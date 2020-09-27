import React, { Component } from "react";
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

type dropdownState = {
  selected: string,
}

export default class Dropdown extends Component<dropdownProps, dropdownState> {

  constructor(props: dropdownProps) {
    super(props);
    this.state = {
      selected: props.defaultValue || "",
    };
  }

   onChange = (e: React.FormEvent<HTMLSelectElement>) => {
     const value = (e.target as HTMLInputElement).value;
     this.setState({selected: value}, () => {
       this.props.callback(value);
     });
   }

  render() {
    return <div className="dropdown_compmonent">
      <div>{this.props.label}</div>
      <select className="select" onChange={this.onChange}>
        { !this.state.selected &&
          <option value=""> --Please choose an option--</option>
        }
        {this.props.options.map((option: option) => {
          return <option key={option.text} value={option.value}>{option.text}</option>
        })}
      </select>
    </div>;
  }
}
