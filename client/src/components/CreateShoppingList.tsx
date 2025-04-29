import { useEffect, useState } from "react";
import { IngredientInterface, MealInterface } from "../type/interfaces";
import _ from "lodash";
import { Link } from "react-router-dom";


export default function LoadCreateShoppingList() {
  const [ingredients, setIngredients] = useState<IngredientInterface[] | null>(null);
  const [meals, setMeals] = useState<MealInterface[] | null>(null);

  useEffect(() => {
    fetch("/ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data));
    fetch("/meals")
      .then((res) => res.json())
      .then((data) => setMeals(data));
  }, []);

  return <div>{(ingredients && meals) ? <CreateShoppingList ingredients={ingredients} meals={meals} /> : <h1>Loading...</h1>}</div>;
}

export function CreateShoppingList({
  ingredients,
  meals,
}: {
  ingredients: IngredientInterface[];
  meals: MealInterface[];
})  {

  console.log('ingredients')
  console.log(ingredients)
  console.log('meals')
  console.log(meals)
  return (
    <div>
      <div>
        <div>
          <Link to="/shopping-list">Back</Link>
        </div>
        Shopping list
      </div>
      <div>
        
      </div>
    </div>
  );
}
