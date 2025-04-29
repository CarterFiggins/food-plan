import { useEffect, useState } from "react";
import { IngredientInterface } from "../type/interfaces";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import useInput from "../common/useInput";
import { units } from "../util/unitHelpers";

export default function LoadEditIngredients() {
  const { id } = useParams();
  const [ingredient, setIngredient] = useState<IngredientInterface | null>(null);

  useEffect(() => {
    fetch(`/ingredients/${id}`)
      .then((res) => res.json())
      .then((ingredient) => setIngredient(ingredient));
  }, []);

  return ingredient ? <EditIngredients ingredient={ingredient} /> : <h1>Loading...</h1>;
}

function EditIngredients({ ingredient }: { ingredient: IngredientInterface }) {
  const navigate = useNavigate();
  const [storageUnit, setStorageUnit] = useState(ingredient.storage_unit);
  const [ingredientName, ingredientNameInput] = useInput({
    name: "Ingredient Name:",
    type: "text",
    defaultValue: ingredient.name,
  });
  const [storageCount, storageCountInput] = useInput({
    name: "Storage Count:",
    type: "number",
    defaultValue: ingredient.storage_count || 0,
  });
  const [storageLife, storageLifeInput] = useInput({
    name: "Storage Life (days):",
    type: "number",
    defaultValue: ingredient.storage_life,
  });

  const save = () => {
    fetch(`/ingredients/${ingredient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredient: { name: ingredientName, storageCount, storageLife, storageUnit},
      }),
    })
      .then((res) => res.json())
      .then(() => navigate(-1));
  };

  return (
    <div>
      <h1>Edit {ingredient.name}</h1>
      <div className="create-name">
        {ingredientNameInput}
        <button onClick={save}>Save</button>
      </div>
      <div className="create-body">
        {storageCountInput}
        <div className="select-container">
          <label htmlFor={"unit"}>Storage Unit:</label>
          <select
            value={storageUnit}
            name="storageUnit"
            id="unit"
            onChange={(e) => setStorageUnit(e.target.value)}
          >
            {_.map(units, (unit) => {
              return (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              );
            })}
          </select>
        </div>
        {storageLifeInput}
      </div>
    </div>
  );
}
