import { useEffect, useState } from "react";
import { MealInterface } from "../type/interfaces";
import _ from "lodash";
import { Link } from "react-router-dom";

export default function LoadMeals() {
  const [data, setData] = useState<MealInterface[] | null>(null);
  const [flip, setFlip] = useState(false);

  const refetch = () => {
    setFlip((current) => !current);
  };

  useEffect(() => {
    fetch("/meals")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [flip]);

  return (
    <div>
      {data ? <Meals data={data} refetch={refetch} /> : <h1>Loading...</h1>}
    </div>
  );
}

export function Meals({
  data,
  refetch,
}: {
  data: MealInterface[];
  refetch: () => void;
}) {
  const deleteMeal = (id: string, name: string) => {
    const result = window.confirm(`Delete ${name}?`);
    if (!result) {
      return;
    }
    fetch(`/meals/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        refetch();
      });
  };

  return (
    <div>
      <Link to="/create-meal">Create Meal</Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Ingredients</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {_.map(data, (meal, index) => (
            <tr key={meal.id}>
              <td className="aline-left">
                {index + 1}: {meal.name}
              </td>
              <td>
                {_.map(meal.recipeItems, (item) => (
                  <span className="ingredient-span" key={item.id}>
                    {item?.ingredient?.name}
                  </span>
                ))}
              </td>
              <td className="flex">
                <Link to={`/meals/edit/${meal.id}`}>Edit</Link>
                <button onClick={() => deleteMeal(meal.id, meal.name)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
