import React, { memo } from 'react';
import { BarGroupHorizontal, Bar, Circle } from '@visx/shape';
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
  usBarColors,
  stateBarColors,
  width,
  height,
  dataKeys,
  margin = defaultMargin,
  formatPercentage,
  colorKeys,
  selectedState
}) {

  let highest = 0;
  data.map((row) => {
    dataKeys.map((key) => {
      if (Number.parseFloat(row[key]) && Math.abs(Number.parseFloat(row[key])) > highest) {
        highest = Math.abs(Number.parseFloat(row[key]));
      }
    });
  });

  // accessors
  const getType = (d) => d.type;

  // scales
  const typeScale = scaleBand({
    domain: data.map(row => row['type']),
    padding: 0.2,
  });

  const keysScale = scaleBand({
    domain: dataKeys,
    padding: 0.1,
  });

  const percentScale = scaleLinear({
    domain: [highest * - 1, highest],
  });

  // bounds
  const xMax = width - margin.left - margin.right;
  const xMin = min(data, d => min(dataKeys, key => Number.parseFloat(d[key])))
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  typeScale.rangeRound([0, yMax]);
  keysScale.rangeRound([0, typeScale.bandwidth()]);
  percentScale.rangeRound([0, xMax]);

  const center = xMax / 2;
  const blackColor = '#444';

  const hasState = stateBarColors && stateBarColors.length > 0;

  return width < 10 ? null : (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <Group top={margin.top} left={margin.left}>
        <BarGroupHorizontal
          data={data}
          keys={dataKeys}
          width={xMax}
          y0={getType}
          y0Scale={typeScale}
          y1Scale={keysScale}
          xScale={percentScale}
          color={() => {return '';}}
          // color={(d, index) => {
          //   return data[index][colorKeys[index]];
          // }}
        >
        {barGroups => (
          <Group>
            {barGroups.map((barGroup, index) => (
              <Group
                key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
                top={barGroup.y0}
              > 
                {barGroup.bars.map((bar, barIndex) => {

                  const barColor = data[barGroup.index][colorKeys[barIndex]];

                  //const isState = 1 === barIndex;
                  const isState = false;

                  let width = 0;
                  if (Number.parseFloat(bar.value)) {
                    width = bar.value > 0 ? bar.width - center : center - Math.abs(bar.width);
                  }
                  // debugger;
                  const x = bar.value > 0 ? center : (center - width)
                  // let offset = bar.value.length * 11.5
                  let textInset =  center;

                  //Optionally move the text to outside the bar
                  // if (width < 70) {
                  //   if (bar.value < 0) {
                  //     textInset = textInset - 52;
                  //   } else {
                  //     textInset = textInset + 52;
                  //   }
                  // }

                  //let barColor = '#FFFFFF';
                  // let barColor = usBarColors[barGroup.index];
                  // if (isState) {
                  //   barColor = stateBarColors[barGroup.index];
                  // }

                  let labelColor = "#000000";
                  // if (chroma.contrast(labelColor, barColor) < 4.9) {
                  //   labelColor = '#FFFFFF';
                  // }
// console.log('bar: ', bar)
                  let barValue = '';
                  if (Number.parseFloat(bar.value)) {
                    barValue = formatPercentage(bar.value);
                  } 

                  let barFill = barColor;
                  if (isState) {
                    barFill = `url(#checkerboard-${barGroup.index}-${bar.index}-${bar.key})`;
                  }

                  let textVerticalOffset = bar.height/2 + 14;
                  // if (dataKeys.length > 1) {
                  //   textVerticalOffset = 15
                  // }

                  return (
                  <Motion defaultStyle={{width: 0, x: center}} style={{width: spring(width), x: spring(x)}}>
                    {interpolated => 
                      <>
                          {isState && <defs>
                            <pattern id={`checkerboard-${barGroup.index}-${bar.index}-${bar.key}`} patternUnits="userSpaceOnUse"
                              width="3" height="3">
                              <rect x="0" y="0" width="1" height="1" fill={barColor} />
                              <rect x="1" y="1" width="1" height="1" fill={barColor} />
                            </pattern>
                          </defs>}
                        <Bar
                          key={`${barGroup.index}-${bar.index}-${bar.key}`}
                          x={interpolated.x}
                          y={bar.y}
                          width={interpolated.width}
                          height={3 }
                          fill={barFill}
                          //fill={`url(#checkerboard-${barGroup.index}-${bar.index}-${bar.key})`}
                          // stroke='#ccc'
                          />
                          {/* const Hexagon = ({fill}) => {
  return ( */}

{selectedState && 
                          <svg 
                            width={18} 
                            height={18} 
                            x={ bar.value > 0 ? textInset + interpolated.width - 1: textInset - interpolated.width - 16} 
                            // x={ textInset - interpolated.width - 18} 
                              y={bar.y - 8}
                            viewBox="0 0 45 51">
                            <polygon 
                              fill={barFill} 
                              points="22 0 44 12.702 44 38.105 22 50.807 0 38.105 0 12.702"
                            />
                          </svg>
                }
  {/* )
} */}
{!selectedState && 
                          <Circle
                            key={`point-${bar.key}`}
                            r={8}
                            cx={bar.value > 0 ? textInset + interpolated.width - 2: textInset - interpolated.width - 8}
                            cy={bar.y + 1}
                            fill={barFill}
                          />
}
                        {/* <text
                          x={bar.value > 0 ? textInset + interpolated.width + 24 : textInset - interpolated.width - 70}
                          y={bar.y + 6}
                          style={{ fontSize: '13px' }}
                          fill={labelColor}>
                          {barValue}
                        </text> */}
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
          tickFormat={function tickFormat(d,e, f){
            console.log(d, e, f)
            return data[e].label;
          }}
        />
        <AxisBottom
          top={yMax-5}
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