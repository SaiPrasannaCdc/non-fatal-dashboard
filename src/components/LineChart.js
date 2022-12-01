import React from 'react';
import { Circle, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';

function LineChart() {

  const height = 300;
  const width = 500;
  const legendWidth = 100;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 50, left: 50, right: 100};
  const circleRadius = 3;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const series = ['cocaine', 'heroin'];
  const seriesColors = {'cocaine': 'blue', 'heroin': 'red'};
  const xKey = 'year';
  const data = [{ year: 1990, cocaine: 2, heroin: 6 }, { year: 1991, cocaine: 12, heroin: 3 }, { year: 1992, cocaine: 3, heroin: 18 }, { year: 1993, cocaine: 22, heroin: 62 }];

  const xScale = scaleLinear({
    domain: [Math.min(...data.map(d => d[xKey])), Math.max(...data.map(d => d[xKey]))],
    range: [0, xMax]
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => Math.max(...series.map(drug => d[drug]))))],
    range: [yMax, 0],
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <Group top={margin.top} left={margin.left}>
        <Group>
          {series.map(drug => 
            <Group key={`line-series-${drug}`}>
              <LinePath
                data={data}
                x={(d) => xScale(d[xKey]) ?? 0}
                y={(d) => yScale(d[drug]) ?? 0}
                stroke={seriesColors[drug] || '#333'}
                strokeWidth={1}
              />
              <text x={xMax + 5} y={yScale(data[data.length - 1][drug])} alignmentBaseline="middle" fontSize={11} fill={seriesColors[drug] || '#333'}>{drug}</text>
            </Group>
          )}
        </Group>
        <AxisLeft
          scale={yScale}
          label={'Deaths per 100,000 population'}
          labelProps={{
            fontSize: 11,
            textAnchor: 'middle',
            style: {
              transform: `rotate(-90deg) translate(0px, 10px)`
            }
          }}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          tickValues={data.map(d => d[xKey])}
          tickFormat={value => value.toFixed(0)}
          label={'Year'}
        />
      </Group>
    </svg>
  )
}

export default LineChart