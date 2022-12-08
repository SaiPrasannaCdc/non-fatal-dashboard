import React from 'react';
import { Circle, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

function BarbellChart({params}) {

  const { data, monthNames, drugOptions, currentDataSource, currentDrug, currentTimeframe, currentMonth, width } = params;

  const filteredData = data.state[currentDataSource][drugOptions[currentDrug].rateColumn][currentTimeframe === 'Monthly' ? currentMonth : 'all'].filter(d => d.state !== 'US');

  const years = Object.keys(filteredData[0]).filter(item => item !== 'state');
  const states = filteredData.map(d => d.state);

  years.sort();

  const isSmallViewport = width < 500;
  const fontSize = 20;
  const height = 800;
  const legendWidth = 125;
  const legendHeight = 50;
  const margin = {top: 15, bottom: 40, left: isSmallViewport ? 75 : 200, right: 15};
  const circleRadius = 6;
  const doubleCircleRadius = circleRadius * 2;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const x1Key = years[0];
  const x2Key = years[years.length - 1];
  const getX1Value = (d) => {
    if(d[x1Key]) return d[x1Key];
    return 0;
  };
  const getX2Value = (d) => {
    if(d[x2Key]) return d[x2Key];
    return 0;
  };
  const yKey = 'state';

  const xScale = scaleLinear({
    range: [doubleCircleRadius, xMax - doubleCircleRadius],
    domain: [0, Math.max(...filteredData.map(d => Math.max(isNaN(getX1Value(d)) ? 0 : getX1Value(d), isNaN(getX2Value(d)) ? 0 : getX2Value(d))))]
  });

  filteredData.sort((a, b) => getX2Value(a) < getX2Value(b) ? 1 : -1);

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: 1,
  });

  const legend = 
    <>
      <Circle cx={0} cy={0} r={circleRadius} stroke="blue"/><text x={doubleCircleRadius} y={0} fontSize={fontSize} alignmentBaseline="middle">{x2Key} rate</text>
      <Circle cx={0} cy={30} r={circleRadius} stroke="blue" fill="transparent"/><text x={doubleCircleRadius} y={30} fontSize={fontSize} alignmentBaseline="middle">{x1Key} rate</text>
    </>;

  return (
    <>
      <svg style={{height}}>
        <Group top={margin.top} left={margin.left}>
          <rect x={0} y={0} width={xMax} height={yMax} stroke="#ccc" fill="transparent" />
          <Group>
            {filteredData.map((d) => (
              <Group key={`bar-${d[yKey]}`} data-tip={`<h3><strong>${data.supportedStates[d[yKey]]}</strong></h3><p><strong>${currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''}${x1Key} Rate</strong>: ${getX1Value(d)}</p><strong>${currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''}${x2Key} Rate</strong>: ${getX2Value(d)}</p>`}>
                <Line x1={xScale(getX1Value(d))} x2={xScale(getX2Value(d))} y1={yScale(d[yKey])} y2={yScale(d[yKey])}/>
                {isNaN(getX1Value(d)) ? <text x={xScale(getX1Value(d))} y={yScale(d[yKey])} textAnchor="middle" alignmentBaseline="middle" fontSize={fontSize} stroke="#666">X</text> : <Circle cx={xScale(getX1Value(d))} cy={yScale(d[yKey])} r={circleRadius} stroke="blue" fill="transparent"/>}
                {isNaN(getX2Value(d)) ? <text x={xScale(getX2Value(d))} y={yScale(d[yKey])} textAnchor="middle" alignmentBaseline="middle" fontSize={fontSize} stroke="#666">X</text> : <Circle cx={xScale(getX2Value(d))} cy={yScale(d[yKey])} r={circleRadius} stroke="blue"/>}
              </Group>
            ))}
          </Group>
          <AxisLeft
            scale={yScale}
            label={'State'}
            hideAxisLine={true}
            tickValues={states}
            tickFormat={tick => !isSmallViewport && data.supportedStates[tick] ? data.supportedStates[tick] : tick}
            tickLabelProps={() => ({
              fontSize,
              textAnchor: 'end',
              dx: -5,
              dy: 5
            })}
            labelProps={{
              fontSize,
              style: {
                transform: `rotate(-90deg) translate(0px, -${margin.left - 60}px)`
              }
            }}
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            hideAxisLine={true}
            numTicks={isSmallViewport ? 5 : null}
            tickLabelProps={() => ({
              fontSize,
              textAnchor: 'middle'
            })}
          />
          {!isSmallViewport && <Group top={yMax - legendHeight} left={xMax - legendWidth}>{legend}</Group>}
        </Group>
      </svg>
      <p className="x-axis-label" style={{marginLeft: margin.left}}>Overdoses Per 100,000 Population</p>
      {isSmallViewport && (
        <svg style={{height: legendHeight}}>
          <Group top={10} left={10}>
            {legend}
          </Group>
        </svg>
      )}
    </>
  )
}

export default BarbellChart