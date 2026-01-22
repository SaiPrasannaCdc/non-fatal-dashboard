import React from 'react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom,AxisLeft } from '@visx/axis';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';
import Utils from '../shared/Utils';


const getFilteredData = (data, currentDataSource, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType, width) => {
  
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

    prefinalData['ethn'] = ethnGroups[x];
    prefinalData['ethnN'] = ethnN;
    prefinalData['sortOrder'] = sortOrder;
    prefinalData['val'] = String(val);

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
    if (!isNaN(fdata[x].val) && Number(fdata[x].val) > 0)
      vals.push(Number(fdata[x].val));
  }

  return Math.max(...vals);
}


const getEthnGroups = (data, currentDataSource, currentYear, currentMonth) => {

  var ethnData = [];

    for(let i=0;i<Object.keys(data.ethnicityData[currentYear][currentDataSource]).length;i++) {
      var ethnGrp = Object.keys(data.ethnicityData[currentYear][currentDataSource])[i];
      ethnData.push(ethnGrp);
     }

    return ethnData;

};

function EthnicityChart(params) {

  const { data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, currentDataType, width, drugOptions, accessible } = params;

  const ethnGroups = getEthnGroups(data, currentDataSource, currentYear, currentMonth)
  const filteredData = getFilteredData(data, currentDataSource, ethnGroups, currentDrug, currentTimeframe, currentYear, currentMonth, currentDataType);

  const isSmallViewport = width < 550;
  const height = 550;
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

  const getBar = (d) => {

    const xPos = isNaN(d[xKey]) ? 15 : xScale(d[xKey]);

    const xTip = `<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: ${Number(d[xKey]).toFixed(1)}</p></div>`;

    return (
      <g key={d[yKey]}>

        {!isNaN(d[xKey]) && d[xKey] >= 0 && <path d={Utils.horizontalBarPath(true, isSmallViewport ? 15 : 50, yScale(d[yKey]), xPos, yScale.bandwidth(), 3, yScale.bandwidth() * .1)} fill={isNaN(d[xKey]) ? 'transparent' : drugOptions[currentDrug].color} stroke={drugOptions[currentDrug].color} opacity={1} data-tip={xTip} />}
        {!isNaN(d[xKey]) && Number(d[xKey]) >= 0 && 
        <Text 
          x={((xPos + (isSmallViewport ? 10 : 55) + (currentDataType == 'rate' ? 35 : 45)))} 
          y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5} 
          textAnchor={'end'} 
          fill="#000000"
          fontWeight='normal' 
          fontSize={isSmallViewport ? fontSize * .8 : fontSize}>{currentDataType == 'rate' ? Number(d[xKey])?.toFixed(1) : Number(d[xKey])?.toFixed(0)}
          </Text>
        }
        {/* {Number(d[xKey])?.toFixed(1) == -3.0 &&
            <Text 
            x={(isSmallViewport ? 20 : 55)}
            y={yScale(d[yKey]) + (yScale.bandwidth() / 2) + 5}
            textAnchor={'end'} 
            fill={drugOptions[currentDrug].color}
            fontWeight='normal' 
            fontSize={isSmallViewport ? fontSize * .8 : fontSize}
            data-tip={`<div class="tooltipTableLC"><p><strong>${drugOptions[currentDrug].titleAll}</strong></p><p><strong>Ethnicity</strong>: ${d[yKey]}</p><p><strong>Overdoses</strong>: Data Suppressed`}>*
            </Text>
        } */}
        {(d[xKey] == 'Data not available') &&
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
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax+ 30} fill={'#000066'} fontSize={13} textAnchor="start">Suspected Nonfatal Overdoses Involving </text>}
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax+ 50} fill={'#000066'} fontSize={13} textAnchor="start">{drugOptions[currentDrug].titleAll} per 10,000 Total ED visits</text>}
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax + 80} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="10">*</tspan>{'Data suppressed.'}</text>} 
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax + 100} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}><tspan baselineShift="super" fontSize="8">†</tspan>{'Scale of the figure may change based on the data'}</text>} 
          {isSmallViewport && Object.keys(filteredData).length > 0 && <text x={-200} y={yMax + 120} fontSize={fontSize - 4} fill={'#000000'} textAnchor={"start"}>{'selected.'}</text>}
        </Group>
      </svg>
      )}
    </>
  )
}

export default EthnicityChart