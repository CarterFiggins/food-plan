import { useState } from "react";
import { MealInterface, MealPlanInterface } from "../type/interfaces";
import _ from "lodash";

interface INewAmountIngredient {
  id: string,
  newAmount: number
}

interface ISaveMealPlan {
  changedIngredients?: INewAmountIngredient[]
  id: string,
  completed: boolean,
}

export default function DayItem({
  day,
  meals,
  mealPlan,
  position,
  refetch,
}: {
    day: string
    position: number
    meals: MealInterface[]
    mealPlan: MealPlanInterface | undefined
    refetch: () => void
  }) {
  const [mealId, setMealId] = useState(mealPlan?.meal.id || "noMeal");
  const [mealCompleted, setMealCompleted] = useState(mealPlan?.meal_created || false);


  const changeMealName = (id: string) => {
    setMealId(id);
    saveMealPlan({ id, completed: mealCompleted });
  }

  const changeMealCompleted = () => {
    const changedIngredients: INewAmountIngredient[] = []
    mealPlan?.meal.recipeItems.forEach((item) => {
      if (item.unit === item.ingredient.storage_unit && (item.ingredient.storage_count || item.ingredient.storage_count === 0)) {
        let itemAmount = item.amount;
        if (!mealCompleted) {
          itemAmount *= -1;
        }
        changedIngredients.push({
          id: item.ingredient.id,
          newAmount: _.toNumber(item.ingredient.storage_count) + _.toNumber(itemAmount), 
        })
      }
    })

    saveMealPlan({ id: mealId, completed: !mealCompleted, changedIngredients});
    setMealCompleted((c) => !c);
  }

  const removeMeal = () => {
    changeMealName("noMeal");
    setMealCompleted(false);
  }

  const saveMealPlan = ({ id, completed, changedIngredients }: ISaveMealPlan) => {
    
    if (id === "noMeal" && mealPlan?.id) {
      fetch(`/meal-plan/${mealPlan.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: mealPlan.id
        }),
      }).then((res) => res.json())
      .then(() => refetch())
      return;
    }

    if (mealPlan?.id) {
      fetch(`/meal-plan/${mealPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: mealPlan.id,
          mealId: id,
          mealCreated: completed,
          position,
          changedIngredients,
        }),
      })
        .then((res) => res.json())
        .then(() => refetch())
      return;
    }

    fetch(`/meal-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealId: id,
        mealCreated: completed,
        position,
      }),
    })
      .then((res) => res.json())
      .then(() => refetch())
  }
    
  return (
    <div className="day-box">
      <div className={"day-name"}>{day}</div>
      <select
        className="select-meal"
        value={mealId}
        name="unit"
        id="unit"
        onChange={(e) => changeMealName(e.target.value)}
      >
        <option value="noMeal">
          Select a Meal
        </option>
        {_.map(meals, (meal) => {
          return (
            <option key={meal.id} value={meal.id}>
              {meal.name}
            </option>
          );
        })}
      </select>
      <div className="meal-made-container">
        {mealId !== "noMeal" && (
          <button className="meal-made-button" onClick={changeMealCompleted}>
            {mealCompleted ? "Undo" : "Meal Made"}
          </button>
        )}
        {mealCompleted && (
          <button className="meal-made-button" onClick={removeMeal}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}