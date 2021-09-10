import React from 'react';

import { LinePath } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { curveLinear } from '@visx/curve'; 

function HeaderLineChart(params) {

  const data = [
    {date: 'March', value: 5},
    {date: 'April', value: 15},
    {date: 'May', value: 10},
    {date: 'June', value: 25}
  ];
  
  const { width, height } = params;

  const margin = {top: 10, bottom: 10, left: 0, right: 0};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleBand({
    domain: data.map(d => d.date),
    range: [ 0, adjustedWidth ],
    padding: 0.2
  });

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [0, Math.max(...data.map(d => d.value))]
  });

  return width > 0 && (
    <>
      <svg
        id="header-line-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}
        style={{
          marginTop: margin.top,
          marginLeft: margin.left
        }}>
        <LinePath
            className={`line`}
            curve={curveLinear}
            data={data}
            x={d => xScale(d.date)}
            y={d => yScale(d.value)}
            stroke="#712177"
            strokeWidth={3}
          />
      </svg>
    </>
  );
}

export default HeaderLineChart;