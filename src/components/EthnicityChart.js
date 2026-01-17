import React from 'react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom,AxisLeft } from '@visx/axis';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';
import Utils from '../shared/Utils';

const getFilteredData = (data, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType) => {
  
  var finalData = [];
  var val = 0;

  for (let x=0;x<ethnGroups.length;x++) {
    
   val = 0;

   if (currentTimeframe == 'Annual' ) {
   for(let i=0;i<Object.keys(data.Annual.US[currentMonth]).length;i++) {
      var ethnGrp = Object.keys(data.Annual.US[currentMonth])[i];
      for (let j=0;j<Object.keys(data.Annual.US[currentMonth][ethnGrp]).length;j++) {
            
          if (data.Annual.US[currentMonth][ethnGrp][j].year == currentYear)
          {
            var dataRec = data.Annual.US[currentMonth][ethnGrp][j];
            if (ethnGrp === ethnGroups[x])
            {
              switch (currentDrug) {
                case 'all':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.all : dataRec.all_pct));

                  break;
                case 'benzodiazepine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.benzodiazepine : dataRec.benzodiazepine_pct));

                  break;
                case 'opioids':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.opioids : dataRec.opioids_pct));

                  break;
                case 'fentanyl':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.fentanyl : dataRec.fentanyl_pct));

                  break;
                case 'heroin':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.heroin : dataRec.heroin_pct));

                  break;
                case 'stimulants':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.stimulants: dataRec.stimulants_pct));

                  break;
                case 'cocaine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.cocaine : dataRec.cocaine_pct));
  
                  break;
                case 'methamphetamine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.methamphetamine : dataRec.methamphetamine_pct));

                  break;
          }
        }
      }
    }
    }
  }
  else
  {
    for(let i=0;i<Object.keys(data.Monthly.US[currentMonth]).length;i++) {
      var ethnGrp = Object.keys(data.Monthly.US[currentMonth])[i];
      for (let j=0;j<Object.keys(data.Monthly.US[currentMonth][ethnGrp]).length;j++) {
            
          if (data.Monthly.US[currentMonth][ethnGrp][j].year == currentYear)
          {
            var dataRec = data.Monthly.US[currentMonth][ethnGrp][j];
            if (ethnGrp === ethnGroups[x])
            {
              switch (currentDrug) {
                case 'all':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.all : dataRec.all_pct));

                  break;
                case 'benzodiazepine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.benzodiazepine : dataRec.benzodiazepine_pct));

                  break;
                case 'opioids':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.opioids : dataRec.opioids_pct));

                  break;
                case 'fentanyl':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.fentanyl : dataRec.fentanyl_pct));

                  break;
                case 'heroin':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.heroin : dataRec.heroin_pct));

                  break;
                case 'stimulants':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.stimulants : dataRec.stimulants_pct));

                  break;
                case 'cocaine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.cocaine : dataRec.cocaine_pct));
  
                  break;
                case 'methamphetamine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.methamphetamine : dataRec.methamphetamine_pct));

                  break;
          }
        }
      }
    }
    }
  }
    
    var prefinalData = {};
    var ethnN = ''
    var sortOrder = 0;

    switch (ethnGroups[x]) {
      case 'AIAN, NH':
        ethnN = 'AI/AN';
        sortOrder = 1; 
        break;
      case 'Asian, NH':
        ethnN = 'Asian'; 
        sortOrder = 2;
        break;
      case 'Black, NH':
        ethnN = 'Black'; 
        sortOrder = 3; 
        break;
      case 'NHOPI, NH':
        ethnN = 'Native Hawaiian or other Pacific Islander'; 
        sortOrder = 4; 
        break;
      case 'Multiple/Other, NH':
        ethnN = 'Other or Multiple Race'; 
        sortOrder = 5; 
        break;
      case 'White, NH':
        ethnN = 'White'; 
        sortOrder = 6; 
        break;
      case 'Hispanic':
        ethnN = 'Hispanic'; 
        sortOrder = 7; 
        break;
    }

    prefinalData['ethn'] = ethnGroups[x];
    prefinalData['ethnN'] = ethnN;
    prefinalData['sortOrder'] = sortOrder;
    prefinalData['val'] = String((val).toFixed(1));

    if (ethnGroups[x] != 'Total' && ethnGroups[x] != 'Missing')
      finalData.push(prefinalData);
  }

  var sortedFinalData = sortByKey(finalData, 'sortOrder');

  return sortedFinalData;
};

const getMissingData = (data, currentTimeframe, currentDrug, currentYear, currentMonth, currentDataType) => {
  
  var val = 0;

   if (currentTimeframe == 'Annual' ) {
   for(let i=0;i<Object.keys(data.Annual.US[currentMonth]).length;i++) {
      var ethnGrp = Object.keys(data.Annual.US[currentMonth])[i];
      for (let j=0;j<Object.keys(data.Annual.US[currentMonth][ethnGrp]).length;j++) {
            
          if (data.Annual.US[currentMonth][ethnGrp][j].year == currentYear)
          {
            var dataRec = data.Annual.US[currentMonth][ethnGrp][j];
            if (ethnGrp === 'Missing')
            {
              switch (currentDrug) {
                case 'all':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.all : dataRec.all_pct));

                  break;
                case 'benzodiazepine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.benzodiazepine : dataRec.benzodiazepine_pct));

                  break;
                case 'opioids':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.opioids : dataRec.opioids_pct));

                  break;
                case 'fentanyl':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.fentanyl : dataRec.fentanyl_pct));

                  break;
                case 'heroin':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.heroin : dataRec.heroin_pct));

                  break;
                case 'stimulants':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.stimulants: dataRec.stimulants_pct));

                  break;
                case 'cocaine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.cocaine : dataRec.cocaine_pct));
  
                  break;
                case 'methamphetamine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.methamphetamine : dataRec.methamphetamine_pct));

                  break;
          }
        }
      }
    }
    }
  }
  else
  {
    for(let i=0;i<Object.keys(data.Monthly.US[currentMonth]).length;i++) {
      var ethnGrp = Object.keys(data.Monthly.US[currentMonth])[i];
      for (let j=0;j<Object.keys(data.Monthly.US[currentMonth][ethnGrp]).length;j++) {
            
          if (data.Monthly.US[currentMonth][ethnGrp][j].year == currentYear)
          {
            var dataRec = data.Monthly.US[currentMonth][ethnGrp][j];
            if (ethnGrp === 'Missing')
            {
              switch (currentDrug) {
                case 'all':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.all : dataRec.all_pct));

                  break;
                case 'benzodiazepine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.benzodiazepine : dataRec.benzodiazepine_pct));

                  break;
                case 'opioids':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.opioids : dataRec.opioids_pct));

                  break;
                case 'fentanyl':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.fentanyl : dataRec.fentanyl_pct));

                  break;
                case 'heroin':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.heroin : dataRec.heroin_pct));

                  break;
                case 'stimulants':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.stimulants : dataRec.stimulants_pct));

                  break;
                case 'cocaine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.cocaine : dataRec.cocaine_pct));
  
                  break;
                case 'methamphetamine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.methamphetamine : dataRec.methamphetamine_pct));

                  break;
          }
        }
      }
    }
    }
  }

  return val;
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
      vals.push(Number(fdata[x].val));
  }

  return Math.max(...vals);
}


const getEthnGroups = (data, currentTimeLine, currentYear, currentMonth) => {

  var ethnData = [];

  if (currentTimeLine == 'Annual') { 

    for(let i=0;i<Object.keys(data.Annual.US[currentMonth]).length;i++) {
      var ethnGrp = Object.keys(data.Annual.US[currentMonth])[i];
      for (let j=0;j<Object.keys(data.Annual.US[currentMonth][ethnGrp]).length;j++) {
        if (data.Annual.US[currentMonth][ethnGrp][j].year == currentYear)
        {
          if (data.Annual.US[currentMonth][ethnGrp][j] && !ethnData.includes(ethnGrp))
            ethnData.push(ethnGrp);
        }
      }
     }

    return ethnData;
  }
  else 
  {
    for(let i=0;i<Object.keys(data.Monthly.US[currentMonth]).length;i++) {
      var ethnGrp = Object.keys(data.Monthly.US[currentMonth])[i];
      for (let j=0;j<Object.keys(data.Monthly.US[currentMonth][ethnGrp]).length;j++) {
        if (data.Monthly.US[currentMonth][ethnGrp][j].year == currentYear)
        {
          if (data.Monthly.US[currentMonth][ethnGrp][j] && !ethnData.includes(ethnGrp))
            ethnData.push(ethnGrp);
        }
      }
     }

    return ethnData;
  }
};

function EthnicityChart(params) {

  const { data, currentTimeframe, currentDrug, currentYear, currentMonth, currentDataType, width, height, drugOptions, accessible, widthReduction } = params;

  const ethnGroups = getEthnGroups(data, currentTimeframe, currentYear, currentMonth)
  const filteredData = getFilteredData(data, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType);
  const missingData = getMissingData(data, currentTimeframe, currentDrug, currentYear, currentMonth, currentDataType);

  const isSmallViewport = width < 550 && !widthReduction;
  const fontSize = 16;
  const margin = { top: 50, bottom: 145, left: 260, right: 15 };

  const xMax = width - margin.left - margin.right;
  const xMaxHalf = 260;
  const yMax = height - margin.top - margin.bottom - (isSmallViewport ? 10 : 0);
  const adjustedWidth = width - margin.left - margin.right;

  const x2Key = 'val';
  const yKey = 'ethnN';

  let overallMax = getMaxValue(filteredData) * 1.1;
  if(overallMax === 0) overallMax = 1;

  const x2Scale = scaleLinear({
    range: [xMaxHalf, xMax],
    domain: [0, overallMax]
  });

  const yScale = scaleBand({
    range: [0, yMax],
    domain: filteredData.map(d => d[yKey]),
    padding: .2,
  });

  const getMissingNote = (mdata) => {
    return 'Note: ' + mdata + '% of data are missing.'
  };

  const getBar = (d) => {

    const x2Pos = isNaN(d[x2Key]) ? xMaxHalf + 15 : x2Scale(d[x2Key]);

    const x2Tip = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: ${Number(d[x2Key]).toFixed(1)}${currentDataType == 'rate' ? '' : '%'}</p></div>`;
    const x2TipDS = `<div class="tooltipTableLC"<p><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Suppressed</p></div>`;

    return (
      <g key={d[yKey]}>

        {d[x2Key] > 0 && <path d={Utils.horizontalBarPath(true,(xMaxHalf/2 - 70), yScale(d[yKey]), (x2Pos - xMaxHalf), yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[x2Key]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={1} data-tip={x2Tip} />}
        {d[x2Key] == 0 && <Text x={x2Pos - xMaxHalf/2 - 70} y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 8} textAnchor="middle" alignmentBaseline="end" fill={'#000000'} fontSize={isSmallViewport ? fontSize : fontSize} data-tip={d[x2Key] == 0 ? x2TipDS : x2Tip}>{d[x2Key] == 0  ? '*' : '†'}</Text>}
        {Number(d[x2Key]) > 0 && <Text 
          x={(x2Pos - xMaxHalf/2 - 70) + (d[x2Key] > 99 ? 53 : (d[x2Key] >= 10 ? 50 : 45))} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="#000000"
          fontWeight='normal' 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{Number(d[x2Key])?.toFixed(1) + (currentDataType == 'rate' ? '' : '%')}</Text>
        }
          {Number(d[x2Key])?.toFixed(1) == -3.0 &&
            <Text 
            x={(xMaxHalf/2 - 65)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill="#000000"
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Suppressed`}>*
            </Text>
        }
        {Number(d[x2Key])?.toFixed(1) == -1.0 &&
            <Text 
            x={(xMaxHalf/2 - 65)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill="#000000"
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Not Available/Not Reported`}>†
            </Text>
        }


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
          {!UtilityFunctions.allDataIsSupressedSA(filteredData) &&
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
          {!isSmallViewport && <text x={adjustedWidth/2/2} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="middle">Suspected Nonfatal Overdoses Involving </text>}
          {!isSmallViewport && <text x={adjustedWidth/2/2} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="middle">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {!isSmallViewport && (!UtilityFunctions.dataIsSupressedEthn(missingData)) && <text x={adjustedWidth/2/2} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle">{getMissingNote(missingData)}</text>}
          {!isSmallViewport && <text x={adjustedWidth/2/2} y={yMax+ (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 110 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>}
          {!isSmallViewport && <text x={adjustedWidth/2/2} y={yMax+ (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 130 : 100)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">†</tspan>{'Scale of the figure may change based on the data selected.'}</text>}

          {isSmallViewport && <text x={-50} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="start">Suspected Nonfatal Overdoses Involving </text>}
          {isSmallViewport && <text x={-50} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="start">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {isSmallViewport && (!UtilityFunctions.dataIsSupressedEthn(missingData)) && <text x={-50} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor="start">{getMissingNote(missingData)}</text>}
          {isSmallViewport && <text x={-50} y={yMax + (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 110 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
          {isSmallViewport && <text x={-50} y={yMax + (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 130 : 100)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="8">†</tspan>{'Scale of the figure may change based on the data'}</text>} 
          {isSmallViewport && <text x={-50} y={yMax + (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 150 : 120)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}>{'selected.'}</text>}
        </Group>
      </svg>
      )}
    </>
  )
}

export default EthnicityChart