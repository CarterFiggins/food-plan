import { useEffect, useState } from "react";
import { IngredientInterface, MealInterface } from "../type/interfaces";
import _ from "lodash";
import { Link } from "react-router-dom";

export default function LoadIngredients() {
  const [data, setData] = useState<IngredientInterface[] | null>(null);
  const [flip, setFlip] = useState(false);

  const refetch = () => {
    setFlip((current) => !current);
  };

  useEffect(() => {
    fetch("/ingredients")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [flip]);

  return <div>{data ? <Ingredients data={data} refetch={refetch} /> : <h1>Loading...</h1>}</div>;
}

export function Ingredients({
  data,
  refetch,
}: {
  data: IngredientInterface[];
  refetch: () => void;
}) {

  const deleteIngredient = (id: string, name: string) => {
    const result = window.confirm(`Delete ${name}?`);
    if (!result) {
      return;
    }
    fetch(`/ingredients/${id}`, {
      method: "DELETE",
    })
      .then((res) =>res.json())
      .then((data) => {
        if (data.error) {
          window.alert(`Error: ${data.error}`)
        }
        refetch();
      });
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Storage Life</th>
            <th>Meals</th>
            <th>Storage Count</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {_.map(data, (ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.name}</td>
              <td>{ingredient.storage_life || "N/A"}</td>
              <td>
                {_.map(ingredient.meals, (meal) => (
                  <span className="ingredient-span" key={meal.id}>
                    {meal?.name}
                  </span>
                ))}
              </td>
              <td>
                {`${ingredient.storage_count || 0} ${ingredient.storage_unit || ''}`}
              </td>
              <td className="flex">
                <Link to={`/ingredients/edit/${ingredient.id}`}>Edit</Link>
                {ingredient?.meals?.length ?
                  <></>
                  :
                  <button onClick={() => deleteIngredient(ingredient.id, ingredient.name)}>
                    Delete
                  </button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
