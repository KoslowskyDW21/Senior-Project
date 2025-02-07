import React from 'react';
import axios, { AxiosError } from "axios";

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
    const [ shoppingList, setShoppingList ] = React.useState<ShoppingList>();
    const [ shoppingListItems, setShoppingListItems ] = React.useState<ShoppingListItem[]>([]);

    const getShoppingList = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/shopping_lists/user_lists`);
            const shopping_list: ShoppingList = response.data;
            console.log(shoppingList);
            setShoppingList(shoppingList);
        } catch (error) {
            console.error("Error fetching shopping list: ", error);
        }
    };

    const getShoppingListItems = async() => {
        try {
            if (shoppingList == undefined) {
                throw Error();
            }
            const response = await axios.get(`http://127.0.0.1:5000/shopping_lists/items/${shoppingList.id}`);
            const shopping_list_items: ShoppingListItem[] = response.data;
            console.log(shopping_list_items);
            setShoppingListItems(shopping_list_items);
        } catch (error) {
            console.error("Error fetching shopping list items: ", error);
        }
    }

    function ShoppingListItem({ shopping_list_id, ingredient_id, ingredient_quantity, ingredient_quantity_unit }: ShoppingListItem) {
        return (
            <>
            <p>{shopping_list_id} {ingredient_id} {ingredient_quantity} {ingredient_quantity_unit}</p>
            </>
        )
    }
    
    React.useEffect(() => {
        getShoppingList();
        getShoppingListItems();
    })

    return (
        <>
            
        </>
    )
}

export default ShoppingList;