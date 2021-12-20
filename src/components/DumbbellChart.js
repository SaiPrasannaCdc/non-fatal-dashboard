import React, { memo } from 'react';
import { Polygon } from '@visx/shape';
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

function DumbbellChart({
  usData,
  stateData,
  width,
  height,
  margin = defaultMargin,
  formatPercentage,
  drugScreenOptions,
  keyIndex,
  mapColorPalette,
  legendOrder
}) {

  let highest = 0;
  let types = [];
  let chartData = [];

  Object.values(drugScreenOptions).map((drugScreenOption, index) => {

    const type = drugScreenOption['titleAll'];

    const usPercentage = usData[keyIndex[drugScreenOption['percentageColumn']]];
    const usSignificance = usData[keyIndex[drugScreenOption['significanceColumn']]];

    const statePercentage = stateData[keyIndex[drugScreenOption['percentageColumn']]];
    const stateSignificance = stateData[keyIndex[drugScreenOption['significanceColumn']]];
    types.push(type);

    if (Number.parseFloat(statePercentage) && Math.abs(Number.parseFloat(statePercentage)) > highest) {
      highest = Math.abs(Number.parseFloat(statePercentage));
    }

    if (Number.parseFloat(usPercentage) && Math.abs(Number.parseFloat(usPercentage)) > highest) {
      highest = Math.abs(Number.parseFloat(usPercentage));
    }

    chartData.push(
      {
        'index': index,
        'type': drugScreenOption['titleAll'],
        'usPercent': usPercentage,
        'usSignificance': usSignificance,
        'usColor': mapColorPalette[legendOrder.indexOf(usSignificance)],
        'statePercent': statePercentage,
        'stateSignificance': stateSignificance,
        'stateColor': mapColorPalette[legendOrder.indexOf(stateSignificance)],
      }
    );
  });
  
  const dataKeys = ['usPercent'];

  const getType = (d) => d.type;

  const typeScale = scaleBand({
    domain: chartData.map(row => row['type']),
    padding: 0.2,
  });

  const keysScale = scaleBand({
    domain: ['usPercent'],
    padding: 0.1,
  });

  const percentScale = scaleLinear({
    domain: [highest * - 1, highest],
  });

  const xMax = width - margin.left - margin.right;
  //const xMin = min(data, d => min(dataKeys, key => Number.parseFloat(d[key])))
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  typeScale.rangeRound([0, yMax]);
  keysScale.rangeRound([0, typeScale.bandwidth()]);
  percentScale.rangeRound([0, xMax]);

  const center = xMax / 2;
  const blackColor = '#444';

  return width < 10 ? null : (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <line x1={center + 100} x2={center + 100} y1={yMax + 5} y2={10} stroke={blackColor} />
      <Group top={margin.top} left={margin.left}>
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

        {chartData.map((row) => {
            
          const lineX1 = percentScale(row['usPercent']);
          const lineX2 = percentScale(row['statePercent']);
          const lineY = typeScale(row['type']) + 24;
  
          return (
            <g>
              <line className="visx-boxplot-max" x1={lineX1} y1={lineY} x2={lineX2} y2={lineY} stroke={'#CCCCCC'} strokeWidth="3"></line>
              <circle style={{ fill: row['usColor'] }}  cx={lineX1} cy={lineY} r="10" />
              {/* <circle style={{ fill: row['stateColor'] }} stroke="black" cx={lineX2} cy={lineY} r="5" /> */}
              <Polygon
                sides={6}
                size={12}
                fill={row['stateColor']}
                rotate={90}
                center={{ x: lineX2, y: lineY }}
                // stroke={'#CCCCCC'}
              />
            </g>
          );
        })}
      </Group>
    </svg>
  );
}

export default DumbbellChart