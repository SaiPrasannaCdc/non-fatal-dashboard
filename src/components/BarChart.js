import React, { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisTop } from '@visx/axis';
import { Text } from '@visx/text';
import { UtilityFunctions } from '../utility'
import Utils from '../shared/Utils';
import '../css/BarChart.css';

const getData = (data, currentState, currentYear, currentMonth, timeline, drugOptions) => {

  var finalData = {};
  var yr_total_drug_OD_n = 0;
  var yr_total_Benzo_OD_n = 0;
  var yr_total_opioid_OD_n = 0;
  var yr_total_Fentanyl_OD_n = 0;
  var yr_total_heroin_OD_n = 0;
  var yr_total_stimulant_OD_n = 0;
  var yr_total_Cocaine_OD_n = 0;
  var yr_total_Methamphetamine_OD_n = 0;
  var yr_total = 0;

  if (data?.length > 0)
  {
    if (timeline === 'Monthly') {
      for(var i=0;i<data.length;i++)
      {
        if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, "0"))
        {
          if (data[i].Sex === 'Total' && data[i].Age_Group === 'Total' && data[i].geoid == currentState)
          {
            yr_total = data[i].total_ED_visits;

            finalData['all'] = {rate: data[i].total_drug_OD_n < 20 ? 0 : ((data[i].total_drug_OD_n/yr_total)*10000), stateKey: 'all', forTooltip: data[i].total_drug_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['benzodiazepine'] = {rate: data[i].total_Benzo_OD_n < 20 ? 0 : ((data[i].total_Benzo_OD_n/yr_total)*10000), stateKey: 'benzodiazepine', forTooltip: data[i].total_Benzo_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['opioids'] = {rate: data[i].total_opioid_OD_n < 20 ? 0 : ((data[i].total_opioid_OD_n/yr_total)*10000), stateKey: 'opioids', forTooltip: data[i].total_opioid_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['fentanyl'] = {rate: data[i].total_Fentanyl_OD_n < 20 ? 0 : ((data[i].total_Fentanyl_OD_n/yr_total)*10000), stateKey: 'fentanyl', forTooltip: data[i].total_Fentanyl_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['heroin'] = {rate: data[i].total_heroin_OD_n < 20 ? 0 : ((data[i].total_heroin_OD_n/yr_total)*10000), stateKey: 'heroin', forTooltip: data[i].total_heroin_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['stimulants'] = {rate: data[i].total_stimulant_OD_n < 20 ? 0 : ((data[i].total_stimulant_OD_n/yr_total)*10000), stateKey: 'stimulants', forTooltip: data[i].total_stimulant_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['cocaine'] = {rate: data[i].total_Cocaine_OD_n < 20 ? 0 : ((data[i].total_Cocaine_OD_n/yr_total)*10000), stateKey: 'cocaine', forTooltip: data[i].total_Cocaine_OD_n < 20 ? 'Data suppressed' : 'dummy'};
            finalData['methamphetamine'] = {rate: data[i].total_Methamphetamine_OD_n < 20 ? 0 : ((data[i].total_Methamphetamine_OD_n/yr_total)*100), stateKey: 'methamphetamine', forTooltip: data[i].total_Methamphetamine_OD_n < 20 ? 'Data suppressed' : 'dummy'};
          }
        }
      }
    }
    else {

      for(var i=0;i<data.length;i++) {
        if (data[i].YYYYMM?.substring(0,4) == currentYear)
        {
          if (data[i].Sex === 'Total' && data[i].Age_Group === 'Total' && data[i].geoid == currentState)
          {
            yr_total = yr_total + Number(data[i].total_ED_visits);
            yr_total_drug_OD_n = yr_total_drug_OD_n + Number(data[i].total_drug_OD_n);
            yr_total_Benzo_OD_n = yr_total_Benzo_OD_n + Number(data[i].total_Benzo_OD_n);
            yr_total_opioid_OD_n =yr_total_opioid_OD_n + Number(data[i].total_opioid_OD_n);
            yr_total_Fentanyl_OD_n = yr_total_Fentanyl_OD_n + Number(data[i].total_Fentanyl_OD_n);
            yr_total_heroin_OD_n = yr_total_heroin_OD_n + Number(data[i].total_heroin_OD_n);
            yr_total_stimulant_OD_n = yr_total_stimulant_OD_n + Number(data[i].total_stimulant_OD_n);
            yr_total_Cocaine_OD_n = yr_total_Cocaine_OD_n + Number(data[i].total_Cocaine_OD_n);
            yr_total_Methamphetamine_OD_n = yr_total_Methamphetamine_OD_n + Number(data[i].total_Methamphetamine_OD_n);
          }
        }
      }

      finalData['all'] = {rate: yr_total_drug_OD_n < 20 ? 0 : ((yr_total_drug_OD_n/yr_total)*10000), stateKey: 'all', forTooltip: yr_total_drug_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['benzodiazepine'] = {rate: yr_total_Benzo_OD_n < 20 ? 0 : ((yr_total_Benzo_OD_n/yr_total)*10000), stateKey: 'benzodiazepine', forTooltip: yr_total_Benzo_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['opioids'] = {rate: yr_total_opioid_OD_n < 20 ? 0 : ((yr_total_opioid_OD_n/yr_total)*10000), stateKey: 'opioids', forTooltip: yr_total_opioid_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['fentanyl'] = {rate: yr_total_Fentanyl_OD_n < 20 ? 0 : ((yr_total_Fentanyl_OD_n/yr_total)*10000), stateKey: 'fentanyl', forTooltip: yr_total_Fentanyl_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['heroin'] = {rate: yr_total_heroin_OD_n < 20 ? 0 : ((yr_total_heroin_OD_n/yr_total)*10000), stateKey: 'heroin', forTooltip: yr_total_heroin_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['stimulants'] = {rate: yr_total_stimulant_OD_n < 20 ? 0 : ((yr_total_stimulant_OD_n/yr_total)*10000), stateKey: 'stimulants', forTooltip: yr_total_stimulant_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['cocaine'] = {rate: yr_total_Cocaine_OD_n < 20 ? 0 : ((yr_total_Cocaine_OD_n/yr_total)*10000), stateKey: 'cocaine', forTooltip: yr_total_Cocaine_OD_n < 20 ? 'Data suppressed' : 'dummy'};
      finalData['methamphetamine'] = {rate: yr_total_Methamphetamine_OD_n < 20 ? 0 : ((yr_total_Methamphetamine_OD_n/yr_total)*100), stateKey: 'methamphetamine', forTooltip: yr_total_Methamphetamine_OD_n < 20 ? 'Data suppressed' : 'dummy'};
    }
  }

  return finalData;
}

function BarChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(true);

  const { data, width, height, el, currentState, currentDrug, selectedDrugs, currentYear, currentMonth, timeline, drugOptions } = params;

  const dataRates = getData(data, currentState, currentYear, currentMonth, timeline, drugOptions);

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
                    {rate > 0 &&
                    <path 
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': `0px 0px`,
                        outline: 'none'
                      }}
                      d={Utils.horizontalBarPath(true, 0, yScale(name), xScale(rate < 0.25 ? 0.25: rate), yScale.bandwidth(), 3, yScale.bandwidth() * .1)}
                      fill={selectedDrugs.includes(stateKey) ? drugOptions[stateKey].color : 'lightgray'}
                      stroke={selectedDrugs.includes(stateKey) ? drugOptions[stateKey].color : ''}
                      strokeWidth="3"
                      onClick={() => {
                      }}
                      /* data-tip={selectedDrugs.includes(name) ? `<div class="tooltipTableLC"><strong>${drugOptions[name].titleAll}</strong><br/><br/>
                      Rate: ${rate < 0 ? toolTip : Number(rate).toLocaleString()}</div>` : ''} */
                    ></path>
                    }
                    <text 
                      className="bar-label"
                      x={rate < 0 ? 10 : xScale(rate)}
                      y={yScale(name)}
                      dy="20"
                      dx={rate == 0 ? "0" : "15"}
                      fill="black">
                        {toolTip.includes('Data suppressed') ? '*' : (selectedDrugs.includes(stateKey) ? (rate <= 0 ? (toolTip.includes('Data suppressed') ? '*' : '†') : Math.round(rate * 100) / 100) : '')}
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