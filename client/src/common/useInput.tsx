import { useState } from "react";
import _ from "lodash";

export default function useInput({ name, type, defaultValue = "" }: any) {
  const [value, setValue] = useState(defaultValue);

  const input = (
    <div className="input-container">
      <label htmlFor={name}>{name}</label>
      <input
        id={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type={type}
      />
    </div>
  );

  return [value, input];
}
