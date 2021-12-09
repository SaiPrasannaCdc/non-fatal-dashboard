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
        "letter": "A",
        "frequency": 6
    },
    {
        "letter": "B",
        "frequency": 4
    },
    {
        "letter": "C",
        "frequency": -5
    },
    {
        "letter": "D",
        "frequency": -4
    },
    {
        "letter": "E",
        "frequency": 4
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



  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group>
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
        
      </Group>
    </svg>
  );
}

export default BarChartVertical