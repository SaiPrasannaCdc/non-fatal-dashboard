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
  range = null,
  chartType = null
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
    const d1EndMonth = parseInt(d1.endMonth);
    const d1EndYear = parseInt(d1.endYear);
    const d2EndMonth = parseInt(d2.endMonth);
    const d2EndYear = parseInt(d2.endYear);

    if(d1EndYear < d2EndYear) return -1;
    if(d1EndYear > d2EndYear) return 1;
    if(d1EndMonth < d2EndMonth) return -1;
    if(d1EndMonth > d2EndMonth) return 1;
    return 0;
  });

  const { fill, drugScreenOptions, currentDrug } = useContext(Context);

  const drugTitle = drugScreenOptions[currentDrug].titlePlural;
  const percentColumn = drugScreenOptions[currentDrug].percentageColumn;
  const significanceColumn = drugScreenOptions[currentDrug].significanceColumn;

  const axisBottomHeight = 30;
  const marginRight = 30;

  let timelineType;

  const getXValue = (d) => {
    if(!d) return '';
    if(d.startMonth === d.endMonth) {
      timelineType = "Annual";
      return `${months[d.endMonth - 1]} ${d.startYear}-${d.endYear.substring(2)}`;
    }
    timelineType = "30 day"
    return `${months[d.startMonth - 1]} ${d.startYear.substring(2)} - ${months[d.endMonth - 1]} ${d.endYear.substring(2)}`
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
    range: [20, yMax - 20],
    round: true,
    domain: [ range[0], range[1] ],
  });

  const center = yScale(0);

  return width < 10 ? null : (
    <svg viewBox={`0 0 ${width} ${height+50}`}>
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group left={100} bottom={200}>
        {data.map((d) => {
          if(!d || isNaN(center)) return '';

          const chartMeta = d.key.split('|');
          const yValue = getYValue(d);
          const xValue = getXValue(d);
          const barY = (yScale(yValue) ??  center);
          const barX = xScale(xValue);
          
          let drugRow = yValue ? // set drug tooltip row if we have a number
            `<div class="percentage-row">
              <div>${drugTitle}:</div>
              <div>${yValue}%</div>
            </div>`
            : '';

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
                r={6}
                cy={barY}
                cx={barX + 1}
                fill={fill(d[significanceColumn])}
                data-tip={`
                  <div class="state-name-row">
                    <div><strong>${chartMeta[0] + ( chartType ? ': ' + chartType : '' )}</strong></div>
                  </div>
                  <div class="significance-row">${d[significanceColumn]}</div>
                  ${drugRow}
                `}
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
          labelProps={{
            fontSize: 13,
            textAnchor: 'middle'
          }}
          tickLabelProps={() => ({
            fill: 'black',
            fontSize: 12,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={6}
          hideAxisLine={true}
          hideTicks={true}
          tickLabelProps={(label, index, props) => ({
            fill: 'black',
            fontSize: 12,
            textAnchor: 'middle',
            dy: 5,
            dx: -65,
            transform: `rotate(-35, ${props[index].to.x}, ${props[index].to.y})`,
            dominantBaseline: 'end'       
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