import { useEffect, useState } from "react";
import { ViewShoppingListInterface } from "../type/interfaces";
import _ from "lodash";
import { Link, useParams } from "react-router-dom";

export default function LoadViewShoppingList() {
  const [data, setData] = useState<ViewShoppingListInterface | null>(null);
  const [flip, setFlip] = useState(false);
  const { id } = useParams();

  const refetch = () => {
    setFlip((current) => !current);
  };

  useEffect(() => {
    fetch(`/shopping-list/${id}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [flip]);

  console.log(data)

  return (
    <div>
      {data ? <ViewShoppingList data={data} refetch={refetch} /> : <h1>Loading...</h1>}
    </div>
  );
}

export function ViewShoppingList({
  data,
  refetch,
}: {
  data: ViewShoppingListInterface;
  refetch: () => void;
  }) {
  
  console.log(data)

  return (
    <div>
      <h1>
      {data.is_favorite ? "*" : ""} {data.name}
      </h1>
      {_.map(data.shoppingItems, (item) => {
        return (
          <div>
            {item.is_checked ? "[X]" : "[ ]"} {item.ingredient.name}
          </div>
        )
      })}
    </div>
  );
}
