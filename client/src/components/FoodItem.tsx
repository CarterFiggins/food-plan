import _ from "lodash";
import { useState } from "react";

export default function FoodItem({ value, foodName }: any) {
  const [hide, setHide] = useState(true);
  return (
    <div
      key={foodName}
      className="food-item"
      onClick={() => setHide((c) => !c)}
    >
      <h2>{foodName}:</h2>
      <div>
        {_.map(value, (amount: number, unit) => {
          return (
            <div key={`${amount} ${unit}`} className="food-item-value">
              {unit === "meals" && hide ? "" : `${unit}: ${amount} `}
            </div>
          );
        })}
      </div>
    </div>
  );
}
