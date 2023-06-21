import { useEffect, useState } from "react";
import { IngredientInterface } from "../type/interfaces";
import _ from "lodash";
import CreateIngredient from "./CreateIngredient";
import useInput from "../common/useInput";
import { useNavigate } from "react-router-dom";

interface FoodItemInterface {
  id?: string;
  name?: string;
  amount?: number;
  unit?: string;
  storageLife?: number;
}
export default function LoadCreateMeal() {
  const [data, setData] = useState<IngredientInterface[] | null>(null);

  useEffect(() => {
    fetch("/ingredients")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return <div>{data ? <CreateMeal {...data} /> : <h1>Loading...</h1>}</div>;
}

export function CreateMeal(data: IngredientInterface[]) {
  const [ingredients, setIngredients] = useState<FoodItemInterface[]>([]);
  const [showCreateIngredient, setShowCreateIngredient] = useState(false);
  const [mealName, mealNameInput] = useInput({
    name: "Meal Name:",
    type: "text",
  });

  const navigate = useNavigate();

  const addIngredient = (newIngredient: FoodItemInterface) => {
    if (!newIngredient.name) {
      return;
    }

    newIngredient.name = _.upperFirst(_.toLower(_.trim(newIngredient.name)));
    const match = _.filter(
      data,
      (foodItem) =>
        _.toLower(foodItem.name) === _.toLower(newIngredient.name as string)
    );

    if (!_.isEmpty(match)) {
      newIngredient.id = match[0].id;
      newIngredient.storageLife = match[0].storage_life;
    }

    setIngredients((currentState) => [...currentState, newIngredient]);
    setShowCreateIngredient(false);
  };

  const deleteFoodItem = (id: number) => {
    const items = [...ingredients];
    _.remove(items, (_item, index) => index === id);
    setIngredients(items);
  };

  const save = () => {
    if (!mealName) {
      // TODO send validation error message
      console.log("no meal name");
      return;
    }

    fetch("/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients,
        mealName,
      }),
    })
      .then((res) => res.json())
      .then(() => navigate(-1));
  };

  return (
    <div className="create">
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Create Meal</h1>
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
        {_.map(ingredients, (food: FoodItemInterface, index: number) => (
          <div className="create-body" key={food.name}>
            <div>Name: {food.name}</div>
            <div>Amount: {food.amount}</div>
            <div>Unit: {food.unit}</div>
            <button onClick={() => deleteFoodItem(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
