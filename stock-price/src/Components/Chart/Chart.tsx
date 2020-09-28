import React, { useRef, useEffect, useState, FunctionComponent } from "react";
// import rd3 from 'react-d3-library';
import {select, line, axisBottom, axisLeft, scaleLinear, scaleTime, extent, timeFormat} from "d3";
import "./Chart.css";

type chartProps = {
  data: any,
  showAvrage ?: boolean,
  height: number,
  width: number,
  param?: string,
};

const Chart: FunctionComponent<chartProps> = ({data, showAvrage = false, height, width, param = "close" }) => {
  const svgRef = useRef(null);
  const [stateData, setData] = useState([]);
  const [stateMin, setMin] = useState(10000000000000000000000000000);
  const [stateMax, setMax] = useState(0);
  const [average, setAverage] = useState(0);
  const paddingLeft = 40;
  const paddingBootom = 20;
  const paddingTop = 10;
  const paddingRight = 10;

    useEffect( () => {
      let min = 10000000000000000000000000000;
      let max = 0;
      let sumAvr = 0;
      data.forEach(element => {
        if( parseInt(element[param]) > max) {
          max = parseInt(element[param]);
        }
        if(parseInt(element[param]) < min) {
          min = parseInt(element[param]);
        }
        sumAvr += parseInt(element[param]);
      });
      setAverage(sumAvr/data.length);
      setMax(max + 1);
      setMin(min - 1);
      const distance = max - min;
      const pointDistance = (height - paddingBootom - paddingTop) / distance;
      const newData = data.map((value) => {
        return {
          x: (value[param] - min) * pointDistance,
          value: value[param],
          date: value.date,
        }
      })
      setData(newData);
    }, [data, height, width, param])

    useEffect( () => {
      // console.log(stateData);
      const svg = select(svgRef.current);
      const xScale = scaleTime().domain(extent(data, d => new Date(d.date))).range([paddingLeft, width - paddingRight]);
      const yScale = scaleLinear().domain([stateMin, stateMax]).range([height - paddingBootom - paddingTop, paddingBootom]);
      const xAxis = axisBottom(xScale)
      .tickFormat(timeFormat("%m-%d"));
      const yAxis = axisLeft(yScale);
      svg.select(".x-axis").style("transform", `translateY(${height-paddingBootom}px)`).call(xAxis);
      svg.select(".y-axis").style("transform", `translatex(${paddingLeft}px)`).call(yAxis);
      const drowline = line()
        .x((value) => xScale(new Date(value.date)))
        .y(value => yScale(value.value));

      svg.selectAll(".path")
        .data([stateData])
        .join("path")
        .attr("class", "path")
        .attr('d', value => drowline(value))
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke", "red").on("mouseover", () => {
          svg.selectAll(".circle")
          .attr("stroke", "red")
          .attr("fill", "black");
        })
        .on("mouseout", () => {
          svg.selectAll(".circle")
          .attr("stroke", "transparent")
          .attr("fill", "transparent");
        });

        svg.selectAll(".circle")
          .data(stateData)
          .join("circle").attr("r", () => 5)
          .attr("class", "circle")
          .attr("cx", (value) => xScale(new Date(value.date)) )
          .attr("cy", value => yScale(value.value) )
          .attr("stroke", "transparent")
          .attr("fill", "transparent")
          .on("mouseover", (event, value) => {
            select(event.target)
            .attr("stroke", "red")
            .attr("fill", "black");
            svg.append("g")
            .attr("class", "popup")
            .style("transform", `translate(-30px, -10px)`)
            .append("text")
            .attr("x", event.offsetX)
            .attr("y", event.offsetY)
            .attr("stroke", event.offsetY)
            .attr("y", event.offsetY)
            .text(`${value.value}`);
          })
          .on("mouseout", (event) => {
            select(event.target)
            .attr("stroke", "transparent")
            .attr("fill", "transparent");
            select(".popup").selectAll("text").remove();
            select(".popup").remove();
          });
          if(stateData.length > 0 && showAvrage){
            svg.select(".avg_line").remove();
            svg.append("line")
            .attr("class", "avg_line")
            .attr("stroke", "yellow")
            .attr("stroke-width", 2)
            .attr("x1", xScale(new Date(stateData[stateData.length - 1].date)))
            .attr("y1", yScale(average))
            .attr("x2", xScale(new Date(stateData[0].date)))
            .attr("y2", yScale(average));
          } else {
            svg.select(".avg_line").remove();
          }

    }, [stateData, showAvrage, average, data, height, stateMax, stateMin, width]);


    return <React.Fragment>
        <svg className="charts" width={width} height={height} ref={svgRef}>
          <defs>
            <linearGradient spreadMethod="pad" id="gradient" x1="0%" y1="0%" x2="111%" y2="87%">
              <stop offset="0%" stopColor="rgb(9, 138, 194)" stopOpacity="1" />
              <stop offset="43%" stopColor="rgb(9, 83, 115)" stopOpacity="1" />
              <stop offset="98%" stopColor="rgb(0, 99, 142)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" y="0" x="0" fill="url(#gradient)"/>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
    </React.Fragment>;
}

export default Chart;
