import React, { useState, useEffect } from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import Utils from '../shared/Utils';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';
import { countCutoff } from '../constants.json';

import '../css/AgeChart.css';

const getAgeGroups = (data, currentTimeLine, currentYear, currentMonth) => {

  var ageData = [];

  if (currentTimeLine == 'Annual') { 

    for(let i=0;i<data.length;i++) {
      if (data[i].YYYYMM?.substring(0,4) == currentYear)
      {
        if (data[i].geoid == 'US' && !ageData.includes(data[i].Age_Group))
          ageData.push(data[i].Age_Group);
      }
     }

    return ageData;
  }
  else 
  {
    var yyyymm = currentYear + currentMonth.padStart(2, '0');
    for(let i=0;i<data.length;i++) {
      if (data[i].YYYYMM == yyyymm)
      {
        if (data[i].geoid == 'US' && !ageData.includes(data[i].Age_Group))
          ageData.push(data[i].Age_Group);
      }
     }

    return ageData;
  }
};

const getFilteredData = (data, ageGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType) => {
  
  var finalData = [];
  var drug_total = 0;

  for (let x=0;x<ageGroups.length;x++) {

    drug_total = 0;
    
    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, '0'))
          {
            if (data[i].Age_Group === ageGroups[x] && data[i].Sex == 'Total' && data[i].geoid == 'US')
            {
              switch (currentDrug) {
                case 'all':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_drug_OD_n : data[i].total_drug_OD_pct));
                  break;
                case 'benzodiazepine':
                   drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Benzo_OD_n : data[i].total_Benzo_OD_pct));
                   break;
                case 'opioids':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_opioid_OD_n : data[i].total_opioid_OD_pct));
                  break;
                case 'fentanyl':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Fentanyl_OD_n : data[i].total_Fentanyl_OD_pct));
                  break;
                case 'heroin':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_heroin_OD_n : data[i].total_heroin_OD_pct));
                  break;
                case 'stimulants':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_stimulant_OD_n : data[i].total_stimulant_OD_pct));
                  break;
                case 'cocaine':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Cocaine_OD_n : data[i].total_Cocaine_OD_pct));
                  break;
                case 'methamphetamine':
                  drug_total = Number(drug_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Methamphetamine_OD_n : data[i].total_Methamphetamine_OD_pct));
                  break;
          }
        }
      }
    }
    
    var prefinalData = {};
    var ageN = ''
    var sortOrder = 0;

    switch (ageGroups[x]) {
      case '0 to 14':
        ageN = '0–14';
        sortOrder = 1; 
        break;
      case '15 to 24':
        ageN = '15–24'; 
        sortOrder = 2;
        break;
      case '25 to 34':
        ageN = '25–34'; 
        sortOrder = 3; 
        break;
      case '35 to 44':
        ageN = '35–44'; 
        sortOrder = 4; 
        break;
      case '45 to 54':
        ageN = '45–54'; 
        sortOrder = 5; 
        break;
      case '55 to 64':
        ageN = '55–64'; 
        sortOrder = 6; 
        break;
      case '65+':
        ageN = '65+'; 
        sortOrder = 7; 
        break;
    }

    prefinalData['age'] = ageGroups[x];
    prefinalData['ageN'] = ageN;
    prefinalData['sortOrder'] = sortOrder;
    prefinalData['value'] = String((drug_total).toFixed(1));

    if (ageGroups[x] != 'Total' && ageGroups[x] != 'Missing')
      finalData.push(prefinalData);
  }

  var sortedFinalData = sortByKey(finalData, 'sortOrder');

  return sortedFinalData;
};

const getMissingData = (data, currentDrug, currentYear, currentMonth) => {
  
  var missing_rate = 0;
  var missing_pct = 0;

    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, '0'))
          {
            if (data[i].geoid == 'US' && data[i].Sex == 'Total')
            {
              switch (currentDrug) {
                case 'all':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_pct));
                  }
                  break;
                case 'benzodiazepine':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_pct));
                  }
                  break;
                case 'opioids':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_pct));
                  }
                  break;
                case 'fentanyl':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_pct));
                  }
                  break;
                case 'heroin':
                   if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_pct));
                  }
                  break;
                case 'stimulants':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_pct));
                  }
                  break;
                case 'cocaine':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_pct));
                  }
                  break;
                case 'methamphetamine':
                  if (data[i].Age_Group == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_pct));
                  }
                  break;

          }
        }
    }
  }

  var missingData = {};

  missingData['rate'] = missing_rate;
  missingData['percent'] = missing_pct;

  return missingData;
};

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
        vals.push(Number(fdata[x].value));
    }
    
    return Math.max(...vals);
  }

function AgeChart(params) {

  const { data, year, width, height, header, el, currentDrug, drugOptions, currentTimeLine, currentYear, currentMonth, currentDataType, accessible, widthReduction } = params;
  const isSmallViewport = width < 550 && !widthReduction;
  const [ animated, setAnimated ] = useState(false);

  const ageGroups = getAgeGroups(data, currentTimeLine, currentYear, currentMonth)
  const filteredData = getFilteredData(data, ageGroups, currentDrug, currentTimeLine, currentYear, currentMonth, currentDataType);
  const missingData = getMissingData(data, currentDrug, currentYear, currentMonth);

  const margin = {top: 10, bottom: (header ? 10 : !isSmallViewport ? 50 : 90), left: (header ? 0 : 50), right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 120;
  const adjustedWidth = width - margin.left - margin.right;
  const fontSize = 16;

  
  const xScale = scaleBand({
    domain: filteredData.map(d => d.ageN),
    range: [ header ? 5 : 0, adjustedWidth ],
    padding: header ? 0 : 0.35
  });

  const max = getMaxValue(filteredData) * 1.2;

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [ 0, max]
  });

  const halfBandwidth = xScale.bandwidth() / 2;

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().top - document.body.getBoundingClientRect().top){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  const getMissingNote = (mdata) => {
    return 'Note: ' +  mdata['percent'] + '% of data are missing.'
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  return width > 0 && 
      (
        <div id="age-chart">
          {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateAgeChartData(filteredData)}
          labelOverrides={{
            'rate': !isSmallViewport ? (currentDataType == 'rate' ? 'Rate' : 'Percent') + ' of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits' : (currentDataType == 'rate' ? 'Rate' : 'Percent'),
            'Sex': !isSmallViewport ? 'By Age (In years)' : 'By Age',
            '0–14': '<15'
          }}
          xAxisKey={'Sex'}
          transforms={{
            rate: num => UtilityFunctions.toFixed(num)
          }}
          height={'auto'}
          width={width}
          isSmallViewport={isSmallViewport}
          currentDataType={currentDataType}
        />
        {!isSmallViewport && <table>
            {!UtilityFunctions.allDataIsSupressed(filteredData) &&
            <tr>
              <td>
                <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div>
              </td>
            </tr>
            }
        </table>
        }
        {isSmallViewport && <table>
          <tr>
              <td>
                <div><span><small><sup>‡</sup>{(currentDataType == 'rate' ? 'Rate' : 'Percent') + ' of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits.'}</small></span></div>
              </td>
            </tr>
            <br></br>
                    <tr>
                      <td>
                        <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
                        {!UtilityFunctions.allDataIsSupressed(filteredData) && <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div> }
                        <span></span>
                      </td>
                    </tr>
                </table>
        }
        </>        
      ) : (
        <svg width={width} height={height + 10}>
          <Group top={margin.top} left={margin.left}>
            (
              <>
                <AxisLeft
                  scale={yScale}
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'end',
                    fill: '#000066',
                    transform: 'translate(-5, 5)'
                  })}
                  labelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'middle'
                  })}
                  labelOffset={60}
                />

                {filteredData.map(d => (
                  <Group key={`group-${d.ageN}`} className="animate-bars">
                    {d.value > 0 && (
                      <path
                        key={`cause-bar-${d.ageN}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        d={Utils.verticalBarPath(xScale(d.ageN), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), xScale.bandwidth() * .1)}
                        fill={drugOptions[currentDrug].color}
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/><br/>Age: ${d.ageN}<br/><br/>Overdoses: ${Number(d.value).toFixed(1) + (currentDataType == 'rate' ? '' : '%')}`}
                      ></path>
                    )}
                    {d.value == 0 && (
                      <text
                        x={xScale(d.ageN) + halfBandwidth}
                        y={adjustedHeight - 10}
                        fill="#000000"
                        fontWeight='normal'
                        textAnchor="middle"
                        cursor="default"
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/><br/>Age Group: ${d.ageN}<br/><br/>Overdoses: Data Suppressed`}
                      >*</text>
                    )}
                    {d.value > 0 && (
                        <text
                          x={xScale(d.ageN) + halfBandwidth}
                          y={yScale(d.value) - 10}
                          fill="#000000"
                          fontWeight='normal'
                          textAnchor="middle"
                          fontSize={isSmallViewport ? fontSize * .8 : fontSize}
                          cursor="default"
                        >{d.value + (currentDataType == 'rate' ? '' : '%')}</text>
                      )}
                  </Group>
                ))}

                <AxisBottom
                  top={adjustedHeight}
                  scale={xScale}
                  tickStroke="transparent"
                  tickLabelProps={(value) => ({
                    fill: '#000066',
                    fontSize: 'medium',
                    textAnchor: (isSmallViewport ? 'start' : 'start'),
                    angle: (isSmallViewport ? 90 : 0),
                    verticalAnchor: 'middle',
                  })}
                  labelProps={{
                    textAnchor: 'middle',                    
                  }}
                />
              </>
            )

            {!isSmallViewport && <text x={adjustedWidth/2} y={height - 110} fill={'#000066'} fontSize={13} textAnchor={!isSmallViewport ? "middle" : "start"}>Suspected Nonfatal Overdoses Involving </text>}
            {!isSmallViewport && <text x={adjustedWidth/2} y={height - 90} fill={'#000066'} fontSize={13} textAnchor={"middle"}>{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
            {!isSmallViewport && !UtilityFunctions.allDataIsSupressed(filteredData) && <text x={adjustedWidth/2} y={height - 60} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"middle"}>{getMissingNote(missingData)}</text>}
            {!isSmallViewport && <text x={adjustedWidth/2} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 30 : 60)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"middle"}><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
            {!isSmallViewport && <text x={adjustedWidth/2} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 10 : 40)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"middle"}><tspan baselineShift="super" fontSize="8">†</tspan>{'Scale of the figure may change based on the data selected.'}</text>} 
            
            {isSmallViewport && <text x={-50} y={height - 130} fill={'#000066'} fontSize={13} textAnchor={"start"}>Suspected Nonfatal Overdoses Involving </text>}
            {isSmallViewport && <text x={-50} y={height - 110} fill={'#000066'} fontSize={13} textAnchor={"start"}>{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
            {isSmallViewport && !UtilityFunctions.allDataIsSupressed(filteredData) && <text x={-50} y={height - 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}>{getMissingNote(missingData)}</text>}  
            {isSmallViewport && <text x={-50} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 50 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
            {isSmallViewport && <text x={-50} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 30 : 60)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="8">†</tspan>{'Scale of the figure may change based on the data'}</text>} 
            {isSmallViewport && <text x={-50} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 10 : 40)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}>{'selected.'}</text>}

          </Group>
        </svg>
      )}
      </div>
    );
}

export default AgeChart;
