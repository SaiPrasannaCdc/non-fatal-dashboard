import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

const lessMonths = (arr) => {
  let output = [];
  for (let i = 0; i < arr.length; i += 3) {
    output.push(arr[i]);
  }
  return output;
};

const getFilteredData = (data, currentTimeframe, currentDataSource, currentState, currentYear) => {
  return currentTimeframe === 'Monthly' ?
    Object.keys(data.year[currentDataSource][currentState]).map(month => {
      let d = data.year[currentDataSource][currentState][month].find(d => d.year === currentYear);
      if (d) {
        d.month = parseInt(month);
        return d;
      }
    }).filter(d => !isNaN(d.month)) :
    data.year[currentDataSource][currentState]['all'];
};

function LineChart({ params }) {

  const { data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource,currentDrug, currentState, currentYear: currentYearUntyped, width } = params;

  const currentYear = parseInt(currentYearUntyped);

  const filteredData = {
    [currentState]: getFilteredData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if(currentState !== 'US') filteredData['US'] = getFilteredData(data, currentTimeframe, currentDataSource, 'US', currentYear);

  const xValues = filteredData['US'].map(d => currentTimeframe === 'Monthly' ? d.month : d.year);

  const isSmallViewport = width < 500;
  const fontSize = 20;
  const height = 400;
  const legendHeight = 110;
  const margin = { top: 15, bottom: 75, left: 75, right: isSmallViewport ? 10 : 150 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const sectionWidth = xMax / xValues.length;
  const sectionWidthHalf = sectionWidth / 2;

  const xKey = currentTimeframe === 'Monthly' ? 'month' : 'year';

  const seriesColor = key => key === 'US' ? 'rgb(43, 45, 115)' : 'lightblue';

  const xScale = scaleLinear({
    domain: [Math.min(...xValues), Math.max(...xValues)],
    range: [0, xMax]
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...Object.keys(filteredData).map(key =>
        Math.max(...filteredData[key].map(d => 
          Math.max(...Object.keys(drugOptions).filter(drug => !isNaN(d[drug])).map(drug => d[drug]))
        ))
    ))],
    range: [yMax, 0],
  });

  let filteredDataNoSuppressed = {};
  Object.keys(filteredData).forEach(key => {
    filteredDataNoSuppressed[key] = [];
    filteredData[key].forEach(d => filteredDataNoSuppressed[key].push({ ...d }));
    filteredDataNoSuppressed[key].forEach(d => Object.keys(drugOptions).forEach(drug => { if (isNaN(d[drug])) d[drug] = 0 }));
  });

  return (
    <>
      <svg style={{ height }}>
        <Group top={margin.top} left={margin.left}>
          <Group>
            {Object.keys(filteredData).map(key => <Group key={`line-path-${key}`}>
              {filteredData[key].map((d, i) => (
                <Group key={`line-path-${key}-point-${i}`}>
                  {i !== filteredData[key].length - 1 && !isNaN(d[currentDrug]) && !isNaN(filteredData[key][i+1][currentDrug]) && 
                    <line x1={xScale(d[xKey]) ?? 0} y1={yScale(d[currentDrug]) ?? 0} x2={xScale(filteredData[key][i+1][xKey]) ?? 0} y2={yScale(filteredData[key][i+1][currentDrug]) ?? 0} stroke={seriesColor(key)} strokeWidth={3} />
                  }
                  {isNaN(d[currentDrug]) && <text x={xScale(d[xKey])} y={yScale(0)} stroke={seriesColor(key)} fontSize={16}>*</text>}
                </Group>
              ))}
              {!isSmallViewport && <text x={xMax + 5} y={yScale(filteredData[key][filteredData[key].length - 1][currentDrug])} alignmentBaseline="middle" fontSize={fontSize} fill={seriesColor(key)}>{stateNames[key]}</text>}
            </Group>)}
            
            {filteredData['US'].map(d => {
              const tooltipValues = [`<p><strong>${stateNames['US']}</strong>: ${d[currentDrug]}</p>`];
              if(currentState !== 'US'){
                const stateValue = filteredData[currentState].find(d2 => d2[xKey] === d[xKey])[currentDrug];
                const stateTooltipValue = `<p><strong>${stateNames[currentState]}</strong>: ${stateValue}</p>`
                if(stateValue > d[currentDrug]){
                  tooltipValues.unshift(stateTooltipValue)
                } else {
                  tooltipValues.push(stateTooltipValue);
                }
              }

              return <rect
                key={`tooltip-section-${d[xKey]}`}
                x={Math.max(0, xScale(d[xKey]) - sectionWidthHalf)}
                y={0}
                width={sectionWidth}
                height={yMax}
                fill='transparent'
                data-tip={`<h3><strong>${currentTimeframe === 'Monthly' ? monthNames[d[xKey]] : d[xKey]}</strong></h3>${tooltipValues.join('')}`}></rect>
            })}
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
            tickValues={currentTimeframe === 'Monthly' && isSmallViewport ? lessMonths(filteredData['US'].map(d => d[xKey])) : filteredData['US'].map(d => d[xKey])}
            tickFormat={value => currentTimeframe === 'Monthly' ? monthNamesShort[value] : value.toFixed(0)}
            label={currentTimeframe === 'Monthly' ? 'Month' : 'Year'}
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
        <svg style={{ height: legendHeight }}>
          {Object.keys(filteredData).map((key, i) =>
            <Group key={`line-series-${key}`}>
              <rect x={0} y={i * fontSize + fontSize} width={10} height={3} fill={seriesColor(key)} />
              <text x={15} y={i * fontSize + fontSize} alignmentBaseline="middle" fontSize={fontSize} fill={seriesColor(key)}>{stateNames[key]}</text>
            </Group>
          )}
        </svg>
      )}
    </>
  )
}

export default LineChart