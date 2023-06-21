import _ from "lodash";
import { useState } from "react";
import useInput from "../common/useInput";
import { units } from "../util/unitHelpers";

export default function CreateIngredient({ addIngredient, close }: any) {
  const [name, nameInput] = useInput({
    name: "Name:",
    type: "text",
  });
  const [amount, amountInput] = useInput({ name: "Amount:", type: "text" });
  const [unit, setUnit] = useState("can");

  const add = () => {
    if (!name || !amount) {
      // TODO: input validation error to user
      console.log("Input name and amount");
      return;
    }
    addIngredient({ name, amount, unit });
  };

  const unitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUnit(event.target.value);
  };

  return (
    <div className="create-body">
      {nameInput}
      {amountInput}
      <select value={unit} name="unit" id="unit" onChange={unitChange}>
        {_.map(units, (unit) => {
          return (
            <option key={unit} value={unit}>
              {unit}
            </option>
          );
        })}
      </select>
      <div>
        <button onClick={add}>Add</button>
        <button onClick={close}>Close</button>
      </div>
    </div>
  );
}
