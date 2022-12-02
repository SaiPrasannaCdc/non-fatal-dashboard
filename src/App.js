import React, { useState, useEffect, useMemo } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa from 'papaparse';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import { Base64 } from 'js-base64';
import * as XLSX from 'xlsx';

import BarbellChart from './components/BarbellChart';
import LineChart from './components/LineChart';
import SexAgeCharts from './components/SexAgeCharts';
import UsaMap from './components/UsaMap';
import Datatable from './components/Datatable';

import Caret from './assets/caret-down.svg';
import Context from './context';
import 'rc-slider/assets/index.css';
import './styles.scss';

const SliderWithTooltip = createSliderWithTooltip(Slider);

const dataSourceOptions = {
  'ED': {
    'title': 'ED Visits'
  },
  'HOSP': {
    'title': 'Hospitalizations'
  }
}

const drugScreenOptions = {
  'alldrug': {
    'titleSingular': 'Drug',
    'titlePlural': 'All Drugs',
    'titleAll': 'All Drug',
    'rateColumn': 'rate_alldrug',
    'color': '#2B2D73',
  },
  'opioid': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioids',
    'rateColumn': 'rate_opioid',
    'color': '#4A2866',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'rateColumn': 'rate_heroin',
    'color': '#353535',
  },
  'stimulant': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulants',
    'rateColumn': 'rate_stimulant',
    'color': '#24574E',
  },
};

const supportedMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'all'];
const supportedStates = {'US': 'United States', 'AL':'Alabama','AK':'Alaska','AZ':'Arizona','AR':'Arkansas','CA':'California','CO':'Colorado','CT':'Connecticut','DE':'Delaware','DC':'District of Columbia','FL':'Florida','GA':'Georgia','HI':'Hawaii','ID':'Idaho','IL':'Illinois','IN':'Indiana','IA':'Iowa','KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine','MD':'Maryland','MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi','MO':'Missouri','MT':'Montana','NE':'Nebraska','NV':'Nevada','NH':'New Hampshire','NJ':'New Jersey','NM':'New Mexico','NY':'New York','NC':'North Carolina','ND':'North Dakota','OH':'Ohio','OK':'Oklahoma','OR':'Oregon','PA':'Pennsylvania','RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota','TN':'Tennessee','TX':'Texas','UT':'Utah','VT':'Vermont','VA':'Virginia','WA':'Washington','WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming'};

const createNewDrugObject = (rate = true) => {
  let obj = {};
  Object.keys(drugScreenOptions).forEach(drug => obj[rate ? drugScreenOptions[drug].rateColumn : drug] = {});
  return obj;
};

const getColumnsInfo = (sheet) => {
  let columnHeaders = {};
  let columns = 0;
  for (let key in sheet) {
    if(key.charAt(0) !== '!'){
      let colKey = key.replace(/[0-9]*/g, '');
      let rowNum = parseInt(key.replace(/[^0-9]*/g, ''));
      
      if(rowNum > columns) columns = rowNum;

      if (rowNum === 1) {
        columnHeaders[sheet[key].v] = colKey;
      }
    }
  }
  return {columnHeaders, columns};
};

export default function App({ dataUrl }) {

  const [ data, setData ] = useState();
  const [ currentDataSource, setCurrentDataSource ] = useState('ED');
  const [ currentDrug, setCurrentDrug ] = useState('alldrug');
  const [ currentState, setCurrentState ] = useState('US');
  const [ currentMonth, setCurrentMonth ] = useState('all');
  const [ currentYear, setCurrentYear ] = useState('2018');

  const drugColor = drugScreenOptions[currentDrug].color;

  useEffect(async () => {
    const binaryData = await (await fetch(dataUrl)).arrayBuffer();
    const wb = XLSX.read(binaryData);

    const stateSheet = wb.Sheets.state_rate_all;
    let {columnHeaders, columns} = getColumnsInfo(stateSheet);

    let stateData = {};
    let yearData = {};
    for(let i = 2; i < columns; i++) {
      //Populate state data
      if(!stateData[stateSheet[columnHeaders['dataset'] + i].v]) {
        stateData[stateSheet[columnHeaders['dataset'] + i].v] = createNewDrugObject();
      }
      let datasetNode = stateData[stateSheet[columnHeaders['dataset'] + i].v]; 
      Object.keys(drugScreenOptions).forEach(drug => {
        if(!datasetNode[drugScreenOptions[drug].rateColumn][stateSheet[columnHeaders['month'] + i].v]){
          datasetNode[drugScreenOptions[drug].rateColumn][stateSheet[columnHeaders['month'] + i].v] = [];
        }
        let monthNode = datasetNode[drugScreenOptions[drug].rateColumn][stateSheet[columnHeaders['month'] + i].v];
        let monthDatum;
        monthNode.forEach(node => {if(node.state === stateSheet[columnHeaders['state'] + i].v) monthDatum = node;});
        if(!monthDatum){
          monthDatum = {state: stateSheet[columnHeaders['state'] + i].v};
          monthNode.push(monthDatum);
        }
        monthDatum[stateSheet[columnHeaders['year'] + i].v] = stateSheet[columnHeaders[drugScreenOptions[drug].rateColumn] + i].v;
      });

      //Populate year data
      if(!yearData[stateSheet[columnHeaders['dataset'] + i].v]) {
        yearData[stateSheet[columnHeaders['dataset'] + i].v] = {};
      }
      datasetNode = yearData[stateSheet[columnHeaders['dataset'] + i].v];
      if(!datasetNode[stateSheet[columnHeaders['state'] + i].v]){
        datasetNode[stateSheet[columnHeaders['state'] + i].v] = {};
      }
      datasetNode = datasetNode[stateSheet[columnHeaders['state'] + i].v];
      if(!datasetNode[stateSheet[columnHeaders['month'] + i].v]){
        datasetNode[stateSheet[columnHeaders['month'] + i].v] = [];
      }
      datasetNode = datasetNode[stateSheet[columnHeaders['month'] + i].v];
      let yearDatum = {year: stateSheet[columnHeaders['year'] + i].v};
      Object.keys(drugScreenOptions).forEach(drug => {
       yearDatum[drug] = stateSheet[columnHeaders['rate_' + drug] + i].v;
      });
      datasetNode.push(yearDatum)
    }

    const sexSheet = wb.Sheets.us_count_all;
    let columnInfo = getColumnsInfo(wb.Sheets.us_count_all);
    columnHeaders = columnInfo.columnHeaders;
    columns = columnInfo.columns;

    let sexData = {};
    for(let i = 2; i < columns; i++) {
      //Populate state data
      if(!sexData[sexSheet[columnHeaders['dataset'] + i].v]) {
        sexData[sexSheet[columnHeaders['dataset'] + i].v] = createNewDrugObject(false);
      } 
      Object.keys(drugScreenOptions).forEach(drug => {
        let datasetNode = sexData[sexSheet[columnHeaders['dataset'] + i].v];
        if(!datasetNode[drug][sexSheet[columnHeaders['year'] + i].v]){
          datasetNode[drug][sexSheet[columnHeaders['year'] + i].v] = {};
        }
        datasetNode = datasetNode[drug][sexSheet[columnHeaders['year'] + i].v];
        if(!datasetNode[sexSheet[columnHeaders['month'] + i].v]){
          datasetNode[sexSheet[columnHeaders['month'] + i].v] = [];
        }
        datasetNode = datasetNode[sexSheet[columnHeaders['month'] + i].v];
        if(sexSheet[columnHeaders['sex'] + i].v !== 'Missing' && sexSheet[columnHeaders['age'] + i].v !== 'Missing'){
          datasetNode.push({sex: sexSheet[columnHeaders['sex'] + i].v, age: sexSheet[columnHeaders['age'] + i].v, value: parseInt(sexSheet[columnHeaders[drug] + i].v)})
        }
      });
    }

    setData({state: stateData, year: yearData, sex: sexData});
  }, []);

  const countyMaps = useMemo(() => 
    <>
      <UsaMap />
      <UsaMap />
    </>
  , [currentYear])

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  if (!data) {
    return <h3>Loading</h3>;
  }

  return (
    <Context.Provider value={{data, supportedStates, drugScreenOptions, currentDataSource, currentDrug, currentState, currentMonth, currentYear}}>
      <div className="filters-container">
        <div>
        {/*<div className={`filter-wrapper ${showTimeline ? 'show-timeline' : ''}`}>*/}
          <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Time Range</div>
          <div className="filters">
            <div className="dropdowns">
              <div>
                <label htmlFor="data-source-select">Select data source: </label>
                <select id="data-source-select" value={currentDataSource} onChange={(e) => { setCurrentDataSource(e.target.value) }}>
                  {Object.keys(dataSourceOptions).map((key) => <option key={key} value={key}>{dataSourceOptions[key]['title']}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="drug-select">Select a Drug: </label>
                <select id="drug-select" value={currentDrug} onChange={(e) => { setCurrentDrug(e.target.value) }}>
                  {Object.keys(drugScreenOptions).map((key) => <option key={key} value={key}>{drugScreenOptions[key]['titleAll']}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="jurisdiction-select">Select a State: </label>
                <select id="jurisdiction-select" value={currentState} onChange={(e) => { setCurrentState(e.target.value) }}>
                  <option value="">US</option>
                  {Object.keys(supportedStates).map((key) => <option key={key} value={key}>{supportedStates[key]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="month-select">Select a Month: </label>
                <select id="month-select" value={currentMonth} onChange={(e) => { setCurrentMonth(e.target.value) }}>
                  {Object.keys(supportedMonths).map((key) => <option key={key} value={key}>{supportedMonths[key]}</option>)}
                </select>
              </div>
              {/*<div className="compare">
                <label htmlFor="month-year">Compare {toLabel} with the previous: </label>
                <span className='legend-help' data-tip='<div className=" tooltip-body">
                  <small>This panel allows you to view the percent change in nonfatal drug overdoses between adjacent months and annually for a select time period.</small></div>
                  <small>You can select either monthly percent change or annual percent change. To select a different month/year, drag the slider below.</div>
                  </div>'>?</span>
                <select id="month-year" value={selectedTimeframe} onChange={(e) => { handleTimeframeChange(e.target.value) }}>
                  <option value="month" name="time-selector">Month</option>
                  <option value="year" name="time-selector">Year</option>
                </select>
              </div>*/}
            </div>

            {/*<div className="timeline">
              <div className="range-aside-container" style={{ color: drugColor }}>
                {'month' === selectedTimeframe &&
                  <SliderWithTooltip
                    tipFormatter={tooltipFormatterMonth}
                    html={true}
                    onChange={(e) => { handleMonthSliderChange(e) }}
                    min={0}
                    step={1}
                    value={sliderPointMonth}
                    align={{
                      offset: [0, -5],
                    }}
                    max={monthTimeframes.length - 1}
                    marks={getSliderMarks('month')}
                    handleStyle={{
                      borderColor: drugColor,
                      backgroundColor: drugColor,
                    }}
                    tipProps={{ visible: true }}
                    ariaLabelForHandle="Select a month to compare in the map"
                    role="slider"
                  // tab-index={0}
                  // ariaValueMin={0}
                  // ariaValueMax={monthTimeframes.length - 1}
                  />
                }
                {'year' === selectedTimeframe &&
                  <SliderWithTooltip
                    tipFormatter={tooltipFormatterYear}
                    onChange={(e) => { handleYearSliderChange(e) }}
                    min={0}
                    step={1}
                    value={sliderPointYear}
                    align={{
                      offset: [0, -5],
                    }}
                    max={yearTimeframes.length - 1}
                    marks={getSliderMarks('year')}
                    handleStyle={{
                      borderColor: drugColor,
                      backgroundColor: drugColor,
                    }}
                    tipProps={{ visible: true }}
                    ariaLabelForHandle="Select a year to compare in the map"
                  />
                }
              </div>
            </div>*/}
          </div>
        </div>

        {/*<header style={{ backgroundColor: drugColor, color: '#fff', fontFamily: 'sans-serif', padding: '.75em 18px', marginBottom: '1em' }}>
          <span style={{ fontSize: '.8em', fontWeight: 'bold' }}>Trends in Emergency Department (ED) Visits</span>
          <h2 style={{ fontSize: '1.4em', margin: 0, padding: '0', display: 'block', fontWeight: 'bold', fontFamily: '"Open Sans",apple-system,blinkmacsystemfont,"Segoe UI","Helvetica Neue",arial,sans-serif' }}>Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdoses</h2>
        </header>
        <div className="callouts">
          <div style={{ 'borderLeft': '5px solid' + drugColor }}>
            <span className="callout" style={{ 'color': drugColor }}>{getPostiveSign(usPercent)}{isNaN(usPercent) ? 'N/A' : `${usPercent}%`}</span>
            <div>

              <span className='data-bite-title' style={{ color: drugColor }}>

                {timeline}  Percent Change<sup>†</sup> in US</span>
              <p>Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdose</p>
            </div>
          </div>
          {selected && constructStateDataBite()}
          {!selected && constructUSSignificantIncreaseDataBite(significanceColumn)}
          <div style={{ 'borderLeft': '5px solid' + drugColor }}>
            <span className="callout" style={{ 'color': drugColor }}>{statesParticipating.length}</span>
            <div>
              <span className='data-bite-title' style={{ color: drugColor }}>States Participating</span>
              <p>Funded states with reported data</p>
            </div>
          </div>
        </div>

        <div className="toggle-area-wrap">
          <div className="toggle-area">
            <div id="toggleLegend" className={`${showLegend ? 'open' : ''}`} onClick={toggleLegend}>
              Show Legend <Caret />
            </div>
            <div id="toggleTimeline" className={`${showTimeline ? 'open' : ''}`} onClick={toggleTimeline}>
              <span className="hide-on-mobile">Edit</span> Time Range <Caret />
            </div>
            <div id="toggleShare" className={`${showShare ? 'open' : ''}`} onClick={toggleShare}>
              Share <Caret />
            </div>
          </div>
        </div>
        <div id="closeShare" onClick={toggleShare}>
          <svg width="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style={{ 'margin': 'auto' }}><path fill="#fff" d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z" /></svg>
        </div>*/}
        <BarbellChart />
        <LineChart />
        <SexAgeCharts />
        {countyMaps}
      </div>
      {/*<div className='data-tables'>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
            Trends by State, {timeline} - {drugScreenOptions[currentDrug]['titleAll']}
            {showDatatable && <span>{String.fromCharCode(8722)}</span>}
            {!showDatatable && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showDatatable &&
            <div className="datatable-body">
              <Datatable runtimeUSData={Object.values(runtimeUSData)} applyLegendToRow={applyLegendToRow} runtimeData={runtimeTableData} Hexagon={Hexagon} keyIndex={keyIndex} jurisdictionColumn={jurisdictionColumn} significanceColumn={significanceColumn} percentageColumn={percentageColumn} supportedStates={supportedStates} drugColor={drugColorLight} drugName={drugScreenOptions[currentDrug]['titleAll']} />
              <small>
                <MapFootnotes />
                <p>{footnote1[0]} {footnote1[1]}</p>
                <p>{footnote3[0]} {footnote3[1]}</p>
                <p>{footnote4[0]} {footnote4[1]}</p>
              </small>
            </div>}
        </div>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleConsiderations}>
            Important Data Considerations
            {showConsiderations && <span>{String.fromCharCode(8722)}</span>}
            {!showConsiderations && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showConsiderations &&
            <div className="datatable-body">
              <p><strong>Important caveats to consider when interpreting the data include:</strong></p>
              <ol>
                <li><strong>Some data may be missing.</strong> Data sent from EDs to health departments may be delayed or may stop for a period of time. When EDs begin sharing data again, information about visits during the lapse may never be shared.</li>
                <li><strong>Reporting facilities and the data they report can change.</strong> Several states continue efforts to onboard new facilities that can begin to share data in syndromic surveillance systems, and some facilities experience periodic interruptions or a cessation of syndromic surveillance data feeds. Some of these issues became more pronounced during the earlier phase of the COVID-19 pandemic. Syndromic data also can be updated with new information over time, for example, with additional diagnosis codes. Therefore, numbers and rates reported could change over time as more facilities began sharing data or sharing higher quality data as well as facilities that may stop sharing data for a period of time. Some EDs also had increases in the proportion of ED visits in syndromic data that contain diagnosis codes, which facilitate the identification of overdose-related visits.</li>
                <li><strong>Data are updated over time.</strong> The chief complaint, or the reason for the ED visit, is available in syndromic surveillance systems within 48 hours for ~70% of ED visits. However, the chief complaint field may be incomplete. ED visit data may be updated over the course of several weeks, and relevant overdose discharge diagnosis codes or revised chief complaint text may be received during this time. However, DOSE data are reported with a one-month time lag and not typically updated each month.</li>
                <li><strong>These are suspected overdoses.</strong> Because these data are not determined by toxicological testing, they are not considered confirmed cases, but “suspected” overdoses.</li>
                <li><strong>Data likely represent an undercount,</strong> given inaccuracies in coding and missing chief complaint information.</li>
                <li><strong>Overdose visit numbers are not mutually exclusive</strong> but rather reflect nesting of drug categories: numbers of suspected opioid-, heroin-, and stimulant-involved overdose visits are included in the numbers of suspected all drug overdose visits; suspected heroin-involved overdose visits are included in the numbers of suspected opioid-involved overdose visits; and some overdose visits involved multiple substances (e.g., a given overdose ED visit could have involved both opioids and stimulants).</li>
              </ol>
            </div>}
        </div>
      </div>
      <a id="dataDownload" data={csvData}>data download</a>
      <p>
        <DownloadButton data={csvData} />
      </p>*/}
      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip" />
    </Context.Provider>
  );
}
