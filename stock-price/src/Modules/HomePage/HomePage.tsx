import React, { Component } from "react";
import Dropdown, {option} from "../../Components/Dropdown/Dropdown";
import Chart from "../../Components/Chart/Chart";
import "./style.css";

type dropdownState = {
  symbol: string,
  data: Array<any>,
  renderData: Array<any>,
  width: number,
  showAvrage: boolean,
  filter: string,
}

const options : Array<option> = [{value: "MSFT", text: "Microsoft"},
  {value: "TSLA", text:"tesla"},
  {value: "NYSE", text: "Aple"},
  {value: "FB", text: "Facebook"},
  {value: "NVDA", text:"Nvidia"},
  {value: "INTC", text:"Intel"}];

  const timeOptions : Array<option> = [
    {value: "7", text: "Last week"},
    {value: "30", text:"Last month"},
    {value: "90", text: "last quarter"}];

export default class HomePage extends Component<{}, dropdownState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      symbol: "MSFT",
      data: [],
      renderData: [],
      width: window.innerWidth - (window.innerWidth * 20 / 100),
      showAvrage: false,
      filter: '7',
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateSize);
    this.getData();
  }

  componentUilllUnmount() {
    window.removeEventListener('resize', this.updateSize);

  }

  updateSize = () => {
    this.setState({ width: window.innerWidth - (window.innerWidth * 20 / 100) });
  }

  getData = () => {
    "https://alpha-vantage.p.rapidapi.com/query?outputsize=compact&datatype=json&function=TIME_SERIES_DAILY_ADJUSTED&symbol=TSLA"
    fetch(`https://alpha-vantage.p.rapidapi.com/query?outputsize=compact&datatype=json&function=TIME_SERIES_DAILY_ADJUSTED&symbol=${this.state.symbol}`, {
    	"method": "GET",
    	"headers": {
    		"x-rapidapi-host": "alpha-vantage.p.rapidapi.com",
    		"x-rapidapi-key": "76c0389856msh260005590f07261p1f419ajsnebc9cf49c2e2"
    	}
    })
    .then(response => response.json())
    .then(data => {
    	// console.log(data["Time Series (Daily)"]);
      const newData = [];
      for(var key in data["Time Series (Daily)"]){
         newData.push({date: key,
           open: data["Time Series (Daily)"][key]["1. open"],
           high: data["Time Series (Daily)"][key]["2. high"],
           low: data["Time Series (Daily)"][key]["3. low"],
           close: data["Time Series (Daily)"][key]["4. close"],
          });
      }
      // console.log(newData);

      this.setState({
        data: newData,
      }, () => {
        this.filter();
      })
    })
    .catch(err => {
    	console.log(err);
    });
  }

  callback=(value: string)=>{
    this.setState({symbol: value}, () => {
      this.getData();
    })
  }

  timeCallback = (value: string) => {
    this.setState({filter: value}, () => {
      this.filter();
    })
  }

  filter = () => {
    // console.log("i am hire", this.state.data.length - parseInt(this.state.filter));
    const newData = [...this.state.data];
    newData.splice( parseInt(this.state.filter)  ,newData.length - parseInt(this.state.filter));
    console.log(newData);
    // console.log(this.state.data);
    this.setState({
      renderData: newData
    });

    // this.state.
  }

  handleAvrageChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      showAvrage: value
    });
  }

  render() {
    // console.log(this.state);


    return <div className="home_module">
      <div className="selectors">
        <Dropdown options={options} callback={this.callback} defaultValue={this.state.symbol} label="Stock symbol:"/>
        <Dropdown options={timeOptions} callback={this.timeCallback} defaultValue={this.state.symbol} label="Time Period:"/>
        <div className="show_avrage">
          <label>
            {this.state.showAvrage && "Hide average"}
            {!this.state.showAvrage && "Show average"}
            <input
              name="isGoing"
              type="checkbox"
              checked={this.state.showAvrage}
              onChange={this.handleAvrageChange} />
          </label>
        </div>
      </div>
      <div className="firstRow">
        <Chart data={this.state.renderData} height={this.state.width/2} width={this.state.width-20} showAvrage={this.state.showAvrage}/>
      </div>
      <div className="secondRow">
        <Chart data={this.state.renderData} height={this.state.width/4} width={(this.state.width-35)/2} param="open" showAvrage={this.state.showAvrage}/>
        <Chart data={this.state.renderData} height={this.state.width/4} width={(this.state.width-35)/2} param="low" showAvrage={this.state.showAvrage}/>
      </div>
    </div>;
  }
}
