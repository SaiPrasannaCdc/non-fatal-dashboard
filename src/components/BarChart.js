import React, { memo } from 'react';
import { BarGroupHorizontal, Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';

import {Motion, spring} from 'react-motion';

const blue = '#aeeef8';
const green = '#e5fd3d';
const purple = '#9caff6';
const defaultMargin = { top: 10, right: 20, bottom: 30, left: 100 };

function max(arr, fn) {
  return Math.max(...arr.map(fn));
}

function min(arr, fn) {
  return Math.min(...arr.map(fn));
}

function absMax(arr, fn) {
  return Math.max(...arr.map(fn));
}

function BarChart({
  data,
  width,
  height,
  margin = defaultMargin
}) {
  debugger;
  const keys = ['percent'];

  let highest = 0;
  data.map((drug) => {
    if (Number.parseInt(drug.percent) && Number.parseInt(drug.percent) > highest) {
      highest = Number.parseInt(drug.percent);
    }
  });

  // accessors
  const getType = (d) => d.type;

  // scales
  const typeScale = scaleBand({
    domain: data.map(row => row['type']),
    padding: 0.2,
  });
  const cityScale = scaleBand({
    domain: keys,
    padding: 0.1,
  });
  const percentScale = scaleLinear({
    domain: [highest * - 1, highest],
  });
  const colorScale = scaleOrdinal({
    domain: keys,
    range: [blue, green, purple],
  });

  // bounds
  const xMax = width - margin.left - margin.right;
  const xMin = min(data, d => min(keys, key => Number.parseInt(d[key])))
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  typeScale.rangeRound([0, yMax]);
  cityScale.rangeRound([0, typeScale.bandwidth()]);
  percentScale.rangeRound([0, xMax]);

  const blackColor = '#444'

  const center = xMax / 2

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        <BarGroupHorizontal
          data={data}
          keys={keys}
          width={xMax}
          y0={getType}
          y0Scale={typeScale}
          y1Scale={cityScale}
          xScale={percentScale}
          color={colorScale}
        >
        {barGroups => (
          <Group>
            {barGroups.map(barGroup => (
              <Group
                key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
                top={barGroup.y0}
              > 
                {barGroup.bars.map(bar => {
                  const x = bar.value > 0 ? center : (xMax - center - bar.width)
                  const width = bar.value > 0 ? bar.width - center : bar.width
                  let offset = bar.value.length * 10
                  let textInset = bar.value > 0 ? center - offset : center + 5 
                  return (
                  <Motion defaultStyle={{width: 0, x: center}} style={{width: spring(width), x: spring(x)}}>
                    {interpolated => 
                    <>
                      <Bar
                        key={`${barGroup.index}-${bar.index}-${bar.key}`}
                        x={interpolated.x}
                        y={bar.y}
                        width={interpolated.width}
                        height={bar.height}
                        fill={'#EF6D2E'}
                      />
                      <text
                        x={bar.value > 0 ? textInset + interpolated.width : textInset - interpolated.width}
                        y={bar.y + 16}
                        style={{fontSize: '13px'}}
                        fill="#FFF">
                          {bar.value}%
                      </text>
                    </>
                    }
                  </Motion>
                )})}
              </Group>
            ))}
            </Group>
        )}
        </BarGroupHorizontal>
        <AxisLeft
          scale={typeScale}
          stroke={blackColor}
          tickStroke={blackColor}
          tickLabelProps={() => ({
            fill: blackColor,
            fontSize: 13,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
        <AxisBottom
          top={155}
          scale={percentScale}
          stroke={blackColor}
          numTicks={7}
          tickStroke={blackColor}
          tickLabelProps={() => ({
            fill: blackColor,
            fontSize: 13,
            textAnchor: 'end',
            dy: '0.33em',
          })}
        />
      </Group>
      <line x1={center + 100} x2={center + 100} y1={yMax + 5} y2={10} stroke={blackColor} />
    </svg>
  );
}

export default BarChart