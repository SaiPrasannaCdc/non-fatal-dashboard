import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Text } from '@visx/text';
import Utils from '../shared/Utils';
import '../css/StateChart.css';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';

const getEthnGroups = (data, currentDataSource, currentYear, currentMonth) => {

  var ethnData = [];

    for(let i=0;i<Object.keys(data.ethnicityData[currentYear][currentDataSource]).length;i++) {
      var ethnGrp = Object.keys(data.ethnicityData[currentYear][currentDataSource])[i];
      ethnData.push(ethnGrp);
     }

    return ethnData;

};

const getFilteredData = (data, currentDataSource, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType) => {
  
  var finalData = {};
  var finalDataBeforeSort = [];
  var val = 0;

  for (let x=0;x<ethnGroups.length;x++) {
    
   val = 0;

   for(let i=0;i<Object.keys(data.ethnicityData[currentYear][currentDataSource]).length;i++) {
      var ethnGrp = Object.keys(data.ethnicityData[currentYear][currentDataSource])[i];
            
            var dataRec = data.ethnicityData[currentYear][currentDataSource][ethnGrp];
            if (ethnGrp === ethnGroups[x])
            {
              switch (currentDrug) {
                case 'alldrug':
                    val = currentDataType == 'rate' ? dataRec.rate_alldrug : dataRec.count_alldrug;

                  break;
                case 'benzodiazepine':
                    val = currentDataType == 'rate' ? dataRec.rate_benzodiazepine : dataRec.count_benzodiazepine;

                  break;
                case 'opioid':
                    val = currentDataType == 'rate' ? dataRec.rate_opioid : dataRec.count_opioid;

                  break;
                case 'fentanyl':
                    val = currentDataType == 'rate' ? dataRec.rate_fentanyl : dataRec.count_fentanyl;

                  break;
                case 'heroin':
                    val = currentDataType == 'rate' ? dataRec.rate_heroin : dataRec.count_heroin;

                  break;
                case 'stimulant':
                    val = currentDataType == 'rate' ? dataRec.rate_stimulant: dataRec.count_stimulant;

                  break;
                case 'cocaine':
                    val = currentDataType == 'rate' ? dataRec.rate_cocaine : dataRec.count_cocaine;
  
                  break;
                case 'methamphetamine':
                    val = currentDataType == 'rate' ? dataRec.rate_methamphetamine : dataRec.count_methamphetamine;

                  break;
          }
        }
    }
    
    var prefinalData = {};
    var ethnN = ''
    var sortOrder = 0;

    switch (ethnGroups[x]) {
      case 'Hispanic, Any Race':
        ethnN = 'Hispanic, (any race)';
        sortOrder = 7; 
        break;
      case 'Non-Hispanic, American Indian or Alaska Native':
        ethnN = 'AI/AN'; 
        sortOrder = 1;
        break;
      case 'Non-Hispanic, Asian':
        ethnN = 'Asian'; 
        sortOrder = 2; 
        break;
      case 'Non-Hispanic, Black or African American':
        ethnN = 'Black'; 
        sortOrder = 3; 
        break;
      case 'Non-Hispanic, Native Hawaiian or Other Pacific Islander':
        ethnN = 'NH/PI'; 
        sortOrder = 4; 
        break;
      case 'Non-Hispanic, Other or Multiple Race':
        ethnN = 'Other or Multiple Race'; 
        sortOrder = 5; 
        break;
      case 'Non-Hispanic, White':
        ethnN = 'White'; 
        sortOrder = 6; 
        break;
    }

    prefinalData['ethnN'] = ethnN;
    prefinalData['sortOrder'] = sortOrder;
    prefinalData['rate'] = String(val);

    finalDataBeforeSort.push(prefinalData);

  }

  const sorted = [...finalDataBeforeSort].sort((a, b) => b.sortOrder - a.sortOrder);
  for (var i=0;i<sorted.length;i++)
    finalData[sorted[i].ethnN] = sorted[i];

  return finalData;
};

function EthnicityChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(true);

  const { data, width, height, el, currentDrug, currentDataSource, currentTimeframe, currentDataType, currentMonth, currentYear, drugOptions, accessible } = params;

  const isSmallViewport = width < 550;

  const ethnGroups = getEthnGroups(data, currentDataSource, currentYear, currentMonth)
  const dataRates = getFilteredData(data, currentDataSource, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType);

  const dataKeys = Object.keys(dataRates || {}).filter(name => name !== 'max' && name !== 'min');
  const maxValue = UtilityFunctions.calculateMax(dataRates) ;
  const max = maxValue> 0 ? maxValue : 1;

  const margin = {top: 10, bottom: 0, left: (isSmallViewport ? 150 : 430), right: 10};
  const adjustedHeight = (height - margin.top - margin.bottom - 100) * ((Object.keys(dataKeys).length / 20)*(1.5));
  const adjustedWidth = width - margin.left - margin.right - 100; 
  const heightNew = height * ((Object.keys(dataKeys).length / 20)*(1.55));

  const xScale = scaleLinear({
    domain: [0, max * (isSmallViewport ? 1.3 : 1.1)],
    range: [ 0, adjustedWidth ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataKeys, 
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

  const formatToolTip = (val) => {
      if (val.includes('Data suppressed'))
          return 'Data suppressed';
      else if (val.includes('Data not available'))
        return 'Data not available/not reported';
      else
        return ''
  }

  return width > 0 && (
    <>
    {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateEthnChartData(dataRates)}
          labelOverrides={{
            'val': !isSmallViewport ? (currentDataType == 'rate' ? 'Rate' : 'Percent') + ' of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleForDropDown + ' per 10,000 Total ED Visits' : (currentDataType == 'rate' ? 'Rate' : 'Percent'),
            'Age Group': !isSmallViewport ? 'By Race/Ethnicity' : 'By Race/Ethnicity',
          }}
          xAxisKey={'Age Group'}
          transforms={{
              rate: num => UtilityFunctions.toFixed(num)
          }}
          height={'auto'}
          width={width}
          isSmallViewport={isSmallViewport}
          currentDataType={currentDataType}
        />
        </>  
      ) : (
        <svg
          id="state-chart" 
          width={width} 
          height={heightNew + 50}>
            <Group top={margin.top} left={margin.left}>
              {dataKeys.map(d => {
                const name = d;
                const rate = dataRates[name].rate;
                const toolTip = isNaN(dataRates[name].rate) ? formatToolTip(dataRates[name].rate) : (currentDataType == 'rate' ? dataRates[name].rate : Number(dataRates[name].rate).toFixed(0));

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
                      fill={drugOptions[currentDrug].color}
                      stroke={drugOptions[currentDrug].color}
                      strokeWidth="3"
                      opacity={1}
                      data-tip={`<div class="tooltipTableLC"><strong>${name}</strong><br/><br/>
                      Rate: ${isNaN(rate) ? toolTip : (currentDataType == 'rate' ? Number(Number(rate).toFixed(1)).toLocaleString() : Number(Number(rate).toFixed(0)).toLocaleString())}</div>`}
                    ></path>
                    <text 
                      className="bar-label"
                      x={isNaN(rate) ? 0 : xScale(rate)}
                      y={yScale(name)}
                      dy={isNaN(rate) ? 28 : 25}
                      dx={isNaN(rate) ? 0 : 5}
                      data-tip={isNaN(rate) ? `<div class="tooltipTableLC"><strong>${name}</strong><br/><br/>Rate: ${toolTip}</div>` : ''}>
                        {isNaN(rate) ? (toolTip?.includes('Data suppressed') ? '*' : '—') : (currentDataType == 'rate' ? Number(Number(rate).toFixed(1)).toLocaleString() : Number(Number(rate).toFixed(0)).toLocaleString())}
                    </text>
                  </Group>
                )}
              )}
              <AxisLeft 
                scale={yScale}
                tickValues={dataKeys}
                  tickLabelProps={() => ({
                  fontSize: 'medium',
                  fill: '#000066',
                  textAnchor: 'end',
                  verticalAnchor: 'middle',
                  angle: (isSmallViewport ? 45 : 0),
                })}
                left={-5}
                hideTicks
                hideAxisLine
              >
              </AxisLeft>
              <AxisBottom
                top={adjustedHeight}
                scale={xScale}
                numTicks={width < viewportCutoff ? 1 : null}
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
              {currentDataType == 'rate' && <text width={adjustedWidth} y={adjustedHeight + 70} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{'Suspected Nonfatal Overdoses Involving'}</text>}
              {currentDataType == 'rate' && <text width={adjustedWidth} y={adjustedHeight + 90} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{drugOptions[currentDrug].titleForDropDown + ' per 10,000 Total ' + (currentDataSource == 'ED' ? 'ED visits' : 'Inpatient Hospitalizations')}</text>}
              {currentDataType == 'count' && <text width={adjustedWidth} y={adjustedHeight + 70} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{'Suspected Nonfatal Overdoses Involving'}</text>}
              {currentDataType == 'count' && <text width={adjustedWidth} y={adjustedHeight + 90} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{drugOptions[currentDrug].titleForDropDown + ' per 10,000 Total ' + (currentDataSource == 'ED' ? 'ED visits' : 'Inpatient Hospitalizations')}</text>}
            </Group>
        </svg>
      )}
    </>
  );
}

export default EthnicityChart;