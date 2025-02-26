from __future__ import annotations
from flask import jsonify, request, current_app
from flask_login import current_user, login_required
from app.recipe_lists import bp
from app.models import Recipe, RecipeList, RecipeRecipeList, db
from werkzeug.utils import secure_filename
import os

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.get("/recipes/<int:id>")
def post_array_of_recipes_in_list(id):
    print(f"searching for recipes in RecipeList {id}")
    recipe_ids = [rrl.recipe_id for rrl in (RecipeRecipeList.query.filter_by(recipe_list_id=id).all())]
    recipes = [Recipe.query.filter_by(id=recipe_id).first() for recipe_id in recipe_ids]
    return jsonify([recipe.to_json() for recipe in recipes]) # type: ignore

@bp.get("/all")
def get_all_recipe_lists_of_current_user():
    print(f"Attempting to return all recipe lists of the current user")
    recipe_lists = RecipeList.query.filter_by(belongs_to=current_user.id).all()
    print([recipe_list.to_json() for recipe_list in recipe_lists])
    return jsonify([recipe_list.to_json() for recipe_list in recipe_lists])

@bp.get("/all_containing/<int:id>")
def get_all_recipe_lists_containing_recipe_with_id(id):
    print(f"Attempting to return all recipe lists containing recipe with id={id}")
    recipe_lists = RecipeList.query.filter_by(belongs_to=current_user.id).all()
    print(f"All recipe lists of user: {recipe_lists}")
    recipe_lists_in = []
    for recipe_list in recipe_lists:
        recipe_ids = [rrl.recipe_id for rrl in (RecipeRecipeList.query.filter_by(recipe_list_id=recipe_list.id).all())]
        if id in recipe_ids:
            recipe_lists_in.append(recipe_list)
    for recipe_list_in in recipe_lists_in:
        print(f"Recipe list this recipe is in: {recipe_list_in}")
    return jsonify([recipe_list_in.to_json() for recipe_list_in in recipe_lists_in]), 200
    
@bp.get('/info/<int:rid>')
def get_recipe_list_name(rid):
    print(f"Searching for RecipeList {rid}")
    recipe_list = RecipeList.query.filter_by(id=rid).first()
    return jsonify(recipe_list.to_json())

@bp.post('/createlist')
def create_list():
    name = request.form.get("name")
    image = request.files.get("image")
    print(f"Creating a new RecipeList with name {name}")
    if not name:
        return jsonify({"message": "name must be specified"}), 400
    try:
        recipeList = RecipeList(name=name, belongs_to=current_user.id, image=image)

        # Handle image upload
        if image and allowed_file(image.filename):
            try:
                upload_folder = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_folder, exist_ok=True)
                filename = secure_filename(image.filename)
                file_path = os.path.join(upload_folder, filename)
                image.save(file_path)
                recipeList.image = os.path.join('static', 'uploads', filename)
            except Exception as e:
                return jsonify({"message": f"File upload failed: {str(e)}"}), 500
        else:
            recipeList.image = "static/uploads/default_image.jpg"

        db.session.add(recipeList)
        db.session.commit()
        return jsonify({"message": "RecipeList created successfully",
                        "recipe_list_id": recipeList.id}), 201
    except Exception as e:
        return jsonify({"message": f"RecipeList creation failed: {str(e)}", "recipe_list_id": -1}), 500
    
@bp.post('/deletelist')
def delete_list():
    lid = request.form.get('lid')
    if not lid:
        return jsonify({"message": "List ID must be specified"}), 400
    try:
        recipeRecipeLists = RecipeRecipeList.query.filter_by(recipe_list_id=lid).all()
        for rrl in recipeRecipeLists:
            rrl.recipe_id = -1
            db.session.delete(rrl)
            db.session.commit()
        recipeList = RecipeList.query.filter_by(id=lid).first()
        if recipeList:
            db.session.delete(recipeList)
            db.session.commit()
            return jsonify({"message": f"List {lid} deleted successfully"}), 200
    except Exception as e:
        print("Failure to delete", e)
        return jsonify({"message": f"RecipeList {lid} failed to be deleted: {str(e)}"}), 500
        

@bp.post('/add-recipe-to-list')
@login_required
def add_recipe_to_list():
    print(request)
    rid = request.form.get("rid")
    lid = request.form.get("lid")
    print(f"Adding recipe {rid} to list {lid}")
    # create a new RecipeRecipeList and add it to the db
    try:
        already_exists = RecipeRecipeList.query.filter_by(recipe_id=rid, recipe_list_id=lid).first()
        print(already_exists)
        if (already_exists):
            return jsonify({"message": "Recipe already in list"}), 200
        rrl = RecipeRecipeList(recipe_id=rid, recipe_list_id=lid)
        db.session.add(rrl)
        db.session.commit()
        return jsonify({"message": "Recipe added to list successfully!"}), 200
    except:
        return jsonify({"message": "Failed to add recipe to list"}), 400
    
@bp.post("/remove-recipe-from-list")
@login_required
def remove_recipe_from_list():
    rid = request.form.get("rid")
    lid = request.form.get("lid")
    print(f"Removing recipe {rid} from list {lid}")
    # delete RecipeRecipeList with matching rid and lid
    try:
        rrl = RecipeRecipeList.query.filter_by(recipe_id=rid, recipe_list_id=lid).first()
        if not rrl:
            return jsonify({"message": f"This recipe does not exist in that list"}), 404
        db.session.delete(rrl)
        db.session.commit()
        stillExists = RecipeRecipeList.query.filter_by(recipe_id=rid, recipe_list_id=lid).first()
        if stillExists:
            return jsonify({"message": f"Recipe {rid} failed to be removed from list {lid}"}), 400
        return jsonify({"message": f"Recipe {rid} successfully removed from list {lid}"}), 200
    except:
        return jsonify({"message": f"Some other error occured while trying to remove recipe {rid} from list {lid}"}), 400
