import React, { Component } from "react";
import Dropdown, {option} from "../../Components/Dropdown/Dropdown";
import Chart from "../../Components/Chart/Chart";
import "./style.css";
import Loader from 'react-loader-spinner';
import DatePicker from "react-datepicker";
import "../../../node_modules/react-datepicker/dist/react-datepicker.css";

type dropdownState = {
  symbol: string,
  data: Array<any>,
  renderData: Array<any>,
  width: number,
  showAvrage: boolean,
  loading: boolean,
  filterStartValue: any,
  filterEndValue: any,
  dinamicSimbol: string,
  newLoading: boolean,
  errmsg: string,
}

const options : Array<option> = [{value: "MSFT", text: "Microsoft"},
  {value: "TSLA", text: "Tesla"},
  {value: "APLE", text: "Aple"},
  {value: "FB", text: "Facebook"},
  {value: "NVDA", text: "Nvidia"},
  {value: "INTC", text: "Intel"}];

export default class HomePage extends Component<{}, dropdownState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      symbol: "MSFT",
      data: [],
      renderData: [],
      width: window.innerWidth - (window.innerWidth * 20 / 100),
      showAvrage: false,
      loading: true,
      filterStartValue: new Date(),
      filterEndValue: new Date(),
      dinamicSimbol: "",
      newLoading: false,
      errmsg: "",
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
    this.setState({newLoading: true}, () => {
      fetch(`https://alpha-vantage.p.rapidapi.com/query?outputsize=compact&datatype=json&function=TIME_SERIES_DAILY_ADJUSTED&symbol=${this.state.dinamicSimbol || this.state.symbol}`, {
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "alpha-vantage.p.rapidapi.com",
          "x-rapidapi-key": "76c0389856msh260005590f07261p1f419ajsnebc9cf49c2e2"
        }
      })
      .then(response => response.json())
      .then(data => {
        const newData = [];
        for(var key in data["Time Series (Daily)"]){
           newData.push({date: key,
             open: data["Time Series (Daily)"][key]["1. open"],
             high: data["Time Series (Daily)"][key]["2. high"],
             low: data["Time Series (Daily)"][key]["3. low"],
             close: data["Time Series (Daily)"][key]["4. close"],
            });
        }

        this.setState({
          data: newData,
          filterStartValue: new Date(newData[newData.length-1].date)
        }, () => {
          this.filter();
        })
      })
      .catch(err => {
        console.log(err);
        this.setState({newLoading: false, errmsg: "Houston we have a problem"})
      });
    });

  }

  callback=(value: string)=>{
    this.setState({symbol: value}, () => {
      this.getData();
    })
  }

  timeRangeStart = (value: any) => {
    this.setState({
      filterStartValue: value,
    }, () => this.filter())
  }

  timeRangeEnd = (value: any) => {
    this.setState({
      filterEndValue: value,
    }, () => this.filter())
  }

  filter = () => {
    const startMiliseconds = this.state.filterStartValue.getTime() / 1000;
    const endMiliseconds = this.state.filterEndValue.getTime() / 1000;

    const newData = []
     this.state.data.forEach((value) => {
      const valueDate = new Date(value.date).getTime() / 1000;
      if(startMiliseconds <= valueDate && endMiliseconds >= valueDate){
        newData.push(value);
      }
    });

    this.setState({
      renderData: newData,
      loading: false,
      newLoading: false,
    });

  }

  handleAvrageChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      showAvrage: value
    });
  }

  updateDynamicSimbol = (event) => {
      this.setState({dinamicSimbol: event.target.value})
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
    this.getData();
    }
  }

  render() {

    return <div className="home_module">
      <div className="selectors">
        <Dropdown options={options} callback={this.callback} defaultValue={this.state.symbol} label="Stock symbol:"/>
        <label className="symbol_input">
           <div>Add your own symbol(ex:GOOGL):</div>
          <input type="text" onChange={this.updateDynamicSimbol} value={this.state.dinamicSimbol} onKeyDown={this.handleKeyDown}/>
        </label>
      </div>
      <div className="time_interval">
        <div className="date_pikerzone1">
          <span>Start Date: </span>
          <DatePicker
            selected={this.state.filterStartValue}
            onChange={date => this.timeRangeStart(date)}
            minDate={new Date( this.state.data.length > 0 ? this.state.data[this.state.data.length - 1].date : "")}
            maxDate={new Date()}
            selectsStart
            showDisabledMonthNavigation
          />
        </div>
        <div className="date_pikerzone2">
          <span>End Date: </span>
          <DatePicker
            selected={this.state.filterEndValue}
            onChange={date => this.timeRangeEnd(date)}
            minDate={new Date( this.state.data.length > 0 ? this.state.data[this.state.data.length - 1].date : "")}
            maxDate={new Date()}
            selectsEnd
            showDisabledMonthNavigation
          />
        </div>
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
      {
        !this.state.loading &&
        <>
          <div className="firstRow">
            <Chart data={this.state.renderData} height={this.state.width/2} width={this.state.width-20} showAvrage={this.state.showAvrage}/>
          </div>
          <div className="secondRow">
            <Chart data={this.state.renderData} height={this.state.width/4} width={(this.state.width-35)/2} param="open" showAvrage={this.state.showAvrage}/>
            <Chart data={this.state.renderData} height={this.state.width/4} width={(this.state.width-35)/2} param="low" showAvrage={this.state.showAvrage}/>
          </div>
          <div className="thirdRow">
            <Chart data={this.state.renderData} height={this.state.width/2} width={this.state.width-20} param="open" showAvrage={this.state.showAvrage}/>
            <Chart data={this.state.renderData} height={this.state.width/2} width={this.state.width-20} param="low" showAvrage={this.state.showAvrage}/>
          </div>
        </>
      }
      {this.state.loading && <div className="loader_postion"><Loader type="Bars" color="#00BFFF" height={80} width={80} /></div>}
      {!this.state.loading && this.state.newLoading && <div className="api_loader_postion"><Loader type="Bars" color="#00BFFF" height={80} width={80} /></div>}
      {this.state.errmsg && <div className="error">{this.state.errmsg}</div>}
    </div>;
  }
}
