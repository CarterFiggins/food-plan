import { useEffect, useState } from "react";
import { MealInterface } from "../type/interfaces";
import useInput from "../common/useInput";
import _ from "lodash";
import FoodItem from "./FoodItem";
import { convertUnit } from "../util/unitHelpers";

export default function LoadFoodStorage() {
  const [data, setData] = useState<MealInterface[] | null>(null);

  useEffect(() => {
    fetch("/meals")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return <div>{data ? <FoodStorage {...data} /> : <h1>Loading...</h1>}</div>;
}

export function FoodStorage(data: MealInterface[]) {
  const [days, daysInput] = useInput({
    name: "Number of days",
    type: "text",
  });

  const [foodStorageData, setFoodStorageData] = useState({});

  const calculateStorage = () => {
    const numberOfDays = _.parseInt(days as string);
    if (_.isNaN(numberOfDays)) {
      console.log("bad input");
      return;
    }
    const numberOfMeals = _.size(data);

    // TODO: if you have more meals then days weird things will happen
    const leftoverDays = numberOfDays % numberOfMeals;
    const mealsPerDay = Math.trunc(numberOfDays / numberOfMeals);
    let count = 0;

    const ingredientMap: any = {};

    _.forEach(data, (meal) => {
      count++;
      let timesMealsBy = mealsPerDay;
      if (count <= leftoverDays) {
        timesMealsBy++;
      }
      _.forEach(meal.recipeItems, (item) => {
        let unit = item.unit;
        if (!unit) {
          unit = "default";
        }
        const ingredientUnit = item.ingredient.storage_unit

        if (!ingredientMap[item.ingredient.name]) {
          ingredientMap[item.ingredient.name] = {};
          ingredientMap[item.ingredient.name].meals = [];
        }
        ingredientMap[item.ingredient.name].meals.push(meal.name);

        let convertedSuccess = false
        if (ingredientUnit) {
          const convertedAmount = convertUnit(item.amount, ingredientUnit, unit)
          if (convertedAmount) {
            if (!ingredientMap[item.ingredient.name][ingredientUnit]) {
              ingredientMap[item.ingredient.name][ingredientUnit] = 0;
            }
            console.log(convertedAmount);
            convertedSuccess = true;
            ingredientMap[item.ingredient.name][ingredientUnit] += convertedAmount * timesMealsBy
          }
        }

        if (ingredientMap[item.ingredient.name][unit] && !convertedSuccess) {
          ingredientMap[item.ingredient.name][unit] +=
            item.amount * timesMealsBy;
        } else if (!convertedSuccess) {
          ingredientMap[item.ingredient.name][unit] =
            item.amount * timesMealsBy;
        }
      });
    });

    setFoodStorageData(ingredientMap);
  };

  return (
    <div>
      <h1>Food Storage</h1>
      <div>
        <div className={"flex"}>
          {daysInput}
          <button onClick={calculateStorage} className="ml-8">
            show
          </button>
        </div>
        <div className="food-storage-container">
          {_.map(foodStorageData, (value, foodName) => (
            <FoodItem key={foodName} value={value} foodName={foodName} />
          ))}
        </div>
      </div>
    </div>
  );
}
