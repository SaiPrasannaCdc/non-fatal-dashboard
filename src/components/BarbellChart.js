import React, { useContext } from 'react';
import { Circle, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

import Context from '../context';

function BarbellChart() {

  const { data, supportedStates, drugScreenOptions, currentDataSource, currentDrug, currentMonth } = useContext(Context);

  const filteredData = data['state'][currentDataSource][drugScreenOptions[currentDrug].rateColumn][currentMonth].filter(d => d.state !== 'US');

  const years = Object.keys(filteredData[0]).filter(item => item !== 'state');
  const states = filteredData.map(d => d.state);

  years.sort();

  const height = 500;
  const width = 500;
  const legendWidth = 100;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 50, left: 110, right: 15};
  const circleRadius = 3;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const x1Key = years[0];
  const x2Key = years[years.length - 1];
  const getX1Value = (d) => {
    if(d[x1Key]) return parseInt(d[x1Key]);
    return 0;
  };
  const getX2Value = (d) => {
    if(d[x2Key]) return parseInt(d[x2Key]);
    return 0;
  };
  const yKey = 'state';

  const xScale = scaleLinear({
    range: [doubleCircleRadius, xMax - doubleCircleRadius],
    domain: [0, Math.max(...filteredData.map(d => Math.max(getX1Value(d), getX2Value(d))))]
  });

  filteredData.sort((a, b) => getX2Value(a) < getX2Value(b) ? 1 : -1);

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: 1,
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <Group top={margin.top} left={margin.left}>
        <rect x={0} y={0} width={xMax} height={yMax} stroke="#ccc" fill="transparent" />
        <Group>
          {filteredData.map((d) => (
            <Group key={`bar-${d[yKey]}`}>
              <Line x1={xScale(getX1Value(d))} x2={xScale(getX2Value(d))} y1={yScale(d[yKey])} y2={yScale(d[yKey])}/>
              <Circle cx={xScale(getX1Value(d))} cy={yScale(d[yKey])} r={circleRadius} stroke="blue" fill="transparent"/>
              <Circle cx={xScale(getX2Value(d))} cy={yScale(d[yKey])} r={circleRadius} stroke="blue"/>
            </Group>
          ))}
        </Group>
        <AxisLeft
          scale={yScale}
          label={'State'}
          hideAxisLine={true}
          tickValues={states}
          tickFormat={tick => supportedStates[tick] || tick}
          labelProps={{
            fontSize: 11,
            textAnchor: 'middle',
            style: {
              transform: `rotate(-90deg) translate(0px, -${margin.left / 2}px)`
            }
          }}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          label={'Deaths Per 100,000 Population'}
          hideAxisLine={true}
        />
        <Group top={yMax - legendHeight} left={xMax - legendWidth}>
          <Circle cx={0} cy={0} r={circleRadius} stroke="blue"/><text x={doubleCircleRadius} y={0} fontSize={11} alignmentBaseline="middle">{x2Key} rate</text>
          <Circle cx={0} cy={20} r={circleRadius} stroke="blue" fill="transparent"/><text x={doubleCircleRadius} y={20} fontSize={11} alignmentBaseline="middle">{x1Key} rate</text>
        </Group>
      </Group>
    </svg>
  )
}

export default BarbellChart