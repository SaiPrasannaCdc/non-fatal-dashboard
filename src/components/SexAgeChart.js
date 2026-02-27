import React from 'react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom,AxisLeft } from '@visx/axis';
import Utils from '../shared/Utils';
import DataTable508 from './DataTable508';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';

const getMaxValue = (fdata) => {

  let maleVals = [];
  let femaleVals = [];
  for (let x=0;x<Object.keys(fdata).length;x++) {
      if (Number(fdata[x].M) > 0)
        maleVals.push(Number(fdata[x].M));
      if (Number(fdata[x].F) > 0)
        femaleVals.push(Number(fdata[x].F))
  }

  let maleMax = maleVals.length > 0 ? Math.max(...maleVals) : 0.84;
  let femaleMax = femaleVals.length > 0 ? Math.max(...femaleVals) : 0.84;
  if (maleMax < femaleMax)
    return femaleMax;
  else
    return maleMax;
}

function SexAgeChart(params) {

  const { data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, currentDataType, width, height, drugOptions, accessible, widthReduction } = params;

  const filteredData = data.sexAge[currentDataSource][currentDrug][currentYear][currentTimeframe === 'Monthly' ? currentMonth : 'all'][currentDataType];

  const isSmallViewport = width < 550 && !widthReduction;
  const fontSize = 16;
  const margin = { top: 15, bottom: 145, left: 50, right: 15 };

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = xMax / 2;
  const yMax = height - margin.top - margin.bottom - (isSmallViewport ? 10 : 0);

  const x1Key = 'F';
  const x2Key = 'M';
  const yKey = 'age';

  let overallMax = getMaxValue(filteredData) * 1.1;
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

    const corner1 = (xMaxHalf - x1Pos) < 3 ? false : true;
    const corner2 = (x2Pos - xMaxHalf) < 3 ? false : true;

    return (
      <g key={d[yKey]}>
        {!isNaN(d[x1Key]) && <path d={corner1 ? Utils.horizontalBarPathDem(false, x1Pos, yScale(d[yKey]), (xMaxHalf - x1Pos), yScale.bandwidth(), 3, yScale.bandwidth() * .1) : Utils.horizontalBarPathDem_NR(x1Pos, yScale(d[yKey]), (xMaxHalf - x1Pos), yScale.bandwidth())} fill={isNaN(d[x1Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} data-tip={x1Tip} />}
        {isNaN(d[x1Key]) && <Text x={x1Pos} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 15} textAnchor="middle" alignmentBaseline="end" fill={drugOptions[currentDrug].color} fontSize={isSmallViewport ? fontSize * 1.6 : fontSize * 1.2} data-tip={x1Tip}>{d[x1Key]?.includes('Data suppressed') ? '*' : '†'}</Text>}
        {!isNaN(d[x1Key]) && <Text 
          x={((x1Pos) - (d[x1Key] > 99 ? 53 : (d[x1Key] >= 10 ? 50 : 45))) + (d[x1Key] == 0.0 ? (currentDataType == 'rate' ? 15 : 2) : 0)} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'start'}  
          fill="black" 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}
          >{isNaN(d[x1Key]) ? '' : (d[x1Key])?.toLocaleString()}</Text>
          }

        {!isNaN(d[x2Key]) && <path d={corner2 ? Utils.horizontalBarPathDem(true, xMaxHalf, yScale(d[yKey]), (x2Pos - xMaxHalf), yScale.bandwidth(), 3, yScale.bandwidth() * .1) : Utils.horizontalBarPathDem_NR(xMaxHalf, yScale(d[yKey]), (x2Pos - xMaxHalf + (!corner2 ? 1 : 0)), yScale.bandwidth())} fill={isNaN(d[x2Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={0.4} data-tip={x2Tip} />}
        {isNaN(d[x2Key]) && <Text x={x2Pos} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 15} textAnchor="middle" alignmentBaseline="end" fill={drugOptions[currentDrug].color} fontSize={isSmallViewport ? fontSize * 1.6 : fontSize * 1.2} data-tip={x2Tip}>{d[x2Key]?.includes('Data suppressed') ? '*' : '†'}</Text>}
        {!isNaN(d[x1Key]) && <Text 
          x={(x2Pos) + (d[x2Key] > 99 ? 53 : (d[x2Key] >= 10 ? 50 : 45))} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="black" 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}
          >{isNaN(d[x2Key]) ? '' : (d[x2Key])?.toLocaleString()}</Text>
        }
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
      <Group>
        <svg style={{ height: height - 30 }}>
        <Group top={margin.top} left={margin.left}>
          <Text x={x1Scale(0) - 15} y={0} textAnchor="end">Female</Text>
          <Text x={x2Scale(0) + 15} y={0}>Male</Text>
          <Group>
            {filteredData.map((d) => getBar(d, false))}
          </Group>
          <AxisLeft
          scale={yScale}
          tickLabelProps={() => ({
            fontSize: 'medium',
            textAnchor: 'end',
            verticalAnchor: 'middle'
          })}
          left={!isSmallViewport ? 30 : 10}
          hideTicks
          hideAxisLine
        />
          <AxisBottom
            top={yMax}
            scale={x1Scale}
            numTicks={3}
            tickStroke="none"
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: (isSmallViewport ? 'rotate(-60deg)' : ''),
                  transformOrigin: `${x1Scale(value)}px ${18}px`,
                  textAnchor: 'middle',
                  fontSize: fontSize,
                }
              }
            }}
          />
          <AxisBottom
            top={yMax}
            scale={x2Scale}
            numTicks={3}
            tickStroke="none"
            tickLabelProps={(value) => {
              return {
                style: {
                  transform: (isSmallViewport ? 'rotate(-60deg)' : ''),
                  transformOrigin: `${x2Scale(value)}px ${18}px`,
                  textAnchor: 'middle',
                  fontSize: fontSize
                }
              }
            }}
          />
          {currentDataType == 'count' && <text x={xMax/2} y={yMax+ 90} fontSize={fontSize} textAnchor="middle">{'Count'}</text>}
          {currentDataType == 'rate' && <text x={xMax/2} y={yMax+ 90} fontSize={fontSize} textAnchor="middle">{'Rate per 100,000 persons'}<tspan baselineShift="super" fontSize="10">5</tspan></text>}
        </Group>
      </svg>
      <div style={{height: ((isSmallViewport ? (currentDataType == 'rate' ? '160px' : '210px') : '300px'))}}>
        <table>
          {Object.keys(filteredData).length > 0 &&
            <tr><td><small><i><sup>*</sup>{'Data suppressed.'}</i></small></td></tr>
          }
          {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>†</sup>{'Data not avaialbe/not reported.'}</i></small></td></tr>
          }
        </table>
      </div>
    </Group>
      )}
    </>
  )
}

export default SexAgeChart