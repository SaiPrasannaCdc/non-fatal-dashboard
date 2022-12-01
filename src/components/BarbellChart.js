import React from 'react';
import { Circle, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

function BarbellChart() {

  const height = 500;
  const width = 500;
  const legendWidth = 100;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 50, left: 110, right: 15};
  const circleRadius = 3;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const x1Key = 'value1';
  const x2Key = 'value2';
  const yKey = 'state';
  const data = [{ state: 'Georgia', value1: 2, value2: 6 }, { state: 'Florida', value1: 12, value2: 3 }, { state: 'North Carolina', value1: 3, value2: 18 }, { state: 'South Carolina', value1: 22, value2: 62 }];

  const xScale = scaleLinear({
    range: [doubleCircleRadius, xMax - doubleCircleRadius],
    domain: [0, Math.max(...data.map(d => Math.max(d[x1Key], d[x2Key])))]
  });

  data.sort((a, b) => a[x1Key] < b[x2Key] ? 1 : -1);

  const yScale = scaleBand({
    range: [0, yMax],
    domain: data.map(d => d[yKey]),
    padding: 1,
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <Group top={margin.top} left={margin.left}>
        <rect x={0} y={0} width={xMax} height={yMax} stroke="#ccc" fill="transparent" />
        <Group>
          {data.map((d) => (
            <Group key={`bar-${d[yKey]}`}>
              <Line x1={xScale(d[x1Key])} x2={xScale(d[x2Key])} y1={yScale(d[yKey])} y2={yScale(d[yKey])}/>
              <Circle cx={xScale(d[x1Key])} cy={yScale(d[yKey])} r={circleRadius} stroke="blue" fill="transparent"/>
              <Circle cx={xScale(d[x2Key])} cy={yScale(d[yKey])} r={circleRadius} stroke="blue"/>
            </Group>
          ))}
        </Group>
        <AxisLeft
          scale={yScale}
          label={'State'}
          hideAxisLine={true}
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
          <Circle cx={0} cy={0} r={circleRadius} stroke="blue"/><text x={doubleCircleRadius} y={0} fontSize={11} alignmentBaseline="middle">2015 rate</text>
          <Circle cx={0} cy={20} r={circleRadius} stroke="blue" fill="transparent"/><text x={doubleCircleRadius} y={20} fontSize={11} alignmentBaseline="middle">2010 rate</text>
        </Group>
      </Group>
    </svg>
  )
}

export default BarbellChart