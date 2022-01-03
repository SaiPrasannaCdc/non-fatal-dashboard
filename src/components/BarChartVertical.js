import React, { useContext } from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import Context from '../context';

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

  const { fill, drugScreenOptions, currentDrug } = useContext(Context);

  const percentColumn = drugScreenOptions[currentDrug].percentageColumn;
  const significanceColumn = drugScreenOptions[currentDrug].significanceColumn;

  const axisBottomHeight = 30;
  const marginRight = 30;

  const getXValue = (d) => {
    if(!d) return '';
    if(d.startMonth === d.endMonth) {
      return `${months[d.endMonth - 1]} ${d.startYear}-${d.endYear.substring(1)}`;
    }
    return `${months[d.startMonth - 1]}-${months[d.endMonth - 1]}`
  };
  const getYValue = (d) => Number(d ? d[percentColumn] : 0);

  // bounds
  const xMax = width - marginRight;
  const yMax = height - axisBottomHeight;

  // scales, memoize for performance
  const xScale = scaleBand({
    range: [0, xMax],
    round: true,
    domain: data.map(getXValue),
    padding: 0.4,
  });

  const yScale = scaleLinear({
    range: [20, yMax],
    round: true,
    domain: [Math.max(...data.map(getYValue), 1) * 1.1, Math.min(...data.map(getYValue), -1) * 1.1],
  });

  const center = yScale(0);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group left={100} bottom={200}>
        {data.map((d) => {
          if(!d || isNaN(center)) return '';

          const xValue = getXValue(d);
          const barY = (yScale(getYValue(d)) ?? 0);
          const barX = xScale(xValue);

          return (
            <Group key={`bar-${xValue}`}>
              <Bar
                x={barX}
                y={barY < center ? barY : center}
                width={2}
                height={Math.abs(barY - center)}
                fill={fill(d[significanceColumn])}
              />
              <Circle
                key={`circle-${xValue}`}
                r={4}
                cy={barY}
                cx={barX + 1}
                fill={fill(d[significanceColumn])}
              />
            </Group>
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
          top={yMax}
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
        {!isNaN(center) && (
          <line y1={center } y2={center} x1={xMax} x2={0} stroke={'black'} />
        )}
      </Group>
    </svg>
  );
}

export default BarChartVertical