import React, { useContext }  from 'react';
import { Bar } from '@visx/shape';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';

import Context from '../context';

function SexAgeCharts() {

  const { data, currentDataSource, currentDrug, currentYear, currentMonth } = useContext(Context);

  const filteredData = data.sex[currentDataSource][currentDrug][currentYear][currentMonth];

  console.log(data.sex[currentDataSource][currentDrug][currentYear], currentMonth, filteredData);

  const height = 300;
  const width = 500;
  const legendWidth = 100;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 50, left: 50, right: 15};
  const circleRadius = 3;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = xMax / 2;
  const yMax = height - margin.top - margin.bottom;

  const xKey = 'value';
  const yKey = 'age';
  const x1Scale = scaleLinear({
    range: [xMaxHalf, 0],
    domain: [0, Math.max(...filteredData.map(d => d[xKey]).filter(val => !isNaN(val)))]
  });


  const x2Scale = scaleLinear({
    range: [xMaxHalf, xMax],
    domain: [0, Math.max(...filteredData.map(d => d[xKey]).filter(val => !isNaN(val)))]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
  });

  const getBar = (d) => {
    const isSecondSeries = d.sex === 'F';
    const alignEnd = (isSecondSeries && x2Scale(d[xKey]) - xMaxHalf > 100) || (!isSecondSeries && x1Scale(d[xKey]) > (xMaxHalf - 100));
    return (
      <g key={d[yKey]}>
        <Bar x={isSecondSeries ? xMaxHalf : x1Scale(d[xKey])} y={yScale(d[yKey])} width={isSecondSeries ? x2Scale(d[xKey]) - xMaxHalf : xMaxHalf - x1Scale(d[xKey])} height={yScale.bandwidth()} fill={isSecondSeries ? 'blue' : 'lightblue'} />
        <Text x={(isSecondSeries ? x2Scale(d[xKey]) : x1Scale(d[xKey])) + (alignEnd ? -10 : 10)} y={yScale(d[yKey]) + yScale.bandwidth() - 10} textAnchor={alignEnd ? 'end' : 'start'} fill={isSecondSeries && x2Scale(d[xKey]) - xMaxHalf > 100 ? 'white' : 'black'} fontSize={11}>{d[yKey]}</Text>
      </g>
    )
  }

  return (
    <>
      <h2>Sex Age Chart</h2>
      <svg viewBox={`0 0 ${width} ${height}`}>
        <Group top={margin.top} left={margin.left}>
          <Group>
            {filteredData.map((d) => getBar(d, false))}
          </Group>
          <Text x={-20} y={yMax / 2} style={{transform: 'rotate(-90deg)', 'transform-origin': `-20px ${yMax / 2}px`}} fontSize={11} textAnchor="middle">Age Group</Text>
          <AxisBottom
            top={yMax}
            scale={x1Scale}
          />
          <AxisBottom
            top={yMax}
            scale={x2Scale}
          />
        </Group>
      </svg>
    </>
  )
}

export default SexAgeCharts