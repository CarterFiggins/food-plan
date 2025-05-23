import { useEffect, useState } from "react";
import { IngredientInterface, IngredientItemInterface, MealInterface, RecipeItemsInterfaceIngredient, ViewListInterface } from "../type/interfaces";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { units } from "../util/unitHelpers";
import useInput from "../common/useInput";

export default function LoadCreateShoppingList() {
  const [ingredients, setIngredients] = useState<IngredientInterface[]>([]);
  const [meals, setMeals] = useState<MealInterface[]>([]);

  useEffect(() => {
    fetch("/ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data));
    fetch("/meals")
      .then((res) => res.json())
      .then((data) => setMeals(data));
  }, []);

  return <div>{(ingredients && meals) ? <CreateShoppingList ingredients={_.orderBy(ingredients, ['name'])} meals={_.orderBy(meals, ['name'])} /> : <h1>Loading...</h1>}</div>;
}

export function EditShoppingList({
  currentMeals,
  currentShoppingList,
  closeEdit,
} : {
  currentMeals: MealInterface[],
    currentShoppingList: ViewListInterface,
    closeEdit: () => void
}) {
  const [ingredients, setIngredients] = useState<IngredientInterface[]>([]);
  const [meals, setMeals] = useState<MealInterface[]>([]);

  useEffect(() => {
    fetch("/ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data));
    fetch("/meals")
      .then((res) => res.json())
      .then((data) => setMeals(data));
  }, []);

  const currentShoppingListMap = _.reduce(currentShoppingList.shoppingItems, (ingredientsMap: any, shoppingListItem: any) => {
    ingredientsMap.set(shoppingListItem.ingredient.id, {id: shoppingListItem.id, ingredient: shoppingListItem.ingredient})
    return ingredientsMap;
  }, new Map())

  return (
    <div>
      {(ingredients && meals) ?
        (
          <CreateShoppingList
            ingredients={_.orderBy(ingredients, ['name'])}
            meals={_.orderBy(meals, ['name'])}
            isCurrentlyFavorite={currentShoppingList.is_favorite}
            currentName={currentShoppingList.name}
            shoppingListId={currentShoppingList.id}
            currentIngredients={currentShoppingListMap}
            currentMeals={new Map(Object.entries(_.keyBy(currentMeals, "id")))}
            closeEdit={closeEdit}
          />
        ) : (
          <h1>Loading...</h1>
        )}
    </div>
  );
}

export function CreateShoppingList({
  ingredients,
  meals,
  currentIngredients = new Map(),
  currentMeals = new Map(),
  isCurrentlyFavorite = false,
  currentName = "",
  shoppingListId = "",
  closeEdit = () => {}
}: {
  ingredients: IngredientInterface[];
  meals: MealInterface[];
  currentIngredients?: Map<string, IngredientItemInterface>;
  currentMeals?: Map<string, MealInterface>;
  isCurrentlyFavorite?: boolean;
  currentName?: string;
  shoppingListId?: string
  closeEdit?: () => void
}) {
  const [selectedIngredients, setSelectedIngredients] = useState<Map<string, IngredientItemInterface>>(currentIngredients);
  const [selectedMeals, setSelectedMeals] = useState<Map<string, MealInterface>>(currentMeals);
  const [isFavorite, setIsFavorite] = useState<boolean>(isCurrentlyFavorite);
  const [shoppingListName, nameInput] = useInput({
    name: "Name:",
    type: "text",
    defaultValue: currentName,
  });
  const navigate = useNavigate();
  const shoppingList = new Map<string, any>()

  _.forEach(Array.from(selectedIngredients.values()), (item: IngredientItemInterface) => {
    const units:any = {}
    shoppingList.set(item.ingredient.id, { ...item.ingredient, units, count: 0 })
  })

  _.forEach(Array.from(selectedMeals.values()), (meal: MealInterface) => {
    _.forEach(meal.recipeItems, (item: RecipeItemsInterfaceIngredient) => {
      const { ingredient, unit, amount } = item;
      if (!selectedIngredients.has(ingredient.id)) return
      const shoppingIngredient = shoppingList.get(ingredient.id)

      if (shoppingIngredient) {
        let newAmount = amount
        if (shoppingIngredient.units[unit]) {
          newAmount += shoppingIngredient.units[unit]
        }
        shoppingList.set(ingredient.id, {
          ...shoppingIngredient,
          count: shoppingIngredient.count + 1,
          units: {
            ...shoppingIngredient.units,
            [unit]: newAmount,
          }
        })
      } else {
        shoppingList.set(ingredient.id, {
          ...ingredient,
          count: 1,
          units: {
            [unit]: {
              amount: amount
            }
          },
        })
      }
    })
  })

  const handleIngredientSelection = (
    ingredient: IngredientInterface
  ) => {
    setSelectedIngredients(prev => {
      const newMap = new Map(prev);
      newMap.has(ingredient.id) ? newMap.delete(ingredient.id) : newMap.set(ingredient.id, {id: 'new', amount: 0, unit: "", ingredient });
      return newMap;
    })
  }

  const handleMealSelection = (
    meal: MealInterface
  ) => {
    if (!selectedMeals.has(meal.id)) {
      setSelectedMeals(prev => {
        const newMap = new Map(prev);
        newMap.set(meal.id, meal);
        return newMap;
      });
      setSelectedIngredients(prev => {
        const newMap = new Map(prev);
        _.forEach(meal.recipeItems, (item) => {
          const { ingredient } = item
          if (!newMap.has(ingredient.id)) {
            newMap.set(ingredient.id, item)
          }
        })
        return newMap;
      })
    } else {
      setSelectedMeals(prev => {
        const newMap = new Map(prev);
        newMap.delete(meal.id)
        return newMap;
      });
      setSelectedIngredients(prev => {
        const newMap = new Map(prev);
        _.forEach(meal.recipeItems, (item) => {
          const { ingredient } = item
          const shoppingItem = shoppingList.get(ingredient.id)
          const ingredientItem = selectedIngredients.get(ingredient.id) || null
          if (!ingredientItem?.ingredientAmount && (!shoppingItem || shoppingItem.count <= 1)) {
            newMap.delete(ingredient.id)
          }
        })
        return newMap;
      })
    }
  }

  const deleteItem = (ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ingredientId)
      return newMap;
    })
  }

  const createShoppingList = () => {
    const shoppingItems = Array.from(shoppingList.values())
    if (_.isEmpty(shoppingItems) || !shoppingListName) {
      return;
    }

    fetch(`/shopping-list/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shoppingItems,
        shoppingListName,
        isFavorite,
        meals: Array.from(selectedMeals.values())
      }),
    }).then((res) => res.json())
      .then(() => navigate(-1));
  }

  const editShoppingList = () => {
    const shoppingItems = Array.from(shoppingList.values())
    if (_.isEmpty(shoppingItems) || !shoppingListName) {
      return;
    }

    const oldIngredients = _.map(Array.from(currentIngredients.values()), (shoppingItem) => {
      return {
        id: shoppingItem.ingredient.id,
        shoppingItemId: shoppingItem.id
      }
    });

    const editedMeals = Array.from(selectedMeals.values());
    const oldMeals = Array.from(currentMeals.values());
    const deletedMealsIds = _.map(_.differenceBy(oldMeals, editedMeals, 'id'), 'id');
    const deletedShoppingItemIds = _.map(_.differenceBy(oldIngredients, shoppingItems, 'id'), 'shoppingItemId');
    const newMeals = _.differenceBy(editedMeals, oldMeals, 'id');
    const newShoppingItems = _.differenceBy(shoppingItems, oldIngredients, 'id');

    fetch(`/shopping-list/${shoppingListId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shoppingListId,
        newShoppingItems,
        deletedShoppingItemIds,
        shoppingListName,
        isFavorite,
        newMeals,
        deletedMealsIds,
      }),
    }).then((res) => res.json())
      .then(() => closeEdit());
  }

  return (
    <div>
      <div className="header-row">
        <div className="title-row">
          <button className="yellow-icon can-click-icon" onClick={() => setIsFavorite(prev => !prev)}>{isFavorite ? '★' : '☆'}</button>
          <h2>New Shopping list</h2>
        </div>
        {shoppingListId ? (
          <div className="button-row">
            <button className="gray-btn" onClick={closeEdit}>Back</button>
            <button className="green-btn" onClick={editShoppingList}>Save</button>
          </div>
        ): (
        <div className="button-row">
          <button className="gray-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="green-btn" onClick={createShoppingList}>Create</button>
        </div>
        )}
      </div>
        {nameInput}
      <div className="create-shopping-container">
        <div className="side-selection">
          <h2>Meals</h2>
          {_.map(meals, (meal) => (
            <div key={meal.id}>
              <input
                type="checkbox"
                checked={selectedMeals.has(meal.id)}
                onChange={() => handleMealSelection(meal)}
              />
              {meal.name}
            </div>
          ))}
        </div>
        <div className="main-shopping-list">
          {_.map(_.orderBy(Array.from(shoppingList.values()), ['name']), (shoppingItem: any) => (
            <ShoppingListItem key={shoppingItem.id} shoppingItem={shoppingItem} deleteItem={deleteItem} />
          ))}
        </div>
        <div className="side-selection">
          <h2>Ingredients</h2>
          {_.map(ingredients, (ingredient) => (
             <div key={ingredient.id}>
              <input
                type="checkbox"
                checked={selectedIngredients.has(ingredient.id)}
                onChange={() => handleIngredientSelection(ingredient)}
              />
              {ingredient.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShoppingListItem(
  { shoppingItem, deleteItem }
    : {
    shoppingItem: any,
    deleteItem: (id: string) => void,
    }) {
  const { units: itemUnits } = shoppingItem

  return (
    <div className="shopping-item">
      <div className="item-name">
        <button className="close-icon" onClick={() => deleteItem(shoppingItem.id)}>x</button>
        <h3>{shoppingItem.name}</h3>
      </div>
      {_.map(itemUnits, (amount, unit) => (
        <div key={unit} className="unit-amount">
          {unit}: {amount}
        </div>
      ))}
    </div>
  )
}
