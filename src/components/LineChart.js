import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';

function LineChart({params}) {

  const { data, drugOptions, currentDataSource, currentState, currentMonth, width } = params;

  if(width === 0) return <></>;

  const filteredData = data.year[currentDataSource][currentState][currentMonth];

  const years = filteredData.map(d => parseInt(d.year));

  const isSmallViewport = width < 500;
  const fontSize = 20;
  const height = 400;
  const margin = {top: 15, bottom: 75, left: 75, right: isSmallViewport ? 10 : 150};

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const sectionWidth = xMax / years.length;
  const sectionWidthHalf = sectionWidth / 2;

  const series = Object.keys(drugOptions);
  const xKey = 'year';

  const xScale = scaleLinear({
    domain: [Math.min(...years), Math.max(...years)],
    range: [0, xMax]
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...filteredData.map(d => Math.max(...Object.keys(drugOptions).filter(drug => !isNaN(d[drug])).map(drug => d[drug]))))],
    range: [yMax, 0],
  });

  let filteredDataNoSuppressed = [];
  filteredData.forEach(d => filteredDataNoSuppressed.push({...d}));
  filteredDataNoSuppressed.forEach(d => Object.keys(drugOptions).forEach(drug => {if(isNaN(d[drug])) d[drug] = 0}));

  return (
    <>
      <svg style={{height}}>
        <Group top={margin.top} left={margin.left}>
          <Group>
            {series.map(drug => 
              <Group key={`line-series-${drug}`}>
                <LinePath
                  data={filteredDataNoSuppressed}
                  x={(d) => xScale(d[xKey]) ?? 0}
                  y={(d) => yScale(d[drug]) ?? 0}
                  stroke={drugOptions[drug].color || '#333'}
                  strokeWidth={3}
                />
                {!isSmallViewport && <text x={xMax + 5} y={yScale(filteredData[filteredData.length - 1][drug])} alignmentBaseline="middle" fontSize={fontSize} fill={drugOptions[drug].color || '#333'}>{drugOptions[drug].titleAll}</text>}
              </Group>
            )}
            {filteredData.map(d => 
              <rect 
                key={`tooltip-section-${d[xKey]}`}
                x={Math.max(0, xScale(d[xKey]) - sectionWidthHalf)} 
                y={0} 
                width={sectionWidth} 
                height={yMax} 
                fill='transparent'
                data-tip={`<h3><strong>${d[xKey]}</strong></h3>` + series.map(drug => `<p><strong>${drugOptions[drug].titleAll}</strong>: ${d[drug]}</p>`).join('')}></rect>
            )}
          </Group>
          <AxisLeft
            scale={yScale}
            label={'Deaths per 100,000 population'}
            tickLabelProps={() => ({
              fontSize,
              textAnchor: 'end',
              dx: -5,
              dy: 5
            })}
            labelProps={{
              fontSize: fontSize,
              textAnchor: 'middle',
              style: {
                transform: `rotate(-90deg) translate(0px, -10px)`
              }
            }}
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickValues={filteredData.map(d => d[xKey])}
            tickFormat={value => value.toFixed(0)}
            label={'Year'}
            tickLabelProps={() => ({
              fontSize,
              textAnchor: 'middle'
            })}
            labelProps={{
              fontSize,
              textAnchor: 'middle'
            }}
          />
        </Group>
      </svg>
      {isSmallViewport && (
        <svg style={{height: 110}}>
          {series.map((drug, i) => 
              <Group key={`line-series-${drug}`}>
                <rect x={0} y={i * fontSize + fontSize} width={10} height={3} fill={drugOptions[drug].color || '#333'} />
                <text x={15} y={i * fontSize + fontSize} alignmentBaseline="middle" fontSize={fontSize} fill={drugOptions[drug].color || '#333'}>{drugOptions[drug].titleAll}</text>
              </Group>
            )}
        </svg>
      )}
    </>
  )
}

export default LineChart