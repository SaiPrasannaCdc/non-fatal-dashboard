import {React, Fragment, useState, useEffect} from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { Circle } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { UtilityFunctions } from '../utility'
import QuickStat from './quickStat';
import ReactDOMServer from 'react-dom/server';

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

export const colorScale = {
  'alldrug': '#2B2D73',
  'opioid': '#4A2866',
  'heroin': '#353535',
  'stimulant': '#24574E',
  'benzodiazepine': '#573325',
  'fentanyl': '#8C5EA7',
  'cocaine': '#357F70',
  'methamphetamine': '#357F70'
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
        Object.keys(data[currentDataSource][drug][year]['all']['count']).forEach(rec => {
          var femCnt = isNaN(data[currentDataSource][drug][year]['all']['count'][rec]['F']) ? 0 : Number(data[currentDataSource][drug][year]['all']['count'][rec]['F']);
          var maleCnt = isNaN(data[currentDataSource][drug][year]['all']['count'][rec]['M']) ? 0 : Number(data[currentDataSource][drug][year]['all']['count'][rec]['M']);
          cnt = Number(cnt) + Number(femCnt) + Number(maleCnt);
        })
        arr.push({
          year: year,
          drug: drug,
          count: cnt,
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
          Object.keys(data[currentDataSource][drug][year][mon]['count']).forEach(rec => {
            var femCnt = isNaN(data[currentDataSource][drug][year][mon]['count'][rec]['F']) ? 0 : Number(data[currentDataSource][drug][year][mon]['count'][rec]['F']);
            var maleCnt = isNaN(data[currentDataSource][drug][year][mon]['count'][rec]['M']) ? 0 : Number(data[currentDataSource][drug][year][mon]['count'][rec]['M']);
            cnt = Number(cnt) + Number(femCnt) + Number(maleCnt);
          })
          arr.push({
            year: year,
            month: mon,
            drug: drug,
            count: cnt,
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

  const { data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear: currentYearUntyped, currentMonth, width, stateDropdownOptions, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth, showLabels, showPercent, isPeriod, currentDrugOnly, supportedYears, selectedDrugs } = params;

  const currentYear = parseInt(currentYearUntyped);

  const filteredData = {
    [currentState]: isPeriod ? getFilteredDataPeriod(data, currentDataSource, currentState, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if (currentState !== 'US') 
    filteredData['US'] = isPeriod ? getFilteredDataPeriod(data, currentDataSource, 'US', lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(data, currentTimeframe, currentDataSource, 'US', currentYear)

  const countsDataYearly = getCountsYearly(data.sex, currentDataSource, drugOptions);
  const countsDataMonthly = getCountsMonthly(data.sex, currentDataSource, drugOptions);
  
  const yScaleDomainPeriod = (UtilityFunctions.calculateYScaleDomain(filteredData, currentDrug, selectedDrugs, currentState) * 1.2);

  useEffect(() => {
    markYearsForTicks()
  });

  const specs = [];
  specs['width'] = currentState === 'US' ? (width - 250) : width;
  specs['width'] = specs['width'];
  specs['isSmallViewport'] = specs['width'] < 500;
  specs['fontSize'] = 16;
  specs['height'] = 400;
  specs['seriesOverlapMargin'] = 20;
  specs['seriesSpacing'] = 20;
  specs['margin'] = isPeriod ? { top: 15, bottom: 85, left: 65, right: specs.isSmallViewport ? 10 : 150 } : { top: 15, bottom: 45, left: 65, right: specs.isSmallViewport ? 10 : 150 };
  specs['xMax'] = specs['width'] - specs.margin.left - specs.margin.right;;
  specs['yMax'] = specs.height - specs.margin.top - specs.margin.bottom;;
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

  const getRateforDrug = (drug, currentState, val) => {

    var rate;
    if (currentTimeframe === 'Annual' && !isPeriod) {
      if (currentState === 'US') {
        for (var i=0;i<Object.keys(inp.filteredData['US']).length;i++) {
          if (inp.filteredData['US'][i]['year'] == val) {
            rate = inp.filteredData['US'][i][drug]
            break;
          }
        }
      }
      else {
          let stateValue = inp.filteredData[currentState].find(d2 => d2[specs.xKey] === val);
          if (stateValue)
              rate = stateValue[drug];
      }
    }
    else if (currentTimeframe === 'Monthly' && !isPeriod) {
      if (currentState === 'US') {
            rate = inp.filteredData['US'][val-1][drug]
      }
      else {
          let stateValue = inp.filteredData[currentState].find(d2 => d2[specs.xKey] === val);
          if (stateValue)
              rate = stateValue[drug];
      }
    }
    else if (isPeriod) {
      let arr = val.split(' ');
      let mon = String(UtilityFunctions.getMonthNumber(arr[0])).padStart(2, '0');;
      let yr = arr[1];
      if (currentState === 'US') {
        for (var i=0; i<inp.filteredData['US'].length;i++) {
          if (inp.filteredData['US'][i].year == String(yr) + String(mon)) {
            rate = inp.filteredData['US'][i][drug];
            break;
          }
        }
      }
      else {
        for (var i=0; i<inp.filteredData[currentState].length;i++) {
          if (inp.filteredData[currentState][i].year == String(yr) + String(mon)) {
            rate = inp.filteredData[currentState][i][drug];
            break;
          }
        }
      }
    }

    return rate;
  }

  const getCountforDrug = (drug, currentState, val) => {
    var cnt = 0;
    if (currentTimeframe === 'Annual' && !isPeriod) {
      if (currentState === 'US') {
        for (var i=0;i<Object.keys(countsDataYearly).length;i++) {
          if (countsDataYearly[i]['year'] == val && countsDataYearly[i]['drug'] === drug) {
            cnt = countsDataYearly[i]['count'];
            break;
          }
        }
      }
      else {
        for (var i=0;i<Object.keys(data.state[currentDataSource][drug]['all']).length;i++) {
          if (data.state[currentDataSource][drug]['all'][i]['state'] == currentState) {
            cnt = data.state[currentDataSource][drug]['all'][i][val];
            break;
          }
        }
      }
    }
    else if (currentTimeframe === 'Monthly' && !isPeriod) {
      if (currentState === 'US') {
          for (var i=0;i<Object.keys(countsDataMonthly).length;i++) {
            if (countsDataMonthly[i].year == currentYear && countsDataMonthly[i].month == val && countsDataMonthly[i].drug == drug) {
              cnt = countsDataMonthly[i].count;
              break;
            }
          }
        }
        else {
          for (var i=0;i<Object.keys(data.state[currentDataSource][drug][val]).length;i++) {
            if (data.state[currentDataSource][drug][val][i]['state'] == currentState)
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
      if (currentState === 'US') {
          for (var i=0;i<Object.keys(countsDataMonthly).length;i++) {
            if (countsDataMonthly[i].year == yr && countsDataMonthly[i].month == mon && countsDataMonthly[i].drug == drug) {
              cnt = countsDataMonthly[i].count;
              break;
            }
          }
        }
        else {
          for (var i=0;i<Object.keys(data.state[currentDataSource][drug][mon]).length;i++) {
            if (data.state[currentDataSource][drug][mon][i]['state'] == currentState)
            {
              cnt = data.state[currentDataSource][drug][mon][i][yr];
              break;
            }
          }
        }
    }

    return cnt;
  }

  const getRateHTMLforDrug = (selectedDrugs, currentState, val) => {
    var leftRateStr = '';
    if (!currentDrugOnly) {
      for (var i in selectedDrugs) {
        let rate = getRateforDrug(selectedDrugs[i], currentState, val);
        leftRateStr = leftRateStr + `<span class=${selectedDrugs[i] + 'ToolTip'}` + '>' + (isNaN(rate) ? 0 : rate) + '</span></br>'
      }
    }
    else {
      let rate = getRateforDrug(currentDrug, currentState, val);
        leftRateStr = leftRateStr + `<span class=${currentDrug + 'ToolTip'}` + '>' + (isNaN(rate) ? 0 : rate) + '</span></br>'
    }
    return leftRateStr;
  }

  const getCountHTMLforDrug = (selectedDrugs, currentState, val) => {

    var leftCntStr = ''
    if (!currentDrugOnly) {
      for (var i in selectedDrugs) {
        let cnt = getCountforDrug(selectedDrugs[i], currentState, val);
        leftCntStr = leftCntStr + `<span class=${selectedDrugs[i] + 'ToolTip'}` + '>' + (isNaN(cnt) ? 0 : cnt) + '</span></br>'
      }
    }
    else {
      let cnt = getCountforDrug(currentDrug, currentState, val);
      leftCntStr = leftCntStr + `<span class=${currentDrug + 'ToolTip'}` + '>' + (isNaN(cnt) ? 0 : cnt) + '</span></br>'
    }
    return leftCntStr;
  }

  const getTooltipFragment = (inp, val) => {

    var leftComStr = `<table><tr><td><p><strong>Overall</strong>` + '</br>(' + (stateDropdownOptions.length - 1) + ' States)</p></td></tr>';
    var leftRateStr = `<tr><td><p><strong>Rate</strong>` + '</br>' + getRateHTMLforDrug(inp.selectedDrugs, 'US', val) + '</p></td></tr>';
    var leftCountStr = `<tr><td><p><strong>Count</strong>` + '</br>' + getCountHTMLforDrug(inp.selectedDrugs, 'US', val) + '</p></td></tr></table>';
    var leftStr = leftComStr + leftRateStr + leftCountStr;
    var rightComStr = `<table><tr><td><p><strong>` + inp.stateNames[inp.currentState] + '</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</strong></p></td></tr>';
    var rightRateStr = `<tr><td><p><strong>Rate</strong>` + '</br>' + getRateHTMLforDrug(inp.selectedDrugs, inp.currentState, val) + '</p></td></tr>';
    var rightCountStr = `<tr><td><p><strong>Count</strong>` + '</br>' + getCountHTMLforDrug(inp.selectedDrugs, inp.currentState, val) + '</p></td></tr></table>';
    var rightStr = rightComStr + rightRateStr + rightCountStr;
    var heading = '<div class="tooltipTableLC alignCenter"><h3 style="margin: 0; padding: 0;"><strong>' + (currentTimeframe === 'Annual' ? ('Year <br>' + val + ' </br>') : ('Month </br>' + (isPeriod ? val : inp.monthNames[val] + ' ' + inp.currentYear) + ' </br>') )+ '</strong></h3></div>';

    return heading + '<table class="tooltipTableLC"><tr><td><div class="containerTT"><div class="col left alignCenter">' + leftStr + '</div><div class="col right alignCenter">' + rightStr + '</div></div></td></tr></table>'
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

    if (rec != null) {
      if (rec.value != rec.valuePrev) {
          diff =  rec.value - rec.valPrev;
          perc = ((diff / rec.valPrev) * 100)
      }

      tooltipHtml = ReactDOMServer.renderToString(buildPercentChartInd(rec.drug, rec.yr, perc, stateNames[rec.state], rec.yearmon))

      return '<table><tr><td><div class="toolTipChgPerc">' + tooltipHtml + '</div></td></tr></table>'
    }
    return '';
  }

  const buildToolTipValues = (sectionWidth, sectionWidthHalf) => {
    return (
      <Fragment>
        {
          inp.filteredData['US'].map(d => {

            var tooltipValues = !currentDrugOnly ? [`<p><strong class=${currentDrug + 'ToolTip'}>Overall Rate</strong>: ${d[currentDrug]} (${stateDropdownOptions.length - 1} states)</p>`] : [];
            if (inp.currentState !== 'US') {
              let stateValue = inp.filteredData[inp.currentState].find(d2 => d2[specs.xKey] === d[specs.xKey]);
              if(stateValue) {
                stateValue = stateValue[currentDrug];
              } else {
                stateValue = 'Data not available/not reported'
              }
              tooltipValues.push(`<p><strong class=${currentDrug + 'ToolTip'}>${inp.stateNames[inp.currentState]} Rate</strong>: ${stateValue}</p>`);
            }

            if (inp.selectedDrugs.length > 0) {
                tooltipValues = !currentDrugOnly ? [`<p><strong class=${inp.selectedDrugs[0] + 'ToolTip'}>Overall Rate</strong>: ${d[inp.selectedDrugs[0]]} (${stateDropdownOptions.length - 1} states)</p>`] : [];
                if (inp.currentState !== 'US') {
                  let stateValue = inp.filteredData[inp.currentState].find(d2 => d2[specs.xKey] === d[specs.xKey]);
                  if(stateValue){
                    stateValue = stateValue[inp.selectedDrugs[0]];
                  } else {
                    stateValue = 'Data not available/not reported'
                  }
                  tooltipValues.push(`<p><strong class=${inp.selectedDrugs[0] + 'ToolTip'}>${inp.stateNames[inp.currentState]} Rate</strong>: ${stateValue}</p>`);
                }
                for (var i in inp.selectedDrugs) {
                  if (i > 0){
                    tooltipValues.push(!currentDrugOnly ? [`<p><strong class=${inp.selectedDrugs[i] + 'ToolTip'}>Overall Rate</strong>: ${d[inp.selectedDrugs[i]]} (${stateDropdownOptions.length - 1} states)</p>`] : null);
                    if (inp.currentState !== 'US') {
                      let stateValue = inp.filteredData[inp.currentState].find(d2 => d2[specs.xKey] === d[specs.xKey]);
                      if (stateValue) {
                        stateValue = stateValue[inp.selectedDrugs[i]];
                      } else {
                        stateValue = 'Data not available/not reported'
                      }
                      tooltipValues.push(`<p><strong class=${inp.selectedDrugs[i] + 'ToolTip'}>${inp.stateNames[inp.currentState]} Rate</strong>: ${stateValue}</p>`);
                    }
                  }
                }
            }

            return <rect
              key={`tooltip-section-${d[specs.xKey]}`}
              className={''}
              x={Math.max(0, specs.xScale(d[specs.xKey]) - sectionWidthHalf)}
              y={0}
              width={sectionWidth}
              height={specs.yMax}
              style={{outline: 'none'}}
              fill='transparent'
              data-tip={inp.currentState !== 'US' ? (isPeriod ? getTooltipFragment(inp, inp.monthNamesPeriod[d[specs.xKey]]) : getTooltipFragment(inp, d[specs.xKey])) : `<table class='tooltipTableLC'><tr><td><h3><strong>${isPeriod ? `${inp.monthNamesPeriod[d[specs.xKey]]}` : inp.currentTimeframe === 'Monthly' ? `${inp.monthNames[d[specs.xKey]]} ${inp.currentYear}` : d[specs.xKey]}</strong></h3>${tooltipValues.join('')}</td></tr></table>`}></rect>
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
                        x={Math.max(0, specs.xScale(d[specs.xKey]) - 5 - 15)}
                        y={specs.yScale(d[drug]) - 20}
                        width={40}
                        height={40}
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
            text={(percentChgValue > 0 ? 'Increase' : 'Decrease') + ' in the number of ' + (currentDataSource === 'ED' ? 'ED visits' : 'inpatient hospitalizations') + ' for nonfatal ' + percentChgDrug + ' overdoses, ' + percentState + ', ' + percentChgYear + ' vs. ' + String((parseInt(percentChgYear) - 1))}
            label={percentChgDrug}
            timeframe={'year'}
        ></QuickStat>
        ); 
      }
    }
  }

  const buildLineForDrug = (currentDrug) => {

    const sectionWidth = specs.xMax / specs.xValues.length;
    const sectionWidthHalf = sectionWidth / 2;

    const seriesLabelPositionUS = specs.yScale(inp.filteredData['US'][inp.filteredData['US'].length - 1][currentDrug]);
    const valueState = inp.filteredData[inp.currentState].length > 0 ? inp.filteredData[inp.currentState][inp.filteredData[inp.currentState].length - 1][currentDrug] : 'Data suppressed*';
    const seriesLabelPositionState = valueState === 'Data suppressed*' ? specs.yScale(0) - 30 : specs.yScale(valueState);
                        
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
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={specs.yScale(d[currentDrug]) ?? 0} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={specs.yScale(dNext[currentDrug]) ?? 0} stroke={UtilityFunctions.getSeriesColor(currentDrug, key)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && key != 'US') && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={specs.yScale(d[currentDrug]) ?? 0} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={specs.yScale(dNext[currentDrug]) ?? 0} stroke={UtilityFunctions.getSeriesColor(currentDrug, key)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && key == 'US') && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={''} fill={''} fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>{showLabels ? d[currentDrug] : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key != 'US') && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={'lightblue'} fill={'lightblue'} fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>{showLabels ? d[currentDrug] : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key == 'US') && <Circle cx={specs.xScale(d[specs.xKey])} cy={specs.yScale(d[currentDrug])} r={4} fill={currentTimeframe === 'Monthly' && d[specs.xKey] == currentMonth ? 'orange' : UtilityFunctions.getSeriesColor(currentDrug, key)} />}
                          {(!isNaN(d[currentDrug]) && key != 'US') && <Circle cx={specs.xScale(d[specs.xKey])} cy={specs.yScale(d[currentDrug])} r={4} fill={currentTimeframe === 'Monthly' && d[specs.xKey] == currentMonth ? 'orange' : UtilityFunctions.getSeriesColor(currentDrug, key)} />}
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
    
                        return <text 
                          x={specs.xMax + 15} 
                          y={yPos}
                          alignmentBaseline="middle" 
                          fontSize={specs.fontSize} 
                          fill={UtilityFunctions.getSeriesColor(currentDrug, key)}>
                            {key != 'US' ? inp.stateNames[key] : 'Overall (' + (stateDropdownOptions.length - 1) + ' States)'}
                        </text>
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
                <text width={specs.yMax} x={specs.margin.left / -2} y={specs.yMax / 2.2} textAnchor="middle" style={{transform: 'rotate(-90deg)', transformOrigin: `-${specs.margin.left / 2}px ${specs.yMax / 2}px`}}>Rate per 100,000 persons<tspan baselineShift="super" fontSize="10">5</tspan></text>
                <AxisBottom
                  top={specs.yMax}
                  scale={specs.xScale}
                  tickValues={currentTimeframe === 'Monthly' && specs.isSmallViewport ? lessMonths(filteredData['US'].map(d => d[specs.xKey])) : (isPeriod ? filteredData['US'].map(d => d[specs.xKey]) : filteredData['US'].map(d => d[specs.xKey]))}
                  tickFormat={value => isPeriod ? monthNamesShort[parseInt(inp.monthNamesShortPeriod[value].length == 4 ? '1' : inp.monthNamesShortPeriod[value])]  : (currentTimeframe === 'Monthly' ? ((value == 1 || value == 12) ? monthNamesShort[value] + ' ' + currentYear : monthNamesShort[value]) : Number(value)?.toFixed(0))}
                  tickLabelProps={(value) => ({
                    fontSize: specs.fontSize,
                    textAnchor: isPeriod ? 'end' : 'middle',
                    angle: isPeriod ? -90 : 0
                  })}
                  labelProps={{
                    fontSize: specs.fontSize,
                    textAnchor: 'middle'
                  }}
                >
                </AxisBottom>
                {generateYearLabels()}
              </Group>
            </svg>
          {currentDrug == 'fentanyl' &&
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span class="x32 fill-p cdc-icon-alert_02 colorRed"></span><span><small><i>Note: Fentanyl data are displayed beginning in October 2020, reflecting the introduction of the ICD-10-CM code for fentanyl-involved poisoning (T40.41). Counts and rates for this indicator are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T40.41 ICD-10-CM code as there was no way to code fentanyl-involved poisonings.</i></small></span></div>
              </td>
            </tr>
          </table>
          }
          {currentDrug == 'methamphetamine' &&
            <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                <div class="rounded ds-8 pt-3 pr-3 pb-2 pl-3 border-0 text-center icon-wrap"><span class="x32 fill-p cdc-icon-alert_02 colorRed"></span><span><small><i>Note: Data on methamphetamine are shown starting in October 2022, when the ICD-10-CM code for methamphetamine-involved poisoning (T43.65) was introduced. Counts and rates for these indicators are shown as {currentTimeframe == 'Monthly' ? '"' + 'NA' + '"' + ' (Not Available)' : 'NA'} for time periods prior to the introduction of the T43.65 ICD-10-CM code as there was no way to code methamphetamine-involved poisonings.</i></small></span></div>
              </td>
            </tr>
          </table>
          }
        </td>
      </tr>
      </table>
      {specs.isSmallViewport && (
        <div id="line-chart-legend-container">
          <div id="line-chart-legend">
            {Object.keys(filteredData).map((key, i) =>
              <div key={`line-series-${key}`}>
                <span fontSize={specs.fontSize} style={{color: UtilityFunctions.getSeriesColor(currentDrug, key, !currentDrugOnly)}}>- {stateNames[key]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
    )

}

export default LineChart