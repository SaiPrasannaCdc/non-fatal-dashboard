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
        ethnN = 'NH/PI'; 
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

const getFilteredDataDummy = (data, ethnGroups) => {
  
  var finalData = [];
  var val = 0;

  for (let x=0;x<ethnGroups.length;x++) {
    
   val = 0;

    for(let i=0;i<Object.keys(data.Monthly.US[10]).length;i++) {
      var ethnGrp = Object.keys(data.Monthly.US[10])[i];
      for (let j=0;j<Object.keys(data.Monthly.US[10][ethnGrp]).length;j++) {
            
          if (data.Monthly.US[10][ethnGrp][j].year == '2025')
          {
            if (ethnGrp === ethnGroups[x])
                  val = -9;
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
        ethnN = 'NH/PI'; 
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
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.all_pct : dataRec.all_pct));

                  break;
                case 'benzodiazepine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.benzodiazepine_pct : dataRec.benzodiazepine_pct));

                  break;
                case 'opioids':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.opioids_pct : dataRec.opioids_pct));

                  break;
                case 'fentanyl':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.fentanyl_pct : dataRec.fentanyl_pct));

                  break;
                case 'heroin':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.heroin_pct : dataRec.heroin_pct));

                  break;
                case 'stimulants':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.stimulants_pct: dataRec.stimulants_pct));

                  break;
                case 'cocaine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.cocaine_pct : dataRec.cocaine_pct));
  
                  break;
                case 'methamphetamine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.methamphetamine_pct : dataRec.methamphetamine_pct));

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
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.all_pct : dataRec.all_pct));

                  break;
                case 'benzodiazepine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.benzodiazepine_pct : dataRec.benzodiazepine_pct));

                  break;
                case 'opioids':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.opioids_pct : dataRec.opioids_pct));

                  break;
                case 'fentanyl':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.fentanyl_pct : dataRec.fentanyl_pct));

                  break;
                case 'heroin':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.heroin_pct : dataRec.heroin_pct));

                  break;
                case 'stimulants':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.stimulants_pct : dataRec.stimulants_pct));

                  break;
                case 'cocaine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.cocaine_pct : dataRec.cocaine_pct));
  
                  break;
                case 'methamphetamine':
                    val = Number(UtilityFunctions.convertValue(currentDataType == 'rate' ? dataRec.methamphetamine_pct : dataRec.methamphetamine_pct));

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

const getEthnGroupsDummy = (data) => {

  var ethnData = [];

      for(let i=0;i<Object.keys(data.Monthly.US[10]).length;i++) {
      var ethnGrp = Object.keys(data.Monthly.US[10])[i];
      for (let j=0;j<Object.keys(data.Monthly.US[10][ethnGrp]).length;j++) {
        if (data.Monthly.US[10][ethnGrp][j].year == '2025')
        {
          if (data.Monthly.US[10][ethnGrp][j] && !ethnData.includes(ethnGrp))
            ethnData.push(ethnGrp);
        }
      }
     }
    return ethnData;
};

function EthnicityChart(params) {

  const { data, dataJurisExcl, currentTimeframe, currentDrug, currentYear, currentMonth, stateNames, currentDataType, width, height, drugOptions, accessible, widthReduction, isEthnGrayBox } = params;

  const ethnGroupsReal = getEthnGroups(data, currentTimeframe, currentYear, currentMonth)
  const filteredDataReal = getFilteredData(data, ethnGroupsReal, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType);
  const missingDataReal = getMissingData(data, currentTimeframe, currentDrug, currentYear, currentMonth, currentDataType);

  const ethnGroupsDummy = getEthnGroupsDummy(data);
  const filteredDataDummy = getFilteredDataDummy(data, ethnGroupsDummy);
  const missingDataDummy = '';

  const filteredData = ethnGroupsReal.length == 0 ? filteredDataDummy : filteredDataReal; 
  const missingData = ethnGroupsReal.length == 0 ? missingDataDummy : missingDataReal;
  const dummy = ethnGroupsReal.length == 0;

  const isSmallViewport = width < 550 && !widthReduction;
  const fontSize = 16;
  const margin = { top: 15, bottom: 145, left: isSmallViewport ? 120 : 110, right: isSmallViewport ? 0 : 15 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom - (isSmallViewport ? 10 : 0);
  const adjustedWidth = width - margin.left - margin.right - 75;

  const xKey = 'val';
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

  const getMissingNote = (mdata) => {
    return 'Note: ' + mdata + `% of nonfatal ${drugOptions[currentDrug].titleSingular.toLowerCase()} overdoses are missing race and/or ethnicity data during this time period.` + (currentDataType == 'percent' ? ' Percentages in the figure may not add up to 100% due to missingness.' : '')
  };

  const areJurisExcluded = () => {

    var states = [];
    var juris = dataJurisExcl[currentYear + String(currentMonth).padStart(2, '0') + currentTimeframe]?.replaceAll(' ', '');
    const arr = juris?.split(",");
    if (arr) return true;
    else return false;
  }

  const getJurisExcluded = () => {

    var states = [];
    var juris = dataJurisExcl[currentYear + String(currentMonth).padStart(2, '0') + currentTimeframe]?.replaceAll(' ', '');
    const arr = juris?.split(",");
    if (arr) {
      for (var i=0; i<arr.length; i++) {
        states.push(stateNames[arr[i]]);
      }
      return states.join(', ').replace(/(,)([^,]*)$/, " and$2");;
    }
    else
     return '';
  }

  const getFormattedValue = (val) => {

    if (currentDataType == 'rate')
      return val;
    else
       return val + '%';
  }

  const getBar = (d) => {

    const xPos = isNaN(d[xKey]) ? 15 : xScale(d[xKey]);

    const xTip = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Race/Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: ${Number(d[xKey]).toFixed(1)}${currentDataType == 'rate' ? '' : '%'}</p></div>`;

    return (
      <g key={d[yKey]}>

        {d[xKey] >= 0 && <path d={d[xKey] < 0.9 ? Utils.horizontalBarPathDem_NR(isSmallViewport ? 5 : 35, yScale(d[yKey]), xPos, yScale.bandwidth()) : Utils.horizontalBarPathDem(true, isSmallViewport ? 5 : 35, yScale(d[yKey]), xPos, yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[xKey]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={1} data-tip={xTip} />}
        {Number(d[xKey]) >= 0 && 
        <Text 
          x={((xPos + (isSmallViewport ? (Number(d[xKey]) >= 100 ? 13 : 5) : (Number(d[xKey]) >= 100 ? 60 : 50)) + (currentDataType == 'rate' ? 30 : 40)))} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="#000000"
          fontWeight='normal' 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{Number(d[xKey])?.toFixed(1) + (currentDataType == 'rate' ? '' : '%')}
          </Text>
        }
          {Number(d[xKey])?.toFixed(1) == -3.0 &&
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
        {Number(d[xKey])?.toFixed(1) == -1.0 &&
            <Text 
            x={(isSmallViewport ? 10 : 40)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill={drugOptions[currentDrug].color}
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Race/Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Not Available/Not Reported`}>†
            </Text>
        }
        {Number(d[xKey])?.toFixed(1) == -9.0 &&
            <Text 
            x={(isSmallViewport ? 20 : 50)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill={drugOptions[currentDrug].color}
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Race/Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Not Available`}>—
            </Text>
        }


      </g>
    )
  }

  if (Number(currentYear) < 2023 && !accessible)
  {
    if (UtilityFunctions.isCovidPeriodGrayBox(currentTimeframe, currentYear, currentMonth))
        return UtilityFunctions.getCovidGrayBox(height, width);
    else 
      return UtilityFunctions.getNoDataGrayBoxForEthn(height + (currentDataType == 'percent' ? 80 : 40), width);
  }

  if (Number(currentYear) == 2023 && Number(currentMonth) < 12 && currentTimeframe == 'Annual' && !accessible)
  {
      return UtilityFunctions.getAnnualNoDataGrayBoxForEthn(height + (currentDataType == 'percent' ? 80 : 40), width);
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
          {dummy && !UtilityFunctions.dataIsSupressedEthn(filteredData) &&
          <tr>
            <td>
              <div><span><small><i><sup></sup></i></small></span></div>
            </td>
          </tr>
          }
          {!dummy && !UtilityFunctions.dataIsSupressedEthn(filteredData) &&
          <tr>
            <td>
              <div><span><small><i><sup>*</sup>{getMissingNote(missingData)}</i></small></span></div>
              <div><span><small><i>{'The race/ethnicity figure excludes data from jurisdictions that had >= 15% missing race/ethnicity data during the selected time period, as well as those who do not participate in DOSE-SYS or who do not have data for this time period. ' + (areJurisExcluded() ? 'This figure excludes data from ' : '') + getJurisExcluded() + (areJurisExcluded() ? '.' : '')}</i></small></span></div>
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
                        {(!dummy && !UtilityFunctions.dataIsSupressedEthn(filteredData)) && <div><span><small><i>{getMissingNote(missingData)}</i></small></span></div> }
                        {<br></br>}
                        <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
                        {<br></br>}
                        {(!dummy && !UtilityFunctions.dataIsSupressedEthn(filteredData)) && <div><span><small><i>{'The race/ethnicity figure excludes data from jurisdictions that had >= 15% missing race/ethnicity data during the selected time period, as well as those who do not participate in DOSE-SYS or who do not have data for this time period.  ' + (areJurisExcluded() ? 'This figure excludes data from ' : '') + getJurisExcluded() + (areJurisExcluded() ? '.' : '')}</i></small></span></div>}
                      </td>
                    </tr>
                </table>
        }
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
              fill: '#000066',
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
                tickFormat={value => 
                      getFormattedValue(value)
                } 
                tickLabelProps={(value) => {
                  return {
                    style: {
                      transform: (isSmallViewport && currentDataType == 'percent' ? 'rotate(-60deg)' : ''),
                      transformOrigin: `${xScale(value)}px ${18}px`,
                      textAnchor: 'middle',
                      fontSize: fontSize,
                      fill: '#000066',
                    }
                  }
                }}
              />
            {!isSmallViewport && Object.keys(filteredData).length > 0 && <text x={adjustedWidth/10 + 150} y={yMax+ 70} fill={'#000066'} fontSize={fontSize} textAnchor="middle">{currentDataType == 'rate' ? 'Suspected Nonfatal Overdoses Involving' : 'Percent of suspected Nonfatal Overdoses'} </text>}
            {!isSmallViewport && Object.keys(filteredData).length > 0 && <text x={adjustedWidth/10 + 150} y={yMax+ 90} fill={'#000066'} fontSize={fontSize} textAnchor="middle">{(currentDataType == 'rate' ?  '' : 'Involving ') + drugOptions[currentDrug].titleAll + (currentDataType == 'rate' ?  ' per 10,000 Total ED visits' : '')}</text>}
            {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={10} y={yMax+ 70} fill={'#000066'} fontSize={fontSize * .8} textAnchor="middle">{currentDataType == 'rate' ? 'Suspected Nonfatal Overdoses Involving' : 'Percent of suspected Nonfatal Overdoses'} </text>}
            {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={10} y={yMax+ 90} fill={'#000066'} fontSize={fontSize * .8} textAnchor="middle">{(currentDataType == 'rate' ?  '' : 'Involving ') + drugOptions[currentDrug].titleAll + (currentDataType == 'rate' ?  ' per 10,000 Total ED visits' : '')}</text>}
          </Group>
        </svg>
        {!isEthnGrayBox &&
        <div style={{height: !isSmallViewport ? '300px' : '520px'}}>
            <table>
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i>{getMissingNote(missingData)}</i></small></td></tr>
              }
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>*</sup>{'Data suppressed.'}</i></small></td></tr>
              }
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>†</sup>{'Scale of the figure may change based on the data selected.'}</i></small></td></tr>
              }
              {Object.keys(filteredData).length > 0 &&
                <tr><td><small><i><sup>§</sup>{'The race/ethnicity figure excludes data from jurisdictions that had >= 15% missing race/ethnicity data during the selected time period, as well as those who do not participate in DOSE-SYS or who do not have data for this time period.  ' + (areJurisExcluded() ? 'This figure excludes data from ' : '') + getJurisExcluded() + (areJurisExcluded() ? '.' : '')}</i></small></td></tr>
              }
            </table>
          </div>
        }
      </Group>
      )}
    </>
    )
 
}

export default EthnicityChart