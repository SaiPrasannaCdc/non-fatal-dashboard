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

const getFilteredData = (data, currentDrug, currentYear, currentMonth, currentDataType) => {

  var finalData = [];
  var male_total = 0;
  var female_total = 0;

    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, '0') && data[i].Age_Group === 'Total')
          {
            if (data[i].geoid == 'US' && data[i].Age_Group == 'Total')
            {
              switch (currentDrug) {
                case 'all':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_drug_OD_n : data[i].total_drug_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_drug_OD_n : data[i].total_drug_OD_pct));
                  }

                  break;
                case 'benzodiazepine':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Benzo_OD_n : data[i].total_Benzo_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) +Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Benzo_OD_n : data[i].total_Benzo_OD_pct));
                  }

                  break;
                case 'opioids':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) +Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_opioid_OD_n : data[i].total_opioid_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_opioid_OD_n : data[i].total_opioid_OD_pct));
                  }

                  break;
                case 'fentanyl':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Fentanyl_OD_n : data[i].total_Fentanyl_OD_pct));
                  } 
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Fentanyl_OD_n : data[i].total_Fentanyl_OD_pct));
                  }

                  break;
                case 'heroin':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) +Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_heroin_OD_n : data[i].total_heroin_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_heroin_OD_n : data[i].total_heroin_OD_pct));
                  }

                  break;
                case 'stimulants':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_stimulant_OD_n : data[i].total_stimulant_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_stimulant_OD_n : data[i].total_stimulant_OD_pct));
                  }

                  break;
                case 'cocaine':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Cocaine_OD_n : data[i].total_Cocaine_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Cocaine_OD_n : data[i].total_Cocaine_OD_pct));
                  }

                  break;
                case 'methamphetamine':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Methamphetamine_OD_n : data[i].total_Methamphetamine_OD_pct));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? data[i].total_Methamphetamine_OD_n : data[i].total_Methamphetamine_OD_pct));
                  }

                  break;
          }
        }
    }
  }

  var maleData = {};
  var femaleData = {};

  femaleData['sex'] = 'Female';
  femaleData['value'] = String((female_total).toFixed(1));
  finalData.push(femaleData);

  maleData['sex'] = 'Male';
  maleData['value'] = String((male_total).toFixed(1));
  finalData.push(maleData);

  return finalData;
};

const getMissingData = (data, currentDrug, currentYear, currentMonth) => {
  
  var missing_rate = 0;
  var missing_pct = 0;

    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, '0'))
          {
            if (data[i].geoid == 'US' && data[i].Age_Group == 'Total')
            {
              switch (currentDrug) {
                case 'all':
                  if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_pct));
                  }
                  break;
                case 'benzodiazepine':
                  if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_pct));
                  }
                  break;
                case 'opioids':
                  if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_pct));
                  }
                  break;
                case 'fentanyl':
                  if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_pct));
                  }
                  break;
                case 'heroin':
                   if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_pct));
                  }
                  break;
                case 'stimulants':
                  if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_pct));
                  }
                  break;
                case 'cocaine':
                  if (data[i].Sex == 'Missing') {
                    missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
                    missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_pct));
                  }
                  break;
                case 'methamphetamine':
                  if (data[i].Sex == 'Missing') {
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

const getMaxValue = (fdata) => {

    let vals = [];
    for (let x=0;x<Object.keys(fdata).length;x++) {
      if (Number(fdata[x].value) > 0)
        vals.push(Number(fdata[x].value));
    }
    
    return vals.length > 0 ? Math.max(...vals) : 0.84;
  }

function SexChart(params) {

  const { data, jurisCountData, width, height, el, currentDrug, drugOptions, currentTimeLine, currentYear, currentMonth, currentDataType, accessible, widthReduction } = params;

  const isSmallViewport = width < 550 && !widthReduction;
  
  const [ animated, setAnimated ] = useState(false);

  const filteredData = getFilteredData(data, currentDrug, currentYear, currentMonth, currentDataType);
  const missingData = getMissingData(data, currentDrug, currentYear, currentMonth);

  const margin = {top: 10, bottom: 50, left: currentDataType == 'rate' ? 50 : (isSmallViewport ? 100: 130), right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 120;
  const adjustedWidth = width - margin.left - margin.right;
  const fontSize = 16;

  const xScale = scaleBand({
    domain: filteredData.map(d => d.sex),
    range: [ 0, adjustedWidth ],
    padding: 0.35
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
    return 'Note: ' + mdata['percent'] + '% of nonfatal ' + drugOptions[currentDrug].titleSingular.toLowerCase() + ' overdoses are missing sex data during this time period.' + (currentDataType == 'percent' ? ' Percentages in the figure may not add up to 100% due to missingness.' : '');
  };
  
  const getFormattedValue = (val) => {

    if (currentDataType == 'rate')
      return val;
    else
       return val + '%';
  } 

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  if (UtilityFunctions.isCovidPeriodGrayBox(currentTimeLine, currentYear, currentMonth))
        return UtilityFunctions.getCovidGrayBox(height, width, accessible ? 'By Sex: ' : '');
    
  return width > 0 && 
      (
        <div id="sex-chart">
          {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateSexChartData(filteredData)}
          labelOverrides={{
            'rate': !isSmallViewport ? (currentDataType == 'rate' ? 'Rate' : 'Percent') + ' of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + (currentDataType == 'rate' ? ' per 10,000 Total ED Visits' : '') : (currentDataType == 'rate' ? 'Rate' : 'Percent'),
            'Sex': 'By Sex (' + ((jurisCountData != null && Object.keys(jurisCountData).length > 0) ? jurisCountData[currentYear + currentMonth.padStart(2, '0') + currentTimeLine] : '0') + ' Jurisdictions)'
          }}
          xAxisKey={'Sex'}
          transforms={{
            rate: num => (UtilityFunctions.toFixed(num) + (currentDataType == 'rate' ? '' : '%'))
          }}
          height={'auto'}
          width={width}
          isSmallViewport={isSmallViewport}
          currentDataType={currentDataType}
        />
        {!isSmallViewport && <table>
            {!UtilityFunctions.allDataIsSupressed(filteredData) && currentDataType == 'placeHolder' &&
            <tr>
              <td>
                <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div>
                <span></span>
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
                {!UtilityFunctions.allDataIsSupressed(filteredData) && currentDataType == 'placeHolder' && <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div> }
                <span></span>
              </td>
            </tr>
        </table>
        }
        </>        
      ) : (
      <Group>
        <svg width={width} height={height - 60}>
          <Group top={margin.top} left={margin.left}>
            (
              <>
                <AxisLeft
                  scale={yScale}
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    fill: '#000066',
                    textAnchor: 'end',
                    transform: 'translate(-5, 5)'
                  })}
                  labelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'middle'
                  })}
                  tickFormat={value => 
                      getFormattedValue(value)
                  }
                  labelOffset={60}
                  numTicks={5}
                />

                {filteredData.map(d => (
                  <Group key={`group-${d.sex}`} className="animate-bars">
                    {d.value >= 0 && (
                      <path
                        key={`cause-bar-${d.sex}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        opacity={d.sex == 'Male' ? 0.4 : 1.0}
                        d={Utils.verticalBarPath(xScale(d.sex), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), xScale.bandwidth() * .1)}
                        fill={drugOptions[currentDrug].color}
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/><br/>Sex: ${d.sex}<br/><br/>Overdoses: ${Number(d.value).toFixed(1) + (currentDataType == 'rate' ? '' : '%')}`}
                      ></path>
                    )}
                    {d.value == -3.0 && (
                      <text
                        x={xScale(d.sex) + halfBandwidth}
                        y={adjustedHeight - 10}
                        fill="#000000"
                        fontWeight='normal'
                        textAnchor="middle"
                        cursor="default"
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/><br/>Sex: ${d.sex}<br/><br/>Overdoses: Data Suppressed`}
                      >*</text>
                    )}
                    {d.value == -1.0 && (
                      <text
                        x={xScale(d.sex) + halfBandwidth}
                        y={adjustedHeight - 10}
                        fill="#000000"
                        fontWeight='normal'
                        textAnchor="middle"
                        cursor="default"
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/><br/>Sex: ${d.sex}<br/><br/>Overdoses: Data not available/not reported`}
                      >†</text>
                    )}
                    {d.value >= 0 && (
                        <text
                          x={xScale(d.sex) + halfBandwidth}
                          y={yScale(d.value) - 10}
                          fill="#000000"
                          fontWeight='normal'
                          textAnchor="middle"
                          cursor="default"
                          fontSize={isSmallViewport ? fontSize * .8 : fontSize}
                        >{d.value + (currentDataType == 'rate' ? '' : '%')}</text>
                      )}
                  </Group>
                ))}

                <AxisBottom
                  top={adjustedHeight}
                  scale={xScale}
                  tickStroke="transparent"
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    fill: '#000066',
                    textAnchor: 'middle',
                    transform: 'translate(0, 10)'
                  })}
                />
              </>
            )
            
            
            {currentDataType != 'rate' && !isSmallViewport && <text width={adjustedHeight} x={(margin.left / -2) - 3} y={adjustedHeight / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', fill: '#000066', transformOrigin: `-${margin.left / 2}px ${adjustedHeight / 2}px`}}>Percent of suspected Nonfatal</text>}
            {currentDataType != 'rate' && !isSmallViewport && <text width={adjustedHeight} x={((margin.left / -2) - 3) + 20} y={adjustedHeight / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', fill: '#000066', transformOrigin: `-${(margin.left / 2) - 20}px ${adjustedHeight / 2}px`}}>overdoses Involving {drugOptions[currentDrug].titleAll} </text>}
            {currentDataType != 'rate' && isSmallViewport && <text width={adjustedHeight} x={(margin.left / -2) + 18} y={adjustedHeight / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', fill: '#000066', transformOrigin: `-${(margin.left / 2) + 18}px ${adjustedHeight / 2}px`}}>Percent of suspected Nonfatal</text>}
            {currentDataType != 'rate' && isSmallViewport && <text width={adjustedHeight} x={((margin.left / -2) + 18) + 20} y={adjustedHeight / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', fill: '#000066', transformOrigin: `-${(margin.left / 2) + 18 - 20}px ${adjustedHeight / 2}px`}}>overdoses Involving {drugOptions[currentDrug].titleAll} </text>}
            {currentDataType == 'rate' && <text x={!isSmallViewport ? adjustedWidth/2 : 80} y={height - 110} fill={'#000066'} fontSize={fontSize * (isSmallViewport ? .8 : 1)} textAnchor="middle">Suspected Nonfatal Overdoses Involving </text>}
            {currentDataType == 'rate' && <text x={!isSmallViewport ? adjustedWidth/2 : 80} y={height - 90} fill={'#000066'} fontSize={fontSize * (isSmallViewport ? .8 : 1)} textAnchor="middle">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          </Group>
        </svg>
        <div>
          <table>
            {!UtilityFunctions.allDataIsSupressed(filteredData) && currentDataType == 'placeHolder' &&
              <tr><td><small><i>{getMissingNote(missingData)}</i></small></td></tr>
            }
            {!UtilityFunctions.allDataIsSupressed(filteredData) &&
              <tr><td><small><i><sup>*</sup>{'Data suppressed.'}</i></small></td></tr>
            }
            {!UtilityFunctions.allDataIsSupressed(filteredData) &&
              <tr><td><small><i><sup>†</sup>{'Scale of the figure may change based on the data selected.'}</i></small></td></tr>
            }
          </table>
        </div>
      </Group>
      )}
      </div>
    );
}

export default SexChart;
