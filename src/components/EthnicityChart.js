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
  const margin = { top: 50, bottom: 145, left: isSmallViewport ? 200 : 300, right: isSmallViewport ? 0 : 15 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom - (isSmallViewport ? 10 : 0);
  const adjustedWidth = width - margin.left - margin.right;

  const xKey = 'val';
  const yKey = 'ethnN';

  let overallMax = getMaxValue(filteredData) * 1.5;
  if(overallMax === 0) overallMax = 1;

  const xScale = scaleLinear({
    range: [0, xMax],
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

    const xPos = isNaN(d[xKey]) ? 15 : xScale(d[xKey] * (width <= 430 ? 0.5 : 0.6));

    const xTip = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: ${Number(d[xKey]).toFixed(1)}${currentDataType == 'rate' ? '' : '%'}</p></div>`;

    return (
      <g key={d[yKey]}>

        {d[xKey] > 0 && <path d={Utils.horizontalBarPath(true, isSmallViewport ? 15 : 50, yScale(d[yKey]), xPos, yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[xKey]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={1} data-tip={xTip} />}
        {Number(d[xKey]) > 0 && 
        <Text 
          x={((xPos + (isSmallViewport ? 10 : 55) + (currentDataType == 'rate' ? 35 : 45)))} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="#000000"
          fontWeight='normal' 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{Number(d[xKey])?.toFixed(1) + (currentDataType == 'rate' ? '' : '%')}
          </Text>
        }
          {Number(d[xKey])?.toFixed(1) == -3.0 &&
            <Text 
            x={(isSmallViewport ? 20 : 55)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill={drugOptions[currentDrug].color}
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Suppressed`}>*
            </Text>
        }
        {Number(d[xKey])?.toFixed(1) == -1.0 &&
            <Text 
            x={(isSmallViewport ? 20 : 55)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill={drugOptions[currentDrug].color}
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
          data={AccessibilityFunctions.generateEthnChartData(filteredData)}
          labelOverrides={{
            'val': !isSmallViewport ? (currentDataType == 'rate' ? 'Rate' : 'Percent') + ' of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits' : (currentDataType == 'rate' ? 'Rate' : 'Percent'),
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
        {!isSmallViewport && Object.keys(filteredData).length > 0 && <table>
          {!UtilityFunctions.dataIsSupressedEthn(filteredData) &&
          <tr>
            <td>
              <div><span><small><i><sup>*</sup>{getMissingNote(missingData)}</i></small></span></div>
            </td>
          </tr>
          }
        </table>
        }
        {isSmallViewport && Object.keys(filteredData).length > 0 && <table>
          <tr>
              <td>
                <div><span><small><sup>‡</sup>{(currentDataType == 'rate' ? 'Rate' : 'Percent') + ' of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits.'}</small></span></div>
              </td>
            </tr>
            <br></br>
                    <tr>
                      <td>
                        <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
                        {!UtilityFunctions.dataIsSupressedEthn(filteredData) && <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div> }
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
            angle: (isSmallViewport ? 45 : 0),
          })}
          left={!isSmallViewport ? 50 : 15}
          hideTicks
          hideAxisLine
        />
          {!isSmallViewport && Object.keys(filteredData).length > 0 && <text x={adjustedWidth/10} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="middle">Suspected Nonfatal Overdoses Involving </text>}
          {!isSmallViewport && Object.keys(filteredData).length > 0 && <text x={adjustedWidth/10} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="middle">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {!isSmallViewport && Object.keys(filteredData).length > 0 && (!UtilityFunctions.dataIsSupressedEthn(missingData)) && <text x={adjustedWidth/10} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle">{getMissingNote(missingData)}</text>}
          {!isSmallViewport && Object.keys(filteredData).length > 0 && <text x={adjustedWidth/10} y={yMax+ (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 110 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>}
          {!isSmallViewport && Object.keys(filteredData).length > 0 && <text x={adjustedWidth/10} y={yMax+ (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 130 : 100)} fontSize={fontSize - 4} fill={'#000000'} textAnchor="middle"><tspan baselineShift="super" fontSize="10">†</tspan>{'Scale of the figure may change based on the data selected.'}</text>}

          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="start">Suspected Nonfatal Overdoses Involving </text>}
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="start">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {isSmallViewport && Object.keys(filteredData).length > 0 && (!UtilityFunctions.dataIsSupressedEthn(missingData)) && <text x={-200} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor="start">{getMissingNote(missingData)}</text>}
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax + (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 110 : 80)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax + (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 130 : 100)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="8">†</tspan>{'Scale of the figure may change based on the data'}</text>} 
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax + (!UtilityFunctions.dataIsSupressedEthn(missingData) ? 150 : 120)} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}>{'selected.'}</text>}
        </Group>
      </svg>
      )}
    </>
  )
}

export default EthnicityChart