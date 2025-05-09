import React, { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisTop } from '@visx/axis';
import { Text } from '@visx/text';
import { UtilityFunctions } from '../utility'
import Utils from '../shared/Utils';
import '../css/BarChart.css';

const getData = (data, currentYear, currentDrug) => {

  var finalData = {};

  if (currentYear == '2024') {
      finalData['all'] = {rate: '100', stateKey: 'all', forTooltip: 'dummy'};
      finalData['benzodiazepine'] = {rate: '90', stateKey: 'benzodiazepine', forTooltip: 'dummy'};
      finalData['opioids'] = {rate: '80', stateKey: 'opioids', forTooltip: 'dummy'};
      finalData['fentanyl'] = {rate: '70', stateKey: 'fentanyl', forTooltip: 'dummy'};
      finalData['heroin'] = {rate: '60', stateKey: 'heroin', forTooltip: 'dummy'};
      finalData['stimulants'] = {rate: '50', stateKey: 'stimulants', forTooltip: 'dummy'};
      finalData['cocaine'] = {rate: '40', stateKey: 'cocaine', forTooltip: 'dummy'};
      finalData['methamphetamine'] = {rate: '30', stateKey: 'methamphetamine', forTooltip: 'dummy'};
  }
  else
  {
    finalData['all'] = {rate: '30', stateKey: 'all', forTooltip: 'dummy'};
      finalData['benzodiazepine'] = {rate: '40', stateKey: 'dummy', forTooltip: 'dummy'};
      finalData['opioids'] = {rate: '50', stateKey: 'opioids', forTooltip: 'dummy'};
      finalData['fentanyl'] = {rate: '60', stateKey: 'fentanyl', forTooltip: 'dummy'};
      finalData['heroin'] = {rate: '70', stateKey: 'heroin', forTooltip: 'dummy'};
      finalData['stimulants'] = {rate: '80', stateKey: 'stimulants', forTooltip: 'dummy'};
      finalData['cocaine'] = {rate: '90', stateKey: 'cocaine', forTooltip: 'dummy'};
      finalData['methamphetamine'] = {rate: '100', stateKey: 'methamphetamine', forTooltip: 'dummy'};
  }

      return finalData;
};

function BarChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(true);

  const { data, width, height, el, currentState, currentDrug, selectedDrugs, currentYear, drugOptions, selectedSec } = params;

  const dataRates = getData(data, currentYear, selectedDrugs);

  const dataKeys = Object.keys(dataRates || {}).filter(name => name !== 'max' && name !== 'min');
  const maxValue = UtilityFunctions.calculateMax(dataRates) ;
  const max = maxValue> 0 ? maxValue : 1;

  const margin = {top: 100, bottom: 0, left: 170, right: 10};
  const adjustedHeight = (height - margin.top - margin.bottom - 100) * ((Object.keys(dataKeys).length / 50)*(1.5));
  const adjustedWidth = width - margin.left - margin.right - 100; 
  const heightNew = (height * ((Object.keys(dataKeys).length / 50)*(1.55))) + 210;

  const sort = (a,b) => {
    if (!isNaN(dataRates[a].rate) && !isNaN(dataRates[b].rate)) {
      if(parseFloat(dataRates[a].rate) > parseFloat(dataRates[b].rate)) return 1;
      if(parseFloat(dataRates[a].rate) < parseFloat(dataRates[b].rate)) return -1;
    }
    if (!isNaN(dataRates[a].rate) && isNaN(dataRates[b].rate)) {
      return 1;
    }
    if (isNaN(dataRates[a].rate) && !isNaN(dataRates[b].rate)) {
      return -1;
    }

    if (isNaN(dataRates[a].rate) && isNaN(dataRates[b].rate)) {
      if (dataRates[a].rate < dataRates[b].rate) return 1;
      else return -1;
    }
    return 0;
   
  };

  const xScale = scaleLinear({
    domain: [0, max * (width < viewportCutoff ? 1.3 : 1.1)],
    range: [ 0, adjustedWidth ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight + 140, 0 ],
    domain: dataKeys.sort(sort), 
    padding: 0.15
  });

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().top - document.body.getBoundingClientRect().top + 50){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if(animated) {
      setAnimated(false);
      setTimeout(() => {
        setAnimated(true);
      }, 50);
    } // eslint-disable-next-line
  }, [selectedDrugs, currentYear]);

  const getXAxisTopLabel = () => {
      return 'Nonfatal Overdoses per 10,000 ED Visits';
  }

  return width > 0 && (
    <>
        <svg
          id="drug-bar-chart" 
          width={width} 
          height={heightNew}>
            <Group top={margin.top} left={margin.left}>
              {dataKeys.map(d => {
                const name = d;
                const rate = dataRates[name].rate;
                const stateKey = dataRates[name].stateKey;
                const toolTip = dataRates[name].forTooltip;

                return (
                  <Group key={`bar-${name}`}>
                    <path 
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': `0px 0px`,
                        outline: 'none'
                      }}
                      d={Utils.horizontalBarPath(true, 0, yScale(name), rate < 0 ? 10 : xScale(rate), yScale.bandwidth(), 3, yScale.bandwidth() * .1)}
                      fill={selectedDrugs.includes(stateKey) ? drugOptions[stateKey].color : 'lightgray'}
                      stroke={selectedDrugs.includes(stateKey) ? drugOptions[stateKey].color : ''}
                      strokeWidth="3"
                      onClick={() => {
                      }}
                      data-tip={selectedDrugs.includes(name) ? `<div class="tooltipTableLC"><strong>${drugOptions[name].titleAll}</strong><br/><br/>
                      Rate: ${rate < 0 ? toolTip : Number(rate).toLocaleString()}</div>` : ''}
                    ></path>
                    <text 
                      className="bar-label"
                      x={rate < 0 ? 10 : xScale(rate)}
                      y={yScale(name)}
                      dy="20"
                      dx="-35"
                      fill="white">
                        {selectedDrugs.includes(stateKey) ? (rate < 0 ? (toolTip.includes('Data suppressed') ? '*' : '†') : rate) : ''}
                    </text>
                  </Group>
                )}
              )}
              
              <AxisLeft 
                scale={yScale}
                tickValues={dataKeys}
              >
                {axisLeft => (
                  <g className="visx-group visx-axis visx-axis-left">
                    {axisLeft.ticks.map(tick => (
                        <g 
                          key={`tick-${tick.value}`}
                          className="visx-group visx-axis-tick">
                          <text textAnchor="end" fontSize="medium" fill="#000066">
                            <tspan y={tick.to.y} dx="-10" dy="5">{drugOptions[tick.value].titleAll}</tspan>
                          </text>
                        </g>
                      )
                    )}
                  </g>
                )}
              </AxisLeft>
              <text width={adjustedWidth} y={adjustedHeight + 70 - 320} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`, fill: '#000066'}}>{getXAxisTopLabel()}</text>
              <AxisTop
                top={adjustedHeight - 200}
                scale={xScale}
                numTicks={width < viewportCutoff ? 4 : null}
                tickStroke="none"
                labelProps={{
                  fontSize: 'medium',
                  textAnchor: width < viewportCutoff ? 'end' : 'top',
                  transform: 'translate(0, 40)'
                }}
                tickLabelProps={() => ({
                  fontSize: 'medium',
                  textAnchor: 'top',
                  transform: 'translate(0, 1)'
                })}
              />
            </Group>
        </svg>
    </>
  );
}

export default BarChart;