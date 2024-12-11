document.addEventListener("DOMContentLoaded", async () => {
    const deleteButton = <HTMLButtonElement> document.getElementById("delete-button");
    deleteButton.addEventListener("click", deleteRecipe);
});

async function deleteRecipe() {
    const deleteDiv = <HTMLDivElement> document.getElementById("delete-recipe");
    const recipeIdElement = <HTMLInputElement> document.getElementById("recipeID");
    const recipeId = recipeIdElement.valueAsNumber;

    const response = await fetch(`/api/del/${recipeId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: ""
    });
}