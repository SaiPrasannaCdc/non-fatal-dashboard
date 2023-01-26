import React, { useState, useEffect, useMemo, useCallback } from 'react';
import "babel-polyfill";
import debounce from 'lodash.debounce';
import ReactTooltip from 'react-tooltip';
import * as XLSX from 'xlsx';
import ResizeObserver from 'resize-observer-polyfill';

import BarbellChart from './components/BarbellChart';
import LineChart from './components/LineChart';
import SexAgeCharts from './components/SexAgeCharts';
import UsaMap from './components/UsaMap';
import Select from './components/Select';
import Datatable from './components/Datatable';

import './styles.scss';

const dataSourceOptions = {
  'ED': {
    'title': 'ED Visits',
    'titleLong': 'Emergency Department (ED) Visits',
    'titleLowerCase': 'ED visits'
  },
  'HOSP': {
    'title': 'Hospitalizations',
    'titleLong': 'Hospitalizations',
    'titleLowerCase': 'hospitalizations'
  }
}

const drugOptions = {
  'alldrug': {
    'titleSingular': 'All Drug',
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

const supportedYears = ['2018', '2019', '2020', '2021'];
const supportedYearsLatest = supportedYears[supportedYears.length - 1];
const monthNames = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December', 'all': 'All Months' };
let stateNames = { 'US': 'Overall', 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming' };

const createNewDrugObject = (rates = true) => {
  let obj = {};
  Object.keys(drugOptions).forEach(drug => {
    if (rates) {
      obj[drugOptions[drug].rateColumn] = {};
    }
    obj[drug] = {};
  });
  return obj;
};

const getColumnsInfo = (sheet) => {
  let columnHeaders = {};
  let columns = 0;
  for (let key in sheet) {
    if (key.charAt(0) !== '!') {
      let colKey = key.replace(/[0-9]*/g, '');
      let rowNum = parseInt(key.replace(/[^0-9]*/g, ''));

      if (rowNum > columns) columns = rowNum;

      if (rowNum === 1) {
        columnHeaders[sheet[key].v] = colKey;
      }
    }
  }
  return { columnHeaders, columns };
};

const createIfUndefined = (object, key, value) => {
  if(!object[key]){
    object[key] = value;
  }
  return object[key];
}

const formatNumber = (val, isFloat = true) => {
  let numericVal = isFloat ? parseFloat(val) : parseInt(val);
  if (isNaN(numericVal)) {
    return 'Data suppressed';
  } else {
    return isFloat ? (Math.round(numericVal * 10) / 10) : numericVal;
  }
};

export default function App({ dataUrl }) {

  const [data, setData] = useState();
  const [currentDataSource, setCurrentDataSource] = useState('ED');
  const [currentDrug, setCurrentDrug] = useState('alldrug');
  const [currentState, setCurrentState] = useState('US');
  const [currentTimeframe, setCurrentTimeframe] = useState('Annual');
  const [currentMonth, setCurrentMonth] = useState('1');
  const [currentYear, setCurrentYear] = useState(supportedYearsLatest);
  const [currentYearCompare, setCurrentYearCompare] = useState(supportedYears[0]);
  const [showDatatable, setDatatable] = useState(false);
  const [showConsiderations, setConsiderations] = useState(false);
  const [width, setWidth] = useState(0);

  const toggleDatatable = () => setDatatable(!showDatatable);
  const toggleConsiderations = () => setConsiderations(!showConsiderations);

  const isSmallViewport = width < 500;

  const drugColor = drugOptions[currentDrug].color;

  const debouncedSetWidth = useMemo(
    () => debounce(setWidth, 300)
    , []);

  const resizeObserver = new ResizeObserver(entries => {
    const { width: newWidth } = entries[0].contentRect;

    if (newWidth !== width) {
      debouncedSetWidth(newWidth);
    }
  });

  const outerContainerRef = useCallback(node => {
    if (node !== null) {
      resizeObserver.observe(node);
    } // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const binaryData = await (await fetch(dataUrl)).arrayBuffer();
      const wb = XLSX.read(binaryData);

      let supportedStates = {};

      const stateSheet = wb.Sheets.state_rate_all;
      let { columnHeaders, columns } = getColumnsInfo(stateSheet);
      let getValue = (key, i) => stateSheet[columnHeaders[key] + i].v;

      let stateData = {};
      let yearData = {};
      let datasetNode;
      for (let i = 2; i < columns; i++) {
        //Populate state data
        if (!stateData[getValue('dataset', i)]) {
          stateData[getValue('dataset', i)] = createNewDrugObject();
        }
        Object.keys(drugOptions).forEach(drug => {
          datasetNode = stateData[getValue('dataset', i)];
          //Drug rate
          let monthNode = createIfUndefined(datasetNode[drugOptions[drug].rateColumn], getValue('month', i), []);
          let monthDatum;
          monthNode.forEach(node => { if (node.state === getValue('state', i)) monthDatum = node; });
          if (!monthDatum) {
            let state = getValue('state', i);
            monthDatum = { state };
            monthNode.push(monthDatum);

            if (!supportedStates[state]) supportedStates[state] = stateNames[state];
          }
          monthDatum[getValue('year', i)] = formatNumber(getValue(drugOptions[drug].rateColumn, i));

          //Drug overdoses
          datasetNode = stateData[getValue('dataset', i)];
          monthNode = createIfUndefined(datasetNode[drug], getValue('month', i), []);
          monthDatum = undefined;
          monthNode.forEach(node => { if (node.state === getValue('state', i)) monthDatum = node; });
          if (!monthDatum) {
            monthDatum = { state: getValue('state', i) };
            monthNode.push(monthDatum);
          }
          monthDatum[getValue('year', i)] = formatNumber(getValue(drug, i), false);
        });

        //Populate year data
        datasetNode = createIfUndefined(yearData, getValue('dataset', i), {});
        datasetNode = createIfUndefined(datasetNode, getValue('state', i), {});
        datasetNode = createIfUndefined(datasetNode, getValue('month', i), []);
        let yearDatum = { year: getValue('year', i) };
        Object.keys(drugOptions).forEach(drug => {
          yearDatum[drug] = formatNumber(getValue(drugOptions[drug].rateColumn, i));
        });
        datasetNode.push(yearDatum);
      }

      const sexSheet = wb.Sheets.us_count_all;
      let columnInfo = getColumnsInfo(sexSheet);
      columnHeaders = columnInfo.columnHeaders;
      columns = columnInfo.columns;
      getValue = (key, i) => sexSheet[columnHeaders[key] + i].v;

      //Populate sex data
      let sexData = {};
      let supportedJurisdictions = {};
      for (let i = 2; i < columns; i++) {
        createIfUndefined(sexData, getValue('dataset', i), createNewDrugObject(false));
        Object.keys(drugOptions).forEach(drug => {
          let datasetNode = sexData[getValue('dataset', i)];
          datasetNode = createIfUndefined(datasetNode[drug], getValue('year', i), {});
          datasetNode = createIfUndefined(datasetNode, getValue('month', i), []);
          if (getValue('sex', i) !== 'Missing' && getValue('age', i) !== 'Missing') {
            let datasetDatum = datasetNode.find(datum => datum.age === getValue('age', i));
            if (!datasetDatum) {
              datasetDatum = { age: getValue('age', i) }
              datasetNode.push(datasetDatum);
            }
            datasetDatum[getValue('sex', i)] = formatNumber(getValue(drug, i), false);
          }
        });

        if(!supportedJurisdictions[getValue('year', i)]){
          supportedJurisdictions[getValue('year', i)] = getValue('jurisdiction_count', i);
        }
      }

      const countySheet = wb.Sheets.cnty_rates_all;
      columnInfo = getColumnsInfo(countySheet);
      columnHeaders = columnInfo.columnHeaders;
      columns = columnInfo.columns;
      getValue = (key, i) => countySheet[columnHeaders[key] + i].v;

      //Populate sex data
      let countyData = {};
      for (let i = 2; i < columns; i++) {
        createIfUndefined(countyData, getValue('year', i), {});
        countyData[getValue('year', i)][getValue('fips', i)] = {
          fips: getValue('fips', i),
          county: getValue('county', i),
          state: getValue('state', i),
          rate: formatNumber(getValue('rate_alldrug', i))
        };
      }

      Object.keys(sexData).forEach(dataSource => Object.keys(sexData[dataSource]).forEach(drug => {
        let annualMax = 0;
        let monthlyMax = 0;
        Object.keys(sexData[dataSource][drug]).forEach(year => {
          sexData[dataSource][drug][year]['all'].forEach(d => {
            if(d['M'] > annualMax) annualMax = d['M'];
            if(d['F'] > annualMax) annualMax = d['F'];
          });
          Object.keys(sexData[dataSource][drug][year]).forEach(month => {
            if(month === 'all') return;
            sexData[dataSource][drug][year][month].forEach(d => {
              if(d['M'] > monthlyMax) monthlyMax = d['M'];
              if(d['F'] > monthlyMax) monthlyMax = d['F'];
            });
          });
        });
        sexData[dataSource][drug].maxAnnual = annualMax;
        sexData[dataSource][drug].maxMonthly = monthlyMax;
      }));
      
      setData({ state: stateData, year: yearData, sex: sexData, county: countyData, supportedStates, supportedJurisdictions });
    }

    fetchData();
  }, []);

  if(data){
    stateNames['US'] = `Overall (${data.supportedJurisdictions[currentYear]} states)`;
    data.supportedStates['US'] = stateNames['US'];
  }

  const barbellChartMemo = useMemo(() =>
    <>
      <h2 className="h3">{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, by state and overall ({data ? data.supportedJurisdictions[currentYear] : 'n/a'} states), {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ${Math.min(currentYear, currentYearCompare)} compared to ${monthNames[currentMonth]} ${Math.max(currentYear, currentYearCompare)}` : `${Math.min(currentYear, currentYearCompare)} compared to ${Math.max(currentYear, currentYearCompare)}`}</h2>
      <Select params={{
        key: 'year',
        label: 'a Year to Compare To',
        value: currentYearCompare,
        onChange: setCurrentYearCompare,
        options: supportedYears.filter(year => year !== currentYear),
        optionLabel: (key) => key
      }}/>
      <BarbellChart params={{ data, monthNames, drugOptions, currentState, currentDataSource, currentDrug, currentTimeframe, currentYear, currentYearCompare, currentMonth: currentMonth, width }} />
    </>,
    [data, monthNames, drugOptions, currentState, currentDataSource, currentDrug, currentTimeframe, currentYear, currentYearCompare, currentMonth, width]);

  const lineChartMemo = useMemo(() =>
    <>
      <h2 className="h3">{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {currentState !== 'US' ? `${stateNames[currentState]} and overall` : 'overall'} {`(${data ? data.supportedJurisdictions[currentTimeframe === 'Monthly' ? currentYear : supportedYearsLatest] : 'n/a'} states)`}, {currentTimeframe === 'Monthly' ? `January ${currentYear} - December ${currentYear}` : `${supportedYears[0]} - ${supportedYearsLatest}`}</h2>
      <LineChart params={{ data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear, currentMonth, width }} />
    </>,
    [data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear, currentMonth, width]);

  const sexAgeChartsMemo = useMemo(() =>
    <>
      <h2 className="h3">{currentTimeframe} count of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses, overall ({data ? data.supportedJurisdictions[currentYear] : 'n/a'} states), {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''} {currentYear}</h2>
      <SexAgeCharts params={{ data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth: currentMonth, width }} />
    </>,
    [data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, width]);

  const usaMapMemo = useMemo(() =>
    <>
      <h2 className="h3">Annual rate of ED visits for nonfatal all drug overdoses per 100,000 persons, by county, {currentState === 'US' ? stateNames[currentState].toLowerCase() : stateNames[currentState]}, {currentYear}</h2>
      <UsaMap params={{ data, stateNames, currentState, currentYear, width }} />
    </>,
    [data, stateNames, currentState, currentYear, width]);

  const loading = <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>;

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  if (!data) {
    return loading;
  }

  let rateOverdoses = data.year[currentDataSource][currentState] ? data.year[currentDataSource][currentState][currentTimeframe === 'Monthly' ? currentMonth : 'all'].find(item => item.year == currentYear) : undefined;
  if(rateOverdoses) rateOverdoses = rateOverdoses[[currentDrug]];
  let totalOverdoses = data.state[currentDataSource][currentDrug][currentTimeframe === 'Monthly' ? currentMonth : 'all'].find(item => item.state === currentState);
  if(totalOverdoses) totalOverdoses = totalOverdoses[currentYear];

  let stateDropdownOptions = data.state[currentDataSource][currentDrug]['all'].map(d => d.state);

  return (
    <>
      <div className="filters-container" ref={outerContainerRef}>
        {width === 0 && loading}
        {width > 0 && (
          <>
            <div className="filter-wrapper">
              <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Filters</div>
              <div className="filters">
                <div className={`dropdowns${isSmallViewport ? ' no-grid' : ''}`}>
                  <Select params={{
                    key: 'data-source',
                    label: 'Data Source',
                    value: currentDataSource,
                    onChange: setCurrentDataSource,
                    options: Object.keys(dataSourceOptions),
                    optionLabel: (key) => dataSourceOptions[key]['title']
                  }}/>
                  <Select params={{
                    key: 'drug',
                    label: 'a Drug',
                    value: currentDrug,
                    onChange: setCurrentDrug,
                    options: Object.keys(drugOptions),
                    optionLabel: (key) => drugOptions[key]['titleAll']
                  }}/>
                  <Select params={{
                    key: 'jurisdiction',
                    label: 'a State',
                    value: currentState,
                    onChange: setCurrentState,
                    options: stateDropdownOptions.sort((a, b) => {
                      if(a === 'US') return -1;
                      if(b === 'US') return 1;
                      return a < b;
                    }),
                    optionLabel: (key) => data.supportedStates[key]
                  }}/>
                  <Select params={{
                    key: 'timeframe',
                    label: 'Time Frame',
                    value: currentTimeframe,
                    onChange: setCurrentTimeframe,
                    options: ['Monthly', 'Annual'],
                    optionLabel: (key) => key
                  }}/>
                  <Select params={{
                    key: 'year',
                    label: 'a Year',
                    value: currentYear,
                    onChange: setCurrentYear,
                    options: supportedYears,
                    optionLabel: (key) => key
                  }}/>
                  <Select params={{
                    key: 'month',
                    label: 'a Month',
                    value: currentMonth,
                    onChange: setCurrentMonth,
                    options: Object.keys(monthNames).filter(key => key !== 'all'),
                    optionLabel: (key) => monthNames[key],
                    disabled: currentTimeframe === 'Monthly' ? undefined : 'disabled'
                  }} />
                  <div>
                    <button id="reset-button" style={{ backgroundColor: drugColor }} onClick={() => {
                      setCurrentDataSource('ED');
                      setCurrentDrug('alldrug');
                      setCurrentState('US');
                      setCurrentTimeframe('Annual');
                      setCurrentMonth('1');
                      setCurrentYear(supportedYearsLatest);
                    }}>Reset</button>
                  </div>
                </div>
              </div>
            </div>

            <header className="data-bite-header" style={{ backgroundColor: drugColor }}>
              <span>Trends in {dataSourceOptions[currentDataSource]['titleLong']}</span>
              <h2>{drugOptions[currentDrug]['titleAll']} Overdoses</h2>
            </header>
            <div className="callouts">
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{totalOverdoses ? totalOverdoses.toLocaleString() : 'N/A'}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>{stateNames[currentState]}</span>
                  <p>{currentTimeframe} number of {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses</p>
                </div>
              </div>
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{rateOverdoses || 'N/A'}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>{stateNames[currentState]}</span>
                  <p>{currentTimeframe} rate of {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons</p>
                </div>
              </div>
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{data.supportedJurisdictions[currentYear]}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>States Participating</span>
                  <p>Funded states with reported data</p>
                </div>
              </div>
            </div>

            <section className="first-section">
              {barbellChartMemo}
            </section>

            <section>
              {lineChartMemo}
            </section>

            <section>
              {sexAgeChartsMemo}
            </section>

            <section>
              {usaMapMemo}
            </section>
          </>
        )}
      </div>
      <div className='data-tables'>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
            Trends by State, {drugOptions[currentDrug]['titleAll']}
            {showDatatable && <span>{String.fromCharCode(8722)}</span>}
            {!showDatatable && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showDatatable &&
            <div className="datatable-body">
              <Datatable params={{ data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonth, currentYear }} />
              <small>
                <p>* Data were collected for the time period beginning January 2018, but exclude several months during the onset of the COVID-19 pandemic (i.e., March 2020-August 2020). In some cases, the funded state did not provide CDC enough months of data to calculate percent change. Rates are suppressed when based on &lt;20 overdoses, thus no percent change is available; for more information, please see: Healthy People 2010 Criteria for Data Suppression.</p>
                <p><span className="merriweather">†</span> To account for changes occurring across time, monthly and annual trends for the rate of ED visits involving suspected drug overdoses (e.g., ED visits involving drug overdoses divided by total ED visits and multiplied by 10,000) were analyzed overall and by U.S. state. Annual change, controlling for seasonal effects, was estimated as the change from a month in a given year to the same month in the following year (e.g., January 2018 to January 2019). Significance testing was conducted using chi-square tests</p>
                <p>§ The state does not share data from syndromic surveillance systems with DOSE.</p>
                <p>¶ The funded state did not provide CDC enough months of data to calculate all percent change cells.</p>
                <p>¶ State does not participate in OD2A DOSE ED data sharing.</p>
                <p>** Certain comparisons include data from two syndromic surveillance systems; some differences between the systems exist, such as the percent of missing discharge diagnos is codes.</p>
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
      <a
        href={dataUrl}
        aria-label="Download this data in a Excel file format."
        className={`btn btn-download no-border`}
        style={{ 'backgroundColor': drugColor }}
      >
        Download Data (XLSX)
      </a>
      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip" />
    </>
  );
}
