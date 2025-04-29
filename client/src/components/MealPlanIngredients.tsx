import { MealPlanInterface } from "../type/interfaces";
import _ from "lodash";
import { convertUnit } from "../util/unitHelpers";
import AmountBox from "./AmountBox";

export default function MealPlanIngredients({ mealPlans }: { mealPlans: MealPlanInterface[] }) {
  const planIngredients: any = {}

  mealPlans.filter(p => !p.meal_created).forEach((plan) => {
    plan.meal.recipeItems.forEach((item) => {
      const storageUnit = item.ingredient.storage_unit
      const storageCount = item.ingredient.storage_count
      let unit = item.unit;
      let amount = item.amount
      if (!unit) {
        unit = "default";
      }
      if (storageUnit) {
        const newPlanAmount = convertUnit(item.amount, storageUnit, item.unit)
        if (newPlanAmount) {
          amount = newPlanAmount
          unit = storageUnit
        }
      }

      if (!planIngredients[item.ingredient.name]) {
        planIngredients[item.ingredient.name] = { plan: {}, current: {} }
        planIngredients[item.ingredient.name].plan[unit] = _.toNumber(amount);
        if (storageUnit && (storageCount || storageCount === 0)) {
          // only need to create the count once because it is the total for that ingredient
          planIngredients[item.ingredient.name].current.unit = storageUnit;
          planIngredients[item.ingredient.name].current.amount = storageCount;
        }
      } else {
        if (!planIngredients[item.ingredient.name].plan[unit]) {
          planIngredients[item.ingredient.name].plan[unit] = _.toNumber(amount);
        } else {
          planIngredients[item.ingredient.name].plan[unit] += _.toNumber(amount);
        }
      }
    })
  })

  return (
    <div className="">
      <div>
        <AmountBox ingredients={planIngredients} />
      </div>
    </div>
  );
}
