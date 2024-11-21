import React, { useContext } from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import { UtilityFunctions } from '../utility'

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
  const drugTitle = drugScreenOptions[currentDrug].titleAll;
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

  const ticksFromRange = () => {

    var maxRange = UtilityFunctions.calculateMinMax(data, currentDrug, 'max');
    var minRange = UtilityFunctions.calculateMinMax(data, currentDrug, 'min');

    const intervalWidth = Math.max(1, Math.ceil((maxRange - minRange) / 50) * 10);

    let ticks = [];

    //Ensure 0 is a tick
    let value = 0;
    ticks.push(value);

    //Count up by interval width ensuring greatest value is represented
    while(value < maxRange){
      value += intervalWidth;
      ticks.push(value);
    }

    //Count down by interval width ensuring lowest value is represented
    value = -1 * intervalWidth;
    ticks.unshift(value);
    while(value > minRange){
      value -= intervalWidth;
      ticks.unshift(value);
    }
    ticks.unshift(value);

    return ticks;
  };

  const ticks = ticksFromRange();

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
    range: [20, yMax - 40],
    domain: [ Math.max(...ticks), Math.min(...ticks) ]
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
          const suppress = (!yScale(yValue) );
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

              { suppress &&
                <svg
                  y={-15}
                  x={barX - 10}
                  aria-hidden="true"
                  data-prefix="fas"
                  data-icon="asterisk"
                  className="svg-inline--fa fa-asterisk fa-w-16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 30 30"
                  width="30"
                  // fill={fill(d[significanceColumn])}
                  stroke="#999"
                  data-tip={`
                    <div class="state-name-row">
                      <div><strong>${chartMeta[0] + ( chartType ? ': ' + chartType : '' )}</strong></div>
                    </div>
                    <div class="significance-row">${d[significanceColumn]}</div>
                    ${drugRow}
                  `}
                >
                  <path d="M6.7 6.5 6 .6h2.9l-.6 5.9 6-1.6.4 2.7-5.8.5 3.8 4.9-2.6 1.4-2.7-5.5L5 14.4 2.4 13 6 8.1.3 7.6l.5-2.7z"/>
                </svg>
              }
              {!suppress &&
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
              }
            </Group>
          );
        })}
        <AxisLeft
          scale={yScale}
          label={'Percent Change'}
          tickValues={ticks}
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