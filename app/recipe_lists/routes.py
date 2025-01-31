from __future__ import annotations
from flask import jsonify, request
from flask_login import current_user, login_required
from app.recipe_lists import bp
from app.models import Recipe, RecipeList, RecipeRecipeList, db

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
    
@bp.get('/info/<int:rid>')
def get_recipe_list_name(rid):
    print(f"Searching for RecipeList {rid}")
    recipe_list = RecipeList.query.filter_by(id=rid).first()
    return jsonify(recipe_list.to_json())

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
            return jsonify({"message": "duplicate recipe"}), 200
        rrl = RecipeRecipeList(recipe_id=rid, recipe_list_id=lid)
        db.session.add(rrl)
        db.session.commit()
        return jsonify({"message": "Recipe added to list successfully!"}), 200
    except:
        return jsonify({"message": "Failed to add recipe to list"}), 400
