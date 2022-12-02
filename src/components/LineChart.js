import React, { useContext } from 'react';
import { Circle, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';

import Context from '../context';

function LineChart() {

  const { data, drugScreenOptions, currentDataSource, currentState, currentMonth } = useContext(Context);

  const filteredData = data.year[currentDataSource][currentState][currentMonth];

  const years = filteredData.map(d => parseInt(d.year));

  const height = 300;
  const width = 500;
  const legendWidth = 100;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 50, left: 50, right: 100};
  const circleRadius = 3;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const series = Object.keys(drugScreenOptions);
  const xKey = 'year';

  const xScale = scaleLinear({
    domain: [Math.min(...years), Math.max(...years)],
    range: [0, xMax]
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...filteredData.map(d => Math.max(...Object.keys(drugScreenOptions).map(drug => parseFloat(d[drug])))))],
    range: [yMax, 0],
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <Group top={margin.top} left={margin.left}>
        <Group>
          {series.map(drug => 
            <Group key={`line-series-${drug}`}>
              <LinePath
                data={filteredData}
                x={(d) => xScale(d[xKey]) ?? 0}
                y={(d) => yScale(d[drug]) ?? 0}
                stroke={drugScreenOptions[drug].color || '#333'}
                strokeWidth={1}
              />
              <text x={xMax + 5} y={yScale(filteredData[filteredData.length - 1][drug])} alignmentBaseline="middle" fontSize={11} fill={drugScreenOptions[drug].color || '#333'}>{drugScreenOptions[drug].titleAll}</text>
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
          tickValues={filteredData.map(d => d[xKey])}
          tickFormat={value => value.toFixed(0)}
          label={'Year'}
        />
      </Group>
    </svg>
  )
}

export default LineChart