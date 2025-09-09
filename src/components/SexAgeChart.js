import React from 'react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom,AxisLeft } from '@visx/axis';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';
import Utils from '../shared/Utils';

const getFilteredData = (data, ageGroups, currentDrug, currentTimeframe, currentYear, currentMonth) => {
  
  var finalData = [];
  var male_total = 0;
  var female_total = 0;

  for (let x=0;x<ageGroups.length;x++) {
    
    male_total = 0;
    female_total = 0;

    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM == currentYear + currentMonth.padStart(2, '0'))
          {
            if (data[i].Age_Group === ageGroups[x] && data[i].geoid == 'US')
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
    prefinalData['M'] = String((male_total).toFixed(1));
    prefinalData['F'] = String((female_total).toFixed(1));

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
        if (data[i].geoid == 'US')
        {
          switch (currentDrug) {
            case 'all':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_drug_OD_pct));
              }
              break;
            case 'benzodiazepine':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_pct));
              }
              break;
            case 'opioids':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_pct));
              }
              break;
            case 'fentanyl':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_pct));
              }
              break;
            case 'heroin':
               if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_pct));
              }
              break;
            case 'stimulants':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_pct));
              }
              break;
            case 'cocaine':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
                missing_rate = Number(missing_rate) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
                missing_pct = Number(missing_pct) + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_pct));
              }
              break;
            case 'methamphetamine':
              if (data[i].Sex == 'Missing' && data[i].Age_Group == 'Missing') {
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

  let maleVals = [];
  let femaleVals = [];
  for (let x=0;x<Object.keys(fdata).length;x++) {
      maleVals.push(Number(fdata[x].M));
      femaleVals.push(Number(fdata[x].F))
  }

  if (Math.max(...maleVals) < Math.max(...femaleVals))
    return Math.max(...femaleVals);
  else
    return Math.max(...maleVals);
}


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

function SexAgeChart(params) {

  const { data, currentTimeframe, currentDrug, currentYear, currentMonth, currentDataType, width, height, drugOptions, accessible, widthReduction } = params;

  const ageGroups = getAgeGroups(data, currentTimeframe, currentYear, currentMonth)
  const filteredData = getFilteredData(data, ageGroups, currentDrug, currentTimeframe, currentYear, currentMonth);
  const missingData = getMissingData(data, currentDrug, currentYear, currentMonth);

  const isSmallViewport = width < 550 && !widthReduction;
  const fontSize = 16;
  const margin = { top: 50, bottom: 145, left: 50, right: 15 };

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = xMax / 2;
  const yMax = height - margin.top - margin.bottom - (isSmallViewport ? 10 : 0);

  const x1Key = 'F';
  const x2Key = 'M';
  const yKey = 'ageN';

  let overallMax = getMaxValue(filteredData) * 1.1;
  if(overallMax === 0) overallMax = 1;

  const x1Scale = scaleLinear({
    range: [xMaxHalf, 50],
    domain: [0, overallMax]
  });

  const x2Scale = scaleLinear({
    range: [xMaxHalf, xMax-50],
    domain: [0, overallMax]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
  });

  const getMissingNote = (mdata) => {
    return 'Note: ' + mdata['percent'] + '% of data are missing.'
  };

  const getBar = (d) => {

    const x1Pos = isNaN(d[x1Key]) ? xMaxHalf - 15 : x1Scale(d[x1Key]);
    const x2Pos = isNaN(d[x2Key]) ? xMaxHalf + 15 : x2Scale(d[x2Key]);

    const x1Tip = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Female</p><p><strong>Overdoses</strong>: ${Number(d[x1Key]).toFixed(1)}</p></div>`;
    const x2Tip = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Male</p><p><strong>Overdoses</strong>: ${Number(d[x2Key]).toFixed(1)}</p></div>`;
    const x1TipDS = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Female</p><p><strong>Overdoses</strong>: Data Suppressed</p></div>`;
    const x2TipDS = `<div class="tooltipTableLC"<p><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><strong>Age</strong>: ${d[yKey]}</p><p><strong>Sex</strong>: Male</p><p><strong>Overdoses</strong>: Data Suppressed</p></div>`;

    const alignEndFirst = x1Pos > (xMaxHalf - 50);
    const alignEndSecond = x2Pos - xMaxHalf > 55;

    return (
      <g key={d[yKey]}>

        {d[x1Key] > 0 && <path d={Utils.horizontalBarPath(false, x1Pos, yScale(d[yKey]), (xMaxHalf - x1Pos), yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[x1Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} data-tip={x1Tip} />}
        {d[x1Key] == 0 && <Text x={x1Pos} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 8} textAnchor="middle" alignmentBaseline="end" fill={'#000000'} fontSize={isSmallViewport ? fontSize : fontSize} data-tip={d[x1Key] == 0 ? x1TipDS : x1Tip}>{d[x1Key] == 0 ? '*' : '†'}</Text>}
        <Text 
          x={(x1Pos) - (d[x2Key] > 99 ? 48 : 40)} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'start'} 
          fill="#000000"
          fontWeight='normal'
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{Number(d[x1Key])?.toFixed(1)}</Text>


        {d[x1Key] > 0 && <path d={Utils.horizontalBarPath(true, xMaxHalf, yScale(d[yKey]), (x2Pos - xMaxHalf), yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[x2Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={0.4} data-tip={x2Tip} />}
        {d[x1Key] == 0 && <Text x={x2Pos} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 8} textAnchor="middle" alignmentBaseline="end" fill={'#000000'} fontSize={isSmallViewport ? fontSize : fontSize} data-tip={d[x2Key] == 0 ? x2TipDS : x2Tip}>{d[x2Key] == 0  ? '*' : '†'}</Text>}
        <Text 
          x={(x2Pos) + (d[x2Key] > 99 ? 48 : 40)} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="#000000"
          fontWeight='normal' 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{Number(d[x2Key])?.toFixed(1)}</Text>


      </g>
    )
  }

  return (
    <>
    {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateSexAgeChartData(filteredData)}
          labelOverrides={{
            'rate': !isSmallViewport ? 'Rate of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits' : 'Rate',
            'Age Group': !isSmallViewport ? 'By Age (In years) and Sex' : 'By Age and Sex',
            'Female': !isSmallViewport ? 'Female' : 'Female',
            'Male': !isSmallViewport ? 'Male' : 'Male',
            '0–14': '<15'
          }}
          xAxisKey={'Age Group'}
          transforms={{
            rate: num => UtilityFunctions.toFixed(num)
          }}
          height={390}
          width={width}
          isSmallViewport={isSmallViewport}
          colSpan={!isSmallViewport ? 2 : null}
          drugName={drugOptions[currentDrug].titleAll}
        />
        {!isSmallViewport && <table>
          {(currentDataType == 'rate' && !UtilityFunctions.allDataIsSupressedSA(filteredData)) &&
          <tr>
            <td>
              <div><span><small><i><sup>*</sup>{getMissingNote(missingData)}</i></small></span></div>
            </td>
          </tr>
          }
        </table>
        }
        {isSmallViewport && <table>
          <tr>
              <td>
                <div><span><small><sup>‡</sup>{'Rate of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits.'}</small></span></div>
              </td>
            </tr>
            <br></br>
                    <tr>
                      <td>
                        <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
                        {!UtilityFunctions.allDataIsSupressedSA(filteredData) && <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div> }
                        <span></span>
                      </td>
                    </tr>
                </table>
        }
        </>        
      ) : (
      <svg style={{ height }}>
        <Group top={margin.top} left={margin.left}>
          <Text x={x1Scale(0) - 15} y={0} fill={'#000066'} textAnchor="end">Female</Text>
          <Text x={x2Scale(0) + 15} y={0} fill={'#000066'} >Male</Text>
          <Group>
            {filteredData.map((d) => getBar(d, false))}
          </Group>
          <AxisLeft
          scale={yScale}
          tickLabelProps={() => ({
            fontSize: 'medium',
            fill: '#000066',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
          left={!isSmallViewport ? 50 : 10}
          hideTicks
          hideAxisLine
        />
          {!isSmallViewport && <text x={xMax/2} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="middle">Suspected Nonfatal Overdoses Involving </text>}
          {!isSmallViewport && <text x={xMax/2} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="middle">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {!isSmallViewport && (currentDataType == 'rate' && !UtilityFunctions.allDataIsSupressedSA(filteredData)) && <text x={xMax/2} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle">{getMissingNote(missingData)}</text>}
          {!isSmallViewport && <text x={xMax/2} y={yMax+ (!UtilityFunctions.allDataIsSupressedSA(filteredData) ? 110 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>}
          {!isSmallViewport && <text x={xMax/2} y={yMax+ (!UtilityFunctions.allDataIsSupressedSA(filteredData) ? 130 : 100)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">†</tspan>{'Scale of the figure may change based on the data selected.'}</text>}

          {isSmallViewport && <text x={-50} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="start">Suspected Nonfatal Overdoses Involving </text>}
          {isSmallViewport && <text x={-50} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="start">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {isSmallViewport && (currentDataType == 'rate' && !UtilityFunctions.allDataIsSupressedSA(filteredData)) && <text x={-50} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor="start">{getMissingNote(missingData)}</text>}
          {isSmallViewport && <text x={-50} y={yMax + (!UtilityFunctions.allDataIsSupressedSA(filteredData) ? 110 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
          {isSmallViewport && <text x={-50} y={yMax + (!UtilityFunctions.allDataIsSupressedSA(filteredData) ? 130 : 100)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="8">†</tspan>{'Scale of the figure may change based on the data'}</text>} 
          {isSmallViewport && <text x={-50} y={yMax + (!UtilityFunctions.allDataIsSupressedSA(filteredData) ? 150 : 120)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}>{'selected.'}</text>}
        </Group>
      </svg>
      )}
    </>
  )
}

export default SexAgeChart