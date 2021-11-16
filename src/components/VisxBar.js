import React from 'react';
import { BarGroupHorizontal, Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft } from '@visx/axis';
import { cityTemperature } from '@visx/mock-data';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from 'd3-time-format';


const blue = '#aeeef8';
export const green = '#e5fd3d';
const purple = '#9caff6';
export const background = '#612efb';
const defaultMargin = { top: 20, right: 20, bottom: 20, left: 50 };

const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = (date) => format(parseDate(date));
function max(arr, fn) {
  return Math.max(...arr.map(fn));
}

const data = cityTemperature.slice(0, 4);
const keys = Object.keys(data[0]).filter(d => d !== 'date');

// accessors
const getDate = (d) => d.date;

// scales
const dateScale = scaleBand({
  domain: data.map(getDate),
  padding: 0.2,
});
const cityScale = scaleBand({
  domain: keys,
  padding: 0.1,
});
const tempScale = scaleLinear({
  domain: [0, max(data, d => max(keys, key => Number(d[key])))],
});
// const colorScale = scaleOrdinal({
//   domain: keys,
//   range: [blue, green, purple],
// });

export default function VisxBar({
  width,
  height,
  margin = defaultMargin,
  events = false,
}) {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  dateScale.rangeRound([0, yMax]);
  cityScale.rangeRound([0, dateScale.bandwidth()]);
  tempScale.rangeRound([0, xMax]);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
      <Group top={margin.top} left={margin.left}>
        <BarGroupHorizontal
          data={data}
          keys={keys}
          width={xMax}
          y0={getDate}
          y0Scale={dateScale}
          y1Scale={cityScale}
          xScale={tempScale}
          //color={colorScale}
        >
          {barGroups =>
            barGroups.map(barGroup => (
              <Group
                key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
                top={barGroup.y0}
              >
                {barGroup.bars.map(bar => (
                  <Bar
                    key={`${barGroup.index}-${bar.index}-${bar.key}`}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={bar.color}
                    rx={4}
                    onClick={() => {
                      if (events) alert(`${bar.key} (${bar.value}) - ${JSON.stringify(bar)}`);
                    }}
                  />
                ))}
              </Group>
            ))
          }
        </BarGroupHorizontal>
        <AxisLeft
          scale={dateScale}
          stroke={green}
          tickStroke={green}
          tickFormat={formatDate}
          hideAxisLine
          tickLabelProps={() => ({
            fill: green,
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
          })}
        />
      </Group>
    </svg>
  );
}