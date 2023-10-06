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
    'titleLongest': 'emergency department (ED) visits',
    'titleLowerCase': 'ED visits'
  },
  'HOSP': {
    'title': 'Inpatient Hospitalizations',
    'titleLong': 'Inpatient Hospitalizations',
    'titleLongest': ' inpatient hospitalizations',
    'titleLowerCase': 'inpatient hospitalizations'
  }
}

const drugOptions = {
  'alldrug': {
    'titleSingular': 'All Drug',
    'titlePlural': 'All Drugs',
    'titleAll': 'All Drug',
    'titleHeader': 'All Drug',
    'rateColumn': 'rate_alldrug',
    'color': '#2B2D73',
  },
  'opioid': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioids',
    'titleHeader': 'All Opioid',
    'rateColumn': 'rate_opioid',
    'color': '#4A2866',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'titleHeader': 'Heroin',
    'rateColumn': 'rate_heroin',
    'color': '#353535',
  },
  'stimulant': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulants',
    'titleHeader': 'All Stimulant',
    'rateColumn': 'rate_stimulant',
    'color': '#24574E',
  },
};

const supportedYears = ['2018', '2019', '2020', '2021', '2022'];
const supportedYearsLatest = supportedYears[supportedYears.length - 1];
const monthNames = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December', 'all': 'All Months' };
let stateNames = { 'US': 'Overall†', 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming' };

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
    return 'Data suppressed*';
  } else {
    return (isFloat ? (Math.round(numericVal * 10) / 10).toFixed(1) : numericVal);
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
  const [currentYearGroup, setCurrentYearGroup] = useState('one');
  const [currentYearCompare, setCurrentYearCompare] = useState(supportedYears[0]);
  const [currentDataType, setCurrentDataType] = useState('count');
  const [showDatatable, setDatatable] = useState(false);
  const [showConsiderations, setConsiderations] = useState(false);
  const [timeframeChanged, setTimeframeChanged] = useState(false);
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
      let supportedJurisdictions = {};

      const usSheet = wb.Sheets['US State Submission Counts'];
      let { columnHeaders, columns } = getColumnsInfo(usSheet);
      let getValue = (key, i) => usSheet[columnHeaders[key] + i].v;

      for (let i = 2; i <= columns; i++) {
        if(!supportedJurisdictions[getValue('year', i)]){
          supportedJurisdictions[getValue('year', i)] = getValue('jurisdiction_count', i);
        }  
      }



      const stateSheet = wb.Sheets['State Counts & Rates'];
      let columnInfo = getColumnsInfo(stateSheet);
      columnHeaders = columnInfo.columnHeaders;
      columns = columnInfo.columns;
      getValue = (key, i) => stateSheet[columnHeaders[key] + i].v;

      let stateData = {};
      let yearData = {};
      let datasetNode;
      for (let i = 2; i <= columns; i++) {
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
          monthDatum[getValue('year', i)] = formatNumber(getValue('count_' + drug, i), false);
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

      let yearMaxes = {}
      Object.keys(yearData).forEach(dataSource => {
        Object.keys(yearData[dataSource]).forEach(state => {
          Object.keys(yearData[dataSource][state]).forEach(month => {
            const timeframe = month === 'all' ? 'Annual' : 'Monthly';
            if(!yearMaxes[timeframe]) yearMaxes[timeframe] = {};
            yearData[dataSource][state][month].forEach(row => {
              Object.keys(drugOptions).forEach(drug => {
                const rowVal = parseFloat(row[drug])
                if(!isNaN(rowVal) && (!yearMaxes[timeframe][drug] || yearMaxes[timeframe][drug] < rowVal)){
                  yearMaxes[timeframe][drug] = rowVal
                }
              });
            })
          })
        })
      });
      yearData['maxes'] = yearMaxes;




      const sexSheet = wb.Sheets['Overall by Sex & Age'];
      columnInfo = getColumnsInfo(sexSheet);
      columnHeaders = columnInfo.columnHeaders;
      columns = columnInfo.columns;
      getValue = (key, i) => sexSheet[columnHeaders[key] + i].v;

      //Populate sex data
      let sexData = {};
      for (let i = 2; i <= columns; i++) {
        createIfUndefined(sexData, getValue('dataset', i), createNewDrugObject(false));
        Object.keys(drugOptions).forEach(drug => {
          let datasetNode = sexData[getValue('dataset', i)];
          datasetNode = createIfUndefined(datasetNode[drug], getValue('year', i), {});
          datasetNode = createIfUndefined(datasetNode, getValue('month', i), {});
          let datasetNodeCount = createIfUndefined(datasetNode, 'count', []);
          let datasetNodeRate = createIfUndefined(datasetNode, 'rate', []);
          if (getValue('sex', i) !== 'Missing' && getValue('age', i) !== 'Missing') {
            let datasetDatumCount = datasetNodeCount.find(datum => datum.age === getValue('age', i));
            if (!datasetDatumCount) {
              datasetDatumCount = { age: getValue('age', i) }
              datasetNodeCount.push(datasetDatumCount);
            }
            datasetDatumCount[getValue('sex', i)] = formatNumber(getValue('count_' + drug, i), false);

            let datasetDatumRate = datasetNodeRate.find(datum => datum.age === getValue('age', i));
            if (!datasetDatumRate) {
              datasetDatumRate = { age: getValue('age', i) }
              datasetNodeRate.push(datasetDatumRate);
            }
            datasetDatumRate[getValue('sex', i)] = formatNumber(getValue(drugOptions[drug].rateColumn, i), true);
          }
        });
      }




      const countySheet = wb.Sheets['County Counts & Rates'];
      columnInfo = getColumnsInfo(countySheet);
      columnHeaders = columnInfo.columnHeaders;
      columns = columnInfo.columns;
      getValue = (key, i) => countySheet[columnHeaders[key] + i].v;

      //Populate sex data
      let countyData = {};
      for (let i = 2; i <= columns; i++) {
        let year = countySheet[columnHeaders['year'] + i] ? getValue('year', i) : 'all';
        createIfUndefined(countyData, year, {});
        countyData[year][getValue('fips', i)] = {
          fips: getValue('fips', i),
          county: getValue('county', i),
          state: getValue('state', i),
          rate: formatNumber(getValue('rate_alldrug', i))
        };
      }

      Object.keys(sexData).forEach(dataSource => Object.keys(sexData[dataSource]).forEach(drug => {
        let annualMax = {'count': 0, 'rate': 0};
        let monthlyMax = {'count': 0, 'rate': 0};
        Object.keys(sexData[dataSource][drug]).forEach(year => {
          if(sexData[dataSource][drug][year]['all']){
            sexData[dataSource][drug][year]['all']['count'].forEach(d => {
              if(d['M'] > annualMax['count']) annualMax['count'] = d['M'];
              if(d['F'] > annualMax['count']) annualMax['count'] = d['F'];
            });
            sexData[dataSource][drug][year]['all']['rate'].forEach(d => {
              const dM = parseFloat(d['M']);
              const dF = parseFloat(d['F']);
              if(dM > annualMax['rate']) annualMax['rate'] = dM;
              if(dF > annualMax['rate']) annualMax['rate'] = dF;
            });
            Object.keys(sexData[dataSource][drug][year]).forEach(month => {
              if(month === 'all') return;
              sexData[dataSource][drug][year][month]['count'].forEach(d => {
                if(d['M'] > monthlyMax['count']) monthlyMax['count'] = d['M'];
                if(d['F'] > monthlyMax['count']) monthlyMax['count'] = d['F'];
              });
              sexData[dataSource][drug][year][month]['rate'].forEach(d => {
                const dM = parseFloat(d['M']);
                const dF = parseFloat(d['F']);
                if(dM > monthlyMax['rate']) monthlyMax['rate'] = dM;
                if(dF > monthlyMax['rate']) monthlyMax['rate'] = dF;
              });
            });
          }
        });
        sexData[dataSource][drug].maxAnnual = annualMax;
        sexData[dataSource][drug].maxMonthly = monthlyMax;
      }));
      
      setData({ state: stateData, year: yearData, sex: sexData, county: countyData, supportedStates, supportedJurisdictions });
    }

    fetchData();
  }, []);

  const barbellChartMemo = useMemo(() =>
    <>
      <h2 className="h3">{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, by state and overall<sup>†</sup>, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ${Math.min(currentYear, currentYearCompare)} compared to ${monthNames[currentMonth]} ${Math.max(currentYear, currentYearCompare)}` : `${Math.min(currentYear, currentYearCompare)} compared to ${Math.max(currentYear, currentYearCompare)}`}{(currentYear === '2022' || currentYearCompare === '2022' || currentYear === '2021' || currentYearCompare === '2021') && <sup>¶</sup>}</h2>
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
      <h2 className="h3">{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {currentState !== 'US' ? `${stateNames[currentState]} and overall` : 'overall'}<sup>†</sup>, {currentTimeframe === 'Monthly' ? <>January {currentYear}&#8211;December {currentYear}</> : <>{supportedYears[0]}&#8211;{supportedYearsLatest}</>}{(currentYear === '2022' || currentYear === '2021' || currentTimeframe === 'Annual') && <sup>¶</sup>}</h2>
      <LineChart params={{ data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear, currentMonth, width }} />
    </>,
    [data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear, currentMonth, width]);

  const sexAgeChartsMemo = useMemo(() =>
    <>
      <h2 className="h3">{currentTimeframe} {currentDataType} of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses{currentDataType === 'rate' ? ' per 100,000 persons' : ''}, overall<sup>†</sup>, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''} {currentYear}{(currentYear === '2022' || currentYear === '2021') && <sup>¶</sup>}</h2>
      Count
      <input className="data-type-checkbox" type="checkbox" onChange={e => setCurrentDataType(e.target.checked ? 'count' : 'rate')} defaultChecked="true"/>
      Rate
      <SexAgeCharts params={{ data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth: currentMonth, currentDataType, width }} />
    </>,
    [data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, currentDataType, width]);

  const usaMapMemo = useMemo(() =>
    currentDataSource === 'ED' ? <>
      <h2 className="h3">{currentYearGroup === 'one' ? 'Annual r' : 'R'}ate of emergency department (ED) visits for nonfatal all drug overdoses per 100,000 {currentYearGroup === 'all' ? 'person-years' : 'persons'}, by county{currentState === 'US' ? <sup>†</sup> : ', '}{currentState === 'US' ? '' : stateNames[currentState]}, {currentYearGroup === 'all' ? <>{supportedYears[0]}&#8211;{supportedYearsLatest}</> : currentYear}{(currentYearGroup === 'all' || currentYear === '2022' || currentYear === '2021') && <sup>¶</sup>}</h2>
      <div><small><i>The county-level heat map is only available for the rate (annual and 5-year) of ED visits for nonfatal all drug overdoses due to substantial suppression that would result if other comparisons were made.</i></small></div>
      1 Year Rate
      <input className="data-type-checkbox" type="checkbox" onChange={e => setCurrentYearGroup(e.target.checked ? 'one' : 'all')} defaultChecked="true"/>
      5 Year Rate
      <UsaMap params={{ data, stateNames, currentState, currentYear, currentYearGroup, width }} />
    </> : <></>,
    [data, stateNames, currentDataSource, currentState, currentYear, currentYearGroup, width]);

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
                    onChange: (val) => {
                      if(!timeframeChanged){
                        setTimeframeChanged(true)
                      }
                      setCurrentTimeframe(val)
                    },
                    options: ['Monthly', 'Annual'],
                    optionLabel: (key) => key
                  }}/>
                  <Select params={{
                    key: 'year',
                    label: 'a Year',
                    value: currentYear,
                    onChange: (param) => {
                      if(param === currentYearCompare){
                        let yearIndex = supportedYears.indexOf(param);
                        yearIndex++;
                        if(yearIndex >= supportedYears.length){
                          yearIndex = 0;
                        }
                        setCurrentYearCompare(supportedYears[yearIndex]);
                      }
                      setCurrentYear(param);
                    },
                    options: supportedYears,
                    optionLabel: (key) => key
                  }}/>
                  {timeframeChanged && <Select params={{
                    key: 'month',
                    label: 'a Month',
                    value: currentMonth,
                    onChange: setCurrentMonth,
                    options: Object.keys(monthNames).filter(key => key !== 'all'),
                    optionLabel: (key) => monthNames[key],
                    disabled: currentTimeframe === 'Monthly' ? undefined : 'disabled'
                  }} />}
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
              <h2>Nonfatal {drugOptions[currentDrug]['titleHeader']} Overdoses</h2>
            </header>
            <div className="callouts">
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{totalOverdoses ? totalOverdoses.toLocaleString() : 'N/A'}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>{stateNames[currentState]}</span>
                  <p>{currentTimeframe} number of nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdose {dataSourceOptions[currentDataSource]['titleLongest']} in {currentTimeframe !== 'Annual' && monthNames[currentMonth]} {currentYear}</p>
                </div>
              </div>
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{rateOverdoses || 'N/A'}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>{stateNames[currentState]}</span>
                  <p>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons in {currentTimeframe !== 'Annual' && monthNames[currentMonth]} {currentYear}</p>
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
      <small>
        <p>* Counts are suppressed when based on 1-9 overdoses and rates are suppressed when based on 1-19 overdoses to avoid sharing information that could be identifiable and because of possible instability of rate estimates. For more information, please see <a target="_blank" href="https://www.cdc.gov/nchs/data/statnt/statnt24.pdf">Healthy People 2010 Criteria for Data Suppression</a>. Mid-year annual population denominators were obtained from the U.S. Census Bureau for the calculation of rates; monthly population denominators were estimated through linear extrapolation of the annual population denominators.</p>
        <br/><p>† A total of 22 states submitted emergency department discharge data and 21 states submitted inpatient hospitalization discharge data. All of these states reported data from 2018-2022 except for Oklahoma, which, reported data from 2020-2021.</p>
        <br/><p>§ There are several important caveats to consider when viewing the figures included in this dashboard and interpreting trends over time. Care-seeking behavior changed during the COVID-19 pandemic, which could influence whether persons sought treatment for an overdose in an ED or hospital setting. Additionally, although coding is standardized under the International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM), the practice of assigning specific codes instead of others (e.g., poisoning codes versus use disorder codes) may vary by facility and state and over time. Some diagnosis codes may lack specificity, which can limit the ability to identify the specific drugs involved in an overdose; new diagnosis codes may also be added each year, which could improve specificity over time.</p>
        <br/><p>¶ For some states, counts and rates for all drug overdoses during October 2021–September 2022 are not directly comparable to prior months and years and may be an underestimate of true all drug overdose burden. Cannabis poisonings were captured in the all drug overdose category from January 2018–September 2021 in all states; however, in certain states, cannabis poisonings were not captured during October 2021–September 2022 due to discharge diagnosis code changes (more information is provided in “Important Data Considerations” #7). Cannabis poisonings in these data likely represent approximately 5% of all drug overdoses; however, certain sex and age groups may be more impacted by the accidental exclusion of the new cannabis codes.</p>
        <p>States that submitted revised data that include the cannabis codes, thus not impacted by this issue, include: Alaska, Hawaii, Iowa, Indiana, Kentucky, Nebraska, New York, North Carolina, Rhode Island, and Washington.</p>
      </small>
      <div className='data-tables'>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
            Data tables, {drugOptions[currentDrug]['titleAll']}
            {showDatatable && <span>{String.fromCharCode(8722)}</span>}
            {!showDatatable && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showDatatable &&
            <div className="datatable-body">
              <Datatable params={{ data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonth, currentYear, currentDataType, currentYearCompare, currentYearGroup }} />
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
                <li><strong>Some data may be missing or incomplete.</strong> Data not available by the reporting deadline may not ever be submitted, as data are typically considered final at submission.</li>
                <li><strong>Reporting facilities and the data they report can change over time.</strong><sup>†</sup> States may receive data from new facilities, and the data they report could change over time. The average percent of ED visits/inpatient hospitalizations currently captured from states participating in DOSE discharge data sharing is 90%.</li>
                <li><strong>These overdoses may not be confirmed by toxicological testing.</strong> These data may not be determined by toxicological testing, which is often limited in ED or hospital settings. Additionally, ED and inpatient hospitalization discharge data are collected for administrative/billing purposes; thus, surveillance for drug overdoses using these data may not accurately reflect the true overdose burden.</li>
                <li><strong>Data are included for overdoses of unintentional and undetermined intents.</strong> Only discharge diagnosis codes for overdoses of unintentional and undetermined intent are included in the data presented on this dashboard. Detailed information on case classification criteria can be found on <a target="_blank" href="https://www.cdc.gov/drugoverdose/nonfatal/case.html">About DOSE</a>.</li>
                <li><strong>Overdose visit numbers are not mutually exclusive</strong> but rather reflect nesting of drug categories: numbers of opioid-, heroin-, and stimulant-involved overdose visits are included in the numbers of all drug overdose visits; suspected heroin-involved overdose visits are included in the numbers of opioid-involved overdose visits; and some overdose visits involved multiple substances (e.g., a given overdose ED visit could have involved both opioids and stimulants).</li>
                <li><strong>Rates beginning in 2021 may not be directly comparable to prior years.</strong> The U.S. Census Bureau instituted new methodology to calculate population estimates beginning with 2021 data. The new methodology, referred to as differential privacy, ensures that data from individuals and individual households remain confidential.</li>
                <li>
                  <strong>For some states, counts and rates for all drug overdoses during October 2021–September 2022 are not directly comparable to prior months and years.</strong> Data from January 2018–September 2021 included discharge diagnosis codes for cannabis poisonings in the all drug overdose category. In October 2021, the prior cannabis poisoning diagnosis code (T40.7X) was retired, and new codes (T40.71, T40.72) for cannabis poisoning and synthetic cannabinoid poisoning were implemented (<a href="https://www.cms.gov/medicare/icd-10/2022-icd-10-cm" target="_blank">FY2022 ICD-10-CM</a>). However, these new codes were not queried in DOSE ED visit and inpatient hospitalization discharge data until October 2022. Thus, there may be underestimates in the counts and rates of all drug overdoses during October 2021–September 2022. Cannabis poisonings in these data likely represent approximately 5% of all drug overdoses; however, certain sex and age groups may be more impacted by the accidental exclusion of the new cannabis codes.
                  <br/>
                  States that submitted revised data that include the cannabis codes, thus not impacted by this issue, include: Alaska, Hawaii, Iowa, Indiana, Kentucky, Nebraska, New York, North Carolina, Rhode Island, and Washington.
                </li>
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
