import { useEffect, useState } from "react";
import { ShoppingItemInterface, ViewShoppingListInterface } from "../type/interfaces";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { Link, useParams } from "react-router-dom";
import { EditShoppingList } from "./CreateShoppingList";

export default function LoadViewShoppingList() {
  const [data, setData] = useState<ViewShoppingListInterface | null>(null);
  const { id } = useParams();

  const getShoppingList = () => {
    fetch(`/shopping-list/${id}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  };

  useEffect(() => {
    getShoppingList()
  }, []);

  return (
    <div>
      {data ? <ViewShoppingList data={data} getShoppingList={getShoppingList} /> : <h1>Loading...</h1>}
    </div>
  );
}

export function ViewShoppingList({
  data,
  getShoppingList,
}: {
  data: ViewShoppingListInterface;
  getShoppingList: () => void;
  }) {
    const [editShoppingList, setEditShoppingList] = useState<boolean>(false);
  const { meals, shoppingList } = data;
  const navigate = useNavigate();
  const { id } = useParams();

  const updateShoppingItem = (checked: boolean, itemId: string, shoppingListId: string | null = null) => {
    fetch(`/shopping-item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ id: itemId, checked, shoppingListId}),
      headers: { 'Content-Type': 'application/json' }
    }).then((res) => res.json())
      .then(async () => {await getShoppingList()});
  };

  const deleteShoppingList = () => {
    fetch(`/shopping-list/${id}`, {
      method: 'DELETE',
    }).then((res) => res.json())
      .then(() => navigate(-1));
  }

  if (editShoppingList) {
    return (
      <EditShoppingList
        currentMeals={meals}
        currentShoppingList={shoppingList}
        closeEdit={() => setEditShoppingList(false)}
      />
    )
  }
  
  return (
    <div>
      <div className="header-row">
        <div className="title-row">
          <h1>
            {shoppingList.is_favorite && (
              <span className="yellow-icon">★</span>
            )}
            {shoppingList.name}
          </h1>
        </div>
        <div className="button-row">
          <button className="gray-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="green-btn" onClick={() => setEditShoppingList(true)}>Edit</button>
          <button className="blue-btn" onClick={() => updateShoppingItem(false, 'all', shoppingList.id)}>Reset</button>
          <button className="red-btn" onClick={() => deleteShoppingList()}>Delete</button>
        </div>
      </div>
      <div className="shopping-list">
        {_.map(_.orderBy(shoppingList.shoppingItems, ["is_checked", "ingredient.name"], ["asc", "asc"]), (item) => {
          return (
              <CheckBoxItem key={item.id} item={item} updateShoppingItem={updateShoppingItem} />
            )
          })}
      </div>
    </div>
  );
}

function CheckBoxItem({
  item,
  updateShoppingItem,
}: {
  item: ShoppingItemInterface
  updateShoppingItem: (isChecked: boolean, itemId: string, shoppingListId?: string) => void
  }) {

  const handleCheckbox = (isChecked: boolean) => {
    updateShoppingItem(isChecked, item.id)
  }

  return (
    <div className={`shopping-item-view ${item.is_checked ? 'checked-item' : ''}`} >
      <h3>
        <input
            className="item-checkbox"
            type="checkbox"
            checked={item.is_checked}
          onChange={(e) => handleCheckbox(e.target.checked)}
          /> {item.ingredient.name}
      </h3>
      {_.map(item.units, (unitItem) => (
        <div key={unitItem.id}>
          {unitItem.unit}: {unitItem.amount}
        </div>
      ))}
    </div>
  )
}
