import React from 'react';

interface ShoppingListItem {
    shopping_list_id: number;
    ingredient_id: number;
    ingredient_quantity: number;
    ingredient_quantity_unit: string;
}

interface ShoppingList {
    id: number;
    user_id: number;
}

const ShoppingList: React.FC = () => {
    const [ shoppingListItems, setShoppingListItems ] = React.useState<ShoppingListItem[]>([]);

    // TODO: get shopping list items from backend
    // then display them

    return (
        <>

        </>
    )
}

export default ShoppingList;