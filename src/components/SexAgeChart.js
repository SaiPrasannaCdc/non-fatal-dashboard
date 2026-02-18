import React from 'react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom,AxisLeft } from '@visx/axis';
import Utils from '../shared/Utils';
import DataTable508 from './DataTable508';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';

function SexAgeChart(params) {

  const { data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, currentDataType, width, drugOptions, accessible, widthReduction } = params;

  const filteredData = data.sexAge[currentDataSource][currentDrug][currentYear][currentTimeframe === 'Monthly' ? currentMonth : 'all'][currentDataType];

  const isSmallViewport = width < 550 && !widthReduction;
  const fontSize = 16;
  const height = 450;
  const margin = { top: 50, bottom: 125, left: isSmallViewport ? 30: 50, right: isSmallViewport ? 0: 15 };

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = xMax / 2;
  const yMax = height - margin.top - margin.bottom;

  const x1Key = 'F';
  const x2Key = 'M';
  const yKey = 'age';

  let overallMax = data.sexAge[currentDataSource][currentDrug][`max${currentTimeframe}`][currentDataType];
  if(overallMax === 0) overallMax = 1;

  const x1Scale = scaleLinear({
    range: [xMaxHalf, 50],
    domain: [0, overallMax]
  });

  const x2Scale = scaleLinear({
    range: [xMaxHalf, xMax-50],
    domain: [0, overallMax]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
  });

  const formatToolTip = (val) => {
      if (val.includes('Data suppressed'))
          return 'Data suppressed';
      else if (val.includes('Data not available'))
        return 'Data not available/not reported';
      else
        return ''
  }

  const getBar = (d) => {

    const x1Pos = isNaN(d[x1Key]) ? xMaxHalf - 15 : x1Scale(d[x1Key]);
    const x2Pos = isNaN(d[x2Key]) ? xMaxHalf + 15 : x2Scale(d[x2Key]);

    const x1Tip = `<div class="tooltipTableLC"><p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Female</p><p><strong>${currentDataType === 'count' ? 'Overdoses' : 'Rate'}</strong>: ${isNaN(d[x1Key]) ? formatToolTip(d[x1Key]) : d[x1Key].toLocaleString()}</p></div>`;
    const x2Tip = `<div class="tooltipTableLC"><p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Male</p><p><strong>${currentDataType === 'count' ? 'Overdoses' : 'Rate'}</strong>: ${isNaN(d[x2Key]) ? formatToolTip(d[x2Key]) : d[x2Key].toLocaleString()}</p></div>`;

    const alignEndFirst = x1Pos > (xMaxHalf - 50);
    const alignEndSecond = x2Pos - xMaxHalf > 55;

    return (
      <g key={d[yKey]}>
        {!isNaN(d[x1Key]) && <path d={Utils.horizontalBarPath(false, x1Pos, yScale(d[yKey]), (xMaxHalf - x1Pos), yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[x1Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={0.4} data-tip={x1Tip} />}
        {isNaN(d[x1Key]) && <Text x={x1Pos} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 15} textAnchor="middle" alignmentBaseline="end" fill={drugOptions[currentDrug].color} fontSize={isSmallViewport ? fontSize * 1.6 : fontSize * 2} data-tip={x1Tip}>{d[x1Key]?.includes('Data suppressed') ? '*' : '†'}</Text>}
        <Text 
          x={(x1Pos) + (isNaN(d[x1Key]) ? -25 : alignEndFirst ? -10 : 10)} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={alignEndFirst ? 'end' : 'start'} 
          fill="black" 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{isNaN(d[x1Key]) ? '' : (d[x1Key])?.toLocaleString()}</Text>

        {!isNaN(d[x2Key]) && <path d={Utils.horizontalBarPath(true, xMaxHalf, yScale(d[yKey]), (x2Pos - xMaxHalf), yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[x2Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} data-tip={x2Tip} />}
        {isNaN(d[x2Key]) && <Text x={x2Pos} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 15} textAnchor="middle" alignmentBaseline="end" fill={drugOptions[currentDrug].color} fontSize={isSmallViewport ? fontSize * 1.6 : fontSize * 2} data-tip={x2Tip}>{d[x2Key]?.includes('Data suppressed') ? '*' : '†'}</Text>}
        <Text 
          x={(x2Pos) + (isNaN(d[x2Key]) ? 25 : alignEndSecond ? -10 : 10)} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={alignEndSecond ? 'end' : 'start'} 
          fill={!isNaN(d[x2Key]) && alignEndSecond ? 'white' : 'black'} 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{isNaN(d[x2Key]) ? '' : (d[x2Key])?.toLocaleString()}</Text>
      </g>
    )
  }

  return (
    <>
    {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateSexChartData(filteredData)}
          labelOverrides={{
            'rate1': 'Rate1 of nonfatal all drug visits per 100,000 persons',
            'rate2': 'Rate2 of nonfatal all drug visits per 100,000 persons'
          }}
          xAxisKey={'Age Group'}
          transforms={{
            rate: num => UtilityFunctions.toFixed(num)
          }}
          width={width}
          colSpan={!isSmallViewport ? 2 : null}
          isSmallViewport={isSmallViewport}
          hdr={currentDataType == 'count' ? 'Count' : null}
          noSort={true}
        />
        </>        
      ) : (
      <svg style={{ height }}>
        <Group top={margin.top} left={margin.left}>
          <Text x={x1Scale(0) - 15} y={0} textAnchor="end">Female</Text>
          <Text x={x2Scale(0) + 15} y={0}>Male</Text>
          <Group>
            {filteredData.map((d) => getBar(d, false))}
          </Group>
          <Text x={-20} y={yMax / 2} style={{ transform: 'rotate(-90deg)', transformOrigin: `-20px ${yMax / 2}px` }} fontSize={fontSize} textAnchor="middle">Age Group</Text>
          <AxisLeft
          scale={yScale}
          tickLabelProps={() => ({
            fontSize: 'medium',
            textAnchor: 'end',
            verticalAnchor: 'middle'
          })}
          left={50}
          hideTicks
          hideAxisLine
        />
          <AxisBottom
            top={yMax}
            scale={x1Scale}
            numTicks={isSmallViewport ? 3 : null}
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: 'rotate(-60deg)',
                  transformOrigin: `${x1Scale(value)}px ${18}px`,
                  textAnchor: 'end',
                  fontSize: fontSize
                }
              }
            }}
          />
          <AxisBottom
            top={yMax}
            scale={x2Scale}
            numTicks={isSmallViewport ? 3 : null}
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: 'rotate(-60deg)',
                  transformOrigin: `${x2Scale(value)}px ${18}px`,
                  textAnchor: 'end',
                  fontSize: fontSize
                }
              }
            }}
          />
          {currentDataType == 'count' && <text x={xMax/2} y={yMax+ 90} fontSize={fontSize} textAnchor="middle">{'Count'}</text>}
          {currentDataType == 'rate' && <text x={xMax/2} y={yMax+ 90} fontSize={fontSize} textAnchor="middle">{'Rate per 100,000 persons'}<tspan baselineShift="super" fontSize="10">5</tspan></text>}
        </Group>
      </svg>
      )}
    </>
  )
}

export default SexAgeChart