import React from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

function BarChartVertical({
  data,
  width,
  height,
}) {

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  data.sort((d1, d2) => {
    if(d1.endYear < d2.endYear) return -1;
    if(d1.endYear > d2.endYear) return 1;
    if(d1.endMonth < d2.endMonth) return -1;
    if(d1.endMonth > d2.endMonth) return 1;
    return 0;
  });

  const axisBottomHeight = 30;

  const getXValue = (d) => {
    if(!d) return '';
    if(d.startMonth === d.endMonth) {
      return `${months[d.endMonth]} ${d.startYear}-${d.endYear.substring(1)}`;
    }
    return `${months[d.startMonth]}-${months[d.endMonth]}`
  };
  const getYValue = (d) => Number(d ? d.allPercentageChange : 0);

  // bounds
  const xMax = width;
  const yMax = height;

  // scales, memoize for performance
  const xScale = scaleBand({
    range: [0, xMax],
    round: true,
    domain: data.map(getXValue),
    padding: 0.4,
  });

  const yScale = scaleLinear({
    range: [20, yMax - axisBottomHeight],
    round: true,
    domain: [Math.max(...data.map(getYValue)) * 1.1, Math.min(...data.map(getYValue)) * 1.1],
  });

  const center = yScale(0);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group left={100} bottom={200}>
        {data.map((d) => {
          const xValue = getXValue(d);
          const barY = (yScale(getYValue(d)) ?? 0);
          const barX = xScale(xValue);

          return (
            <>
            <Bar
              key={`bar-${xValue}`}
              x={barX}
              y={barY < center ? barY : center}
              width={2}
              height={Math.abs(barY - center)}
              // bar.value > 0 ? bar.width - center : center - Math.abs(bar.width)
              // fill="rgba(23, 233, 217, .5)"
              // onClick={() => {
              //   if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`)
              // }}
            />
            <Circle
              key={`circle-${xValue}`}
              r={4}
              cy={barY}
              cx={barX + 1}
              // fill={barFill}
            />
            </>
          );
        })}
        <AxisLeft
          scale={yScale}
          label={'Percent Change'}
          numTicks={5}
          hideAxisLine={true}
          hideTicks={true}
          tickLabelProps={() => ({
            fill: 'black',
            fontSize: 13,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
        <AxisBottom
          top={yMax - axisBottomHeight}
          scale={xScale}
          label={'30 day comparison'}
          numTicks={5}
          hideAxisLine={true}
          hideTicks={true}
          tickLabelProps={() => ({
            fill: 'black',
            fontSize: 13,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
        <line y1={center } y2={center} x1={xMax} x2={0} stroke={'black'} />
      </Group>
    </svg>
  );
}

export default BarChartVertical