import {React, Fragment, useState, useEffect} from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { Circle } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { UtilityFunctions } from '../utility'
import QuickStat from './quickStat';

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

export const colorScale = {
  'alldrug': '#2B2D73',
  'opioid': '#4A2866',
  'heroin': '#353535',
  'stimulant': '#24574E',
  'benzo': '#573325',
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

const getFilteredDataPeriod = (data, currentDataSource, currentState, currentYear, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) => {

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
              benzo: element[index1].benzo,
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
          benzo: arr[i].benzo,
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

const overrideSuppMessage = (year, drug) => {
  if ((year === 2018 || year === 2019 || year === 2020) && (drug === 'fentanyl' || drug === 'methamphetamine'))
    return true;
  else
    return false;
}

function LineChart({ params }) {

  const { data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear: currentYearUntyped, currentMonth, width, stateDropdownOptions, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth, showLabels, showPercent, showPeriod, showOverAll, selectedDrugs } = params;

  const currentYear = parseInt(currentYearUntyped);
  const isPeriod = showPeriod;

  const filteredData = {
    [currentState]: isPeriod ? getFilteredDataPeriod(data, currentDataSource, currentState, currentYear, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if (currentState !== 'US') 
    filteredData['US'] = isPeriod ? getFilteredDataPeriod(data, currentDataSource, 'US', currentYear, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) : getFilteredData(data, currentTimeframe, currentDataSource, 'US', currentYear)

  const yScaleDomainPeriod = (UtilityFunctions.calculateYScaleDomain(filteredData, currentDrug, selectedDrugs, currentState, showOverAll) * 1.2);

  const [percentChgDrug, setPercentChgDrug] = useState(['']);
  const [percentChgYear, setPercentChgYear] = useState(['']);
  const [percentChgValue, setPercentChgValue] = useState(['']);
  const [percentState, setPercentState] = useState(['']);
  const [yearMon, setYearMon] = useState(['']);

  useEffect(() => {
    markYearsForTicks()
  });

  const specs = [];
  specs['width'] = showPercent ? width - 500 : width;
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

  const percentfunc = (drug, yr, value, yrPrev, valuePrev, state, yearmon) => {

    var perc = 0;
    var diff, rounded;

    setPercentChgDrug(drug);
    setPercentChgYear(yr);
    setPercentState(state === 'US' ? 'overall' : state);
    setYearMon(yearmon)
  
    if (value != valuePrev) //it is an increase
    {
        diff =  value - valuePrev;
        perc = ((diff * 100) / value)
        rounded = Math.round(perc * 10) / 10
        setPercentChgValue(perc);
    }
    else if (value === valuePrev) //it is no change
    {
      setPercentChgValue(perc);
    }
  }

  const range = (start, end, step = 1) => {
    let str = ''
    let result = [];
    for(let i=0; i<=end; i+=step) {
      result.push(i);
    }
    return result;
  };

  const generateYearLabels = () => {
    return (
      <Fragment>
        <Fragment>
            return <text y={specs.yMax + 80} x={inp['tickIndexes'].length == 0 ? ((specs.xMax + 5)/2) : ((inp['tickWidth'] *((inp['tickIndexes'][0] == 1 ? 5.5 : (inp['tickIndexes'][0] - 2)/2))) + 5)} textAnchor="middle" style={{fontWeight: 'bold'}}>{lookupPeriodStartYear}</text>
        </Fragment>
        <Fragment>
          {inp['tickIndexes'].map((yearIdx, idx) => {
            if(yearIdx > 1) {
              return <text y={specs.yMax + 80} x={((inp['tickWidth'] * (inp['tickIndexes'][idx] - 2)) + (inp['tickWidth'] * 6 )  + 5)} textAnchor="middle" style={{fontWeight: 'bold'}}>{inp['monthNamesShortPeriod'][yearIdx]}</text>
            }
            })}
        </Fragment>
      </Fragment>
    )
  }

 const markYearsForTicks = () => {

    const xAxis = document?.getElementsByClassName("visx-axis-bottom")[0];
    const ticks = xAxis?.getElementsByClassName("visx-axis-tick");
    if (ticks !== undefined && ticks != null)
    {
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

  const buildToolTipValues = (data, inp, specs, currentDrug, isPeriod, sectionWidth, sectionWidthHalf) => {
    return (
      <Fragment>
        {inp.filteredData['US'].map(d => {
          const tooltipValues = [`<p><strong class=${currentDrug + 'ToolTip'}>Overall Rate</strong>: ${d[currentDrug]} (${stateDropdownOptions.length - 1} states)</p>`];
          if(inp.currentState !== 'US'){
            let stateValue = inp.filteredData[inp.currentState].find(d2 => d2[specs.xKey] === d[specs.xKey]);
            if(stateValue){
              stateValue = stateValue[currentDrug];
            } else {
              stateValue = 'Data not available/not reported'
            }
            tooltipValues.push(`<p><strong class=${currentDrug + 'ToolTip'}>${inp.stateNames[inp.currentState]} Rate</strong>: ${stateValue}</p>`);
          }
        
        return <rect
          key={`tooltip-section-${d[specs.xKey]}`}
          x={Math.max(0, specs.xScale(d[specs.xKey]) - sectionWidthHalf)}
          y={0}
          width={sectionWidth}
          height={specs.yMax}
          fill='transparent'
          data-tip={`<h3><strong>${isPeriod ? `${inp.monthNamesPeriod[d[specs.xKey]]}` : inp.currentTimeframe === 'Monthly' ? `${inp.monthNames[d[specs.xKey]]} ${inp.currentYear}` : d[specs.xKey]}</strong></h3>${tooltipValues.join('')}`}></rect>
        })}   
      </Fragment>
    )
  }
  
  const buildMultiToolTipValues = (data, inp, specs, isPeriod, sectionWidth, sectionWidthHalf) => {
    
    return (
      <Fragment>
        {
          inp.filteredData['US'].map(d => {
            var tooltipValues = showOverAll ? [`<p><strong class=${currentDrug + 'ToolTip'}>Overall Rate</strong>: ${d[currentDrug]} (${stateDropdownOptions.length - 1} states)</p>`] : [];
            if(inp.currentState !== 'US'){
              let stateValue = inp.filteredData[inp.currentState].find(d2 => d2[specs.xKey] === d[specs.xKey]);
              if(stateValue){
                stateValue = stateValue[currentDrug];
              } else {
                stateValue = 'Data not available/not reported'
              }
              tooltipValues.push(`<p><strong class=${currentDrug + 'ToolTip'}>${inp.stateNames[inp.currentState]} Rate</strong>: ${stateValue}</p>`);
            }

            if (inp.selectedDrugs.length > 0) {
              tooltipValues = showOverAll ? [`<p><strong class=${inp.selectedDrugs[0] + 'ToolTip'}>Overall Rate</strong>: ${d[inp.selectedDrugs[0]]} (${stateDropdownOptions.length - 1} states)</p>`] : [];
              if(inp.currentState !== 'US'){
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
                  tooltipValues.push(showOverAll ? [`<p><strong class=${inp.selectedDrugs[i] + 'ToolTip'}>Overall Rate</strong>: ${d[inp.selectedDrugs[i]]} (${stateDropdownOptions.length - 1} states)</p>`] : null);
                  if(inp.currentState !== 'US'){
                    let stateValue = inp.filteredData[inp.currentState].find(d2 => d2[specs.xKey] === d[specs.xKey]);
                    if(stateValue){
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
              x={Math.max(0, specs.xScale(d[specs.xKey]) - sectionWidthHalf)}
              y={0}
              width={sectionWidth}
              height={specs.yMax}
              style={{outline: 'none'}}
              fill='transparent'
              data-tip={inp.currentState !== 'US' ? `<table><tr><td><div class="container"><div class="col left">Left</div><div class="col right">Right</div></div></td></tr></table>` : `<h3><strong>${isPeriod ? `${inp.monthNamesPeriod[d[specs.xKey]]}` : inp.currentTimeframe === 'Monthly' ? `${inp.monthNames[d[specs.xKey]]} ${inp.currentYear}` : d[specs.xKey]}</strong></h3>${tooltipValues.join('')}`}></rect>
          })
        }
      </Fragment>
    )
  }
  
  const buildPercentChartInd = (percentChgDrug, percentChgYear, percentChgValue, percentState, yearMon) => {

    if (currentTimeframe === 'Annual' && !showPeriod) {
      if (selectedDrugs?.length > 0 && percentChgYear != '2018') {
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
    else if (currentTimeframe === 'Monthly' && !showPeriod){
      if (selectedDrugs?.length > 0 && percentChgYear != '1') {
        return (
          <QuickStat
              colorScale={colorScale}
              defaultValueIfEmpty={defaultValueIfEmpty}
              value={percentChgValue}
              text={(percentChgValue > 0 ? 'Increase' : 'Decrease') + ' in the number of ' + (currentDataSource === 'ED' ? 'ED visits' : 'inpatient hospitalizations') + ' for nonfatal ' + percentChgDrug + ' overdoses, ' + percentState + ', ' + inp.monthNames[percentChgYear] + ' ' + currentYear + ' vs. ' + inp.monthNames[String((parseInt(percentChgYear) - 1))] + ' ' + currentYear}
              label={percentChgDrug}
              timeframe={'month'}
          ></QuickStat>
          ); 
        }
    }
    else if (showPeriod){
      if (selectedDrugs?.length > 0) {
        var year = String(yearMon)?.substring(0,4);
        var cmon = String(yearMon)?.substring(4).replace(/^0+/, '');
        var pmon = Number(cmon) - 1;
        return (
          <QuickStat
              colorScale={colorScale}
              defaultValueIfEmpty={defaultValueIfEmpty}
              value={percentChgValue}
              text={(percentChgValue > 0 ? 'Increase' : 'Decrease') + ' in the number of ' + (currentDataSource === 'ED' ? 'ED visits' : 'inpatient hospitalizations') + ' for nonfatal ' + percentChgDrug + ' overdoses, ' + percentState + ', ' + inp.monthNames[cmon] + ' ' + year + ' vs. ' + inp.monthNames[pmon] + ' ' + year}
              label={percentChgDrug}
              timeframe={'month'}
          ></QuickStat>
          ); 
        }
    }
  }

  const buildLineForDrug = (specs, data, inp, currentDrug, showLabels, showPercent, isPeriod) => {

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
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && key == 'US' && showOverAll) && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={specs.yScale(d[currentDrug]) ?? 0} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={specs.yScale(dNext[currentDrug]) ?? 0} stroke={UtilityFunctions.getSeriesColor(currentDrug, key, showOverAll)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && !isNaN(dNext[currentDrug]) && key != 'US') && 
                            <line x1={specs.xScale(d[specs.xKey]) ?? 0} y1={specs.yScale(d[currentDrug]) ?? 0} x2={specs.xScale(dNext[specs.xKey]) ?? 0} y2={specs.yScale(dNext[currentDrug]) ?? 0} stroke={UtilityFunctions.getSeriesColor(currentDrug, key, showOverAll)} strokeWidth={3} />
                          }
                          {(!isNaN(d[currentDrug]) && key == 'US' && showOverAll) && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={''} fill={''} fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>{showLabels ? d[currentDrug] : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key != 'US') && <text x={i == 0 ? specs.xScale(d[specs.xKey]) :  specs.xScale(d[specs.xKey])} y={specs.yScale(d[currentDrug])-8} stroke={'lightblue'} fill={'lightblue'} fontSize={12} textAnchor={i == 0 ? 'right' : 'middle'}>{showLabels ? d[currentDrug] : ''}</text>}
                          {(!isNaN(d[currentDrug]) && key == 'US' && showOverAll) && <Circle onMouseEnter={(event) => {percentfunc(currentDrug, d[specs.xKey], d[currentDrug], dPrev[specs.xKey], dPrev[currentDrug], inp.stateNames[key], d['year'])}} cx={specs.xScale(d[specs.xKey])} cy={specs.yScale(d[currentDrug])} r={4} fill={currentTimeframe === 'Monthly' && d[specs.xKey] == currentMonth ? 'orange' : UtilityFunctions.getSeriesColor(currentDrug, key, showOverAll)} />}
                          {(!isNaN(d[currentDrug]) && key != 'US') && <Circle onMouseEnter={(event) => {percentfunc(currentDrug, d[specs.xKey], d[currentDrug], dPrev[specs.xKey], dPrev[currentDrug], inp.stateNames[key], d['year'])}} cx={specs.xScale(d[specs.xKey])} cy={specs.yScale(d[currentDrug])} r={4} fill={currentTimeframe === 'Monthly' && d[specs.xKey] == currentMonth ? 'orange' : UtilityFunctions.getSeriesColor(currentDrug, key, showOverAll)} />}
                        </Group>
                      )
                    })}
                    {(!specs.isSmallViewport && yScaleDomainPeriod > 0) &&  (() => {
                        let yPos = seriesLabelPositionUS;
    
                        if(key !== 'US'){
                          const isOverlapping = seriesLabelPositionState < seriesLabelPositionUS + specs.seriesOverlapMargin && seriesLabelPositionState > seriesLabelPositionUS - specs.seriesOverlapMargin;
                          if(isOverlapping){
                            if(seriesLabelPositionState < seriesLabelPositionUS){
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
                          x={specs.xMax + 30} 
                          y={yPos}
                          alignmentBaseline="middle" 
                          fontSize={specs.fontSize} 
                          fill={UtilityFunctions.getSeriesColor(currentDrug, key, showOverAll)}>
                            {key != 'US' ? inp.stateNames[key] : showOverAll ? inp.stateNames[key] : ''}
                        </text>
                      })()
                    }
                  </Group>)}
                  {
                    (!showPercent) && 
                      buildMultiToolTipValues(data, inp, specs, isPeriod, sectionWidth, sectionWidthHalf)
                  }
                </Group>
      </Fragment>
      )
  }

  return (
    <>
      <table style={{width: '100%'}}>
        <tr>
        <td style={showPercent ? {width: specs.width + 150} : {width: '100%'}}>
        <svg style={showPercent ? {height: specs.height, width: specs.width + 50} : {height: specs.height}}>
        <Group top={specs.margin.top} left={specs.margin.left}>
          {buildLineForDrug(specs, data, inp, currentDrug, showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('alldrug') && currentDrug != 'alldrug' && buildLineForDrug(specs, data, inp, 'alldrug', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('opioid') && currentDrug != 'opioid' && buildLineForDrug(specs, data, inp, 'opioid', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('heroin') && currentDrug != 'heroin' && buildLineForDrug(specs, data, inp, 'heroin', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('stimulant') && currentDrug != 'stimulant' && buildLineForDrug(specs, data, inp, 'stimulant', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('benzo') && currentDrug != 'benzo' && buildLineForDrug(specs, data, inp, 'benzo', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('fentanyl') && currentDrug != 'fentanyl' && buildLineForDrug(specs, data, inp, 'fentanyl', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('cocaine') && currentDrug != 'cocaine' && buildLineForDrug(specs, data, inp, 'cocaine', showLabels, showPercent, isPeriod)}
          {inp.selectedDrugs.includes('methamphetamine') && currentDrug != 'methamphetamine' && buildLineForDrug(specs, data, inp, 'methamphetamine', showLabels, showPercent, isPeriod)}
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
        <td style={showPercent ? {width: '100px!important', verticalAlign: 'top', paddingTop: '50px'} : {}}>
          {showPercent && buildPercentChartInd(percentChgDrug, percentChgYear, percentChgValue, percentState, yearMon)}
        </td>
        </tr>
      </table>
      {specs.isSmallViewport && (
        <div id="line-chart-legend-container">
          <div id="line-chart-legend">
            {Object.keys(filteredData).map((key, i) =>
              <div key={`line-series-${key}`}>
                <span fontSize={specs.fontSize} style={{color: UtilityFunctions.getSeriesColor(currentDrug, key, showOverAll)}}>- {stateNames[key]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
    )

}

export default LineChart