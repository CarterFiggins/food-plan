import { useEffect, useState } from "react";
import { IngredientInterface, IngredientItemInterface, MealInterface, RecipeItemsInterfaceIngredient } from "../type/interfaces";
import _ from "lodash";
import { Link, useNavigate } from "react-router-dom";
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

export function CreateShoppingList({
  ingredients,
  meals,
}: {
  ingredients: IngredientInterface[];
  meals: MealInterface[];
}) {
  const [selectedIngredients, setSelectedIngredients] = useState<Map<string, IngredientItemInterface>>(new Map());
  const [selectedMeals, setSelectedMeals] = useState<Map<string, MealInterface>>(new Map());
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [shoppingListName, nameInput] = useInput({
    name: "Name:",
    type: "text",
  });
  const navigate = useNavigate();
  const shoppingList = new Map<string, any>()

  _.forEach(Array.from(selectedIngredients.values()), (item: IngredientItemInterface) => {
    const units:any = {}
    if (item.ingredientUnit && item.ingredientAmount) {
      units[item.ingredientUnit] = item.ingredientAmount
    }
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

  const addItem = (ingredientId: string, unit: string, amount: number) => {
    setSelectedIngredients((prev) => {
      const newMap = new Map(prev);
      const ingredient = newMap.get(ingredientId)
      if (ingredient) {
        newMap.set(ingredientId, {...ingredient, ingredientUnit: unit, ingredientAmount: amount})
      }
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
      }),
    }).then((res) => res.json())
      .then(() => navigate(-1));
  }

  return (
    <div>
      <div className="title-row">
        <button className="star-icon" onClick={() => setIsFavorite(prev => !prev)}>{isFavorite ? '★' : '☆'}</button>
        <h2>New Shopping list</h2>
        <div className="button-row">
          <button className="gray-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="green-btn" onClick={createShoppingList}>Create</button>
        </div>
      </div>
        {nameInput}
      <div className="create-shopping-container">
        <div className="side-selection">
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
            <ShoppingListItem key={shoppingItem.id} shoppingItem={shoppingItem} deleteItem={deleteItem} addItem={addItem} />
          ))}
        </div>
        <div className="side-selection">
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
  { shoppingItem, deleteItem, addItem }
    : {
    shoppingItem: any,
    deleteItem: (id: string) => void,
    addItem: (id: string, unit: string, amount: number) => void,
    }) {
  const [showInput, setShowInputs] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<string>("whole");
  const [selectedAmount, amountInput, setSelectedAmount] = useInput({
    name: "Amount",
    type: "number",
    defaultValue: 0,
  });
  const { units: itemUnits } = shoppingItem

  const closeNewItem = () => {
    setShowInputs(prev => !prev);
    setSelectedUnit("whole");
    setSelectedAmount(0);
  }

  const addNewItem = () => {
    const numSelectedAmount = _.toNumber(selectedAmount)
    if (!(numSelectedAmount <= 0 || !selectedUnit)) {
      addItem(shoppingItem.id, selectedUnit, numSelectedAmount)
      closeNewItem()
    }
  }

  return (
    <div className="shopping-item">
      <div className="item-name">
        <button className="close-icon" onClick={() => deleteItem(shoppingItem.id)}>x</button>
        <h3>{shoppingItem.name}</h3>
        {showInput ? (
          <div>
            <button className="plus-icon" onClick={addNewItem}>Save</button>
            <button className="close-icon" onClick={closeNewItem}>Close</button>
          </div>
        ) : (
          <button className="plus-icon" onClick={closeNewItem}>+</button>
        )}
      </div>
      {showInput && (
        <div className="shopping-input">
          {amountInput}
          <select
            value={selectedUnit}
            name="storageUnit"
            id="unit"
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            {_.map(units, (unit) => {
              return (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              );
            })}
          </select>
        </div>
      )}
      {_.map(itemUnits, (amount, unit) => (
        <div key={unit} className="unit-amount">
          {unit}: {amount}
        </div>
      ))}
    </div>
  )
}
