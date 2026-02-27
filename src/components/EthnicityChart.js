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
  
  var finalData = [];
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
    prefinalData['rate'] = isNaN(val) ? val : (currentDataType == 'rate' ? String(Number(val).toFixed(1)) : String(Number(val).toFixed(0)));

    finalData.push(prefinalData);
  }

    var sortedFinalData = sortByKey(finalData, 'sortOrder');

    return sortedFinalData;

  }


function sortByKey(array, key) {
  return array.sort(function(a, b) {
    const x = a[key];
    const y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

const getMaxValue = (fdata) => {

  let vals = [];
  for (let x=0;x<Object.keys(fdata).length;x++) {
     if (!isNaN(fdata[x].rate)) 
        vals.push(Number(fdata[x].rate));
  }

  return Math.max(...vals);
}

function EthnicityChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(true);

  const { data, width, height, el, currentDrug, currentDataSource, currentTimeframe, currentDataType, currentMonth, currentYear, drugOptions, accessible, widthReduction } = params;

  const isSmallViewport = width < 550 && !widthReduction;
  const fontSize = 16;
  const margin = { top: 50, bottom: 125, left: isSmallViewport ? 120 : 110, right: isSmallViewport ? 0 : 15 };

  const ethnGroups = getEthnGroups(data, currentDataSource, currentYear, currentMonth)
  const filteredData = getFilteredData(data, currentDataSource, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType);

  const dataKeys = Object.keys(filteredData || {}).filter(name => name !== 'max' && name !== 'min');
  const maxValue = UtilityFunctions.calculateMax(filteredData) ;
  const max = maxValue> 0 ? maxValue : 1;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom - (isSmallViewport ? 10 : 0);
  const adjustedWidth = width - margin.left - margin.right - 75;

  const xKey = 'rate';
  const yKey = 'ethnN';

  let overallMax = getMaxValue(filteredData);
  if(overallMax === 0) overallMax = 1;

  const xScale = scaleLinear({
    domain: [0, overallMax  * 1.2],
    range: [0, adjustedWidth]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
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

      if (val.includes('suppressed'))
          return 'Data suppressed';
      else if (val.includes('not available'))
        return 'Data not available/not reported';
      else if (val.includes('NA'))
        return 'Data not available';
      else
        return ''
  }

  const getBar = (d) => {


    const xPos = isNaN(d[xKey]) ? 15 : xScale(d[xKey]);

    const xTip = `<div class="tooltipTableLC"><p><strong>Race/Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: ${(currentDataType == 'rate' ? UtilityFunctions.formatRate(d[xKey], 1) : UtilityFunctions.formatCount(d[xKey], 0))}</p></div>`;

    return (
      <g key={d[yKey]}>

        {!isNaN(d[xKey]) && d[xKey] >= 0 && <path d={d[xKey] < 0.9 ? Utils.horizontalBarPathDem_NR(isSmallViewport ? 5 : 35, yScale(d[yKey]), xPos, yScale.bandwidth()) : Utils.horizontalBarPathDem(true, isSmallViewport ? 5 : 35, yScale(d[yKey]), xPos, yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[xKey]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={1} data-tip={xTip} />}
        {!isNaN(d[xKey]) && Number(d[xKey]) >= 0 && 
        <Text 
          x={((xPos + (isSmallViewport ? (Number(d[xKey]) >= 100 ? 13 : 5) : (Number(d[xKey]) >= 100 ? 60 : 50)) + (currentDataType == 'rate' ? 30 : 40)))} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="#000000"
          fontWeight='normal' 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{(currentDataType == 'rate' ? UtilityFunctions.formatRate(d[xKey], 1) : UtilityFunctions.formatCount(d[xKey], 0))}
          </Text>
        }
          {isNaN(d[xKey]) &&
            <Text 
            x={(isSmallViewport ? 10 : 40)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill={drugOptions[currentDrug].color}
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Race/Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Suppressed`}>*
            </Text>
        }
     </g>
    )
  }


  return width > 0 && (
    <>
    {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateEthnChartData(filteredData)}
          labelOverrides={{
            'val': !isSmallViewport ? (currentDataType == 'rate' ? `Rate per 100,000 persons` : 'Count') : (currentDataType == 'rate' ? 'Rate per 100,000 persons' : 'Count'),
            'Age Group': !isSmallViewport ? 'Race/Ethnicity' : 'Race/Ethnicity',
          }}
          xAxisKey={'Age Group'}
          transforms={{
              rate: num => UtilityFunctions.toFixed(num)
          }}
          height={'auto'}
          width={width}
          isSmallViewport={isSmallViewport}
          currentDataType={currentDataType}
          noSort={true}
        />
        </>  
      ) : (
        <Group>
        <svg style={{ height: height - 30 }}> 
            <Group top={margin.top} left={margin.left}>
              <Group>
              {filteredData.map((d) => getBar(d, false))}
              </Group>
              <AxisLeft
            scale={yScale}
            tickLabelProps={() => ({
              fontSize: 'medium',
              textAnchor: 'end',
              verticalAnchor: 'middle',
              angle: (45),
            })}
            left={!isSmallViewport ? 35 : 5}
            hideTicks
            hideAxisLine
          />

              <AxisBottom
                top={yMax}
                scale={xScale}
                left={!isSmallViewport ? 35 : 5}
                numTicks={isSmallViewport ? 3 : 6}
                tickStroke="none"
                tickLabelProps={(value) => {
                  return {
                    style: {
                      transform: (isSmallViewport && currentDataType == 'percent' ? 'rotate(-60deg)' : ''),
                      transformOrigin: `${xScale(value)}px ${18}px`,
                      textAnchor: 'middle',
                      fontSize: fontSize,
                    }
                  }
                }}
              />
              {currentDataType == 'rate' && <text width={adjustedWidth} y={yMax + 90} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{'Rate per 100,000 persons'}<tspan baselineShift="super" fontSize="10">5</tspan></text>}
              {currentDataType == 'count' && <text width={adjustedWidth} y={yMax + 90} x={(adjustedWidth/2)} textAnchor="middle" style={{ transformOrigin: `-${margin.left / 2}px ${adjustedWidth / 2}px`}}>{'Count'}</text>}
            </Group>
        </svg>
        <div style={{height: !isSmallViewport ? '300px' : '520px'}}>
            <table>
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>*</sup>{'Data suppressed.'}</i></small></td></tr>
              }
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>†</sup>{'Data not avaialbe/not reported.'}</i></small></td></tr>
              }
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>§</sup>{'The race/ethnicity figure excludes data from jurisdictions that had ≥15% missing race/ethnicity data during the selected time period, as well as those who do not participate in DOSE-SYS or who do not have data for this time period. This figure excludes data from [X, Y, and Z].'}</i></small></td></tr>
              }
            </table>
            </div>
            </Group>
          
      )}
    </>
  );
}

export default EthnicityChart;