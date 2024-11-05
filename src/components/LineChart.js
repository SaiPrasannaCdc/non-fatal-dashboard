import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { Circle } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { UtilityFunctions } from '../utility'

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

const lessMonths = (arr) => {
  let output = [];
  for (let i = 0; i < arr.length; i += 3) {
    output.push(arr[i]);
  }
  return output;
};

const getFilteredData = (data, currentTimeframe, currentDataSource, currentState, currentYear) => {
  if(data.year[currentDataSource][currentState]){
    if(currentTimeframe === 'Monthly'){
      return Object.keys(data.year[currentDataSource][currentState]).map(month => {
        let d = data.year[currentDataSource][currentState][month].find(d => d.year == String(currentYear));
        if (d) {
          d.month = parseInt(month);
          return d;
        }
      }).filter(d => !!d && !isNaN(d.month));
    } else {
      return data.year[currentDataSource][currentState]['all'];
    }

  } else {
    return [];
  }
};

function LineChart({ params }) {

  const { data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear: currentYearUntyped, currentMonth, width } = params;

  const currentYear = parseInt(currentYearUntyped);

  const filteredData = {
    [currentState]: getFilteredData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if(currentState !== 'US') filteredData['US'] = getFilteredData(data, currentTimeframe, currentDataSource, 'US', currentYear);

  const yScaleDomainPeriod = UtilityFunctions.calculateYScaleDomain(filteredData, currentDrug, currentState) * 1.2

  const xValues = filteredData['US'].map(d => currentTimeframe === 'Monthly' ? d.month : d.year);

  const isSmallViewport = width < 500;
  const fontSize = 16;
  const height = 400;
  const seriesOverlapMargin = 20; 
  const seriesSpacing = 20; 
  const margin = { top: 15, bottom: 45, left: 65, right: isSmallViewport ? 10 : 150 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const sectionWidth = xMax / xValues.length;
  const sectionWidthHalf = sectionWidth / 2;

  const xKey = currentTimeframe === 'Monthly' ? 'month' : 'year';

  const seriesColor = key => key === 'US' ? 'rgb(43, 45, 115)' : 'lightblue';

  const xScale = scaleLinear({
    domain: [Math.min(...xValues), Math.max(...xValues)],
    range: [10, xMax]
  });

  const yScale = scaleLinear({
    domain: [0, yScaleDomainPeriod],
    range: [yMax, 0]
  });

  const range = (start, end, step = 1) => {
    let str = ''
    let result = [];
    for(let i=0; i<=end; i+=step) {
      result.push(i);
    }
    return result;
  };
  
  const seriesLabelPositionUS = yScale(filteredData['US'][filteredData['US'].length - 1][currentDrug]);
  const valueState = filteredData[currentState].length > 0 ? filteredData[currentState][filteredData[currentState].length - 1][currentDrug] : 'Data suppressed*';
  const seriesLabelPositionState = valueState === 'Data suppressed*' ? yScale(0) - 30 : yScale(valueState);

  return (
    <>
      <svg style={{ height }}>
        <Group top={margin.top} left={margin.left}>
          <Group>
            {Object.keys(filteredData).map(key => <Group key={`line-path-${key}`}>
              {xValues.map((xVal, i) => {
                const d = filteredData[key].find(d => d[xKey] === xVal) || {};
                const dNext = i === xValues.length - 1 ? {} : filteredData[key].find(d => d[xKey] === xValues[i + 1]) || {}

                return (
                  <Group key={`line-path-${key}-point-${i}`}>
                    {!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && 
                      <line x1={xScale(d[xKey]) ?? 0} y1={yScale(d[currentDrug]) ?? 0} x2={xScale(dNext[xKey]) ?? 0} y2={yScale(dNext[currentDrug]) ?? 0} stroke={seriesColor(key)} strokeWidth={3} />
                    }
                    {isNaN(d[currentDrug]) && <text x={xScale(xVal)} y={yScale(0) - 20} stroke={seriesColor(key)} fill={seriesColor(key)} fontSize={20} textAnchor="middle">{d[currentDrug] === 'Data suppressed*' ? '*' : '†'}</text>}
                    {!isNaN(d[currentDrug]) && <text x={i == 0 ? xScale(d[xKey]) + 8 :  xScale(d[xKey])} y={yScale(d[currentDrug])-8} stroke={UtilityFunctions.getSeriesColor(currentDrug, key)} fill={UtilityFunctions.getSeriesColor(currentDrug, key)} fontSize={12} textAnchor="middle">{d[currentDrug]}</text>}
                    {!isNaN(d[currentDrug]) && <Circle cx={xScale(d[xKey])} cy={yScale(d[currentDrug])} r={4} fill={currentTimeframe === 'Monthly' && d[xKey] == currentMonth ? 'orange' : seriesColor(key)} />}
                  </Group>
                )
              })}
              {(!isSmallViewport && yScaleDomainPeriod > 0) &&  (() => {
                  let yPos = seriesLabelPositionUS;

                  if(key !== 'US'){
                    const isOverlapping = seriesLabelPositionState < seriesLabelPositionUS + seriesOverlapMargin && seriesLabelPositionState > seriesLabelPositionUS - seriesOverlapMargin;
                    if(isOverlapping){
                      if(seriesLabelPositionState < seriesLabelPositionUS){
                        yPos = seriesLabelPositionUS - seriesSpacing;
                        if(yPos < seriesOverlapMargin){
                          yPos = seriesLabelPositionUS + seriesSpacing;
                        }
                      } else {
                        yPos = seriesLabelPositionUS + seriesSpacing;
                        if(yPos > yMax - seriesOverlapMargin){
                          yPos = seriesLabelPositionUS - seriesSpacing;
                        }
                      }
                    } else {
                      yPos = seriesLabelPositionState;
                    }
                  }

                  return <text 
                    x={xMax + 20} 
                    y={yPos}
                    alignmentBaseline="middle" 
                    fontSize={fontSize} 
                    fill={seriesColor(key)}>
                      {stateNames[key]}
                  </text>
                })()
              }
            </Group>)}
            
            {filteredData['US'].map(d => {
              const tooltipValues = [`<p><strong>Overall† Rate</strong>: ${d[currentDrug]} (${data.supportedJurisdictions[currentTimeframe === 'Monthly' ? currentYear : d[xKey]]} states)</p>`];
              if(currentState !== 'US'){
                let stateValue = filteredData[currentState].find(d2 => d2[xKey] === d[xKey]);
                if(stateValue){
                  stateValue = stateValue[currentDrug];
                } else {
                  stateValue = 'Data not available/not reported'
                }
                tooltipValues.push(`<p><strong>${stateNames[currentState]} Rate</strong>: ${stateValue}</p>`);
              }

              return <rect
                key={`tooltip-section-${d[xKey]}`}
                x={Math.max(0, xScale(d[xKey]) - sectionWidthHalf)}
                y={0}
                width={sectionWidth}
                height={yMax}
                fill='transparent'
                data-tip={`<h3><strong>${currentTimeframe === 'Monthly' ? `${monthNames[d[xKey]]} ${currentYear}` : d[xKey]}</strong></h3>${tooltipValues.join('')}`}></rect>
            })}
          </Group>
          <AxisLeft
            scale={yScale}
            tickValues={yScaleDomainPeriod > 0 ? range(0,  yScaleDomainPeriod, Math.round(yScaleDomainPeriod/8 * 100) / 100) : null}
            tickLabelProps={() => ({
              fontSize,
              textAnchor: 'end',
              dx: -5,
              dy: 5
            })}
          />
          <Text width={yMax} x={margin.left / -2} y={yMax / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', transformOrigin: `-${margin.left / 2}px ${yMax / 2}px`}}>Rate per 100,000 persons</Text>
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickValues={currentTimeframe === 'Monthly' && isSmallViewport ? lessMonths(filteredData['US'].map(d => d[xKey])) : filteredData['US'].map(d => d[xKey])}
            tickFormat={value => currentTimeframe === 'Monthly' ? monthNamesShort[value] : (value.toFixed ?value.toFixed(0) :value) }
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
      {currentDrug == 'fentanyl' &&
      <table style={{width: '100%'}}>
        <tr>
          <td style={{width: '15%'}}></td>
          <td style={{width: '70%'}}>
          <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span class="x32 fill-p cdc-icon-alert_02 colorRed"></span><span><small><i>Note: Fentanyl data are displayed beginning in October 2020, reflecting the introduction of the ICD-10-CM code for fentanyl-involved poisoning (T40.41). Counts and rates for this indicator are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T40.41 ICD-10-CM code as there was no way to code fentanyl-involved poisonings.</i></small></span></div>
          </td>
          <td style={{width: '15%'}}></td>
        </tr>
      </table>
      }
      {currentDrug == 'methamphetamine' &&
        <table style={{width: '100%'}}>
        <tr>
          <td style={{width: '15%'}}></td>
          <td style={{width: '70%'}}>
          <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span class="x32 fill-p cdc-icon-alert_02 colorRed"></span><span><small><i>Note: Data on methamphetamine are shown starting in October 2022, when the ICD-10-CM code for methamphetamine-involved poisoning (T43.65) was introduced. Counts and rates for these indicators are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T43.65 ICD-10-CM code as there was no way to code methamphetamine-involved poisoning.</i></small></span></div>
          </td>
          <td style={{width: '15%'}}></td>
        </tr>
      </table>
      }
      {isSmallViewport && (
        <div id="line-chart-legend-container">
          <div id="line-chart-legend">
            {Object.keys(filteredData).map((key, i) =>
              <div key={`line-series-${key}`}>
                <span fontSize={fontSize} style={{color: seriesColor(key)}}>- {stateNames[key]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default LineChart