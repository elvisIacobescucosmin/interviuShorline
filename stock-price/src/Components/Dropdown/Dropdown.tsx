import React, { useRef, useEffect, useState, FunctionComponent } from "react";
import "./Dropdown.css";

 export type option = {
  value: string,
  text: string
}

type dropdownProps = {
  options: Array<option>,
  defaultValue?: string,
  label: string,
  callback: (text: string) => void;
}

const Dropdown: FunctionComponent<dropdownProps> = ({options, defaultValue, callback, label }) => {

  const [selected, setSelected] = useState(defaultValue);

  const onChange = (e: React.FormEvent<HTMLSelectElement>) => {
       const value = (e.target as HTMLInputElement).value;
       setSelected(value);
       callback(value)
     }

  return <div className="dropdown_compmonent">
    <div>{label}</div>
    <select className="select" onChange={onChange}>
      { !selected &&
        <option value=""> --Please choose an option--</option>
      }
      {options.map((option: option) => {
        return <option key={option.text} value={option.value}>{option.text}</option>
      })}
    </select>
  </div>;
}
export default Dropdown;
