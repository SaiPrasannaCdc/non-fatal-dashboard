import React, { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Text } from '@visx/text';
import { UtilityFunctions } from '../utility'
import Utils from '../shared/Utils';
import '../css/StateChart.css';

const getData = (data, dataOverall, currentTimeframe, currentMonth, currentYear, currentDrug, stateNames, drugOptions) => {

  var finalData = {};

  if (data?.length > 0)
  {
      for(var i=0;i<data.length;i++)
      {
        if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, "0"))
        {
          for(var j=0;j<Object.keys(stateNames).length;j++) {
            let st = Object.keys(stateNames)[j];
            if (data[i].geoid == st && st != 'US')
            {
              let val;
              let tooltipVal;

              switch (currentDrug) {
                case 'all':
                  val = UtilityFunctions.convertValue(data[i].total_drug_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_drug_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'benzodiazepine':
                  val = UtilityFunctions.convertValue(data[i].total_Benzo_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_Benzo_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'opioids':
                  val = UtilityFunctions.convertValue(data[i].total_opioid_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_opioid_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'fentanyl':
                  val = UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_Fentanyl_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'heroin':
                  val = UtilityFunctions.convertValue(data[i].total_heroin_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_heroin_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'stimulants':
                  val = UtilityFunctions.convertValue(data[i].total_stimulant_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_stimulant_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'cocaine':
                  val = UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_Cocaine_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
                case 'methamphetamine':
                  val = UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(data[i].total_Methamphetamine_OD_n);
                  finalData[stateNames[st]] = {rate: val, stateKey: st, forTooltip: tooltipVal};
                  break;
              }
            }
          }
        }
      }
      for(var i=0;i<dataOverall.length;i++)
      {
        if (dataOverall[i].YYYYMM == currentYear + currentMonth.padStart(2, "0"))
        {
            if (dataOverall[i].Sex == 'Total' && dataOverall[i].Age_Group == 'Total' && dataOverall[i].geoid == 'US')
            {
              let val;
              let tooltipVal;

              switch (currentDrug) {
                case 'all':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_drug_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_drug_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'benzodiazepine':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_Benzo_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_Benzo_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'opioids':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_opioid_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_opioid_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'fentanyl':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_Fentanyl_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_Fentanyl_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'heroin':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_heroin_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_heroin_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'stimulants':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_stimulant_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_stimulant_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'cocaine':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_Cocaine_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_Cocaine_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
                case 'methamphetamine':
                  val = UtilityFunctions.convertValue(dataOverall[i].total_Methamphetamine_OD_n);
                  tooltipVal = val == 0 ? 'Data suppressed' : String(dataOverall[i].total_Methamphetamine_OD_n);
                  finalData[stateNames['US']] = {rate: val, stateKey: 'US', forTooltip: tooltipVal};
                  break;
              }
            }
        }
      }
  }

  return UtilityFunctions.deleteStateKeys(finalData);
}

function StateChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(true);

  const { data, dataOverall, width, height, el, currentState, currentDrug, currentTimeframe, currentMonth, currentYear, drugOptions, stateNames, setCurrentState } = params;

  const dataRates = getData(data, dataOverall, currentTimeframe, currentMonth, currentYear, currentDrug, stateNames);

  const dataKeys = Object.keys(dataRates || {}).filter(name => name !== 'max' && name !== 'min');
  const maxValue = UtilityFunctions.calculateMax(dataRates) ;
  const max = maxValue> 0 ? maxValue : 1;

  const margin = {top: 10, bottom: 10, left: 130, right: 10};
  const adjustedHeight = (height - margin.top - margin.bottom - 100) * ((Object.keys(dataKeys).length / 50)*(1.5));
  const adjustedWidth = width - margin.left - margin.right - 100; 
  const heightNew = height * ((Object.keys(dataKeys).length / 50)*(1.42));

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
    range: [ adjustedHeight, 0 ],
    domain: dataKeys.sort(sort), 
    padding: 0.30
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
  }, [currentDrug, currentYear]);

  const getXAxisLabel = () => {
      return 'Nonfatal Overdoses Involving ' + drugOptions[currentDrug].titleForDropDown + ' per 10,000 Total ED Visits';
  }

  return width > 0 && (
    <>
        <svg
          id="state-chart" 
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
                    {
                      rate > 0 && 
                        <path 
                        className={`animated-bar ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px 0px`,
                          outline: 'none'
                        }}
                        d={Utils.horizontalBarPath(true, 0, yScale(name), rate < 0 ? 10 : xScale(rate), yScale.bandwidth(), 3, yScale.bandwidth() * .1)}
                        fill={stateKey === 'US' ? 'white' : drugOptions[currentDrug].color}
                        stroke={stateKey === currentState ? 'rgba(255, 102, 1, 0.9)' : drugOptions[currentDrug].color}
                        strokeWidth="3"
                        opacity={(currentState === 'US' || stateKey === currentState) ? 1 : 0.4}
                        onClick={() => {
                          if(currentState === stateKey){
                            setCurrentState('US');
                          } else {
                            setCurrentState(stateKey);
                          }
                        }}
                        data-tip={`<div class="tooltipTableLC"><strong>${name}</strong><br/><br/>
                        Rate: ${(rate)}</div>`}
                      ></path>
                    }
                    {
                      rate == 0 &&
                        <text 
                        className="bar-label"
                        x={rate < 0 ? 10 : xScale(rate)}
                        y={yScale(name)}
                        dy="12"
                        dx="5"
                        data-tip={`<strong>${name}</strong><br/><br/>Rate: *Data Suppressed`}>
                        {'*'}
                      </text>
                    }
                    {
                      rate > 0 &&
                        <text 
                        className="bar-label"
                        x={rate < 0 ? 10 : xScale(rate)}
                        y={yScale(name)}
                        dy="12"
                        dx="5">
                        {rate}
                      </text>
                    }
                    
                    
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
                            <tspan y={tick.to.y} dx="-10" dy="5">{tick.value === 'District of Columbia' ? 'DC' : tick.value}</tspan>
                          </text>
                        </g>
                      )
                    )}
                  </g>
                )}
              </AxisLeft>
              <text width={adjustedWidth} y={adjustedHeight + 70} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`, fill: '#000066'}} >{getXAxisLabel()}<tspan baselineShift="super" fontSize="10">*</tspan></text>
              <AxisBottom
                top={adjustedHeight}
                scale={xScale}
                numTicks={width < viewportCutoff ? 4 : null}
                tickStroke="none"
                labelProps={{
                  fontSize: 'medium',
                  textAnchor: width < viewportCutoff ? 'end' : 'middle',
                  transform: 'translate(0, 40)'
                }}
                tickLabelProps={() => ({
                  fontSize: 'medium',
                  textAnchor: 'middle',
                  transform: 'translate(0, 10)'
                })}
              />
            </Group>
        </svg>
    </>
  );
}

export default StateChart;