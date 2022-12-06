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

  const height = 225;
  const width = 500;
  const legendWidth = 100;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 50, left: 50, right: 15};
  const circleRadius = 3;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = xMax / 2;
  const yMax = height - margin.top - margin.bottom;

  const x1Key = 'M';
  const x2Key = 'F';
  const yKey = 'age';
  const x1Scale = scaleLinear({
    range: [xMaxHalf, 0],
    domain: [0, Math.max(...filteredData.map(d => Math.max(d[x1Key], d[x2Key])).filter(val => !isNaN(val)))]
  });


  const x2Scale = scaleLinear({
    range: [xMaxHalf, xMax],
    domain: [0, Math.max(...filteredData.map(d => Math.max(d[x1Key], d[x2Key])).filter(val => !isNaN(val)))]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
  });

  const getBar = (d) => {
    const alignEndFirst = x1Scale(d[x1Key]) > (xMaxHalf - 100);
    const alignEndSecond = x2Scale(d[x2Key]) - xMaxHalf > 100;
    return (
      <g key={d[yKey]}>
        <Bar x={x1Scale(d[x1Key])} y={yScale(d[yKey])} width={xMaxHalf - x1Scale(d[x1Key])} height={yScale.bandwidth()} fill={'lightblue'} data-tip={`<p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Male</p><p><strong>Overdoses</strong>: ${d[x1Key].toLocaleString()}</p>`} />
        <Text x={(x1Scale(d[x1Key])) + (alignEndFirst ? -10 : 10)} y={yScale(d[yKey]) + yScale.bandwidth() - 10} textAnchor={alignEndFirst ? 'end' : 'start'} fill="black" fontSize={11}>{d[yKey]}</Text>

        <Bar x={xMaxHalf} y={yScale(d[yKey])} width={x2Scale(d[x2Key]) - xMaxHalf} height={yScale.bandwidth()} fill={'rgb(43, 45, 115)'} data-tip={`<p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Female</p><p><strong>Overdoses</strong>: ${d[x2Key].toLocaleString()}</p>`} />
        <Text x={(x2Scale(d[x2Key])) + (alignEndSecond ? -10 : 10)} y={yScale(d[yKey]) + yScale.bandwidth() - 10} textAnchor={alignEndSecond ? 'end' : 'start'} fill={x2Scale(d[x2Key]) - xMaxHalf > 100 ? 'white' : 'black'} fontSize={11}>{d[yKey]}</Text>
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
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: 'rotate(-60deg)',
                  transformOrigin: `${x1Scale(value)}px ${18}px`,
                  textAnchor: 'end',
                  fontSize: 9
                }
              }
            }}
          />
          <AxisBottom
            top={yMax}
            scale={x2Scale}
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: 'rotate(-60deg)',
                  transformOrigin: `${x2Scale(value)}px ${18}px`,
                  textAnchor: 'end',
                  fontSize: 9
                }
              }
            }}
          />
        </Group>
      </svg>
    </>
  )
}

export default SexAgeCharts