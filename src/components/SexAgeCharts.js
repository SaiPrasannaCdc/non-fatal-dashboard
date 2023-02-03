import React from 'react';
import { Bar, Circle } from '@visx/shape';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';

function SexAgeCharts({ params }) {

  const { data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, currentDataType, width } = params;

  const filteredData = data.sex[currentDataSource][currentDrug][currentYear][currentTimeframe === 'Monthly' ? currentMonth : 'all'][currentDataType];

  const isSmallViewport = width < 500;
  const fontSize = 16;
  const height = 450;
  const margin = { top: 50, bottom: 125, left: 50, right: 15 };

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = xMax / 2;
  const yMax = height - margin.top - margin.bottom;

  const x1Key = 'M';
  const x2Key = 'F';
  const yKey = 'age';

  let overallMax = data.sex[currentDataSource][currentDrug][`max${currentTimeframe}`][currentDataType];
  if(overallMax === 0) overallMax = 1;

  const x1Scale = scaleLinear({
    range: [xMaxHalf, 0],
    domain: [-.05 * overallMax, overallMax]
  });

  const x2Scale = scaleLinear({
    range: [xMaxHalf, xMax],
    domain: [-.05 * overallMax, overallMax]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
  });

  const getBar = (d) => {
    const x1Pos = x1Scale(isNaN(d[x1Key]) ? overallMax * .1 : d[x1Key]);
    const x2Pos = x2Scale(isNaN(d[x2Key]) ? overallMax * .1 : d[x2Key]);

    const alignEndFirst = x1Pos > (xMaxHalf - 50);
    const alignEndSecond = x2Pos - xMaxHalf > 55;

    return (
      <g key={d[yKey]}>
        <Bar x={x1Pos} y={yScale(d[yKey])} width={xMaxHalf - x1Pos} height={yScale.bandwidth()} fill={isNaN(d[x1Key]) ? 'transparent' : 'lightblue'} stroke="lightblue" data-tip={`<p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Male</p><p><strong>${currentDataType === 'count' ? 'Overdoses' : 'Rate'}</strong>: ${d[x1Key].toLocaleString()}</p>`} />
        <Text x={(x1Pos) + (alignEndFirst ? -10 : 10)} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} textAnchor={alignEndFirst ? 'end' : 'start'} fill="black" fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{d[yKey]}</Text>

        <Bar x={xMaxHalf} y={yScale(d[yKey])} width={x2Pos - xMaxHalf} height={yScale.bandwidth()} fill={isNaN(d[x2Key]) ? 'transparent' : 'rgb(43, 45, 115)'} stroke="rgb(43, 45, 115)" data-tip={`<p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Female</p><p><strong>${currentDataType === 'count' ? 'Overdoses' : 'Rate'}</strong>: ${d[x2Key].toLocaleString()}</p>`} />
        <Text x={(x2Pos) + (alignEndSecond ? -10 : 10)} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} textAnchor={alignEndSecond ? 'end' : 'start'} fill={alignEndSecond ? 'white' : 'black'} fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{d[yKey]}</Text>
      </g>
    )
  }

  return (
    <>
      <svg style={{ height }}>
        <Group top={margin.top} left={margin.left}>
          <Text x={x1Scale(0) - 15} y={0} textAnchor="end">Male</Text>
          <Text x={x2Scale(0) + 15} y={0}>Female</Text>
          <Group>
            {filteredData.map((d) => getBar(d, false))}
          </Group>
          <Text x={-20} y={yMax / 2} style={{ transform: 'rotate(-90deg)', transformOrigin: `-20px ${yMax / 2}px` }} fontSize={fontSize} textAnchor="middle">Age Group</Text>
          <AxisBottom
            top={yMax}
            scale={x1Scale}
            numTicks={isSmallViewport ? 3 : null}
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: 'rotate(-60deg)',
                  transformOrigin: `${x1Scale(value)}px ${18}px`,
                  textAnchor: 'end',
                  fontSize: fontSize
                }
              }
            }}
          />
          <AxisBottom
            top={yMax}
            scale={x2Scale}
            numTicks={isSmallViewport ? 3 : null}
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: 'rotate(-60deg)',
                  transformOrigin: `${x2Scale(value)}px ${18}px`,
                  textAnchor: 'end',
                  fontSize: fontSize
                }
              }
            }}
            label={{count: 'Count', rate: 'Rate per 100,000 persons'}[currentDataType]}
            labelProps={{
              fontSize,
              textAnchor: 'middle',
              dx: xMax / -4,
              dy: 50
            }}
          />
        </Group>
      </svg>
    </>
  )
}

export default SexAgeCharts