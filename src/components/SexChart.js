import React, { useState, useEffect } from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import Utils from '../shared/Utils';
import { UtilityFunctions } from '../utility'
import { countCutoff } from '../constants.json';

import '../css/AgeChart.css';

const getFilteredData = (data, currentDrug, currentYear, currentMonth) => {
  
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
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                  }

                  break;
                case 'benzodiazepine':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) +Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                  }

                  break;
                case 'opioids':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) +Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                  }

                  break;
                case 'fentanyl':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                  } 
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                  }

                  break;
                case 'heroin':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) +Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                  }

                  break;
                case 'stimulants':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                  }

                  break;
                case 'cocaine':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
                  }

                  break;
                case 'methamphetamine':
                  if (data[i].Sex == 'Male') {
                    male_total = Number(male_total) + Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n));
                  }
                  else if (data[i].Sex == 'Female') {
                    female_total = Number(female_total) + Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n));
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
        vals.push(Number(fdata[x].value));
    }
    
    return Math.max(...vals);
  }

function SexChart(params) {

  const viewportCutoff = 600;

  const { data, width, height, el, currentDrug, drugOptions, currentTimeLine, currentYear, currentMonth } = params;
  const [ animated, setAnimated ] = useState(false);

  const filteredData = getFilteredData(data, currentDrug, currentYear, currentMonth);
  const missingData = getMissingData(data, currentDrug, currentYear, currentMonth);

  const margin = {top: 10, bottom: 50, left: 90, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 100;
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
    return 'Note: ' + mdata['percent'] + '% of data are missing.'
  };
  

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  return width > 0 && 
      (
        <div id="age-chart">
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            (
              <>
                <AxisLeft
                  scale={yScale}
                  numTicks={6}
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
                  labelOffset={60}
                />
                {/* <text x={adjustedHeight / -2} y={-65} textAnchor="middle" fill={'#000066'} transform="rotate(-90)">Nonfatal Overdoses per 10,000 ED visits</text> */}

                {filteredData.map(d => (
                  <Group key={`group-${d.sex}`} className="animate-bars">
                    {d.value > 0 && (
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
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/><br/>Sex: ${d.sex}<br/><br/>Overdoses: ${Number(d.value).toFixed(1)}`}
                      ></path>
                    )}
                    {d.value == 0 && (
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
                    {d.value > 0 && (
                        <text
                          x={xScale(d.sex) + halfBandwidth}
                          y={yScale(d.value) - 10}
                          fill="#000000"
                          fontWeight='normal'
                          textAnchor="middle"
                          cursor="default"
                        >{d.value}</text>
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
            <text x={adjustedWidth/2} y={height - 90} fill={'#000066'} fontSize={16} textAnchor="middle">Nonfatal Overdoses Involving {drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>
            {!UtilityFunctions.allDataIsSupressed(filteredData) && <text x={adjustedWidth/2} y={height - 60} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle">{getMissingNote(missingData)}</text>} 
            {<text x={adjustedWidth/2} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 30 : 60)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
            {<text x={adjustedWidth/2} y={height - (!UtilityFunctions.allDataIsSupressed(filteredData) ? 10 : 40)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">†</tspan>{'Scale of the figure may change based on the data selected.'}</text>} 
          </Group>
        </svg>
      </div>
    );
}

export default SexChart;
