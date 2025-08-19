import React, {Fragment, useState, useEffect} from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { Circle } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { UtilityFunctions } from '../utility'
import QuickStat from './quickStat';
import ReactDOMServer from 'react-dom/server';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

export const colorScale = {
  'all': '#325D7D',
  'opioids': '#000C77',
  'heroin': '#0C6F96',
  'stimulants': '#411B6D',
  'benzodiazepine': '#B83A5E',
  'fentanyl': '#294891',
  'cocaine': '#671AAA',
  'methamphetamine': '#A378E8'
};

const defaultValueIfEmpty = (v, df) => {
  if (v && v != '') return v;

  else return df;
}

const lessMonths = (arr) => {
  let output = [];
  for (let i = 0; i < arr.length; i += 3) {
    output.push(arr[i]);
  }
  return output;
};

const getChangePrecValues = (filteredData, selectedDrugs, xValues, xKey) => {

  var changePrecValues = [];
    Object.keys(filteredData).map(key => {
      xValues.map((xVal, i) => {
        for (var j in selectedDrugs) {
          const d = filteredData[key].find(d => d[xKey] === xVal) || {};
          const dPrev = i > 0  ? filteredData[key].find(d => d[xKey] === xValues[i - 1]) || {} : {}
          changePrecValues.push({drug: selectedDrugs[j], yr: d[xKey], value: d[selectedDrugs[j]], yrPrev: dPrev[xKey], valPrev: dPrev[selectedDrugs[j]], state: key, yearmon: d['year']})
        }
    })
  })
  return changePrecValues;
}

const getYears = (startYrInp, endYrInp) => {

  let years = [];
  
  let startYr = Number(String(startYrInp));
  let endYr = Number(String(endYrInp));
  for (let stYr=startYr;stYr<=endYr;stYr++)
    years.push(stYr)
  
  return years;
} 

const getFilteredData = (data, currentState, lookupPeriodStartYear, lookupPeriodEndYear) => {

  var finalData = {};
  var allYrsData = [];
  var yrs = getYears(lookupPeriodStartYear, lookupPeriodEndYear)

  for (let x=0;x<yrs.length;x++) {
    var yrData = {};
    var yr_total_drug_OD_n = 0;
    var yr_total_Benzo_OD_n = 0;
    var yr_total_opioid_OD_n = 0;
    var yr_total_Fentanyl_OD_n = 0;
    var yr_total_heroin_OD_n = 0;
    var yr_total_stimulant_OD_n = 0;
    var yr_total_Cocaine_OD_n = 0;
    var yr_total_Methamphetamine_OD_n = 0;


    for(let i=0;i<data.length;i++) {
          if (data[i].YYYYMM?.substring(0,4) == yrs[x])
          {
             if (currentState == 'US') {
                if (data[i].geoid == currentState && data[i].Sex == 'Total' && data[i].Age_Group == 'Total')
                {
                  yr_total_drug_OD_n = yr_total_drug_OD_n + (UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                  yr_total_Benzo_OD_n = yr_total_Benzo_OD_n + (UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                  yr_total_opioid_OD_n =yr_total_opioid_OD_n + (UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                  yr_total_Fentanyl_OD_n = yr_total_Fentanyl_OD_n + (UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                  yr_total_heroin_OD_n = yr_total_heroin_OD_n + (UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                  yr_total_stimulant_OD_n = yr_total_stimulant_OD_n + (UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                  yr_total_Cocaine_OD_n = yr_total_Cocaine_OD_n + (UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
                  yr_total_Methamphetamine_OD_n = yr_total_Methamphetamine_OD_n + (UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n));
                }
            }
            else
            {
              if (data[i].geoid == currentState)
                {
                  yr_total_drug_OD_n = yr_total_drug_OD_n + (UtilityFunctions.convertValue(data[i].total_drug_OD_n));
                  yr_total_Benzo_OD_n = yr_total_Benzo_OD_n + (UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
                  yr_total_opioid_OD_n =yr_total_opioid_OD_n + (UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
                  yr_total_Fentanyl_OD_n = yr_total_Fentanyl_OD_n + (UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
                  yr_total_heroin_OD_n = yr_total_heroin_OD_n + (UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
                  yr_total_stimulant_OD_n = yr_total_stimulant_OD_n + (UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
                  yr_total_Cocaine_OD_n = yr_total_Cocaine_OD_n + (UtilityFunctions.convertValue(ata[i].total_Cocaine_OD_n));
                  yr_total_Methamphetamine_OD_n = yr_total_Methamphetamine_OD_n + (UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n));
                }
            }
          }
        }

        yrData['year'] = Number(yrs[x]);
        yrData['all'] = String(Number(yr_total_drug_OD_n).toFixed(1));
        yrData['benzodiazepine'] = String(Number(yr_total_Benzo_OD_n).toFixed(1));
        yrData['opioids'] = String(Number(yr_total_opioid_OD_n).toFixed(1));
        yrData['fentanyl'] = String(Number(yr_total_Fentanyl_OD_n).toFixed(1));
        yrData['heroin'] = String(Number(yr_total_heroin_OD_n).toFixed(1));
        yrData['stimulants'] = String(Number(yr_total_stimulant_OD_n).toFixed(1));
        yrData['cocaine'] = String(Number(yr_total_Cocaine_OD_n).toFixed(1));
        yrData['methamphetamine'] = String(Number(yr_total_Methamphetamine_OD_n).toFixed(1));

      allYrsData.push(yrData);

      }

      finalData[currentState] = allYrsData;

      return finalData[currentState];
};

const getFilteredDataPeriod = (data, currentState, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) => {

  var allMonthsData = [];

  var monthsArray = UtilityFunctions.generateYYMMArray(Number(lookupPeriodStartYear), Number(lookupPeriodStartMonth), Number(lookupPeriodEndYear), Number(lookupPeriodEndMonth))
  var index = 1;
  for(let j=0;j<monthsArray.length;j++) {
    for(let i=0;i<data.length;i++)
        {
          if (data[i].YYYYMM == monthsArray[j])
          {
            if (currentState == 'US') {
              if (data[i].geoid == currentState && data[i].Sex == 'Total' && data[i].Age_Group == 'Total')
              {
                var monData = {}
                monData['index'] = Number(index);
                monData['year'] = monthsArray[j]
                monData['all'] = String(Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n)).toFixed(1));
                monData['benzodiazepine'] = String(Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n)).toFixed(1));
                monData['opioids'] = String(Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n)).toFixed(1));
                monData['fentanyl'] = String(Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n)).toFixed(1));
                monData['heroin'] = String(Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n)).toFixed(1));
                monData['stimulants'] = String(Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n)).toFixed(1));
                monData['cocaine'] = String(Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n)).toFixed(1));
                monData['methamphetamine'] = String(Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n)).toFixed(1));

                allMonthsData.push(monData);

                index++;
              }
            }
            else
            {
              if (data[i].geoid == currentState)
              {
                var monData = {}
                monData['index'] = Number(index);
                monData['year'] = monthsArray[j]
                monData['all'] = String(Number(UtilityFunctions.convertValue(data[i].total_drug_OD_n)).toFixed(1));
                monData['benzodiazepine'] = String(Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n)).toFixed(1));
                monData['opioids'] = String(Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n)).toFixed(1));
                monData['fentanyl'] = String(Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n)).toFixed(1));
                monData['heroin'] = String(Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n)).toFixed(1));
                monData['stimulants'] = String(Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n)).toFixed(1));
                monData['cocaine'] = String(Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n)).toFixed(1));
                monData['methamphetamine'] = String(Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n)).toFixed(1));

                allMonthsData.push(monData);

                index++;
              }
            }
          }
        }
    }

  return allMonthsData;

};

function LineChart(params) {

  const { data, dataOverall, jurisCountData, monthNames, stateNames, drugOptions, currentTimeframe, currentDrug, currentState, currentYear: currentYearUntyped, currentMonth, width, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth, showPercent, showOverall, isPeriod, selectedDrugs, currentDataSource, accessible } = params;

  const currentYear = parseInt(currentYearUntyped);

  const showLabels = false;
  const currentDrugOnly = currentState != 'US' ? true : false;

  const filteredData = {
    [currentState]: isPeriod ? getFilteredDataPeriod(currentState != 'US' ? data : dataOverall , currentState, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(currentState != 'US' ? data : dataOverall, currentState, String(lookupPeriodStartYear), String(lookupPeriodEndYear))
  }

  if (currentState !== 'US') {
    filteredData['US'] = isPeriod ? getFilteredDataPeriod(dataOverall, 'US', lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(dataOverall, 'US', String(lookupPeriodStartYear), String(lookupPeriodEndYear))
  }

  const tmpyScaleDomainPeriod = UtilityFunctions.calculateYScaleDomain(filteredData, currentDrug, selectedDrugs, currentState, showOverall);
  const yScaleDomainPeriod = (tmpyScaleDomainPeriod == -1 ? 1 : (tmpyScaleDomainPeriod * 1.2));

  useEffect(() => {
    markYearsForTicks();
    adjustCrowdedLabels();
    adjustLinesForLabels();
  });

  const specs = [];
  specs['width'] = width - 35; 
  specs['width'] = specs['width'];
  specs['isSmallViewport'] = specs['width'] < 500;
  specs['fontSize'] = 16;
  specs['height'] = 450;
  specs['seriesOverlapMargin'] = 20;
  specs['seriesSpacing'] = 20;
  specs['margin'] = isPeriod ? { top: 15, bottom: 65, left: (currentState != 'US' && !showOverall ? 125 : 75), right: specs.isSmallViewport ? 10 : 150 } : { top: 15, bottom: 45, left: (currentState != 'US' && !showOverall ? 125: 75), right: specs.isSmallViewport ? 10 : 150 };
  specs['xMax'] = specs['width'] - specs.margin.left - specs.margin.right;
  specs['yMax'] = specs.height - specs.margin.top - specs.margin.bottom;
  specs['xKey'] = isPeriod ? 'index' : currentTimeframe === 'Monthly' ? 'month' : 'year';
  specs['xValues'] = isPeriod ? filteredData['US'].map(d => d.index) : filteredData['US'].map(d => currentTimeframe === 'Monthly' ? d.month : d.year);

  specs['xScale'] = scaleLinear({
    domain: [Math.min(...specs.xValues), Math.max(...specs.xValues)],
    range: [10, specs.xMax]
  });
  specs['yScale'] = scaleLinear({
    domain: [0, yScaleDomainPeriod == 0 ? 0.8 : yScaleDomainPeriod], 
    range: [specs.yMax, 0],
  });

  const changePrecValues = getChangePrecValues(filteredData, selectedDrugs, specs.xValues, specs.xKey);

  const inp = [];
  inp['filteredData'] = filteredData;
  inp['stateNames'] = stateNames;
  inp['monthNames'] = monthNames;
  inp['monthNamesShort'] = monthNamesShort;
  inp['monthNamesPeriod'] = UtilityFunctions.buildMonthNamesPeriod(filteredData['US'])
  inp['monthNamesShortPeriod'] = UtilityFunctions.buildMonthNumbersPeriod(filteredData['US'])
  inp['tickIndexes'] = UtilityFunctions.getAllIndexes(inp['monthNamesShortPeriod'], 4)
  inp['currentTimeframe'] = currentTimeframe;
  inp['currentDataSource'] = 'ED';
  inp['currentYear'] = currentYear;
  inp['currentMonth'] = currentMonth;
  inp['currentDrug'] = currentDrug;
  inp['currentState'] = currentState;
  inp['selectedDrugs'] = selectedDrugs;
  inp['tickWidth'] = specs['xMax']/(Object.keys(inp['monthNamesShortPeriod']).length - 1);
  inp['numOfTicks'] = specs['xMax']/inp['tickWidth'];

  const markYearsForTicks = () => {

    const xAxis = document?.getElementsByClassName("visx-axis-bottom")[1];
    const ticks = xAxis?.getElementsByClassName("visx-axis-tick");
    if (ticks !== undefined && ticks != null) {
      for (var i=0; i<ticks?.length; i++) {
        var tickText = ticks[i]?.childNodes[1].childNodes[0].childNodes[0].innerHTML;
        var ln = ticks[i]?.getElementsByClassName("visx-line");
        if (ln !== undefined && ln != null) {
          ln[0]?.setAttribute("y1","0");
          ln[0]?.setAttribute('stroke-width', '1')
          if (tickText.substring(0,3) === 'Jan') {
            ln[0]?.setAttribute("y1","1");
            ln[0]?.setAttribute('stroke-width', '3')
          }
        }
      }
    } 
}

const adjustCrowdedLabels = () => {

  if (currentState != 'US')
    return;

  var yr = inp.filteredData['US'][inp.filteredData['US'].length - 1]['year'];
  var covidTimeIndex = UtilityFunctions.getCovidPeriodIndex(yr) + 1;
  var allPeriodIsCovid = (inp.filteredData['US'].length  <= covidTimeIndex) ? true : false;

  if (allPeriodIsCovid)
    return;

    var rec = inp.filteredData['US'][inp.filteredData['US'].length - 1];
    var covidTimeIndex = UtilityFunctions.getCovidPeriodIndex(rec.year) + 1;

    var positionsVar = [];
    const allLabels = document?.getElementsByClassName("adjustCrowded");
    if (selectedDrugs !== undefined && selectedDrugs != null) {
      for (var i=0; i<selectedDrugs?.length; i++) {
        if (!UtilityFunctions.isCovidPeriod(rec.year)) {
          var pos = specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1][selectedDrugs[i]]);
          if (pos !== undefined) {
            positionsVar.push({
                label: drugOptions[selectedDrugs[i]].titleForDropDown, 
                xpos: specs.xMax + 18,
                ypos:  specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1][selectedDrugs[i]]),
                yposNew: specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1][selectedDrugs[i]]),
                adjusted: false
              })
          }
        }
        else {
          
          var pos = specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1 - covidTimeIndex][selectedDrugs[i]]);
          if (pos !== undefined) {
            positionsVar.push({
                label: drugOptions[selectedDrugs[i]].titleForDropDown, 
                xpos: specs.xMax + 18,
                ypos:  specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1 - covidTimeIndex][selectedDrugs[i]]),
                yposNew: specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1 - covidTimeIndex][selectedDrugs[i]]),
                adjusted: false
              })
          }
        }
      }
    }
    
    var avg = 0; var order = 'topdown'; var upcnt = 0; var downcnt = 0;

    for (var i=0; i<positionsVar?.length; i++) 
      avg = avg + positionsVar[i].ypos;
    
    avg = avg/positionsVar?.length;

    for (var i=0; i<positionsVar?.length; i++) {
      if (positionsVar[i].ypos > avg)
        downcnt++;
      else
        upcnt++;
    }

    if (downcnt > upcnt)
      order = 'bottomup';

    if (order == 'bottomup') {
      
      positionsVar.sort((a, b) => b.ypos - a.ypos);

      if (positionsVar !== undefined && positionsVar != null) {
        for (var i=0; i<positionsVar?.length; i++) {
          if (i == 0) {
            positionsVar[i].yposNew = Number(positionsVar[i].ypos);
          }
          else{
            positionsVar[i].yposNew = ((Number(positionsVar[i-1].yposNew) - Number(positionsVar[i].ypos)) < 20) ? (Number(positionsVar[i-1].yposNew) - 20) : Number(positionsVar[i].ypos);
            positionsVar[i].adjusted = ((Number(positionsVar[i-1].yposNew) - Number(positionsVar[i].ypos)) < 20) ? true : false;
          }
        }
      }
    }
    else
    {
      positionsVar.sort((a, b) => a.ypos - b.ypos);

      if (positionsVar !== undefined && positionsVar != null) {
        for (var i=0; i<positionsVar?.length; i++) {
          if (i == 0) {
            positionsVar[i].yposNew = Number(positionsVar[i].ypos);
          }
          else{
              positionsVar[i].yposNew = ((Number(positionsVar[i].ypos) - Number(positionsVar[i-1].yposNew)) < 20) ? (Number(positionsVar[i-1].yposNew) + 20) : Number(positionsVar[i].ypos);
              positionsVar[i].adjusted = ((Number(positionsVar[i].ypos) - Number(positionsVar[i-1].yposNew)) < 20) ? true : false;
          }
        }
      }
    }
    

    specs['positionsVar'] = positionsVar;

    for (var i=0; i<allLabels?.length; i++) {
      for (var j=0; j<positionsVar?.length; j++) {
          if (allLabels[i].innerHTML == positionsVar[j].label) {
            allLabels[i].setAttribute("y", String(positionsVar[j].yposNew));
            break;
          }
        }
      }
  }

  const adjustLinesForLabels = () => {

    if (currentState != 'US')
      return;

    if (selectedDrugs !== undefined && selectedDrugs != null) {
      for (var i=0; i<selectedDrugs?.length; i++) {
        var lineElm = document?.getElementById(`line-leading-${selectedDrugs[i]}`);

        for (var j=0; j<specs['positionsVar']?.length; j++) {
          var drug = specs['positionsVar'][j].label;
          var drugLbl;
          switch (drug) {
            case 'All Drugs':
              drugLbl = "all";
              break;
            case 'All Stimulants':
              drugLbl = "stimulants";
              break;
            case 'All Opioids':
              drugLbl = "opioids";
              break;
            default:
              drugLbl = drug;
              break;
          }
          if (lineElm?.id.includes(drugLbl?.toLowerCase())) {
            lineElm.style.visibility = "visible"
            if (specs['positionsVar'][j].adjusted === true) {
              lineElm.setAttribute("y1", String(specs['positionsVar'][j].ypos));
              lineElm.setAttribute("y2", String(specs['positionsVar'][j].yposNew));
            }
            else
            {
              lineElm.style.visibility = "hidden";
            }
            break;
          }
        }
       }
    }
  }

  const getFormattedValue = (val) => {
    if (val == 1 || val == Object.keys(inp.monthNamesShortPeriod).length ||  inp.monthNamesShortPeriod[val].length == 4)
    {
      if (inp.monthNamesShortPeriod[val].length == 4) {
        let retVal =  monthNamesShort[parseInt('1')];
        if (retVal == 'Jan')
          return monthNamesShort[parseInt('1')] + ' ' + inp.monthNamesShortPeriod[val];
        else
          return '';
      }
      else 
        return '';
    }
    else
      return '';
  } 
  
  const getRateforDrug = (drug, parmState, val) => {

    var rate;
    if (currentTimeframe === 'Annual' && !isPeriod) {
      if (parmState === 'US') {
        for (var i=0;i<Object.keys(inp.filteredData['US']).length;i++) {
          if (inp.filteredData['US'][i]['year'] == val) {
            rate = inp.filteredData['US'][i][drug]
            break;
          }
        }
      }
      else {
          let stateValue = inp.filteredData[parmState].find(d2 => d2[specs.xKey] === val);
          if (stateValue)
              rate = stateValue[drug];
      }
    }
    else if (currentTimeframe === 'Monthly' && !isPeriod) {
      if (parmState === 'US') {
            rate = inp.filteredData['US'][val-1][drug]
      }
      else {
          let stateValue = inp.filteredData[parmState].find(d2 => d2[specs.xKey] === val);
          if (stateValue)
              rate = stateValue[drug];
      }
    }
    else if (isPeriod) {
      let arr = val.split(' ');
      let mon = String(UtilityFunctions.getMonthNumber(arr[0])).padStart(2, '0');;
      let yr = arr[1];
      if (parmState === 'US') {
        for (var i=0; i<inp.filteredData['US'].length;i++) {
          if (inp.filteredData['US'][i].year == String(yr) + String(mon)) {
            rate = inp.filteredData['US'][i][drug];
            break;
          }
        }
      }
      else {
        for (var i=0; i<inp.filteredData[parmState].length;i++) {
          if (inp.filteredData[parmState][i].year == String(yr) + String(mon)) {
            rate = inp.filteredData[parmState][i][drug];
            break;
          }
        }
      }
    }

    return rate;
  }

  const getRateHTMLforDrug = (selectedDrugs, parmState, val) => {
    var leftRateStr = '';
    if (parmState == 'US') {
      for (var i in selectedDrugs) {
        if (selectedDrugs[i].includes(currentDrug)) {
          let rate = getRateforDrug(selectedDrugs[i], parmState, val);
          leftRateStr = leftRateStr + `<span class=${selectedDrugs[i] + 'ToolTip'}` + '>' + (isNaN(rate) ? 0 : (rate == 0 ? 'Data Suppressed' : rate)) + '</span></br>'
        }
      }
    }
    else {
      let rate = getRateforDrug(currentDrug, parmState, val);
        leftRateStr = leftRateStr + `<span class=${currentDrug + 'ToolTip'}` + '>' + (isNaN(rate) ? 0 : (rate == 0 ? 'Data Suppressed' : rate)) + '</span></br>'
    }
    return leftRateStr;
  }

  const getTooltipStateFragment = (d) => {
    let val = isPeriod ? inp.monthNamesPeriod[d[[specs.xKey]]] : d[[specs.xKey]]; 
    let rate = getRateforDrug(inp.selectedDrugs[0], currentState, val)
    let str = `<table class='tooltipTableLC'><tr><td><span class='toolTipSpanLC'><strong>`
    let stStr = inp.currentTimeframe === 'Monthly' ? `${inp.monthNamesPeriod[d[[specs.xKey]]]}` : UtilityFunctions.getPeriod(d['year'].substring(0,4), d['year'].substring(4));
    let msgStr = inp.currentTimeframe === 'Monthly' ? '' : `&nbsp<span class='smallFont alignCenter'>12-month rolling averages starting and ending period</span>`;
    let midStr = `<p><strong class=${inp.selectedDrugs[0] + 'ToolTip'}>` + drugOptions[inp.selectedDrugs[0]].titleForDropDown + `</strong>: ${rate == 0 ? 'Data Suppressed' : (rate == '-1.0' ? 'Data not available/not reported' : rate)}</p>`
    let parStr = `</strong></span>` + midStr + `</td></tr></table>`;
    return str + stStr + `</td></tr><tr><td class='alignCenter'>` + msgStr + parStr;
  }

  const getTooltipFragment = (d) => {
    let val = isPeriod ? inp.monthNamesPeriod[d[[specs.xKey]]] : d[[specs.xKey]]; 
    let rateSt = getRateforDrug(inp.selectedDrugs[0], currentState, val);
    let rateUS = getRateforDrug(inp.selectedDrugs[0], 'US', val)
    let str = `<table class='tooltipTableLC'><tr><td><span class='toolTipSpanLC'><strong>`
    let stStr = inp.currentTimeframe === 'Monthly' ? `${inp.monthNamesPeriod[d[[specs.xKey]]]}` : UtilityFunctions.getPeriod(d['year'].substring(0,4), d['year'].substring(4));
    let msgStr = inp.currentTimeframe === 'Monthly' ? '' : `&nbsp<span class='smallFont alignCenter'>12-month rolling averages starting and ending period</span>`;
    let midStr1 = `<p class='alignLeft'><strong class=${inp.selectedDrugs[0] + 'ToolTip'}>` + 'Overall' + `</strong>: ${rateUS == 0 ? 'Data Suppressed' : (rateUS == '-1.0' ? 'Data not available/not reported' : rateUS)} (${getJurisCount(d['year'])} Jurisdictions)</p>`
    let midStr2 = `<p class='alignLeft'><strong class=${inp.selectedDrugs[0] + 'ToolTip'}>` + drugOptions[inp.selectedDrugs[0]].titleForDropDown + `</strong>: ${rateSt == 0 ? 'Data Suppressed' : (rateSt == '-1.0' ? 'Data not available/not reported' : rateSt)}</p>`
    let parStr = `</strong></span>` + midStr1 + midStr2 + `</td></tr></table>`;
    return str + stStr + `</td></tr><tr><td class='alignCenter'>` + msgStr + parStr;
  }

  const getTooltipFragmentPerc = (drug, yr, st) => {

    var rec;
    var perc = 0;
    var diff;
    var tooltipHtml;

    for (var i=0; i<changePrecValues?.length; i++) {
      if (changePrecValues[i].yearmon == yr && changePrecValues[i].drug == drug && changePrecValues[i].state == st) {
        rec = changePrecValues[i];
        break
      }
    }

    if (rec != null && !isNaN(rec.valPrev)) {
      if (rec.value != rec.valPrev) {
          diff =  rec.value - rec.valPrev;
          perc = rec.valPrev == 0 ? (diff * 100) : ((diff / rec.valPrev) * 100)
      }

      tooltipHtml = ReactDOMServer.renderToString(buildPercentChartInd(rec.drug, rec.yr, perc, stateNames[rec.state], rec.yearmon))

      return '<table><tr><td><div class="toolTipChgPerc">' + tooltipHtml + '</div></td></tr></table>'
    }
    return '';
  }

  const sortToolTipValues = (vals) => {
    let sortedToolTips = [];
    if (vals !== undefined) {
      Object.keys(drugOptions).forEach(drug => {
        for (var i=0;i<vals.length;i++)
        {
          if ((drug == 'all' && vals[i]?.includes('All Drugs')) || (drug != 'all' && vals[i]?.includes(drug)))
            sortedToolTips.push(vals[i]);
        }
      })
    }
    return sortedToolTips;
  }

  const getTooltipCovid = () => {
    return `<table class='tooltipTableLC'><tr><td><span class='toolTipSpanLC'><strong><small><sup>‡</sup>Grayed out area represents the COVID-19 pandemic </small></strong></td></tr><tr><td><span class='toolTipSpanLC'><strong><small>and is distinct from data suppression.</small></strong></td></tr></table>`;
  }

  const getJurisCount = (yearmon) => {
    return jurisCountData[yearmon + currentTimeframe]
  }

  const getDataTip = (d, tooltipValuesSorted) => {
    if (UtilityFunctions.isCovidPeriod(d['year']))
      return getTooltipCovid();

    if (inp.currentState !== 'US') {
      if (!showOverall)
        return getTooltipStateFragment(d);
      else
        return getTooltipFragment(d);
    }
    else
    {
        return `<table class='tooltipTableLC'><tr><td class='bgBlue'><span>Overall (${getJurisCount(d['year'])} Jurisdictions)</span></td></tr><tr><td></td></tr>` + `<tr><td class='alignCenter'><span class='toolTipSpanLC'><strong>${isPeriod ? (inp.currentTimeframe === 'Monthly' ? `${inp.monthNamesPeriod[d[specs.xKey]]}` : UtilityFunctions.getPeriod(d['year'].substring(0,4), d['year'].substring(4))) : inp.currentTimeframe === 'Monthly' ? `${inp.monthNames[d[specs.xKey]]} ${inp.currentYear}` : d[specs.xKey]}</strong></span></td></tr>` + (inp.currentTimeframe === 'Annual' ? 
                `<tr><td class='alignCenter'><span class='smallFont'>12-month rolling averages starting and ending period</span></td></tr><tr><td>&nbsp;</td></tr>` : '<tr><td>&nbsp;</td></tr>') + `<tr><td>${tooltipValuesSorted.join('')}</td></tr></table>`;
    }
  }
  
  const buildToolTipValues = (sectionWidth, sectionWidthHalf) => {
    return (
      <Fragment>
        {
          inp.filteredData['US'].map((d, index) => {

            if (inp.currentState === 'US') {
              let numStates = getJurisCount(d['year']);
              var tooltipValues = [];
              if (inp.selectedDrugs.length > 0) {
                  for (var i in inp.selectedDrugs) {
                      tooltipValues.push(`<div class='toolTipPad'><span><strong class=${inp.selectedDrugs[i] + 'ToolTip'}>` + drugOptions[inp.selectedDrugs[i]].titleForDropDown + `</strong>: ${d[inp.selectedDrugs[i]] == 0 ? 'Data Suppressed' : (d[inp.selectedDrugs[i]] == '-1.0' ? 'Data not available/not reported' : d[inp.selectedDrugs[i]])}</span></div>`);
                    }
                  }
              }
            
            let tooltipValuesSorted = sortToolTipValues(tooltipValues)

            return <rect
              key={`tooltip-section-${d[specs.xKey]}`}
              fill={UtilityFunctions.isCovidPeriod(d['year'])  ? '#E7E7E7' : 'transparent'}
              strokeWidth={UtilityFunctions.isCovidPeriod(d['year'])  ? 3 : null}
              stroke={UtilityFunctions.isCovidPeriod(d['year'])  ? '#E7E7E7' : null}
              x={Math.max(0, specs.xScale(d[specs.xKey]) - sectionWidthHalf)}
              y={0}
              width={(UtilityFunctions.doesEndWithCovidPeriod(inp.filteredData, 'US') && (index == (inp.filteredData['US'].length - 1))) ? (sectionWidth/2) : (sectionWidth)}
              height={specs.yMax}
              style={{outline: 'none', shapeRendering: UtilityFunctions.doesEndWithCovidPeriod(inp.filteredData, 'US') ? 'crispEdges' : ''}}
              data-tip={getDataTip(d, tooltipValuesSorted)}></rect>
          })
        }
      </Fragment>
    )
  }

  const buildToolTipValuesPerc = (drug) => {
    return (
      <Fragment>
        {
          Object.keys(inp.filteredData).map(key => {
            return (
              <Fragment>
                {
                  specs.xValues.map((xVal, i) => {
                    const d = inp.filteredData[key].find(d => d[specs.xKey] === xVal) || {};
                      return <rect
                        key={`tooltip-section-${d[specs.xKey]}`}
                        x={Math.max(0, specs.xScale(d[specs.xKey]) -10)}
                        y={specs.yScale(d[drug]) - 10}
                        width={20}
                        height={20}
                        style={{outline: 'none'}}
                        fill='transparent'
                        data-tip={getTooltipFragmentPerc(drug, d.year, key)}></rect>
                })
              }
              </Fragment>
            )
        })
      }
      </Fragment>
    )
  }

  const getTooTipPartPercent = (timeline, yearMon) => {
    if (timeline == 'Annual')
      return String(yearMon) + ', ' + String(yearMon - 1)
    else
      return UtilityFunctions.getMonthName(String(Number(yearMon.substring(4)))) + ', ' + yearMon.substring(0,4) + ' vs. ' + UtilityFunctions.getPrevMonYear(yearMon);

  }

  const buildPercentChartInd = (percentChgDrug, percentChgYear, percentChgValue, percentState, yearMon) => {

    return (
      <QuickStat
          colorScale={colorScale}
          defaultValueIfEmpty={defaultValueIfEmpty}
          value={percentChgValue}
          text={(percentChgValue > 0 ? 'Increase' : (percentChgValue == 0 ? 'No Change' : 'Decrease')) + ' in ' + (currentDataSource === 'ED' ? 'ED visits' : 'inpatient hospitalizations') + ' for nonfatal ' + percentChgDrug.replace('all', 'all drug') + ' overdoses, ' + percentState + ', ' + getTooTipPartPercent(currentTimeframe, yearMon)}
          label={percentChgDrug}
          timeframe={'year'}
      ></QuickStat>
      ); 
  }

  const buildLineForDrug = (currentDrug) => {

    const sectionWidth = specs.xMax / specs.xValues.length;
    const sectionWidthHalf = sectionWidth / 2;

    var yr = inp.filteredData['US'][inp.filteredData['US'].length - 1]['year'];
    var covidTimeIndex = UtilityFunctions.getCovidPeriodIndex(yr) + 1;
    var allPeriodIsCovid = (inp.filteredData['US'].length  <= covidTimeIndex) ? true : false;
    var endWithCovidPeriod = UtilityFunctions.isCovidPeriod(yr);

    const seriesLabelPositionUS = endWithCovidPeriod && !allPeriodIsCovid ? specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1 - covidTimeIndex][currentDrug]) : specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1][currentDrug]);
    const valueState = inp.filteredData[inp.currentState].length > 0 ? (endWithCovidPeriod && !allPeriodIsCovid ? inp.filteredData[inp.currentState][inp.filteredData[inp.currentState].length - 1 - covidTimeIndex][currentDrug] : inp.filteredData[inp.currentState][inp.filteredData[inp.currentState].length - 1][currentDrug]) : 'Data suppressed*';
    const seriesLabelPositionState = (valueState === 'Data suppressed*' || valueState === '-1.0') ? specs.yScale(0) - 15 : specs.yScale(valueState);

    if (seriesLabelPositionUS === undefined)
      return;
    
    return (
      <Fragment>
          <Group>
                  {Object.keys(inp.filteredData).map(key => <Group key={`line-path-${key}`}>
                    {specs.xValues.map((xVal, i) => {
                      const d = inp.filteredData[key].find(d => d[specs.xKey] === xVal) || {};
                      const dNext = i === specs.xValues.length - 1 ? {} : inp.filteredData[key].find(d => d[specs.xKey] === specs.xValues[i + 1]) || {}
                      const dPrev = i > 0  ? inp.filteredData[key].find(d => d[specs.xKey] === specs.xValues[i - 1]) || {} : {}

                      return (
                        <Group key={`line-path-${key}-point-${i}`}>
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && d[currentDrug] > 0 && dNext[currentDrug] > 0 && key == 'US' && (currentState == 'US' || (currentState != 'US' && showOverall))) && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={specs.yScale(d[currentDrug]) ?? 0} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={specs.yScale(dNext[currentDrug]) ?? 0} stroke={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && d[currentDrug] > 0 && dNext[currentDrug] > 0 && key != 'US') && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={specs.yScale(d[currentDrug]) ?? 0} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={specs.yScale(dNext[currentDrug]) ?? 0} stroke={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && key == 'US' && (currentState == 'US' || (currentState != 'US' && showOverall))) && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={''} fill={''} fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>{showLabels ? d[currentDrug] : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key == 'US' && d[currentDrug] > 0 && (currentState == 'US' || (currentState != 'US' && showOverall))) && <Circle cx={specs.xScale(d[specs.xKey])} cy={specs.yScale(d[currentDrug])} r={4} fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} />}
                          {(!isNaN(d[currentDrug]) && key == 'US' && d[currentDrug] == 0 && (currentState == 'US' || (currentState != 'US' && showOverall))) && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={''} fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} fontSize={16} fontWeight={'bold'} textAnchor={i == 0 ? 'right' : 'middle'}>{!UtilityFunctions.isCovidPeriod(d['year']) ? '*' : ''}</text>}

                          {(!isNaN(d[currentDrug]) && key != 'US') && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={'lightblue'} fill={'lightblue'} fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>{showLabels ? d[currentDrug] : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key != 'US') && d[currentDrug] > 0 && <Circle cx={specs.xScale(d[specs.xKey])} cy={specs.yScale(d[currentDrug])} r={4} fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} />}
                          {(!isNaN(d[currentDrug]) && key != 'US') && d[currentDrug] == 0 && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={''} fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} fontSize={16} fontWeight={'bold'} textAnchor={i == 0 ? 'right' : 'middle'}>{!UtilityFunctions.isCovidPeriod(d['year']) ? '*' : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key != 'US') && d[currentDrug] == '-1.0' && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(0)-8} stroke={''} fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)} fontSize={16} fontWeight={'bold'} textAnchor={i == 0 ? 'right' : 'middle'}>{!UtilityFunctions.isCovidPeriod(d['year']) ? '†' : ''}</text>}
                        </Group>
                        )
                    })}
                    {(!specs.isSmallViewport && yScaleDomainPeriod > 0) &&  (() => {
                        let yPos = seriesLabelPositionUS;
    
                        if(key !== 'US') {
                          const isOverlapping = seriesLabelPositionState < seriesLabelPositionUS + specs.seriesOverlapMargin && seriesLabelPositionState > seriesLabelPositionUS - specs.seriesOverlapMargin;
                          if (isOverlapping) {
                            if (seriesLabelPositionState < seriesLabelPositionUS) {
                              yPos = seriesLabelPositionUS - specs.seriesSpacing;
                              if(yPos < specs.seriesOverlapMargin){
                                yPos = seriesLabelPositionUS + specs.seriesSpacing;
                              }
                            } else {
                              yPos = seriesLabelPositionUS + specs.seriesSpacing;
                              if(yPos > specs.yMax - specs.seriesOverlapMargin){
                                yPos = seriesLabelPositionUS - specs.seriesSpacing;
                              }
                            }
                          } else {
                            yPos = seriesLabelPositionState;
                          }
                        }
    
                        if (currentState != 'US') {
                          return <text 
                            x={specs.xMax + 25} 
                            y={yPos}
                            alignmentBaseline="middle" 
                            fontSize={specs.fontSize} 
                            fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)}>
                              {key != 'US' ? inp.stateNames[key] : (showOverall ? 'Overall' : '')}
                          </text>
                        }
                        else{
                          return (
                            <Group>
                              <line
                                id={`line-leading-${currentDrug}`}
                                x1={specs.xMax + 4}
                                y1={yPos}
                                x2={specs.xMax + 25} 
                                y2={yPos}
                                stroke={colorScale[currentDrug]}
                                strokeWidth={0.5}/>
                              <text
                                class='adjustCrowded'
                                x={specs.xMax + 28} 
                                y={yPos}
                                alignmentBaseline="middle" 
                                fontSize={specs.fontSize} 
                                fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)}>
                                  {drugOptions[currentDrug].titleForDropDown}
                              </text>
                            </Group>
                            )
                        }
                      })()
                    }
                  </Group>)
                  }
                  {
                    !showPercent && buildToolTipValues(sectionWidth, sectionWidthHalf)
                  }
                  {
                    showPercent && 
                    inp.selectedDrugs.map(drug => {
                      return buildToolTipValuesPerc(drug)
                    })
                  }
                </Group>
      </Fragment>
      )
  }

  return (
    <>
    {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateLineChartData(filteredData, currentDrug, selectedDrugs, currentState, stateNames)}
          labelOverrides={{
            'all': 'All Drugs*',
            'benzodiazepine': 'Benzodiazepine*',
            'cocaine': 'Cocaine*',
            'heroin': 'Heroin*',
            'fentanyl': 'Fentanyl*',
            'methamphetamine': 'Methamphetamine*',
            'opioids': 'All Opioids*',
            'stimulants': 'All Stimulants*',
          }}
          xAxisKey={'Year/Month'}
          transforms={{
            rate: num => UtilityFunctions.toFixed(num)
          }}
          width={width}
        />
        </>        
      ) : (
      <table style={{width: '100%'}}>
        <tr>
          <td style={{width: '85%'}}>
            <svg style={{height: (specs.height - 30), width: '100%'}}>
              <Group top={specs.margin.top} left={specs.margin.left}>
                {currentState !== 'US' && buildLineForDrug(currentDrug)}
                {inp.selectedDrugs.includes('all') && currentState === 'US' && buildLineForDrug('all')}
                {inp.selectedDrugs.includes('opioids') && currentState === 'US' && buildLineForDrug('opioids')}
                {inp.selectedDrugs.includes('heroin') && currentState === 'US' && buildLineForDrug('heroin')}
                {inp.selectedDrugs.includes('stimulants') && currentState === 'US' && buildLineForDrug('stimulants')}
                {inp.selectedDrugs.includes('benzodiazepine') && currentState === 'US' && buildLineForDrug('benzodiazepine')}
                {inp.selectedDrugs.includes('fentanyl') && currentState === 'US' && buildLineForDrug('fentanyl')}
                {inp.selectedDrugs.includes('cocaine') && currentState === 'US' && buildLineForDrug('cocaine')}
                {inp.selectedDrugs.includes('methamphetamine') && currentState === 'US' && buildLineForDrug('methamphetamine')}
                
                <AxisLeft
                  scale={specs.yScale}
                  tickLabelProps={() => ({
                    fontSize: specs.fontSize,
                    textAnchor: 'end',
                    fill: '#000066',
                    dx: -5,
                    dy: 5
                  })}
                />
                <text width={specs.yMax} x={(specs.margin.left / -2) - 3} y={specs.yMax / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', fill: '#000066', transformOrigin: `-${specs.margin.left / 2}px ${specs.yMax / 2}px`}}>Nonfatal Overdoses per 10,000 Total ED Visits</text>
               <AxisBottom
                  top={specs.yMax}
                  scale={specs.xScale}
                  tickValues={currentTimeframe === 'Monthly' && specs.isSmallViewport ? lessMonths(filteredData['US'].map(d => d[specs.xKey])) : (isPeriod ? filteredData['US'].map(d => d[specs.xKey]) : filteredData['US'].map(d => d[specs.xKey]))}
                  tickFormat={value => 
                      getFormattedValue(value)
                  }
                  tickLabelProps={(value) => ({
                    fontSize: inp['numOfTicks'] > 60 ? specs.fontSize - 4 : specs.fontSize,
                    fill: '#000066',
                    textAnchor: ('start'),
                  })}
                  labelProps={{
                    fontSize: specs.fontSize,
                    textAnchor: 'middle',                    
                  }}
                >
                </AxisBottom>
              </Group>
            </svg>
        </td>
      </tr>
      </table>
      )}
      {(!accessible && specs.isSmallViewport) && (
        <div id="line-chart-legend-container">
          <div id="line-chart-legend">
            {Object.keys(filteredData).map((key, i) =>
              <div key={`line-series-${key}`}>
                <span fontSize={specs.fontSize} style={{color: UtilityFunctions.getSeriesColorLine(currentDrug, key, showOverall)}}>- {stateNames[key]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
    )

}

export default LineChart