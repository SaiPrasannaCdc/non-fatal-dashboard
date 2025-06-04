import React, { useState, useEffect } from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import Utils from '../shared/Utils';
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

const getFilteredData = (data, ageGroups, currentDrug, currentTimeframe, currentYear, currentMonth) => {
  
  var finalData = [];
  var drug_total = 0;

  debugger;

  for (let x=0;x<ageGroups.length;x++) {

    drug_total = 0;
    
    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, '0'))
          {
            if (data[i].Age_Group === ageGroups[x] && data[i].Sex == 'Total' && data[i].geoid == 'US')
            {
              switch (currentDrug) {
                case 'all':
                  drug_total = Number(drug_total) + Number(data[i].total_drug_OD_n == 9999 ? 0 : data[i].total_drug_OD_n);
                  break;
                case 'benzodiazepine':
                   drug_total = Number(drug_total) + Number(data[i].total_Benzo_OD_n == 9999 ? 0 : data[i].total_Benzo_OD_n);
                   break;
                case 'opioids':
                  drug_total = Number(drug_total) + Number(data[i].total_opioid_OD_n == 9999 ? 0 : data[i].total_opioid_OD_n);
                  break;
                case 'fentanyl':
                  drug_total = Number(drug_total) + Number(data[i].total_Fentanyl_OD_n == 9999 ? 0 : data[i].total_Fentanyl_OD_n);
                  break;
                case 'heroin':
                  drug_total = Number(drug_total) + Number(data[i].total_heroin_OD_n == 9999 ? 0 : data[i].total_heroin_OD_n);
                  break;
                case 'stimulants':
                  drug_total = Number(drug_total) + Number(data[i].total_stimulant_OD_n == 9999 ? 0 : data[i].total_stimulant_OD_n);
                  break;
                case 'cocaine':
                  drug_total = Number(drug_total) + Number(data[i].total_Cocaine_OD_n == 9999 ? 0 : data[i].total_Cocaine_OD_n);
                  break;
                case 'methamphetamine':
                  drug_total = Number(drug_total) + Number(data[i].total_Methamphetamine_OD_n == 9999 ? 0 : data[i].total_Methamphetamine_OD_n);
                  break;
          }
        }
      }
    }
    
    var prefinalData = {};
    var ageN = ''
    var sortOrder = 0;

    switch (ageGroups[x]) {
      case '< 15':
        ageN = '<15';
        sortOrder = 1; 
        break;
      case '15 to 24':
        ageN = '15-24'; 
        sortOrder = 2;
        break;
      case '25 to 34':
        ageN = '25-34'; 
        sortOrder = 3; 
        break;
      case '35 to 44':
        ageN = '35-44'; 
        sortOrder = 4; 
        break;
      case '45 to 54':
        ageN = '45-54'; 
        sortOrder = 5; 
        break;
      case '55 to 64':
        ageN = '55-64'; 
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

  const viewportCutoff = 600;

  const { data, year, width, height, header, el, currentDrug, drugOptions, currentTimeLine, currentYear, currentMonth } = params;
  const [ animated, setAnimated ] = useState(false);

 /*  if (data)
    debugger; */

  const ageGroups = getAgeGroups(data, currentTimeLine, currentYear, currentMonth)
  const filteredData = getFilteredData(data, ageGroups, currentDrug, currentTimeLine, currentYear, currentMonth);

  const margin = {top: 10, bottom: (header ? 10 : 50), left: (header ? 0 : 90), right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 100;
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
                <text x={adjustedHeight / -2} y={-65} textAnchor="middle" fill={'#000066'} transform="rotate(-90)">Nonfatal Overdoses per 10,000 ED visits</text>

                {filteredData.map(d => (
                  <Group key={`group-${d.ageN}`} className="animate-bars">
                    {d.value >= countCutoff && (
                      <path
                        key={`cause-bar-${d.ageN}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        d={Utils.verticalBarPath(xScale(d.ageN), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), xScale.bandwidth() * .1)}
                        fill={drugOptions[currentDrug].color}
                        data-tip={`<strong>${drugOptions[currentDrug].titleAll}</strong><br/>Overdoses: ${Number(d.value).toLocaleString()}`}
                      ></path>
                    )}
                    {d.value < countCutoff && (
                      <text
                        x={xScale(d.ageN) + halfBandwidth}
                        y={adjustedHeight + 15}
                        fill="white"
                        textAnchor="middle"
                        cursor="default"
                        data-tip="*Data suppressed"
                      >*</text>
                    )}
                    {d.value >= countCutoff && (
                        <text
                          x={xScale(d.ageN) + halfBandwidth}
                          y={yScale(d.value) + 25}
                          fill="white"
                          textAnchor="middle"
                          cursor="default"
                          data-tip="*Data suppressed"
                        >{d.value}</text>
                      )}
                  </Group>
                ))}

                <AxisBottom
                  top={adjustedHeight}
                  scale={xScale}
                  tickStroke="transparent"
                  tickLabelProps={() => ({
                    fill: '#000066',
                    fontSize: 'medium',
                    textAnchor: 'middle',
                    transform: 'translate(0, 10)'
                  })}
                />
              </>
            )

            {<text x={adjustedWidth/2} y={height - 70} fontSize={fontSize} fontWeight={'bold'} fill={'#000066'} textAnchor="middle">{'Age (In years)'}</text>}
            {<text x={adjustedWidth/2} y={height - 50} fontSize={fontSize - 4} fill={'#000066'} textAnchor="middle">{'Note: X (XX%) of data are mssing.'}</text>} 
            {<text x={adjustedWidth/2} y={height - 30} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">†</tspan>{'Scale of the chart may change based on the data selected.'}</text>} 

          </Group>
        </svg>
      </div>
    );
}

export default AgeChart;
