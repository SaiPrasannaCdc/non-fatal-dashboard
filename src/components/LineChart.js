import {React, Fragment, useState, useEffect} from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { Circle } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';
import QuickStat from './quickStat';
import ReactDOMServer from 'react-dom/server';

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

export const colorScale = {
  'alldrug': '#325D7D',
  'opioid': '#000C77',
  'heroin': '#0C6F96',
  'stimulant': '#411B6D',
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

const getCountsYearly = (data, currentDataSource, drugOptions) => {

  var arr = [];

  Object.keys(drugOptions).forEach(drug => {
    Object.keys(data[currentDataSource][drug]).forEach(year => {
      if (!isNaN(year)) {
        var cnt = 0;
        var cntText = '';
        Object.keys(data[currentDataSource][drug][year]['all']['count']).forEach(rec => {
          var femCnt = data[currentDataSource][drug][year]['all']['count'][rec]['F'];
          var maleCnt = data[currentDataSource][drug][year]['all']['count'][rec]['M'];

          cnt = Number(cnt) + (isNaN(femCnt) ? 0 : Number(femCnt)) + (isNaN(maleCnt) ? 0 : Number(maleCnt));
            if (isNaN(femCnt) && isNaN(maleCnt))
              cntText = femCnt;
        })
        arr.push({
          year: year,
          drug: drug,
          count: ((cnt == 0 && cntText.length > 0) ? cntText : cnt),
        });
      }
    })
  })
  return arr;
}

const getCountsMonthly = (data, currentDataSource, drugOptions) => {
  var arr = [];

  Object.keys(drugOptions).forEach(drug => {
    Object.keys(data[currentDataSource][drug]).forEach(year => {
      if (!isNaN(year)) {
        for (var mon=1;mon<=12;mon++)
        {
          var cnt = 0;
          var cntText = '';
          Object.keys(data[currentDataSource][drug][year][mon]['count']).forEach(rec => {
            var femCnt = data[currentDataSource][drug][year][mon]['count'][rec]['F'];
            var maleCnt = data[currentDataSource][drug][year][mon]['count'][rec]['M'];
            cnt = Number(cnt) + (isNaN(femCnt) ? 0 : Number(femCnt)) + (isNaN(maleCnt) ? 0 : Number(maleCnt));
            if (isNaN(femCnt) && isNaN(maleCnt))
              cntText = femCnt;
          })
          arr.push({
            year: year,
            month: mon,
            drug: drug,
            count: ((cnt == 0 && cntText.length > 0) ? cntText : cnt),
          });
        }
      }
    })
  })
  return arr;
}

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

const getFilteredData = (data, currentTimeframe, currentDataSource, currentState, currentYear) => {

  if(data.year[currentDataSource][currentState]){
    if(currentTimeframe === 'Monthly'){
      return Object.keys(data.year[currentDataSource][currentState]).map(month => {
        let d = data.year[currentDataSource][currentState][month].find(d => d.year == String(currentYear));
        if (d) {
          d.month = parseInt(month);
          return d;
        }
      }).filter(d => !!d && !isNaN(d.month));
    } else {
      return data.year[currentDataSource][currentState]['all'];
    }

  } else {
    return [];
  }
};

const getFilteredDataPeriod = (data, currentDataSource, currentState, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) => {

  var arr = [];
  var arrFinal = [];

  if(data.year[currentDataSource][currentState]){
    for (let index = 0; index < Object.keys(data.year[currentDataSource][currentState]).length - 1; ++index) {
      const element = data.year[currentDataSource][currentState][index + 1];
      for (let index1 = 0; index1 < element.length; ++index1) {
        if (element[index1].year <= lookupPeriodEndYear && element[index1].year >= lookupPeriodStartYear) 
          {
            arr.push({
              year: String(element[index1].year) + (String(parseInt(index) + 1).length < 2 ? String(parseInt(index) + 1).padStart(2, '0') : String(index + 1)),
              alldrug: element[index1].alldrug,
              opioid: element[index1].opioid,
              heroin: element[index1].heroin,
              stimulant: element[index1].stimulant,
              benzodiazepine: element[index1].benzodiazepine,
              fentanyl: element[index1].fentanyl,
              cocaine: element[index1].cocaine,
              methamphetamine: element[index1].methamphetamine
            });
          }
      }
    }

    arr.sort((a, b) => {
        if (a['year'] > b['year']) {
          return 1
        } else if (a['year'] < b['year']) {
          return -1
        } else {
          return 0
        }
    })

    var lpsm = lookupPeriodStartMonth.length < 2 ? lookupPeriodStartMonth.padStart(2, '0') : lookupPeriodStartMonth;
    var lpem = lookupPeriodEndMonth.length < 2 ? lookupPeriodEndMonth.padStart(2, '0') : lookupPeriodEndMonth;
    var lpsmFinal = String(lookupPeriodStartYear) + String(lpsm);
    var lpemFinal = String(lookupPeriodEndYear) + String(lpem);
    
    var cnt = 0;
    for (let i = 0; i < arr.length; ++i) {
      if (parseInt(arr[i].year) <=  parseInt(lpemFinal) && parseInt(arr[i].year) >=  parseInt(lpsmFinal))
      {
        arrFinal.push({
          index: cnt + 1,
          year: arr[i].year,
          alldrug: arr[i].alldrug,
          opioid: arr[i].opioid,
          heroin: arr[i].heroin,
          stimulant: arr[i].stimulant,
          benzodiazepine: arr[i].benzodiazepine,
          fentanyl: arr[i].fentanyl,
          cocaine: arr[i].cocaine,
          methamphetamine: arr[i].methamphetamine
        });

        cnt++;
      }
    }

    return arrFinal;
  } else {
    return [];
  }
};

function LineChart({ params }) {

  const { data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear: currentYearUntyped, currentMonth, width, stateDropdownOptions, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth, showLabels, showPercent, isPeriod, currentDrugOnly, supportedYears, selectedDrugs, accessible } = params;

  const currentYear = parseInt(currentYearUntyped);

  const filteredData = {
    [currentState]: isPeriod || (accessible && currentTimeframe == 'Monthly') ? getFilteredDataPeriod(data, currentDataSource, currentState, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if (currentState !== 'US') 
    filteredData['US'] = isPeriod || (accessible && currentTimeframe == 'Monthly') ? getFilteredDataPeriod(data, currentDataSource, 'US', lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(data, currentTimeframe, currentDataSource, 'US', currentYear)

  const countsDataYearly = getCountsYearly(data.sex, currentDataSource, drugOptions);
  const countsDataMonthly = getCountsMonthly(data.sex, currentDataSource, drugOptions);
  
  const yScaleDomainPeriod = (UtilityFunctions.calculateYScaleDomain(filteredData, currentDrug, selectedDrugs, currentState) * 1.2);

  const currentStaterate = stateNames[currentState] + ' rate'
  const currentStatePctChange = stateNames[currentState] + ' %change in rate'

  useEffect(() => {
    markYearsForTicks();
    adjustCrowdedLabels();
    adjustLinesForLabels();
  });

  const specs = [];
  specs['width'] = width - 20; 
  specs['width'] = specs['width'];
  specs['isSmallViewport'] = specs['width'] < 550;
  specs['fontSize'] = 16;
  specs['height'] = 400;
  specs['seriesOverlapMargin'] = 20;
  specs['seriesSpacing'] = 20;
  specs['margin'] = (isPeriod && filteredData['US'].length > 12) ? { top: 15, bottom: 85, left: specs.isSmallViewport ? 35 : 75, right: specs.isSmallViewport ? 10 : 150 } : { top: 15, bottom: 45, left: specs.isSmallViewport ? 55 : (currentState != 'US' ? 125: 75), right: specs.isSmallViewport ? 10 : 150 };
  specs['xMax'] = specs['width'] - specs.margin.left - specs.margin.right;
  specs['yMax'] = specs.height - specs.margin.top - specs.margin.bottom;
  specs['xKey'] = isPeriod ? 'index' : currentTimeframe === 'Monthly' ? 'month' : 'year';
  specs['xValues'] = isPeriod ? filteredData['US'].map(d => d.index) : filteredData['US'].map(d => currentTimeframe === 'Monthly' ? d.month : d.year);

  specs['xScale'] = scaleLinear({
    domain: [Math.min(...specs.xValues), Math.max(...specs.xValues)],
    range: [10, specs.xMax]
  });
  
  specs['yScale'] = scaleLinear({
    domain: [0, yScaleDomainPeriod], 
    range: [specs.yMax, 0],
  });

  const changePrecValues = (currentTimeframe == 'Annual' && !isPeriod) ? getChangePrecValues(filteredData, selectedDrugs, specs.xValues, specs.xKey) : [];

  const inp = [];
  inp['filteredData'] = filteredData;
  inp['stateNames'] = stateNames;
  inp['monthNames'] = monthNames;
  inp['monthNamesShort'] = monthNamesShort;
  inp['monthNamesPeriod'] = UtilityFunctions.buildMonthNamesPeriod(filteredData['US'])
  inp['monthNamesShortPeriod'] = UtilityFunctions.buildMonthNumbersPeriod(filteredData['US'])
  inp['tickIndexes'] = UtilityFunctions.getAllIndexes(inp['monthNamesShortPeriod'], 4)
  inp['currentTimeframe'] = currentTimeframe;
  inp['currentDataSource'] = currentDataSource;
  inp['currentYear'] = currentYear;
  inp['currentMonth'] = currentMonth;
  inp['currentDrug'] = currentDrug;
  inp['currentState'] = currentState;
  inp['selectedDrugs'] = selectedDrugs;
  inp['tickWidth'] = specs['xMax']/(Object.keys(inp['monthNamesShortPeriod']).length - 1);
  inp['numOfTicks'] = specs['xMax']/inp['tickWidth'];

  const generateYearLabels = () => {

    return (
      <Fragment>
        <Fragment>
            return <text y={specs.yMax + 80} x={inp['tickIndexes'].length == 0 ? ((specs.xMax + 5)/2) : ((inp['tickWidth'] *((inp['tickIndexes'][0] == 1 ? 5.5 : (inp['tickIndexes'][0] - 2)/2))) + 5)} textAnchor="middle" style={{fontWeight: 'bold'}}>{lookupPeriodStartYear}</text>
        </Fragment>
        <Fragment>
          {inp['tickIndexes'].map((yearIdx, idx) => {
            if(yearIdx > 1) {
              if (idx < (inp['tickIndexes'].length) - 1) {
                return <text y={specs.yMax + 80} x={((inp['tickWidth'] * (inp['tickIndexes'][idx] - 2)) + (inp['tickWidth'] * 6 )  + 5)} textAnchor="middle" style={{fontWeight: 'bold'}}>{inp['monthNamesShortPeriod'][yearIdx]}</text>
              }
              else
              {
                return <text y={specs.yMax + 80} x={((inp['tickWidth'] * inp['tickIndexes'][idx] - 2) + (((inp['numOfTicks'] - inp['tickIndexes'][idx] - 2) * inp['tickWidth'])/2))  + 5} textAnchor="middle" style={{fontWeight: 'bold'}}>{inp['monthNamesShortPeriod'][yearIdx]}</text>
              }
            }
            })}
        </Fragment>
      </Fragment>
    )
  }

 const getNumberOfStates = (dkey) => {

    var mon, yr;

    let str = isPeriod ? inp.monthNamesPeriod[dkey] : dkey;
    
    if (currentTimeframe === 'Monthly' && isPeriod) {
      var monYr = String(str)?.split(' ');
      mon = UtilityFunctions.getMonthNumber(monYr[0]);
      yr = monYr[1];
    }
    if (currentTimeframe === 'Monthly' && !isPeriod) {
      mon = str;
      yr = currentYear;
    }
    else if (currentTimeframe === 'Annual')
    {
      yr = dkey;
    }

    let monMain = currentTimeframe != 'Monthly' ? '00' : String(mon).padStart(2, '0');
    let key = currentDataSource + '_' + yr + monMain;
    let supportedStates = {};
    let strStates = data.supportedJurisdictions[key]?.split(',');
    if (strStates !== undefined) {
      for (const st of strStates) {
        if (!supportedStates[st]) 
          supportedStates[st] = stateNames[st]; 
      }
    }

    return Object.keys(supportedStates).length - 1;
  }

  const markYearsForTicks = () => {

    const xAxis = document?.getElementsByClassName("visx-axis-bottom")[0];
    const ticks = xAxis?.getElementsByClassName("visx-axis-tick");
    if (ticks !== undefined && ticks != null) {
      for (var i=0; i<ticks?.length; i++) {
        var tickText = ticks[i]?.childNodes[1].childNodes[0].childNodes[0].innerHTML;
        var ln = ticks[i]?.getElementsByClassName("visx-line");
        if (ln !== undefined && ln != null) {
          ln[0]?.setAttribute("y1","0");
          if (tickText == 'Dec') {
            ln[0]?.setAttribute("y1","-10");
          }
        }
      }
    } 
  }

 const adjustCrowdedLabels = () => {

  if (currentState != 'US')
    return;

    var positionsVar = [];
    const allLabels = document?.getElementsByClassName("adjustCrowded");
    if (selectedDrugs !== undefined && selectedDrugs != null) {
      for (var i=0; i<selectedDrugs?.length; i++) {
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
              drugLbl = "alldrug";
              break;
            case 'All Stimulants':
              drugLbl = "stimulant";
              break;
            case 'All Opioids':
              drugLbl = "opioid";
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
    if (isPeriod)
    {
      if (inp['numOfTicks'] > 12) {
        if (inp.monthNamesShortPeriod[val].length == 4)
          return monthNamesShort[parseInt('1')]
        else
          return monthNamesShort[parseInt(inp.monthNamesShortPeriod[val])]
      }
      else
      {
        if (val == 1 || val == Object.keys(inp.monthNamesShortPeriod).length ||  inp.monthNamesShortPeriod[val].length == 4)
        {
          if (inp.monthNamesShortPeriod[val].length == 4)
            return monthNamesShort[parseInt('1')] + ' ' + lookupPeriodEndYear;
          else 
            return monthNamesShort[parseInt(inp.monthNamesShortPeriod[val])] + ' ' + (val == 1 ? lookupPeriodStartYear : lookupPeriodEndYear);
        }
        else
          return monthNamesShort[parseInt(inp.monthNamesShortPeriod[val])];
      }
    }
    else
    {
      if (currentTimeframe === 'Monthly') {
        if (val == 1 || val == 12)
          return monthNamesShort[val] + ' ' + currentYear;
        else
          return monthNamesShort[val];
      }
      else
        return Number(val)?.toFixed(0);
    }
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

  const getCountforDrug = (drug, parmState, val) => {
    var cnt = 0;
    if (currentTimeframe === 'Annual' && !isPeriod) {
      if (parmState === 'US') {
        for (var i=0;i<Object.keys(countsDataYearly).length;i++) {
          if (countsDataYearly[i]['year'] == val && countsDataYearly[i]['drug'] === drug) {
            cnt = countsDataYearly[i]['count'];
            break;
          }
        }
      }
      else {
        for (var i=0;i<Object.keys(data.state[currentDataSource][drug]['all']).length;i++) {
          if (data.state[currentDataSource][drug]['all'][i]['state'] == parmState) {
            cnt = data.state[currentDataSource][drug]['all'][i][val];
            break;
          }
        }
      }
    }
    else if (currentTimeframe === 'Monthly' && !isPeriod) {
      if (parmState === 'US') {
          for (var i=0;i<Object.keys(countsDataMonthly).length;i++) {
            if (countsDataMonthly[i].year == currentYear && countsDataMonthly[i].month == val && countsDataMonthly[i].drug == drug) {
              cnt = countsDataMonthly[i].count;
              break;
            }
          }
        }
        else {
          for (var i=0;i<Object.keys(data.state[currentDataSource][drug][val]).length;i++) {
            if (data.state[currentDataSource][drug][val][i]['state'] == parmState)
            {
              cnt = data.state[currentDataSource][drug][val][i][currentYear];
              break;
            }
          }
        }
    }
    else if (isPeriod) {
      let arr = val.split(' ');
      let mon = UtilityFunctions.getMonthNumber(arr[0]);
      let yr = arr[1];
      if (parmState === 'US') {
          for (var i=0;i<Object.keys(countsDataMonthly).length;i++) {
            if (countsDataMonthly[i].year == yr && countsDataMonthly[i].month == mon && countsDataMonthly[i].drug == drug) {
              cnt = countsDataMonthly[i].count;
              break;
            }
          }
        }
        else {
          for (var i=0;i<Object.keys(data.state[currentDataSource][drug][mon]).length;i++) {
            if (data.state[currentDataSource][drug][mon][i]['state'] == parmState)
            {
              cnt = data.state[currentDataSource][drug][mon][i][yr];
              break;
            }
          }
        }
    }

    return cnt;
  }

  const getText = (val) => {
    if (val == 'Data not available')
      return 'Data not available/not reported';
    else if (val == 'Data suppressed*')
      return 'Data suppressed';
    else
      return '';
  }

  const getRateHTMLforDrug = (selectedDrugs, parmState, val) => {
    var leftRateStr = '';
    if (parmState == 'US') {
      for (var i in selectedDrugs) {
        if (selectedDrugs[i].includes(currentDrug)) {
          let rate = getRateforDrug(selectedDrugs[i], parmState, val);
          leftRateStr = leftRateStr + `<span class=${selectedDrugs[i] + 'ToolTip'}` + '>' + (isNaN(rate) ? getText(rate) : rate) + '</span></br>'
        }
      }
    }
    else {
      let rate = getRateforDrug(currentDrug, parmState, val);
      leftRateStr = leftRateStr + `<span class=${currentDrug + 'ToolTip'}` + '>' + (isNaN(rate) ? getText(rate) : rate) + '</span></br>'
    }
    return leftRateStr;
  }

  const getCountHTMLforDrug = (selectedDrugs, parmState, val) => {

    var leftCntStr = ''
    if (parmState == 'US') {
      for (var i in selectedDrugs) {
        if (selectedDrugs[i].includes(currentDrug)) {
          let cnt = getCountforDrug(selectedDrugs[i], parmState, val);
          leftCntStr = leftCntStr + `<span class=${selectedDrugs[i] + 'ToolTip'}` + '>' + (isNaN(cnt) ? getText(cnt) : cnt) + '</span></br>'
        }
      }
    }
    else {
      let cnt = getCountforDrug(currentDrug, parmState, val);
      leftCntStr = leftCntStr + `<span class=${currentDrug + 'ToolTip'}` + '>' + (isNaN(cnt) ? getText(cnt) : cnt) + '</span></br>'
    }
    return leftCntStr;
  }

  const getTooltipFragment = (param) => {
   
    let val = isPeriod ? inp.monthNamesPeriod[param] : param;
    let numStates = getNumberOfStates(param)
    var leftComStr = `<table><tr><td><p><strong>Overall</strong>` + '</br>' + '(' + numStates + ' Jurisdictions)' + '</p></td></tr>';
    var leftRateStr = `<tr><td><p><strong>Rate</strong>` + '</br>' + getRateHTMLforDrug(inp.selectedDrugs, 'US', val) + '</p></td></tr>';
    var leftCountStr = `<tr><td><p><strong>Count</strong>` + '</br>' + getCountHTMLforDrug(inp.selectedDrugs, 'US', val) + '</p></td></tr></table>';
    var leftStr = leftComStr + leftRateStr + leftCountStr;
    var rightComStr = `<table><tr><td><p class='whSpace'><strong>` + inp.stateNames[inp.currentState] + '</strong></br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</p></td></tr>';
    var rightRateStr = `<tr><td><p><strong>Rate</strong>` + '</br>' + getRateHTMLforDrug(inp.selectedDrugs, inp.currentState, val) + '</p></td></tr>';
    var rightCountStr = `<tr><td><p><strong>Count</strong>` + '</br>' + getCountHTMLforDrug(inp.selectedDrugs, inp.currentState, val) + '</p></td></tr></table>';
    var rightStr = rightComStr + rightRateStr + rightCountStr;
    var heading = '<div class="tooltipTableLCCenter alignCenter"><h3 style="margin: 0; padding: 0;"><strong>' + (currentTimeframe === 'Annual' ? (val + ' </br>') : ((isPeriod ? val : inp.monthNames[val] + ' ' + inp.currentYear) + ' </br>') ) + '</strong></h3><span>' + '</span></div>';

    return heading + '<table class="tooltipTableLCCenter"><tr><td><div class="containerTT"><div class="col left alignCenter">' + leftStr + '</div><div class="col right alignCenter">' + rightStr + '</div></div></td></tr></table>'
  }

  const getTooltipFragmentPerc = (drug, yr, st) => {

    var rec;
    var perc = 0;
    var diff;
    var tooltipHtml;

    for (var i=0; i<changePrecValues?.length; i++) {
      if (changePrecValues[i].yr == yr && changePrecValues[i].drug == drug && changePrecValues[i].state == st) {
        rec = changePrecValues[i];
        break
      }
    }

    if (rec != null && !isNaN(rec.valPrev)) {
      if (rec.value != rec.valPrev) {
          diff =  rec.value - rec.valPrev;
          perc = ((diff / rec.valPrev) * 100)
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
          if (vals[i]?.includes(drug))
            sortedToolTips.push(vals[i]);
        }
      })
    }
    return sortedToolTips;
  }
  
  const buildToolTipValues = (sectionWidth, sectionWidthHalf) => {
    return (
      <Fragment>
        {
          inp.filteredData['US'].map(d => {

            if (inp.currentState === 'US') {
              let numStates = getNumberOfStates(d[specs.xKey])
              let cntC = getCountforDrug(currentDrug, 'US', currentTimeframe == 'Annual' ? d['year'] : (!isPeriod ? d['month'] : inp.monthNamesPeriod[d['index']]));
              var tooltipValues = [];
              if (!currentDrugOnly) {
                tooltipValues.push(`<p><strong class=${currentDrug + 'ToolTip'}>` + drugOptions[currentDrug].titleForDropDown + ` Overall Rate</strong>: ${d[currentDrug]} (${numStates} Jurisdictions)</p>`);
                tooltipValues.push(`<p><strong class=${currentDrug + 'ToolTip'}>` + drugOptions[currentDrug].titleForDropDown + ` Overall Count</strong>: ${cntC} (${numStates} Jurisdictions)</p>`);
              }

              if (inp.selectedDrugs.length > 0) {
                  for (var i in inp.selectedDrugs) {
                    let cntS = getCountforDrug(inp.selectedDrugs[i], 'US', currentTimeframe == 'Annual' ? d['year'] : (!isPeriod ? d['month'] : inp.monthNamesPeriod[d['index']]));
                    if (!inp.selectedDrugs[i].includes(currentDrug)){
                      tooltipValues.push(!currentDrugOnly ? `<p><strong class=${inp.selectedDrugs[i] + 'ToolTip'}>` + drugOptions[inp.selectedDrugs[i]].titleForDropDown + ` Overall Rate</strong>: ${d[inp.selectedDrugs[i]]} (${numStates} Jurisdictions)</p>` : null);
                      tooltipValues.push(!currentDrugOnly ? `<p><strong class=${inp.selectedDrugs[i] + 'ToolTip'}>` + drugOptions[inp.selectedDrugs[i]].titleForDropDown + ` Overall Count</strong>: ${cntS} (${numStates} Jurisdictions)</p>` : null);
                    }
                  }
              }
            }
            
            let tooltipValuesSorted = sortToolTipValues(tooltipValues)

            return <rect
              key={`tooltip-section-${d[specs.xKey]}`}
              className={''}
              x={Math.max(0, specs.xScale(d[specs.xKey]) - sectionWidthHalf)}
              y={0}
              width={sectionWidth}
              height={specs.yMax}
              style={{outline: 'none'}}
              fill='transparent'
              data-tip={inp.currentState !== 'US' ? getTooltipFragment(d[specs.xKey]) : `<table class='tooltipTableLC'><tr><td><span class='toolTipSpanLC'><strong>${isPeriod ? `${inp.monthNamesPeriod[d[specs.xKey]]}` : inp.currentTimeframe === 'Monthly' ? `${inp.monthNames[d[specs.xKey]]} ${inp.currentYear}` : d[specs.xKey]}</strong></span>${tooltipValuesSorted.join('')}</td></tr></table>`}></rect>
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
                    if (d.year != supportedYears[0]) {
                      return <rect
                        key={`tooltip-section-${d[specs.xKey]}`}
                        x={Math.max(0, specs.xScale(d[specs.xKey]) -10)}
                        y={specs.yScale(d[drug]) - 10}
                        width={20}
                        height={20}
                        style={{outline: 'none'}}
                        fill='transparent'
                        data-tip={getTooltipFragmentPerc(drug, d.year, key)}></rect>
                    }
                })
              }
              </Fragment>
            )
        })
      }
      </Fragment>
    )
  }

  const buildPercentChartInd = (percentChgDrug, percentChgYear, percentChgValue, percentState, yearMon) => {

    if (currentTimeframe === 'Annual' && !isPeriod) {
      if (percentChgYear != supportedYears[0]) {
      return (
        <QuickStat
            colorScale={colorScale}
            defaultValueIfEmpty={defaultValueIfEmpty}
            value={percentChgValue}
            text={(percentChgValue > 0 ? 'Increase' : 'Decrease') + ' in the rate of ' + (currentDataSource === 'ED' ? 'ED visits' : 'inpatient hospitalizations') + ' for nonfatal ' + percentChgDrug.replace('alldrug', 'all drug') + ' overdoses, ' + percentState + ', ' + percentChgYear + ' vs. ' + String((parseInt(percentChgYear) - 1))}
            label={percentChgDrug}
            timeframe={'year'}
        ></QuickStat>
        ); 
      }
    }
  }

  function getLastKnownDataPoint() {
    let val = 0;
    for (var i=inp.filteredData[inp.currentState].length - 1;i>0;i--)
    {
      if (!isNaN(inp.filteredData[inp.currentState][i][currentDrug])) {
        val = inp.filteredData[inp.currentState][i][currentDrug];
        break;
      }
    }
    return val;
  }

  function getSymbol(val) {
    if (val == 'Data not available')
      return '†';
    else if (val == 'Data suppressed*')
      return '*';
    else
      return '';
  }

  function getYValue(d, currentDrug) {
    var val = specs.yScale(d[currentDrug]) ?? 0;
    if (val != 0)
    {
      if (Number(d[currentDrug]) == 0)
        return specs.yScale(0)-14;
      else
        return specs.yScale(d[currentDrug]);
    }
    return 0;
  }

  function lastValuesSame() {
    var stVal = inp.filteredData[currentState][inp.filteredData[currentState].length - 1][currentDrug];
    var usVal = inp.filteredData['US'][inp.filteredData[currentState].length - 1][currentDrug];

    if (stVal == usVal)
      return true;
    else
      return false;
  }

  function narrowPoints(xval) {

    const usVal = inp.filteredData['US'].find(d => d[specs.xKey] === xval) || {};
    const stVal = inp.filteredData[currentState].find(d => d[specs.xKey] === xval) || {};
    const usValF = parseFloat(specs.yScale(parseFloat(usVal[currentDrug])));
    const stValF = parseFloat(specs.yScale(parseFloat(stVal[currentDrug])));

    var diff;
    if (usValF > stValF)
      diff = usValF - stValF;
    else
      diff = stValF - usValF;

    if (diff <= 15)
      return true;
    else
      return false;
  }

  function higherValue(xval) {

    const usVal = inp.filteredData['US'].find(d => d[specs.xKey] === xval) || {};
    const stVal = inp.filteredData[currentState].find(d => d[specs.xKey] === xval) || {};
    if (parseFloat(usVal[currentDrug]) > parseFloat(stVal[currentDrug]))
      return 'US';
    else
      return currentState;
  }
  
  const buildLineForDrug = (currentDrug) => {

    const sectionWidth = specs.xMax / specs.xValues.length;
    const sectionWidthHalf = sectionWidth / 2;

    const seriesLabelPositionUS = specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1][currentDrug]);
    const valueState = inp.filteredData[inp.currentState].length > 0 ? inp.filteredData[inp.currentState][inp.filteredData[inp.currentState].length - 1][currentDrug] : 'Data suppressed*';
    const seriesLabelPositionState = valueState === 'Data suppressed*' ? getLastKnownDataPoint() == 0 ? specs.yScale(0) - 30 : specs.yScale(getLastKnownDataPoint()) : specs.yScale(valueState);
    
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
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && key == 'US') && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={getYValue(d, currentDrug)} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={getYValue(dNext, currentDrug)} stroke={UtilityFunctions.getSeriesColorLine(currentDrug, key, true)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && key != 'US') && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={getYValue(d, currentDrug)} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={getYValue(dNext, currentDrug)} stroke={UtilityFunctions.getSeriesColorLine(currentDrug, key, false)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && key == 'US') && currentState == 'US' &&
                            <text 
                              x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} 
                              y={specs.yScale(d[currentDrug])-8}
                              stroke={''} fill={''} 
                              fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>
                                {showLabels ? d[currentDrug] : ''}
                            </text>
                          }
                          {(!isNaN(d[currentDrug]) && key == 'US') && currentState != 'US' && showLabels && 
                            <text 
                              x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} 
                              y={!narrowPoints(xVal) ? specs.yScale(d[currentDrug])-8 : (higherValue(xVal) == 'US' ? specs.yScale(d[currentDrug])-16 : specs.yScale(d[currentDrug])+28)} 
                              stroke={''} fill={''} 
                              fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>
                                {showLabels ? d[currentDrug] : ''}
                            </text>
                          }
                          {(!isNaN(d[currentDrug]) && key == 'US' && currentState != 'US' && narrowPoints(xVal)) && showLabels && 
                            <line
                              x1={specs.xScale(d[specs.xKey])}
                              y1={specs.yScale(d[currentDrug])}
                              x2={specs.xScale(d[specs.xKey])}
                              y2={higherValue(xVal) == 'US' ? specs.yScale(d[currentDrug])-16 : specs.yScale(d[currentDrug]) + 18}
                              stroke="#666"
                              strokeWidth={0.7}
                              strokeDasharray="2,2"
                              opacity={0.6}
                          />
                          }
                          {(isNaN(d[currentDrug]) && key == 'US') && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(0)-8} stroke={''} fill={''} fontSize={16} textAnchor={'middle'}>{getSymbol(d[currentDrug])}</text>}
                          {(!isNaN(d[currentDrug]) && key == 'US') && <Circle cx={specs.xScale(d[specs.xKey])} cy={Number(d[currentDrug]) == 0 ? (specs.yScale(0)-14) : (specs.yScale(d[currentDrug]))} r={currentTimeframe === 'Monthly' ? 4: 5} fill={currentTimeframe === 'Monthly' && d[specs.xKey] == currentMonth ? 'orange' : UtilityFunctions.getSeriesColorLine(currentDrug, key, true)} />}
                          {(!isNaN(d[currentDrug]) && key != 'US') && currentState == 'US' &&
                            <text 
                              x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} 
                              y={specs.yScale(d[currentDrug])-8}
                              stroke={'lightblue'} fill={'lightblue'} 
                              fontSize={12} 
                              textAnchor={i == 0 ? 'right' : 'middle'}>
                              {showLabels ? d[currentDrug] : ''}
                            </text>
                          }
                          {(!isNaN(d[currentDrug]) && key != 'US') && currentState != 'US' && showLabels && 
                            <text 
                              x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} 
                              y={!narrowPoints(xVal) ? (d[currentDrug] == '0.0' ? specs.yScale(d[currentDrug])-22 : specs.yScale(d[currentDrug])-8) : (higherValue(xVal) == currentState ? specs.yScale(d[currentDrug])-16 : specs.yScale(d[currentDrug])+28)}
                              stroke={'lightblue'} fill={'lightblue'} 
                              fontSize={12} 
                              textAnchor={i == 0 ? 'right' : 'middle'}>
                              {showLabels ? d[currentDrug] : ''}
                            </text>
                          }
                          {(!isNaN(d[currentDrug]) && key != 'US' & narrowPoints(xVal)) && currentState != 'US' && showLabels && 
                            <line
                              x1={specs.xScale(d[specs.xKey])}
                              y1={specs.yScale(d[currentDrug])}
                              x2={specs.xScale(d[specs.xKey])}
                              y2={higherValue(xVal) == currentState ? specs.yScale(d[currentDrug])-16 : specs.yScale(d[currentDrug]) + 18}
                              stroke="#666"
                              strokeWidth={0.7}
                              strokeDasharray="2,2"
                              opacity={0.6}
                          />
                          }
                          {(isNaN(d[currentDrug]) && key != 'US') && 
                          <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(0)-8} fontSize={16} textAnchor={'middle'}>{getSymbol(d[currentDrug])}</text>}
                          {(!isNaN(d[currentDrug]) && key != 'US') && 
                          <Circle cx={specs.xScale(d[specs.xKey])} cy={Number(d[currentDrug]) == 0 ? (specs.yScale(0)-14) : (specs.yScale(d[currentDrug]))} r={currentTimeframe === 'Monthly' ? 4: 5} fill={currentTimeframe === 'Monthly' && d[specs.xKey] == currentMonth ? 'orange' : UtilityFunctions.getSeriesColorLine(currentDrug, key, false)} />}
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
                          return (<Group>
                            <text 
                            x={specs.xMax + 25} 
                            y={yPos}
                            alignmentBaseline="middle" 
                            fontSize={specs.fontSize} 
                            fill={UtilityFunctions.getSeriesColorLine(currentDrug, key, false)}>
                              {key != 'US' ? inp.stateNames[key] : 'Overall'}
                          </text>
                          {lastValuesSame() && key != 'US' && <line
                                id={`line-leading-${currentDrug}`}
                                x1={specs.xMax + 4}
                                y1={yPos - specs.seriesOverlapMargin}
                                x2={specs.xMax + 25} 
                                y2={yPos}
                                stroke={UtilityFunctions.getSeriesColorLine(currentDrug, key, false)}
                                strokeWidth={0.5}/>}
                          </Group>
                            )
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
                                fill={UtilityFunctions.getSeriesColorLine(currentDrug, key,true)}>
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
          data={AccessibilityFunctions.generateLineChartData(filteredData, currentDrug, selectedDrugs, currentState, stateNames, currentTimeframe, showPercent, changePrecValues)}
          labelOverrides={ !showPercent ? {
            'alldrug': 'All Drugs',
            'benzodiazepine': 'Benzodiazepine',
            'cocaine': 'Cocaine',
            'heroin': 'Heroin',
            'methamphetamine': 'Methamphetamine',
            'opioid': 'All Opioids',
            'stimulant': 'All Stimulants',
            'fentanyl': 'Fentanyl',
            'Overall': 'Overall rate',
            'state' : currentStaterate,
            'Year/Month': currentTimeframe == 'Monthly' ? 'Month and Year' : 'Year',
          } : {
            'alldrug': 'All Drugs rate',
            'benzodiazepine': 'Benzodiazepine rate',
            'cocaine': 'Cocaine rate',
            'heroin': 'Heroin rate',
            'methamphetamine': 'Methamphetamine rate',
            'opioid': 'All Opioids rate',
            'stimulant': 'All Stimulants rate',
            'fentanyl': 'Fentanyl rate',
            'Overall': 'Overall rate',
            'alldrug_pct': 'All Drugs %change in rate',
            'benzodiazepine_pct': 'Benzodiazepine %change in rate',
            'cocaine_pct': 'Cocaine %change in rate',
            'heroin_pct': 'Heroin %change in rate',
            'methamphetamine_pct': 'Methamphetamine %change in rate',
            'opioid_pct': 'All Opioids %change in rate',
            'stimulant_pct': 'All Stimulants %change in rate',
            'fentanyl_pct': 'Fentanyl %change in rate',
            'Overall_pct': 'Overall %change in rate',
            'state' : currentStaterate,
            'state_pct' : currentStatePctChange,
            'Year/Month': currentTimeframe == 'Monthly' ? 'Month and Year' : 'Year',
          }}
          xAxisKey={'Year/Month'}
          transforms={{
            rate: num => UtilityFunctions.toFixed(num)
          }}
          width={width}
          colSpan={!showPercent ? ((currentState == 'US' ? (!showPercent ? selectedDrugs.length : (selectedDrugs.length * 2)) : (!showPercent ? 2: 4))) : null}
          isSmallViewport={specs['isSmallViewport']}
          supScript={showPercent ?'§': ''}
        />
        {(currentDrug == 'fentanyl' || selectedDrugs.includes('fentanyl')) &&
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span><small><i>Note: Fentanyl data are displayed beginning in October 2020, reflecting the introduction of the ICD-10-CM code for fentanyl-involved poisoning (T40.41). Counts and rates for this indicator are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T40.41 ICD-10-CM code as there was no way to code fentanyl-involved poisonings.</i></small></span></div>
              </td>
            </tr>
          </table>
          }
          {(currentDrug == 'methamphetamine' || selectedDrugs.includes('methamphetamine')) &&
            <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span><small><i>Note: Data on methamphetamine are shown starting in October 2022, when the ICD-10-CM code for methamphetamine-involved poisoning (T43.65) was introduced. Counts and rates for these indicators are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T43.65 ICD-10-CM code as there was no way to code methamphetamine-involved poisonings.</i></small></span></div>
              </td>
            </tr>
          </table>
         }
        </>        
      ) : (
      <table style={{width: '100%'}}>
        <tr>
          <td style={{width: '85%'}}>
            <svg style={{height: specs.height, width: '100%'}}>
              <Group top={specs.margin.top} left={specs.margin.left}>
                {buildLineForDrug(currentDrug)}
                {inp.selectedDrugs.includes('alldrug') && currentDrug != 'alldrug' && currentState === 'US' && buildLineForDrug('alldrug')}
                {inp.selectedDrugs.includes('opioid') && currentDrug != 'opioid' && currentState === 'US' && buildLineForDrug('opioid')}
                {inp.selectedDrugs.includes('heroin') && currentDrug != 'heroin' && currentState === 'US' && buildLineForDrug('heroin')}
                {inp.selectedDrugs.includes('stimulant') && currentDrug != 'stimulant' && currentState === 'US' && buildLineForDrug('stimulant')}
                {inp.selectedDrugs.includes('benzodiazepine') && currentDrug != 'benzodiazepine' && currentState === 'US' && buildLineForDrug('benzodiazepine')}
                {inp.selectedDrugs.includes('fentanyl') && currentDrug != 'fentanyl' && currentState === 'US' && buildLineForDrug('fentanyl')}
                {inp.selectedDrugs.includes('cocaine') && currentDrug != 'cocaine' && currentState === 'US' && buildLineForDrug('cocaine')}
                {inp.selectedDrugs.includes('methamphetamine') && currentDrug != 'methamphetamine' && currentState === 'US' && buildLineForDrug('methamphetamine')}
                
                <AxisLeft
                  scale={specs.yScale}
                  tickLabelProps={() => ({
                    fontSize: specs.fontSize,
                    textAnchor: 'end',
                    dx: -5,
                    dy: 5
                  })}
                />
                {!specs.isSmallViewport && <text width={specs.yMax} x={specs.margin.left / -2} y={specs.yMax / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', transformOrigin: `-${specs.margin.left / 2}px ${specs.yMax / 2}px`}}>Rate per 100,000 persons<tspan baselineShift="super" fontSize="10">5</tspan></text>}
                <AxisBottom
                  top={specs.yMax}
                  scale={specs.xScale}
                  tickValues={currentTimeframe === 'Monthly' && specs.isSmallViewport ? lessMonths(filteredData['US'].map(d => d[specs.xKey])) : (isPeriod ? filteredData['US'].map(d => d[specs.xKey]) : filteredData['US'].map(d => d[specs.xKey]))}
                  tickFormat={value => 
                      getFormattedValue(value)
                  }
                  tickLabelProps={(value) => ({
                    fontSize: inp['numOfTicks'] > 60 ? specs.fontSize - 4 : specs.fontSize,
                    textAnchor: (isPeriod ? (inp['numOfTicks'] <= 12 ? 'middle' : 'end') : 'middle'),
                    angle: (specs.isSmallViewport ? 90 : (isPeriod ? (inp['numOfTicks'] <= 12 ? 0 : -90) : 0)),
                  })}
                  labelProps={{
                    fontSize: specs.fontSize,
                    textAnchor: 'middle'
                  }}
                >
                </AxisBottom>
                {(isPeriod && inp['numOfTicks'] > 12) && generateYearLabels()}
              </Group>

            </svg>
          {(currentDrug == 'fentanyl' || selectedDrugs.includes('fentanyl')) &&
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span><small><i>Note: Fentanyl data are displayed beginning in October 2020, reflecting the introduction of the ICD-10-CM code for fentanyl-involved poisoning (T40.41). Counts and rates for this indicator are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T40.41 ICD-10-CM code as there was no way to code fentanyl-involved poisonings.</i></small></span></div>
              </td>
            </tr>
          </table>
          }
          {(currentDrug == 'methamphetamine' || selectedDrugs.includes('methamphetamine')) &&
            <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span><small><i>Note: Data on methamphetamine are shown starting in October 2022, when the ICD-10-CM code for methamphetamine-involved poisoning (T43.65) was introduced. Counts and rates for these indicators are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T43.65 ICD-10-CM code as there was no way to code methamphetamine-involved poisonings.</i></small></span></div>
              </td>
            </tr>
          </table>
         }
        </td>
      </tr>
      </table>
      )}
      {/* {(!accessible && specs.isSmallViewport) && (
        <div id="line-chart-legend-container">
          <div id="line-chart-legend">
            {Object.keys(filteredData).map((key, i) =>
              <div key={`line-series-${key}`}>
                <span fontSize={specs.fontSize} style={{color: UtilityFunctions.getSeriesColor(currentDrug, key, !currentDrugOnly)}}>- {stateNames[key]}</span>
              </div>
            )}
          </div>
        </div>
      )} */}
    </>
    )

}

export default LineChart