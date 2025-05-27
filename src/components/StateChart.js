import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Text } from '@visx/text';
import { UtilityFunctions } from '../utility'
import Utils from '../shared/Utils';
import '../css/StateChart.css';

const getData = (data, currentDataSource, currentTimeframe, currentMonth, currentYear, currentDrug, stateNames) => {

  var finalData = {};

  if (currentTimeframe == 'Annual') {
    if(data && data.year[currentDataSource]){
      for (let i = 0; i <= Object.keys(data.year[currentDataSource]).length; i++) {
        var key = Object.keys(data.year[currentDataSource])[i];
        if (data.year[currentDataSource][key]){
          let rec = data.year[currentDataSource][key]['all'].find(d => d.year == String(currentYear));
          if (rec)
            finalData[stateNames[key]] = {rate: isNaN(rec[currentDrug]) ? '-1' : rec[currentDrug], stateKey: key, forTooltip: rec[currentDrug]};
          }
        }
        return finalData;
    }
    else {
      return [];
    }
  }
  else {

    if(data && data.year[currentDataSource]) {
        for (let i = 0; i <= Object.keys(data.year[currentDataSource]).length - 1; i++) {
          var state = Object.keys(data.year[currentDataSource])[i]
          var val = -1
          for (var x=0;x<=Object.keys(data.year[currentDataSource][state][currentMonth]).length - 1; x++)
          {
            if (data.year[currentDataSource][state][[currentMonth]][x].year === Number(currentYear))
            {
                switch (currentDrug) {
                  case 'alldrug':
                    val = data.year[currentDataSource][state][[currentMonth]][x].alldrug;
                    break;
                  case 'benzodiazepine':
                    val = data.year[currentDataSource][state][[currentMonth]][x].benzodiazepine;
                    break;
                  case 'opioid':
                    val = data.year[currentDataSource][state][[currentMonth]][x].opioid;
                    break;
                  case 'fentanyl':
                    val = data.year[currentDataSource][state][[currentMonth]][x].fentanyl;
                    break;
                  case 'heroin':
                    val = data.year[currentDataSource][state][[currentMonth]][x].heroin;
                    break;
                  case 'stimulant':
                    val = data.year[currentDataSource][state][[currentMonth]][x].stimulant;
                    break;
                  case 'cocaine':
                    val = data.year[currentDataSource][state][[currentMonth]][x].cocaine;
                    break;
                  case 'methamphetamine':
                    val = data.year[currentDataSource][state][[currentMonth]][x].methamphetamine;
                    break;
                }
            }

            finalData[stateNames[state]] = {rate: val, stateKey: state, forTooltip: String(val)};
          }

      }

      return finalData;
    }
      else {
        return [];
    }
  }

};

function StateChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(true);

  const { data, width, height, el, currentState, currentDrug, currentDataSource, currentTimeframe, currentMonth, currentYear, drugOptions, stateNames, setCurrentState } = params;

  const dataRates = getData(data, currentDataSource, currentTimeframe, currentMonth, currentYear, currentDrug, stateNames);

  const dataKeys = Object.keys(dataRates || {}).filter(name => name !== 'max' && name !== 'min');
  const maxValue = UtilityFunctions.calculateMax(dataRates) ;
  const max = maxValue> 0 ? maxValue : 1;

  const margin = {top: 10, bottom: 0, left: 130, right: 10};
  const adjustedHeight = (height - margin.top - margin.bottom - 100) * ((Object.keys(dataKeys).length / 50)*(1.5));
  const adjustedWidth = width - margin.left - margin.right - 100; 
  const heightNew = height * ((Object.keys(dataKeys).length / 50)*(1.55));

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
  }, [currentDrug, currentDataSource, currentYear]);

  const getXAxisLabel = () => {
      if (currentDataSource == 'ED')
          return 'Rate of nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' visits per 100,000 persons';
      else if (currentDataSource == 'HOSP')
        return 'Rate of nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' inpatient hospitalizations per 100,000 persons';
      else
        return ''
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
                      Rate: ${rate < 0 ? toolTip : Number(rate).toLocaleString()}</div>`}
                    ></path>
                    <text 
                      className="bar-label"
                      x={rate < 0 ? 10 : xScale(rate)}
                      y={yScale(name)}
                      dy="12"
                      dx="5">
                        {rate < 0 ? (toolTip?.includes('Data suppressed') ? '*' : '†') : rate}
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
                          <text textAnchor="end" fontSize="medium">
                            <tspan y={tick.to.y} dx="-10" dy="5">{tick.value === 'District of Columbia' ? 'DC' : tick.value}</tspan>
                          </text>
                        </g>
                      )
                    )}
                  </g>
                )}
              </AxisLeft>
              <text width={adjustedWidth} y={adjustedHeight + 70} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{getXAxisLabel()}<tspan baselineShift="super" fontSize="10">5</tspan></text>
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