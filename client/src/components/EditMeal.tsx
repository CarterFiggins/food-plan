import { useCallback, useEffect, useState } from "react";
import { MealInterface } from "../type/interfaces";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import useInput from "../common/useInput";
import CreateIngredient from "./CreateIngredient";
import { units } from "../util/unitHelpers";

export default function LoadEditMeal() {
  const { id } = useParams();
  const [meal, setMeal] = useState<MealInterface | null>(null);

  useEffect(() => {
    fetch(`/meals/${id}`)
      .then((res) => res.json())
      .then((meal) => setMeal(meal));
  }, []);

  return meal ? <EditMeal meal={meal} /> : <h1>Loading...</h1>;
}

function EditMeal({ meal: initialMeal }: { meal: MealInterface }) {
  const [meal, setMeal] = useState(initialMeal);
  const [showCreateIngredient, setShowCreateIngredient] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const [mealName, mealNameInput] = useInput({
    name: "Meal Name:",
    type: "text",
    defaultValue: meal.name,
  });

  const save = () => {
    fetch(`/meals/${meal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meal: { ...meal, name: mealName },
        deletedIds,
      }),
    })
      .then((res) => res.json())
      .then(() => navigate(-1));
  };

  const addIngredient = (newIngredient: {
    name: string;
    id: string;
    storageLife: number;
    amount: number;
    unit: string;
  }) => {
    if (!newIngredient.name) {
      return;
    }

    newIngredient.name = _.upperFirst(_.toLower(newIngredient.name));
    const match = _.filter(
      meal as any,
      (foodItem) =>
        _.toLower(foodItem.name) === _.toLower(newIngredient.name as string)
    );

    if (!_.isEmpty(match)) {
      newIngredient.id = match[0].id;
      newIngredient.storageLife = match[0].storageLife;
    }

    const cloneMeal = _.clone(meal);
    cloneMeal.recipeItems.push({
      id: "new",
      amount: newIngredient.amount,
      unit: newIngredient.unit,
      ingredient: {
        id: newIngredient.id || "new",
        name: newIngredient.name,
        storage_life: newIngredient.storageLife,
      },
    });
    setMeal(cloneMeal);
    setShowCreateIngredient(false);
  };

  const editIngredient = (
    value: string | number,
    index: number,
    valueName: string
  ) => {
    setMeal((currentMeal) => {
      if (valueName === "name") {
        const items = [...currentMeal.recipeItems];
        items[index].ingredient.name = value as string;
        return { ...currentMeal, recipeItems: items };
      }
      if (valueName === "amount") {
        const items = [...currentMeal.recipeItems];
        items[index].amount = value as number;
        return { ...currentMeal, recipeItems: items };
      }
      if (valueName === "unit") {
        const items = [...currentMeal.recipeItems];
        items[index].unit = value as string;
        return { ...currentMeal, recipeItems: items };
      }
      return currentMeal;
    });
  };

  const deleteIngredient = (index: number, id: string) => {
    const cloneMeal = _.clone(meal);
    cloneMeal.recipeItems.splice(index, 1);
    if (id !== "new") {
      setDeletedIds((ids: string[]) => {
        return [...ids, id];
      });
    }
    setMeal(cloneMeal);
  };

  return (
    <div>
      <h1>Edit {initialMeal.name}</h1>
      <div className="create-name">
        {mealNameInput}
        <button onClick={save}>Save</button>
      </div>
      {showCreateIngredient ? (
        <CreateIngredient
          addIngredient={addIngredient}
          close={() => setShowCreateIngredient(false)}
        />
      ) : (
        <button onClick={() => setShowCreateIngredient(true)}>
          Add Ingredient
        </button>
      )}
      <div>
        {_.map(meal.recipeItems, (item, index) => (
          <div className="create-body" key={index}>
            <label htmlFor={item.ingredient.name}>Name:</label>
            <input
              id={item.ingredient.name}
              type="text"
              value={item.ingredient.name}
              onChange={(e) => editIngredient(e.target.value, index, "name")}
            />
            <label htmlFor={item.amount.toString()}>Amount:</label>
            <input
              id={item.amount.toString()}
              type="text"
              value={item.amount}
              onChange={(e) => editIngredient(e.target.value, index, "amount")}
            />
            <select
              value={item.unit}
              name="unit"
              id="unit"
              onChange={(e) => editIngredient(e.target.value, index, "unit")}
            >
              {_.map(units, (unit) => {
                return (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                );
              })}
            </select>
            <button onClick={() => deleteIngredient(index, item.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
