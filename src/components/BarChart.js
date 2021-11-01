import React, { memo } from 'react';
import { BarGroupHorizontal, Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import chroma from 'chroma-js';
import {Motion, spring} from 'react-motion';

const defaultMargin = { top: 10, right: 20, bottom: 80, left: 100 };

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
  margin = defaultMargin,
  barColors
}) {

  const keys = ['percent'];

  let highest = 0;
  data.map((drug) => {
    if (Number.parseInt(drug.percent) && Math.abs(Number.parseInt(drug.percent)) > highest) {
      highest = Math.abs(Number.parseInt(drug.percent));
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

  // bounds
  const xMax = width - margin.left - margin.right;
  const xMin = min(data, d => min(keys, key => Number.parseInt(d[key])))
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  typeScale.rangeRound([0, yMax]);
  cityScale.rangeRound([0, typeScale.bandwidth()]);
  percentScale.rangeRound([0, xMax]);

  const center = xMax / 2;
  const blackColor = '#444';

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
          color={() => {return '';}}
        >
        {barGroups => (
          <Group>
            {barGroups.map((barGroup, index) => (
              <Group
                key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
                top={barGroup.y0}
              > 
                {barGroup.bars.map(bar => {
                  const width = bar.value > 0 ? bar.width - center : center - Math.abs(bar.width);
                  const x = bar.value > 0 ? center : (center - width)
                  let offset = bar.value.length * 10
                  let textInset = bar.value > 0 ? center - offset : center + 5

                  const barColor = barColors[index];
                  let labelColor = "#000000";
                  if (chroma.contrast(labelColor, barColor) < 4.9) {
                    labelColor = '#FFFFFF';
                  }

                  let barValue = '';
                  if (Number.parseInt(bar.value)) {
                    barValue = bar.value + '%';
                  } 

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
                        fill={barColor}
                      />
                      <text
                        x={bar.value > 0 ? textInset + interpolated.width : textInset - interpolated.width}
                        y={bar.y + 16}
                        style={{ fontSize: '13px' }}
                        fill={labelColor}>
                        {barValue}
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
          label={'Percent Change'}
          tickFormat={function tickFormat(d){
            return d + '%';
          }}
          labelClassName={'bar-chart-xaxis-label'}
          labelOffset={20}
          stroke={blackColor}
          numTicks={7}
          tickStroke={blackColor}
          tickLabelProps={() => ({
            fill: blackColor,
            fontSize: 13,
            textAnchor: 'middle',
            dy: '0.33em',
          })}
        />
      </Group>
      <line x1={center + 100} x2={center + 100} y1={yMax + 5} y2={10} stroke={blackColor} />
    </svg>
  );
}

export default BarChart