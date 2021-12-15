import React, { useMemo } from 'react';
import { BarGroup, Bar, Circle, VerticalBarShape } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import chroma from 'chroma-js';
import {Motion, spring} from 'react-motion';
// import { letterFrequency } from '@visx/mock-data';

const defaultMargin = { top: 10, right: 20, bottom: 80, left: 100 };

function BarChartVertical({
  // data,
  usBarColors,
  stateBarColors,
  width,
  height,
  dataKeys,
  // margin = defaultMargin,
  formatPercentage,
  colorKeys,
  selectedState
}) {

  const letterFrequency = [
    {
      "letter": "Dec-Jan",
      "frequency": 0.6
    },
    {
        "letter": "Jan-Feb",
        "frequency": 0.4
    },
    {
        "letter": "Feb-Mar",
        "frequency": -0.5
    },
    {
        "letter": "Mar-Apr",
        "frequency": -0.4
    },
    {
        "letter": "Apr-May",
        "frequency": 0.4
    },
    {
      "letter": "May-Jun",
      "frequency": 0.6
    }
  ];

  const data = letterFrequency;
const verticalMargin = 120;

  const getLetter = (d) => d.letter;
const getLetterFrequency = (d) => Number(d.frequency) ;


  // bounds
  const xMax = width;
  const yMax = height;

  // scales, memoize for performance
  const xScale = 

      scaleBand({
        range: [0, xMax],
        round: true,
        domain: data.map(getLetter),
        padding: 0.4,
      })

  const yScale = 

      scaleLinear({
        range: [0, yMax],
        round: true,
        domain: [0, Math.max(...data.map(getLetterFrequency))],
      })

  const center = yMax / 2;

  let highest = 0;

  const percentScale = scaleLinear({
    domain: [0, Math.max(...data.map(getLetterFrequency))],
  });

  percentScale.rangeRound([0, yMax]);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group left={100} bottom={200}>
        {data.map((d) => {
          const letter = getLetter(d);
          // const barWidth = xScale.bandwidth();
          const barHeight = (yScale(getLetterFrequency(d)) ?? 0);
          // const barHeight = yMax - (yScale(getLetterFrequency(d)) ?? 0);
          const barX = xScale(letter);
          const barY = barHeight > 0 ? (yMax - barHeight) / 2 : (yMax + barHeight) / 2;
          

          console.log(center, "barheight: ", barHeight, "-", d)
          return (
            <>
            <Bar
              key={`bar-${letter}`}
              x={barX}
              y={barHeight > 0 ? barY : center}
              width={2}
              height={ barHeight > 0 ? barHeight / 2 : Math.abs(barHeight) / 2 }
              // bar.value > 0 ? bar.width - center : center - Math.abs(bar.width)
              // fill="rgba(23, 233, 217, .5)"
              // onClick={() => {
              //   if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`)
              // }}
            />
            <Circle
              key={`circle-${letter}`}
              r={8}
              cy={barHeight > 0 && barHeight !== 0 ? barY + 8 :  center + Math.abs(barHeight) / 2 - 8 }
              cx={barX}
              // fill={barFill}
            />
            </>
          );
        })}
        <AxisLeft
          // scale={yScale}
          stroke={'black'}
          tickStroke={'black'}
          // labelOffset={20}
          scale={percentScale}
          label={'Percent Change'}
          tickFormat={function tickFormat(d){
            return d*10 + '%';
          }}
          numTicks={5}
          tickLabelProps={() => ({
            fill: 'black',
            fontSize: 13,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
        <AxisBottom
          top={yMax-30}
          // left={-34}
          scale={xScale}
          stroke={'black'}
          tickStroke={'black'}
          label={'30 day comparison'}
          labelOffset={10}
          tickLabelProps={() => ({
            fill: 'black',
            fontSize: 13,
            textAnchor: 'middle',
            dy: '0.33em'
          })}
        />
        <line y1={center } y2={center} x1={xMax} x2={0} stroke={'black'} />
      </Group>
    </svg>
  );
}

export default BarChartVertical