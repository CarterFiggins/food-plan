import { useEffect, useState } from "react";
import { ShoppingListInterface } from "../type/interfaces";
import _ from "lodash";
import { Link } from "react-router-dom";

export default function LoadShoppingList() {
  const [data, setData] = useState<ShoppingListInterface[] | null>(null);
  const [flip, setFlip] = useState(false);

  const refetch = () => {
    setFlip((current) => !current);
  };

  useEffect(() => {
    fetch("/shopping-list")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [flip]);

  return (
    <div>
      {data ? <ShoppingList data={data} refetch={refetch} /> : <h1>Loading...</h1>}
    </div>
  );
}

export function ShoppingList({
  data,
  refetch,
}: {
  data: ShoppingListInterface[];
  refetch: () => void;
}) {

  return (
    <div>
      <div>
        <h3>
          <Link to="/create-shopping-list">Create Shopping List</Link>
        </h3>
        <h2>Shopping list</h2>
      </div>
      <div>
        {_.map(data, (list) => (
          <h3 key={list.id}>
            <Link to={`/shopping-list/${list.id}`}>
             {list.is_favorite ? "*" : ""} {list.name}
            </Link>
          </h3>
        ))}
      </div>
    </div>
  );
}
