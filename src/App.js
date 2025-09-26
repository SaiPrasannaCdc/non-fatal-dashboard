import React, { useState, useEffect, useMemo, useCallback, useRef, Fragment } from 'react';
import "babel-polyfill";
import debounce from 'lodash.debounce';
import ReactTooltip from 'react-tooltip';
import * as XLSX from 'xlsx';
import ResizeObserver from 'resize-observer-polyfill';

import StateChart from './components/StateChart';
import LineChart from './components/LineChart';
import SexAgeCharts from './components/SexAgeCharts';
import UsaMap from './components/UsaMap';
import Select from './components/Select';
import Datatable from './components/Datatable';
import Tab from "./components/tab";

import { UtilityFunctions } from './utility'

import './styles.scss';

const viewportCutoffSmall = 550;

const dataSourceOptions = {
  'ED': {
    'title': 'ED Visits',
    'titleLong': 'ED',
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
    'titleForDropDown': 'All Drugs',
    'titleHeader': 'All Drug',
    'rateColumn': 'rate_alldrug',
    'color': '#325D7D',
    'lineChartOrder': '1'
  },
  'benzodiazepine': {
    'titleSingular': 'Benzodiazepine',
    'titlePlural': 'Benzodiazepine',
    'titleAll': 'Benzodiazepine',
    'titleForDropDown': 'Benzodiazepine',
    'titleHeader': 'Benzodiazepine',
    'rateColumn': 'rate_benzodiazepine',
    'color': '#B83A5E',
    'lineChartOrder': '8'
  },
  'opioid': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioid',
    'titleForDropDown': 'All Opioids',
    'titleHeader': 'All Opioid',
    'rateColumn': 'rate_opioid',
    'color': '#000C77',
    'lineChartOrder': '5'
  },
  'fentanyl': {
    'titleSingular': 'Fentanyl',
    'titlePlural': 'Fentanyl',
    'titleAll': 'Fentanyl',
    'titleForDropDown': 'Fentanyl',
    'titleHeader': 'Fentanyl',
    'rateColumn': 'rate_fentanyl',
    'color': '#294891',
    'lineChartOrder': '6'
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'titleForDropDown': 'Heroin',
    'titleHeader': 'Heroin',
    'rateColumn': 'rate_heroin',
    'color': '#0C6F96',
    'lineChartOrder': '7'
  },
  'stimulant': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulant',
    'titleForDropDown': 'All Stimulants',
    'titleHeader': 'All Stimulant',
    'rateColumn': 'rate_stimulant',
    'color': '#411B6D',
    'lineChartOrder': '2'
  },
  'cocaine': {
    'titleSingular': 'Cocaine',
    'titlePlural': 'Cocaine',
    'titleAll': 'Cocaine',
    'titleForDropDown': 'Cocaine',
    'titleHeader': 'Cocaine',
    'rateColumn': 'rate_cocaine',
    'color': '#671AAA',
    'lineChartOrder': '3'
  },
  'methamphetamine': {
    'titleSingular': 'Methamphetamine',
    'titlePlural': 'Methamphetamine',
    'titleAll': 'Methamphetamine',
    'titleForDropDown': 'Methamphetamine',
    'titleHeader': 'Methamphetamine',
    'rateColumn': 'rate_methamphetamine',
    'color': '#A378E8',
    'lineChartOrder': '4'
  },
};

const supportedYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
const tabData = [{ label: "ED Visits" }, { label: "Inpatient Hospitalizations" }];
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
  if (!object[key]) {
    object[key] = value;
  }
  return object[key];
}

const formatNumber = (val, isFloat = true) => {
  let numericVal = isFloat ? parseFloat(val) : parseInt(val);
  if (isNaN(numericVal)) {
    if (val == 'NA')
      return 'Data not available';
    return 'Data suppressed*';
  } else {
    return (isFloat ? (Math.round(numericVal * 10) / 10).toFixed(1) : numericVal);
  }
};

export default function App(params) {

  const [data, setData] = useState();
  const [stateDropdownOptions, setStateDropdownOptions] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState('ED');
  const [currentDrug, setCurrentDrug] = useState('alldrug');
  const [currentState, setCurrentState] = useState('US');
  const [currentTimeframe, setCurrentTimeframe] = useState('Annual');
  const [currentMonth, setCurrentMonth] = useState('1');
  const [currentYear, setCurrentYear] = useState(supportedYearsLatest);
  const [currentYearGroup, setCurrentYearGroup] = useState('one');
  const [currentYearCompare, setCurrentYearCompare] = useState(supportedYears[0]);
  const [lookupPeriodStartYear, setLookupPeriodStartYear] = useState(supportedYearsLatest);
  const [lookupPeriodStartMonth, setLookupPeriodStartMonth] = useState('1');
  const [lookupPeriodEndYear, setLookupPeriodEndYear] = useState(supportedYearsLatest);
  const [lookupPeriodEndMonth, setLookupPeriodEndMonth] = useState('12');
  const [currentDataType, setCurrentDataType] = useState('count');
  const [showDatatable, setDatatable] = useState(false);
  const [showConsiderations, setConsiderations] = useState(false);
  const [showFootnotes, setFootnotes] = useState(false);
  const [showLabels, setLabelToggle] = useState(false);
  const [showPercent, setPercentToggle] = useState(false);
  const [isPeriod, setPeriodToggle] = useState(false);
  const [selectAllFlag, setSelectAllFlag] = useState(false);
  const [deselectAllFlag, setDeselectAllFlag] = useState(false);
  const [currentDrugOnly, setOnlyCurrentDrug] = useState(false);
  const [selectedDrugs, setselectedDrugs] = useState(['alldrug']);
  const [timeframeChanged, setTimeframeChanged] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { accessible } = params;
  const [width, setWidth] = useState(accessible ? 0 : 100);
  
  const dataPath = window.location.origin.includes('localhost') ? '/data/' : '/overdose-prevention/data-dashboards/dose-discharge-dashboard/data/';

  const toggleDatatable = () => setDatatable(!showDatatable);
  const toggleConsiderations = () => setConsiderations(!showConsiderations);
  const toggleFootnotes = () => setFootnotes(!showFootnotes);

  const isSmallViewport = width < viewportCutoffSmall;

  const stateBarChartRef = useRef();

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

  const handleDrugSelectionsChange = (event, drug) => {
    if (!event.currentTarget.className.includes('notSelected')) {
      if (drug != currentDrug) {
        event.currentTarget.classList.remove(drug);
        event.currentTarget.classList.add('notSelected');
        setselectedDrugs(selectedDrugs.filter(dr => dr !== drug))
        setSelectAllFlag(false);
      }
    }
    else {
      if (drug != currentDrug) {
        event.currentTarget.classList.remove('notSelected');
        event.currentTarget.classList.add(drug);
        setselectedDrugs([...selectedDrugs, drug])
        setDeselectAllFlag(false);
      }

    }
  }

    const getFileNameFromPath = (path) => {
    if(!path){
      return 'DOSE_DIS_Dashboard_Download.xlsx';
    }
    // Get the filename from the path and remove any query parameters
    const filename = path.split('/').pop();
    return filename.split('?')[0];
  }

  const selectAllDrugs = () => {
    var selDrugs = []
    Object.keys(drugOptions).forEach(drug => {
      selDrugs.push(drug)
    })
    setselectedDrugs(selDrugs)
  }

  const resetDates = () => {
    setLookupPeriodEndYear(currentYear);
    setLookupPeriodEndMonth('12');
    setLookupPeriodStartYear(currentYear);
    setLookupPeriodStartMonth('1');
  }

  const outerContainerRef = useCallback(node => {
    if (node !== null) {
      resizeObserver.observe(node);
    } // eslint-disable-next-line
  }, []);

  const overrideSuppMessage = (year, drug) => {
    if ((year === '2018' || year === '2019' || year === '2020') && (drug === 'fentanyl' || drug === 'methamphetamine'))
      return true;
    else
      return false;
  }

  const getSubBannerText = (imgtype) => {
    var txt = '';

    switch (imgtype) {

      case 'lineChart':

        if (currentDataSource == 'ED') {
          if (!isPeriod) {
            if (currentTimeframe === 'Monthly')
              txt = 'How often did people visit the ' + dataSourceOptions[currentDataSource]['titleLong'] + ' for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ((selectedDrugs.length > 1 && currentState == 'US') ? ' and other drug ' : '') + ' overdoses monthly in ' + currentYear;
            else
              txt = 'How often did people visit the ' + dataSourceOptions[currentDataSource]['titleLong'] + ' for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ((selectedDrugs.length > 1 && currentState == 'US') ? ' and other drug ' : '') + ' overdoses from ' + supportedYears[0] + ' to ' + supportedYearsLatest;
          }
          else {
            txt = 'How often did people visit the ' + dataSourceOptions[currentDataSource]['titleLong'] + ' for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ((selectedDrugs.length > 1 && currentState == 'US') ? ' and other drug ' : '') + ' overdoses from ' + monthNames[lookupPeriodStartMonth] + ' ' + lookupPeriodStartYear + ' to ' + monthNames[lookupPeriodEndMonth] + ' ' + lookupPeriodEndYear;
          }
        }
        else if (currentDataSource == 'HOSP') {
          if (!isPeriod) {
            if (currentTimeframe === 'Monthly')
              txt = 'How often were people hospitalized for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ((selectedDrugs.length > 1 && currentState == 'US') ? ' and other drug ' : '') + ' overdoses monthly in ' + currentYear;
            else
              txt = 'How often were people hospitalized for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ((selectedDrugs.length > 1 && currentState == 'US') ? ' and other drug ' : '') + ' overdoses from ' + supportedYears[0] + ' to ' + supportedYearsLatest;
          }
          else {
            txt = 'How often were people hospitalized for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ((selectedDrugs.length > 1 && currentState == 'US') ? ' and other drug ' : '') + ' overdoses from ' + monthNames[lookupPeriodStartMonth] + ' ' + lookupPeriodStartYear + ' to ' + monthNames[lookupPeriodEndMonth] + ' ' + lookupPeriodEndYear;
          }
        }
        break;

      case 'statebarChart':
        let drugName = drugOptions[currentDrug].titleAll.toLowerCase();
        let drugNameMod = ((currentDrug === 'alldrug' || currentDrug === 'opioid' || currentDrug === 'stimulant') ? drugName + 's' : drugName);
        if (currentDataSource == 'ED')
          txt = 'What is the rate of ED visits for nonfatal overdoses involving ' + drugNameMod + ' in ' + (currentState != 'US' ? (stateNames[currentState] + ' and other states in the U.S.') : ('all participating states ')) + ' in ' + (currentTimeframe === 'Monthly' ? monthNames[currentMonth] + ' ' : '') + currentYear;
        else if (currentDataSource == 'HOSP')
          txt = 'What is the rate of inpatient hospitalizations for nonfatal overdoses involving ' + drugNameMod + ' in ' + (currentState != 'US' ? (stateNames[currentState] + ' and other states in the U.S.') : ('all participating states ')) + ' in ' + (currentTimeframe === 'Monthly' ? monthNames[currentMonth] + ' ' : '') + currentYear;

        break;

      case 'sexChart':

        let key = currentDataSource + '_' + currentYear + '00';
        let numStates = data?.supportedJurisdictions[key]?.split(',').length - 1;

        if (currentTimeframe === 'Monthly') {
          if (currentDataSource == 'ED')
            txt = 'What was the ' + currentDataType + ' of ED visits for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' overdoses in ' + (currentTimeframe === 'Monthly' ? monthNames[currentMonth] + ' ' : '') + currentYear + ', Overall (' + numStates + ' States)';
          else if (currentDataSource == 'HOSP')
            txt = 'What was the ' + currentDataType + ' of hospitalizations for ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' overdoses in ' + (currentTimeframe === 'Monthly' ? monthNames[currentMonth] + ' ' : '') + currentYear + ', Overall (' + numStates + ' States)';
        }
        else {
          if (currentDataSource == 'ED')
            txt = 'What was the ' + currentDataType + ' of ED visits for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' overdoses in ' + (currentTimeframe === 'Monthly' ? monthNames[currentMonth] + ' ' : '') + currentYear + ', Overall (' + numStates + ' States)';
          else if (currentDataSource == 'HOSP')
            txt = 'What was the ' + currentDataType + ' of hospitalizations for ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' overdoses in ' + (currentTimeframe === 'Monthly' ? monthNames[currentMonth] + ' ' : '') + currentYear + ', Overall (' + numStates + ' States)';
        }

        break;

      case 'usaMap':
        if (currentDataSource == 'ED')
          txt = 'How often did people visit the ED for nonfatal ' + drugOptions[currentDrug].titleAll.toLowerCase() + ' overdoses by county in ' + currentYear;

        break;
    }

    return txt;

  }

  const getPeriodControls = () => {

    return (
      <Fragment>
        <div style={{ display: 'block', whiteSpace: 'pre' }}>
          <Select params={{
            key: 'year',
            label: 'Start Period: ',
            value: lookupPeriodStartYear,
            onChange: (val) => {
              if (!UtilityFunctions.areValidSelections(val, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth))
                resetDates()
              else
                setLookupPeriodStartYear(val)

              checkForPeriod(val, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth);
            },
            options: supportedYears.slice().filter(year => year <= supportedYearsLatest).reverse(),
            optionLabel: (key) => key,
            noSelectPrefix: true
          }} />
          <Select params={{
            key: 'month',
            label: '',
            value: lookupPeriodStartMonth,
            onChange: setLookupPeriodStartMonth,
            onChange: (val) => {
              if (!UtilityFunctions.areValidSelections(lookupPeriodStartYear, val, lookupPeriodEndYear, lookupPeriodEndMonth))
                resetDates();
              else
                setLookupPeriodStartMonth(val)

              checkForPeriod(lookupPeriodStartYear, val, lookupPeriodEndYear, lookupPeriodEndMonth);
            },
            options: Object.keys(monthNames).filter(key => key !== 'all'),
            optionLabel: (key) => monthNames[key],
            noSelectPrefix: true
          }} />
          <Select params={{
            key: 'year',
            label: 'End Period: ',
            value: lookupPeriodEndYear,
            onChange: (val) => {
              if (!UtilityFunctions.areValidSelections(lookupPeriodStartYear, lookupPeriodStartMonth, val, lookupPeriodEndMonth))
                resetDates();
              else
                setLookupPeriodEndYear(val)

              checkForPeriod(lookupPeriodStartYear, lookupPeriodStartMonth, val, lookupPeriodEndMonth)
            },
            options: supportedYears.slice().filter(year => year <= supportedYearsLatest).reverse(),
            optionLabel: (key) => key,
            noSelectPrefix: true
          }} />
          <Select params={{
            key: 'month',
            label: '',
            value: lookupPeriodEndMonth,
            onChange: (val) => {
              if (!UtilityFunctions.areValidSelections(lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, val))
                resetDates();
              else
                setLookupPeriodEndMonth(val)

              checkForPeriod(lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, val)
            },
            options: Object.keys(monthNames).filter(key => key !== 'all'),
            optionLabel: (key) => monthNames[key],
            noSelectPrefix: true
          }} />
        </div>
      </Fragment>
    )
  }

  const getPeriodControlsSVP = () => {

    return (
      <Fragment>
        <table>
          <tr>
            <td>
              <div style={{ display: 'block', whiteSpace: 'pre' }}>
                <Select params={{
                  key: 'year',
                  label: 'Start Period: ',
                  value: lookupPeriodStartYear,
                  onChange: (val) => {
                    if (!UtilityFunctions.areValidSelections(val, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth))
                      resetDates()
                    else
                      setLookupPeriodStartYear(val)

                    checkForPeriod(val, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth);
                  },
                  options: supportedYears.slice().filter(year => year <= supportedYearsLatest).reverse(),
                  optionLabel: (key) => key,
                  noSelectPrefix: true
                }} />
              </div>
            </td>
            <td>
              <div style={{ display: 'block', whiteSpace: 'pre' }}>
                <Select params={{
                  key: 'month',
                  label: '',
                  value: lookupPeriodStartMonth,
                  onChange: setLookupPeriodStartMonth,
                  onChange: (val) => {
                    if (!UtilityFunctions.areValidSelections(lookupPeriodStartYear, val, lookupPeriodEndYear, lookupPeriodEndMonth))
                      resetDates();
                    else
                      setLookupPeriodStartMonth(val)

                    checkForPeriod(lookupPeriodStartYear, val, lookupPeriodEndYear, lookupPeriodEndMonth);
                  },
                  options: Object.keys(monthNames).filter(key => key !== 'all'),
                  optionLabel: (key) => monthNames[key],
                  noSelectPrefix: true
                }} />
              </div>
             
            </td>
          </tr>
          <tr>
            <td>
              <div style={{ display: 'block', whiteSpace: 'pre' }}>
              <Select params={{
                key: 'year',
                label: 'End Period: ',
                value: lookupPeriodEndYear,
                onChange: (val) => {
                  if (!UtilityFunctions.areValidSelections(lookupPeriodStartYear, lookupPeriodStartMonth, val, lookupPeriodEndMonth))
                    resetDates();
                  else
                    setLookupPeriodEndYear(val)

                  checkForPeriod(lookupPeriodStartYear, lookupPeriodStartMonth, val, lookupPeriodEndMonth)
                },
                options: supportedYears.slice().filter(year => year <= supportedYearsLatest).reverse(),
                optionLabel: (key) => key,
                noSelectPrefix: true
              }} />
              </div>
            </td>
            <td>
              <div style={{ display: 'block', whiteSpace: 'pre' }}>
              <Select params={{
                key: 'month',
                label: '',
                value: lookupPeriodEndMonth,
                onChange: (val) => {
                  if (!UtilityFunctions.areValidSelections(lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, val))
                    resetDates();
                  else
                    setLookupPeriodEndMonth(val)

                  checkForPeriod(lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, val)
                },
                options: Object.keys(monthNames).filter(key => key !== 'all'),
                optionLabel: (key) => monthNames[key],
                noSelectPrefix: true
          }} />
              </div>
                
            </td>
          </tr>
        </table>
      </Fragment>
    )
  }

  const getPeriodControlsWrapper = () => {
    return (
      <Fragment>
        <table>
          <tr>
            <td style={{ width: '100%!important', textAlign: 'center' }}>
              {currentTimeframe === 'Monthly' && isSmallViewport && getPeriodControlsSVP()}
              {currentTimeframe === 'Monthly' && !isSmallViewport && getPeriodControls()}
            </td>
          </tr>
        </table>
      </Fragment>
    )
  }

  const getToggleControls = () => {
    return (
      <Fragment>
        {!isSmallViewport && 
          <table style={{ tableLayout: 'fixed', display: 'block', width: '100%' }}>
          <tr>
            <td style={{ width: '55%', paddingLeft: '65px' }}>
              <table style={{ width: '100%', tableLayout: 'fixed' }}>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top' }}>
                    {(currentState === 'US') &&
                      <label className="subLabel">Make a selection to change the line graph&nbsp;&nbsp;</label>
                    }
                  </td>
                  <td style={{ width: '18%', verticalAlign: 'top' }}>
                    <div>
                      {(currentState === 'US') &&
                        <label title="Check to select all drugs.">
                          <input id="toggleSelectAll" type="checkbox" checked={selectAllFlag}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentDrug(currentDrug);
                                selectAllDrugs();
                                setDeselectAllFlag(false);
                                setSelectAllFlag(true);
                              }
                              else {
                                setCurrentDrug(currentDrug);
                                setselectedDrugs([currentDrug])
                                setSelectAllFlag(false);
                              }
                            }} /> Select All
                        </label>

                      }
                    </div>
                  </td>
                  <td style={{ width: '20%', verticalAlign: 'top' }}>
                    <div>
                      {(currentState === 'US') &&
                        <label title="Check to clear all drugs, except current drug.">
                          <input id="toggleClearAll" type="checkbox" checked={deselectAllFlag}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentDrug(currentDrug);
                                setselectedDrugs([currentDrug])
                                setDeselectAllFlag(true);
                                setSelectAllFlag(false);
                              }
                              else {
                                setCurrentDrug(currentDrug);
                                setselectedDrugs([currentDrug]);
                                setDeselectAllFlag(false);
                              }
                            }} /> Clear All
                        </label>
                      }
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style={{ width: '15%' }}></td>
            <td style={{ width: '30%' }}>
              <table>
                <tr>
                  <td style={{ width: '76%', textAlign: 'right' }}>
                    {(currentTimeframe === 'Annual') &&
                      <div style={{ float: 'right' }}>
                        <label class="toggleA" title={'Toggle to hover over a data point on the line chart to view percent change for the selected year compared to the previous year.'}>
                          <input id="togglePercent" class="toggleA-input" type="checkbox" checked={showPercent}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPercentToggle(true)
                              }
                              else {
                                setPercentToggle(false)
                              }
                            }} />
                          <span class="toggleA-label" data-off="% Chg Off"
                            data-on="% Chg On">
                          </span>
                          <span class="toggleA-handle"></span>
                        </label>
                      </div>
                    }
                  </td>
                  <td style={{ width: '28%', textAlign: 'right' }}>
                    {(!accessible) &&
                      <div style={{ float: 'right' }}>
                        <label class="toggle" title={'Toggle to see values of a data point.'}>
                          <input id="toggleLabel" class="toggle-input" type="checkbox" checked={showLabels}
                            onChange={(e) => {
                              if (e.target.checked)
                                setLabelToggle(true)
                              else
                                setLabelToggle(false)
                            }} />
                          <span class="toggle-label" data-off="Labels Off"
                            data-on="Labels On">
                          </span>
                          <span class="toggle-handle"></span>
                        </label>
                      </div>
                    }
                  </td>
                </tr>
              </table>
            </td>

          </tr>
          <tr>
            <td colSpan='2' class="drugsDivTop" style={{ textAlign: 'left', verticalAlign: 'top', paddingLeft: '65px' }}>
              {(currentState === 'US') &&
                getDrugControls()
              }
            </td>
            {(!accessible && currentTimeframe === 'Annual') &&
              <td>
                <label className="subLabel">When "% Chg" is on, hover over a data point on the line chart to view percent change for the selected year compared to the previous year.&nbsp;&nbsp;</label>
              </td>
            }
          </tr>

          </table>
        }
        {isSmallViewport && 
          <table style={{ tableLayout: 'fixed', display: 'block', width: '100%' }}>
          <tr>
            <td colSpan='2'>
                {(currentState === 'US') &&
                      <label className="subLabel">Make a selection to change the line graph&nbsp;&nbsp;</label>
                    }
            </td>
          </tr>
          <tr>
                  <td style={{ width: '50%!important', verticalAlign: 'top', textAlign: 'left' }}>
                      {(currentState === 'US') &&
                        <label title="Check to select all drugs.">
                          <input id="toggleSelectAll" type="checkbox" checked={selectAllFlag}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentDrug(currentDrug);
                                selectAllDrugs();
                                setDeselectAllFlag(false);
                                setSelectAllFlag(true);
                              }
                              else {
                                setCurrentDrug(currentDrug);
                                setselectedDrugs([currentDrug])
                                setSelectAllFlag(false);
                              }
                            }} /> Select All
                        </label>
                      }
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'left' }}>
                    <div>
                      {(currentState === 'US') &&
                        <label title="Check to clear all drugs, except current drug.">
                          <input id="toggleClearAll" type="checkbox" checked={deselectAllFlag}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentDrug(currentDrug);
                                setselectedDrugs([currentDrug])
                                setDeselectAllFlag(true);
                                setSelectAllFlag(false);
                              }
                              else {
                                setCurrentDrug(currentDrug);
                                setselectedDrugs([currentDrug]);
                                setDeselectAllFlag(false);
                              }
                            }} /> Clear All
                        </label>
                      }
                    </div>
                  </td>
          </tr>
          <br></br>
          <tr>
            <td colSpan='2'>
              <table>
                <tr>
                  <td style={{ width: ((!accessible && !isSmallViewport) ? '76%' : '100%'), textAlign: ((!accessible && !isSmallViewport) ? 'left' : 'right') }}>
                    {(currentTimeframe === 'Annual') &&
                      <div style={{ float: 'left' }}>
                        <label class="toggleA" title={'Toggle to hover over a data point on the line chart to view percent change for the selected year compared to the previous year.'}>
                          <input id="togglePercent" class="toggleA-input" type="checkbox" checked={showPercent}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPercentToggle(true)
                              }
                              else {
                                setPercentToggle(false)
                              }
                            }} />
                          <span class="toggleA-label" data-off="% Chg Off"
                            data-on="% Chg On">
                          </span>
                          <span class="toggleA-handle"></span>
                        </label>
                      </div>
                    }
                  </td>
                  {(!accessible && !isSmallViewport) &&
                  <td style={{ width: '28%', textAlign: 'left' }}>
                    
                      <div style={{ float: 'left' }}>
                        <label class="toggle" title={'Toggle to see values of a data point.'}>
                          <input id="toggleLabel" class="toggle-input" type="checkbox" checked={showLabels}
                            onChange={(e) => {
                              if (e.target.checked)
                                setLabelToggle(true)
                              else
                                setLabelToggle(false)
                            }} />
                          <span class="toggle-label" data-off="Labels Off"
                            data-on="Labels On">
                          </span>
                          <span class="toggle-handle"></span>
                        </label>
                      </div>
                  </td>
                  }
                </tr>
              </table>
            </td>
          </tr>
          <br></br>
          <tr>
            <td colSpan='2' class="drugsDivTop" style={{ textAlign: 'left', verticalAlign: 'top', paddingLeft: '5px' }}>
              {(currentState === 'US') &&
                getDrugControls()
              }
            </td>
          </tr>
          <tr>
            {(!accessible && currentTimeframe === 'Annual') &&
              <td colSpan='2'>
                <label className="subLabel">When "% Chg" is on, hover over a data point on the line chart to view percent change for the selected year compared to the previous year.&nbsp;&nbsp;</label>
              </td>
            }
          </tr>

          </table>
        }
      </Fragment>
    )
  }

  const getDrugControls = () => {
    const entries = Object.entries(drugOptions);
    entries.sort((a, b) => a[1].lineChartOrder - b[1].lineChartOrder);

    if (!isSmallViewport) {
    return (
      <Fragment>
        <Fragment>
          <div style={{ width: '100%!important', float: 'left', display: 'inline-block' }}>
            {
              entries.map((drug, index) => (
                index < 4 &&
                <div class={`drugDiv-${drug[0]}`}>
                  <span class={(selectedDrugs.includes(drug[0]) || currentDrug.includes(drug[0])) ? drug[0] : 'notSelected'} onClick={(event) => { handleDrugSelectionsChange(event, drug[0]) }}></span>
                  <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                </div>

              ))
            }
          </div>
        </Fragment>
        <Fragment>
          <div style={{ width: '100%!important', float: 'left', display: 'inline-block' }}>
            {
              entries.map((drug, index) => (
                index >= 4 &&
                <div class={`drugDiv-${drug[0]}`}>
                  <span class={(selectedDrugs.includes(drug[0]) || currentDrug.includes(drug[0])) ? drug[0] : 'notSelected'} onClick={(event) => { handleDrugSelectionsChange(event, drug[0]) }}></span>
                  <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                </div>
              ))
            }
          </div>
        </Fragment>
      </Fragment>
    )
  }
  else
  {
    return (
              <Fragment>
                      <Fragment>
                        <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
                        {
                          entries.map((drug, index) => (
                            <div>
                              <div class={`drugDiv-${drug[0]}`}>
                                <span class={(selectedDrugs.includes(drug[0])) ? drug[0] : 'notSelected'} onClick={(event) => { handleDrugSelectionsChange(event, drug[0]) }}></span>
                                <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                              </div>
                              <br></br>
                              </div>
                              
                          ))
                        }
                        </div>
                      </Fragment>
                    </Fragment>
              )
  }
  }

  const fetchData = async () => {

    let supportedStates = {};
    let supportedJurisdictions = {};
    let stateData = {};
    let yearData = {};
    let sexData = {};
    let countyData = {};

    await fetch(dataPath + 'Jurisdiction_Counts_Rates.json')
      .then(res => res.json())
      .then(data => {

        let columns = data.length;
        let getValue = (key, i) => data[i][key];

        let datasetNode;
        for (let i = 0; i < columns; i++) {
          //Populate state data
          if (!stateData[getValue('dataset', i)]) {
            stateData[getValue('dataset', i)] = createNewDrugObject();
          }
          Object.keys(drugOptions).forEach(drug => {
            datasetNode = stateData[getValue('dataset', i)];
            //Drug rate
            let monthNode = createIfUndefined(datasetNode[drugOptions[drug].rateColumn], getValue('month', i), []);
            let monthDatum;
            monthNode.forEach(node => { if (node.state === getValue('jurisdiction', i)) monthDatum = node; });
            if (!monthDatum) {
              let state = getValue('jurisdiction', i);
              monthDatum = { state };
              monthNode.push(monthDatum);
            }
            monthDatum[getValue('year', i)] = formatNumber(getValue(drugOptions[drug].rateColumn, i));

            //Drug overdoses
            datasetNode = stateData[getValue('dataset', i)];
            monthNode = createIfUndefined(datasetNode[drug], getValue('month', i), []);
            monthDatum = undefined;
            monthNode.forEach(node => { if (node.state === getValue('jurisdiction', i)) monthDatum = node; });
            if (!monthDatum) {
              monthDatum = { state: getValue('jurisdiction', i) };
              monthNode.push(monthDatum);
            }
            monthDatum[getValue('year', i)] = formatNumber(getValue('count_' + drug, i), false);
          });

          //Populate year data
          datasetNode = createIfUndefined(yearData, getValue('dataset', i), {});
          datasetNode = createIfUndefined(datasetNode, getValue('jurisdiction', i), {});
          datasetNode = createIfUndefined(datasetNode, getValue('month', i), []);
          let yearDatum = { year: Number(getValue('year', i)) };
          Object.keys(drugOptions).forEach(drug => {
            yearDatum[drug] = formatNumber(getValue(drugOptions[drug].rateColumn, i));
          });
          datasetNode.push(yearDatum);

          //prepare jurisdictions data
          let ds = getValue('dataset', i);
          let yr = getValue('year', i);
          let tmp = getValue('month', i);
          let st = getValue('jurisdiction', i);
          let mon = tmp == 'all' ? '00' : String(tmp).padStart(2, '0');
          let key = ds + '_' + yr + mon;
          if (supportedJurisdictions[key])
            supportedJurisdictions[key] = supportedJurisdictions[key] + ',' + st;
          else
            supportedJurisdictions[key] = st;
        }

        let yearMaxes = {}
        Object.keys(yearData).forEach(dataSource => {
          Object.keys(yearData[dataSource]).forEach(state => {
            Object.keys(yearData[dataSource][state]).forEach(month => {
              const timeframe = month === 'all' ? 'Annual' : 'Monthly';
              if (!yearMaxes[timeframe]) yearMaxes[timeframe] = {};
              yearData[dataSource][state][month].forEach(row => {
                Object.keys(drugOptions).forEach(drug => {
                  const rowVal = parseFloat(row[drug])
                  if (!isNaN(rowVal) && (!yearMaxes[timeframe][drug] || yearMaxes[timeframe][drug] < rowVal)) {
                    yearMaxes[timeframe][drug] = rowVal
                  }
                });
              })
            })
          })
        });
        yearData['maxes'] = yearMaxes;

        //supported jurisdictions
        let key = currentDataSource + '_' + supportedYearsLatest + '00';
        let strStates = supportedJurisdictions[key]?.split(',');
        for (const st of strStates) {
          if (!supportedStates[st])
            supportedStates[st] = stateNames[st];
        }
        setStateDropdownOptions(Object.keys(supportedStates))

      });

    await fetch(dataPath + 'Overall_By_Sex_Age.json')
      .then(res => res.json())
      .then(data => {
        let columns = data.length;
        let getValue = (key, i) => data[i][key];

        //Populate sex data
        for (let i = 0; i < columns; i++) {
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

        Object.keys(sexData).forEach(dataSource => Object.keys(sexData[dataSource]).forEach(drug => {
          let annualMax = { 'count': 0, 'rate': 0 };
          let monthlyMax = { 'count': 0, 'rate': 0 };
          Object.keys(sexData[dataSource][drug]).forEach(year => {
            if (sexData[dataSource][drug][year]['all']) {
              sexData[dataSource][drug][year]['all']['count'].forEach(d => {
                if (d['M'] > annualMax['count']) annualMax['count'] = d['M'];
                if (d['F'] > annualMax['count']) annualMax['count'] = d['F'];
              });
              sexData[dataSource][drug][year]['all']['rate'].forEach(d => {
                const dM = parseFloat(d['M']);
                const dF = parseFloat(d['F']);
                if (dM > annualMax['rate']) annualMax['rate'] = dM;
                if (dF > annualMax['rate']) annualMax['rate'] = dF;
              });
              Object.keys(sexData[dataSource][drug][year]).forEach(month => {
                if (month === 'all') return;
                sexData[dataSource][drug][year][month]['count'].forEach(d => {
                  if (d['M'] > monthlyMax['count']) monthlyMax['count'] = d['M'];
                  if (d['F'] > monthlyMax['count']) monthlyMax['count'] = d['F'];
                });
                sexData[dataSource][drug][year][month]['rate'].forEach(d => {
                  const dM = parseFloat(d['M']);
                  const dF = parseFloat(d['F']);
                  if (dM > monthlyMax['rate']) monthlyMax['rate'] = dM;
                  if (dF > monthlyMax['rate']) monthlyMax['rate'] = dF;
                });
              });
            }
          });
          sexData[dataSource][drug].maxAnnual = annualMax;
          sexData[dataSource][drug].maxMonthly = monthlyMax;
        }));
      });

    await fetch(dataPath + 'County_Counts_Rates.json')
      .then(res => res.json())
      .then(data => {

        let columns = data.length;
        let getValue = (key, i) => data[i][key];

        for (let i = 0; i < columns; i++) {
          let year = getValue('year', i).length == 4 ? getValue('year', i) : 'all';
          createIfUndefined(countyData, year, {});
          countyData[year][getValue('fips', i)] = {
            fips: getValue('fips', i),
            county: getValue('county', i),
            state: getValue('jurisdiction', i),
            rate: formatNumber(getValue('rate_alldrug', i)),
            count: formatNumber(getValue('count_alldrug', i))
          };
        }
      });

    //set data
    setData({ state: stateData, year: yearData, sex: sexData, county: countyData, supportedJurisdictions });

    setOnlyCurrentDrug(false);

  }

  useEffect(() => {

    fetchData();

  }, []);

  const getFootNotesForData = (addl) => {
    return (
      <div className="datatable-body">
        <table style={{ width: '100%' }}>
          <tr style={{ textAlign: 'right', fontSize: '15px' }}><td>{'* Data suppressed'}<sup>3</sup></td></tr>
          <tr style={{ textAlign: 'right', fontSize: '15px' }}><td>{'† Data not available/not reported'}<sup>4</sup></td></tr>
          {addl && showPercent && <tr style={{ textAlign: 'right', fontSize: '15px' }}><td>{'§ Rate per 100,000 persons'}<sup>5</sup></td></tr>}
        </table>
      </div>
    )
  }

  const drugTab = (drugName, drugLabel) => (
    <button
      className={`drug-tab${drugName === currentDrug ? (' ' + drugName) : ''}`}
      onClick={() => {
        setCurrentDrug(drugName);
        setselectedDrugs([drugName])
        setDeselectAllFlag(false);
        setSelectAllFlag(false);
      }}
    >{drugLabel || drugName}</button>
  );

  const resetPeriodDates = (yr) => {
    setLookupPeriodStartYear(yr);
    setLookupPeriodStartMonth('1');
    setLookupPeriodEndYear(yr);
    setLookupPeriodEndMonth('12');
  }

  const checkForPeriod = (startYear, startMon, endYear, endMon) => {
    if (startYear == currentYear && endYear == currentYear && startMon == '1' && endMon == '12')
      setPeriodToggle(false);
    else
      setPeriodToggle(true);
  }

  function getSupportedStates(ds, yr, mon, tframe) {
    let supportedStates = {};
    let monMain = tframe != 'Monthly' ? '00' : String(mon).padStart(2, '0');
    let key = ds + '_' + yr + monMain;

    let strStates = data.supportedJurisdictions[key]?.split(',');
    for (const st of strStates) {
      if (!supportedStates[st])
        supportedStates[st] = stateNames[st];
    }
    setStateDropdownOptions(Object.keys(supportedStates))
  }

  const handleTabClick = (index) => {
    let ds;
    setActiveTab(index);
    ds = index == 0 ? 'ED' : 'HOSP';
    setCurrentDataSource(ds)
    getSupportedStates(ds, currentYear, currentMonth, currentTimeframe);

    if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, ds, currentYear, currentMonth, currentTimeframe, currentState)){
      setCurrentState('US');
      setOnlyCurrentDrug(false);
    }
  };

  const setDrug = (val) => {
    setCurrentDrug(val);
  }

  const stateBarChartMemo = useMemo(() =>
    <>
      <h2 className="data-bite-header sub" style={{ backgroundColor: drugColor }}>{getSubBannerText('statebarChart')}<sup>3,4</sup>?</h2>
      <div id="state-chart-container" className="chart-container" ref={stateBarChartRef}>
        <StateChart
          data={data}
          width={width}
          height={900} //TODO
          el={stateBarChartRef}
          currentState={currentState}
          currentDrug={currentDrug}
          currentDataSource={currentDataSource}
          currentTimeframe={currentTimeframe}
          currentMonth={currentMonth}
          currentYear={currentYear}
          drugOptions={drugOptions}
          stateNames={stateNames}
          setCurrentState={setCurrentState}
          accessible={accessible}
        />
      </div>
    </>,
    [data, width, currentDrug, currentDataSource, currentTimeframe, currentMonth, currentYear, currentState]);

  const lineChartMemo = useMemo(() =>
    <>
      <h2 className="data-bite-header sub" style={{ backgroundColor: drugColor }}>{getSubBannerText('lineChart')}<sup>{overrideSuppMessage(currentYear, currentDrug) ? '2,*' : '2'}</sup>?</h2>
      {getToggleControls()}
      <br></br>
      {(isSmallViewport && !accessible) && <div style={{color: '#000066', textAlign: 'center'}}><span><small>{'Rate per 100,000 persons'}</small><sup>5</sup></span></div>}
      <table style={{ width: '100%' }}>
        <tr>
          <td>
            <div class="containerLC">
              <div class={currentState === 'US' ? "chartDivAll" : "chartDivAll"}>
                <LineChart params={{ data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear, currentMonth, width, stateDropdownOptions, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth, showLabels, showPercent, isPeriod, currentDrugOnly, supportedYears, selectedDrugs, accessible }} />
              </div>
            </div>
          </td>
        </tr>
        <br></br>
        <tr>
          <td>{getPeriodControlsWrapper()}</td>
        </tr>

      </table>
    </>,
    [data, monthNames, stateNames, drugOptions, currentTimeframe, currentDataSource, currentDrug, currentState, currentYear, currentMonth, width, stateDropdownOptions, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth, showLabels, showPercent, isPeriod, currentDrugOnly, supportedYears, selectedDrugs]);

  const sexAgeChartsMemo = useMemo(() =>
    <>
      <h2 className="data-bite-header sub" style={{ backgroundColor: drugColor }}>{getSubBannerText('sexChart')}<sup>3,4</sup>?</h2>
      Count
      <input className="data-type-checkbox" type="checkbox" onChange={e => setCurrentDataType(e.target.checked ? 'count' : 'rate')} defaultChecked="true" />
      Rate
      <br></br>
      <div className='subsection marked'>
        <span className="individual-header margin-top-small-viewport" style={{ color: drugColor }}>By Age and Sex</span>
        <SexAgeCharts params={{ data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth: currentMonth, currentDataType, width, drugOptions, accessible }} />
      </div>
    </>,
    [data, currentTimeframe, currentDataSource, currentDrug, currentYear, currentMonth, currentDataType, width]);

  const usaMapMemo = useMemo(() =>
    (currentDataSource === 'ED' && currentDrug === 'alldrug') ? <>
      <h2 className="data-bite-header sub" style={{ backgroundColor: drugColor }}>{getSubBannerText('usaMap')}<sup>3,4</sup>?</h2>
      {!accessible && <div><small><i>The county-level heat map is only available for the rate (annual and 5-year) of ED visits for nonfatal all drug overdoses due to substantial suppression that would result if other comparisons were made. The county heat map uses patient county of residence data. By hovering, the heat map shows ED visits within each state: county-level numbers reflect in-state residents, while state-level numbers include both in-state residents and out-of-state residents (individuals residing in other states but visiting in-state facilities).</i></small></div>}
      {accessible && <div><small><i>The county-level tables are only available for the rate (annual and 5-year) of ED visits for nonfatal all drug overdoses due to substantial suppression that would result if other comparisons were made. This table uses patient county of residence data. County-level numbers reflect in-state residents who visited in-state facilities.</i></small></div>}
      1 Year Rate
      <input className="data-type-checkbox" type="checkbox" onChange={e => setCurrentYearGroup(e.target.checked ? 'one' : 'all')} defaultChecked="true" />
      5 Year Rate
      <UsaMap params={{ data, stateNames, currentState, currentYear, currentYearGroup, currentDrug, supportedYears, width, accessible }} />
    </> : <></>,
    [data, stateNames, currentDataSource, currentState, currentYear, currentYearGroup, currentDrug, supportedYears, width]);

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
  if (rateOverdoses) {
    rateOverdoses = rateOverdoses[[currentDrug]];
  }

  let totalOverdoses = data.state[currentDataSource][currentDrug][currentTimeframe === 'Monthly' ? currentMonth : 'all'].find(item => item.state === currentState);
  if (totalOverdoses) {
    totalOverdoses = totalOverdoses[currentYear];
  }

  return (
    <>
      <div className="filters-container" ref={outerContainerRef}>
        {width === 0 && loading}
        {width > 0 && (
          <>
            <div>
              <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Filters</div>
              <div className="filters">
                <div><label title="This dashboard contains 2 data sets">Select Data Source:</label><br></br><label className="subTitle">This dashboard contains two datasets</label><sup>6</sup></div>
                <div className="tabs-container">
                  <div className="tabs">
                    {tabData.map((tab, index) => (
                      <Tab
                        key={index}
                        label={tab.label}
                        onClick={() =>
                          handleTabClick(index)
                        }
                        isActive={index === activeTab}
                      />
                    ))}
                  </div>
                  <div className="tab-content">
                    {activeTab == 0 && <span><strong>ED Visits:</strong> Discharge data that captures information about patients who sought care at Emergency Department (ED) and were discharged from the ED.</span>}
                    {activeTab == 1 && <span><strong>Inpatient Hospitalization:</strong> These discharge data refer to information collected about patients’ hospital stays. Inpatient hospitalizations may represent increased severity of nonfatal overdoses, as compared to ED visits.</span>}
                  </div>
                </div>
              </div>
            </div>
            &nbsp;
            {!isSmallViewport &&
            <div className="filters">
              <div className={`dropdowns${isSmallViewport ? ' no-grid' : ''}`}>
                <Select params={{
                  key: 'timeframe',
                  label: 'Time Frame',
                  value: currentTimeframe,
                  onChange: (val) => {
                    if (!timeframeChanged) {
                      setTimeframeChanged(true)
                    }
                    setCurrentTimeframe(val)
                    getSupportedStates(currentDataSource, currentYear, currentMonth, val);
                    if (val === 'Monthly') {
                      setPercentToggle(false)
                      resetPeriodDates(currentYear)
                    }

                    setPeriodToggle(false);

                    if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, currentDataSource, currentYear, currentMonth, val, currentState)){
                      setCurrentState('US');
                      setOnlyCurrentDrug(false);
                    }
                  },
                  options: ['Monthly', 'Annual'],
                  optionLabel: (key) => key
                }} />
                <Select params={{
                  key: 'year',
                  label: 'a Year',
                  value: currentYear,
                  onChange: (param) => {
                    if (param === currentYearCompare) {
                      let yearIndex = supportedYears.indexOf(param);
                      yearIndex++;
                      if (yearIndex >= supportedYears.length) {
                        yearIndex = 0;
                      }
                      setCurrentYearCompare(supportedYears[yearIndex]);
                    }
                    setCurrentYear(param);
                    getSupportedStates(currentDataSource, param, currentMonth, currentTimeframe);
                    setPeriodToggle(false);

                    if (currentTimeframe === 'Monthly') {
                      resetPeriodDates(param)
                    }

                    if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, currentDataSource, param, currentMonth, currentTimeframe, currentState)){
                      setCurrentState('US');
                      setOnlyCurrentDrug(false);
                    }
                  },
                  options: supportedYears,
                  optionLabel: (key) => key
                }} />
                {(timeframeChanged && currentTimeframe == 'Monthly') && <Select params={{
                  key: 'month',
                  label: 'a Month',
                  value: currentMonth,
                  onChange: (param) => {
                    setCurrentMonth(param);
                    getSupportedStates(currentDataSource, currentYear, param, currentTimeframe);
                    resetPeriodDates(currentYear);
                    setPeriodToggle(false);

                    if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, currentDataSource, currentYear, param, currentTimeframe, currentState)) {
                      setCurrentState('US');
                      setOnlyCurrentDrug(false);
                    }
                  },
                  options: Object.keys(monthNames).filter(key => key !== 'all'),
                  optionLabel: (key) => monthNames[key],
                  disabled: currentTimeframe === 'Monthly' ? undefined : 'disabled'
                }} />}
                <Select params={{
                  key: 'jurisdiction',
                  label: 'View Data For: ',
                  noSelectPrefix: true,
                  value: currentState,
                  onChange: (param) => {
                    setCurrentState(param);
                    if (param !== 'US')
                      setOnlyCurrentDrug(true);
                    else
                      setOnlyCurrentDrug(false);
                  },


                  options: stateDropdownOptions?.sort((a, b) => {
                    if (a === 'US') return -1;
                    if (b === 'US') return 1;
                    return a < b;
                  }),
                  optionLabel: (key) => key != 'US' ? stateNames[key] : stateNames[key] + ' (' + (Object.keys(stateDropdownOptions).length - 1) + ' States)'
                }} />
                <div>
                  <button id="reset-button" style={{ backgroundColor: drugColor }} onClick={() => {
                    setActiveTab(0);
                    setCurrentDataSource('ED');
                    setCurrentDrug('alldrug');
                    setselectedDrugs(['alldrug'])
                    setCurrentState('US');
                    setCurrentTimeframe('Annual');
                    setCurrentMonth('1');
                    setCurrentYear(supportedYearsLatest);
                    setPeriodToggle(false);
                    setLabelToggle(false);
                    setPercentToggle(false);
                    setSelectAllFlag(false);
                    setDeselectAllFlag(false);
                  }}>Reset</button>
                </div>
              </div>
              &nbsp;
              <div><label>Select a Drug:</label></div>
              &nbsp;
              <div>
                <div className="drug-tab-section">
                  {drugTab('alldrug', <span>All Drugs</span>)}
                  {drugTab('benzodiazepine', <span>Benzodiazepine</span>)}
                  {drugTab('heroin', <span>Heroin</span>)}
                  {drugTab('stimulant', <span>All Stimulants</span>)}
                </div>
                <div className="drug-tab-section">
                  {drugTab('opioid', <span>All Opioids</span>)}
                  {drugTab('fentanyl', <span>Fentanyl</span>)}
                  {drugTab('cocaine', <span>Cocaine</span>)}
                  {drugTab('methamphetamine', <span>Methamphetamine</span>)}
                </div>
              </div>
            </div>
            }
            {isSmallViewport &&
            <div className="filters">
              <table>
                <tr>
                  <td>
                    <div className={`dropdowns${isSmallViewport ? ' no-grid' : ''}`}>
                        <Select params={{
                          key: 'timeframe',
                          label: 'Time Frame',
                          value: currentTimeframe,
                          onChange: (val) => {
                            if (!timeframeChanged) {
                              setTimeframeChanged(true)
                            }
                            setCurrentTimeframe(val)
                            getSupportedStates(currentDataSource, currentYear, currentMonth, val);
                            if (val === 'Monthly') {
                              setPercentToggle(false)
                              resetPeriodDates(currentYear)
                            }

                            setPeriodToggle(false);

                            if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, currentDataSource, currentYear, currentMonth, val, currentState)){
                              setCurrentState('US');
                              setOnlyCurrentDrug(false);
                            }
                          },
                          options: ['Monthly', 'Annual'],
                          optionLabel: (key) => key
                        }} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className={`dropdowns${isSmallViewport ? ' no-grid' : ''}`}>
                        <Select params={{
                          key: 'year',
                          label: 'a Year',
                          value: currentYear,
                          onChange: (param) => {
                            if (param === currentYearCompare) {
                              let yearIndex = supportedYears.indexOf(param);
                              yearIndex++;
                              if (yearIndex >= supportedYears.length) {
                                yearIndex = 0;
                              }
                              setCurrentYearCompare(supportedYears[yearIndex]);
                            }
                            setCurrentYear(param);
                            getSupportedStates(currentDataSource, param, currentMonth, currentTimeframe);
                            setPeriodToggle(false);

                            if (currentTimeframe === 'Monthly') {
                              resetPeriodDates(param)
                            }

                            if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, currentDataSource, param, currentMonth, currentTimeframe, currentState)){
                              setCurrentState('US');
                              setOnlyCurrentDrug(false);
                            }
                          },
                          options: supportedYears,
                          optionLabel: (key) => key
                      }} />
                    </div>
                  </td>
                </tr>
                {(timeframeChanged && currentTimeframe == 'Monthly') &&
                <tr>
                  <td>
                    <div className={`dropdowns${isSmallViewport ? ' no-grid' : ''}`}>
                        <Select params={{
                            key: 'month',
                            label: 'a Month',
                            value: currentMonth,
                            onChange: (param) => {
                              setCurrentMonth(param);
                              getSupportedStates(currentDataSource, currentYear, param, currentTimeframe);
                              resetPeriodDates(currentYear);
                              setPeriodToggle(false);

                              if (!UtilityFunctions.isStateInSupportedStates(data.supportedJurisdictions, currentDataSource, currentYear, param, currentTimeframe, currentState)) {
                                setCurrentState('US');
                                setOnlyCurrentDrug(false);
                              }
                            },
                            options: Object.keys(monthNames).filter(key => key !== 'all'),
                            optionLabel: (key) => monthNames[key],
                            disabled: currentTimeframe === 'Monthly' ? undefined : 'disabled'
                          }} />
                    </div>
                  </td>
                </tr>
                }
                <tr>
                  <td>
                    <div className={`dropdowns${isSmallViewport ? ' no-grid' : ''}`}>
                      <Select params={{
                        key: 'jurisdiction',
                        label: 'View Data For: ',
                        noSelectPrefix: true,
                        value: currentState,
                        onChange: (param) => {
                          setCurrentState(param);
                          if (param !== 'US')
                            setOnlyCurrentDrug(true);
                          else
                            setOnlyCurrentDrug(false);
                        },


                        options: stateDropdownOptions?.sort((a, b) => {
                          if (a === 'US') return -1;
                          if (b === 'US') return 1;
                          return a < b;
                        }),
                        optionLabel: (key) => key != 'US' ? stateNames[key] : stateNames[key] + ' (' + (Object.keys(stateDropdownOptions).length - 1) + ' States)'
                      }} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div>
                      <button id="reset-button" style={{ backgroundColor: drugColor }} onClick={() => {
                        setActiveTab(0);
                        setCurrentDataSource('ED');
                        setCurrentDrug('alldrug');
                        setselectedDrugs(['alldrug'])
                        setCurrentState('US');
                        setCurrentTimeframe('Annual');
                        setCurrentMonth('1');
                        setCurrentYear(supportedYearsLatest);
                        setPeriodToggle(false);
                        setLabelToggle(false);
                        setPercentToggle(false);
                        setSelectAllFlag(false);
                        setDeselectAllFlag(false);
                      }}>Reset</button>
                </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div>
                      <select id="drug-select" value={currentDrug} onChange={(e) => { setDrug(e.target.value); }}>
                        <option value="alldrug">All Drugs</option>
                        <option value="stimulant">All Stimulants</option>
                        <option value="opioid">All Opioids</option>
                        <option value="fentanyl">Fentanyl</option>
                        <option value="cocaine">Cocaine</option>
                        <option value="methamphetamine">Methamphetamine</option>
                        <option value="heroin">Heroin</option>
                        <option value="benzodiazepine">Benzodiazepine</option>
                      </select>
                  </div>
                  </td>
                </tr>
              </table>
            </div>
            }
            
            &nbsp;
            <header className="data-bite-header" style={{ backgroundColor: drugColor }}>
              <span className="biggerFont">Trends in {dataSourceOptions[currentDataSource]['title']}</span>
              <h2>Nonfatal {drugOptions[currentDrug]['titleHeader']} Overdoses</h2>
            </header>
            <div className="callouts">
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{totalOverdoses}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>{stateNames[currentState]}</span>
                  <p>{currentTimeframe} number of nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdose {dataSourceOptions[currentDataSource]['titleLowerCase']} in <strong>{currentTimeframe !== 'Annual' && monthNames[currentMonth]} {currentYear}</strong></p>
                </div>
              </div>
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{rateOverdoses || 'N/A'}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>{stateNames[currentState]}</span>
                  <p>Rate<sup>1</sup> of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdose in <strong>{currentTimeframe !== 'Annual' && monthNames[currentMonth]} {currentYear}</strong></p>
                </div>
              </div>
              <div style={{ 'borderLeft': '5px solid' + drugColor }}>
                <span className="callout" style={{ 'color': drugColor }}>{Object.keys(stateDropdownOptions).length - 1}</span>
                <div>
                  <span className='data-bite-title' style={{ color: drugColor }}>States Participating<sup>2</sup></span>
                  <p>Participating states with reported data</p>
                </div>
              </div>
            </div>
            <div><sup>1</sup><small><i>Overall rate is calculated per 100,000 persons using U.S. Census population denominators. Overdoses counted in each category may involve multiple substances.</i></small></div>

            <section className="first-section">
              {lineChartMemo}
              <br></br>
              {!accessible && getFootNotesForData()}
              {accessible && getFootNotesForData(true)}
            </section>

            <section>
              {stateBarChartMemo}
              {getFootNotesForData()}
            </section>

            <section>
              {sexAgeChartsMemo}
              {getFootNotesForData()}
            </section>

            <section>
              {usaMapMemo}
              {accessible && getFootNotesForData()}
            </section>
          </>
        )}
      </div>
      <div className='data-tables'>
        {/* <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
            Data tables, {drugOptions[currentDrug]['titleForDropDown']}
            {showDatatable && <span>{String.fromCharCode(8722)}</span>}
            {!showDatatable && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showDatatable &&
            <div className="datatable-body">
              <Datatable params={{ data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonth, currentYear, currentDataType, currentYearCompare, currentYearGroup, stateDropdownOptions }} />
            </div>}
        </div> */}
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleFootnotes}>
            Footnotes
            {showFootnotes && <span>{String.fromCharCode(8722)}</span>}
            {!showFootnotes && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showFootnotes &&
            <div className="datatable-body">
              <ul id='noBullets'>
                <li><strong><sup>1</sup></strong>Overall rate is calculated per 100,000 persons using U.S. Census population denominators. Mid-year annual population denominators were obtained from the U.S. Census Bureau using the most recently updated data at the time of analysis (<a target="_blank" href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-detail.html">https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-detail.html</a>).</li>
                <li><strong><sup>2</sup></strong>Jurisdictions submitting data to DOSE are funded to provide data coverage accounting for at least 80% of facilities within a jurisdiction; however, some jurisdictions’ coverage was lower (i.e., between 60%-&lt;80%). Thus, these results should be interpreted with caution and likely represent an underestimation in counts and rates. Jurisdictions with 60-&lt;80% ED facility coverage include IN (2020 only), LA (2018-2021), and MT (2023 only). Jurisdictions with 60-&lt;80% inpatient hospital facility coverage include MT (2018-2023). Jurisdictions with &lt;60% facility coverage are not posted on the DOSE dashboard.</li>
                <li><strong><sup>3</sup></strong>Counts based on 1-9 overdoses and rates when based on 1-19 overdose counts are suppressed to avoid sharing information that could be identifiable and because of possible instability of rate estimates. For more information, please see <a target="_blank" href="https://www.cdc.gov/nchs/data/statnt/statnt24.pdf">Healthy People 2010 Criteria for Data Suppression</a>. Mid-year annual population denominators were obtained from the <a target="_blank" href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-detail.html">U.S. Census Bureau</a> for the calculations of rates.</li>
                <li><strong><sup>4</sup></strong>A total of 32 jurisdictions submit DOSE ED discharge data and 35 jurisdictions submit DOSE inpatient hospitalization discharge data under OD2A in States. Certain jurisdictions participating in DOSE discharge surveillance were not included in the current dashboard update, or were not included for all years, if data were not yet completed. Oklahoma reported ED data beginning in 2021. The “Overall” (all jurisdictions) category may not be comparable across years because different jurisdictions may be included in different years based on data availability.</li>
                <li><strong><sup>5</sup></strong>The term "rate" in the context of ED or inpatient hospitalization visits for nonfatal drug overdoses refers to the number of visits per 100,000 individuals in the population. This metric allows for a more accurate comparison of ED or inpatient hospitalization visit frequencies across different population sizes and demographics.</li>
                <li><strong><sup>6</sup></strong>The Emergency Department (ED) and inpatient hospitalization datasets are intended to be mutually exclusive. The ED dataset captures individuals who sought care and were discharged from the ED, while the inpatient hospitalization dataset includes patients admitted through the ED or other sources.</li>
              </ul>
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
              <ul>
                <li><strong>Some data may be missing or incomplete.</strong> Data not available by the reporting deadline may not ever be submitted or incomplete, as data are typically considered final at submission.</li>
                <li><strong>Reporting facilities and the data they report can change over time.</strong> Jurisdictions may receive data from new facilities, and the data they report could change over time. The average percent of ED or hospital facilities currently captured from jurisdictions participating in DOSE discharge data sharing is &gt; 90%. A total of 32 jurisdictions submit DOSE ED discharge data and 35 jurisdictions submit DOSE inpatient hospitalization discharge data under OD2A in States. Certain jurisdictions participating in DOSE discharge surveillance were not included in the current dashboard update, or were not included for all years, if data were not yet completed. Oklahoma reported ED data beginning in 2021. The “Overall” (all jurisdictions) category may not be comparable across years because different jurisdictions may be included in different years based on data availability.</li>
                <li><strong>These overdoses may not be confirmed by toxicological testing.</strong> These data may not be determined by toxicological testing, which is often limited in ED or hospital settings. Additionally, ED and inpatient hospitalization discharge data are collected for administrative/billing purposes; thus, surveillance for drug overdoses using these data may not accurately reflect the true overdose trend.</li>
                <li><strong>Data are included for overdoses of unintentional and undetermined intents.</strong> Only discharge diagnosis codes for overdoses of unintentional and undetermined intent, initial encounters are included in the data presented on this dashboard. Detailed information on case classification criteria can be found on the <a target="_blank" href="/overdose-prevention/data-research/facts-stats/about-dose-system.html">About DOSE</a> page.</li>
                <li><strong>Overdose visit numbers are not mutually exclusive</strong> but rather reflect nesting of drug categories: numbers of opioid-, fentanyl-, heroin-, benzodiazepine-, stimulant-, cocaine-, and methamphetamine-involved overdose visits are included in the numbers of all drug overdose visits; heroin- and fentanyl-involved overdose visits are included in the numbers of opioid-involved overdose visits; cocaine- and methamphetamine-involved overdose visits are included in the numbers of stimulant-involved overdose visits; and some overdose visits involved multiple substances (e.g., a given overdose ED visit could have involved both opioids and stimulants).</li>
                <li><strong>Rates beginning in 2021 may not be directly comparable to prior years.</strong> The <a target="_blank" href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-detail.html">U.S. Census Bureau</a> instituted new methodology to calculate population estimates beginning with 2021 data. The new methodology, referred to as differential privacy, ensures that data from individuals and individual households remain confidential.</li>
                <li><strong>Jurisdictions submitting data to DOSE are funded to provide data coverage accounting for at least 80% of facilities within a jurisdiction;</strong> however, some jurisdictions' coverage was lower (i.e., between 60% and 79%). Thus, these results should be interpreted with caution and likely represent an underestimation in counts and rates. States with 60% - &lt;80% ED facility coverage include IN (2020 only), LA (2018-2021), and MT (2023 only). States with 60 - &lt;80% inpatient hospital facility coverage include MT (2018-2023). State data with &lt;60% facility coverage are not posted on the DOSE dashboard.</li>
                <li><strong>There are several important caveats to consider</strong> when viewing the {!accessible ? 'figures' : 'tables'} included in this dashboard and interpreting trends over time. Care-seeking behavior changed during the COVID-19 pandemic, which could influence whether persons sought treatment for an overdose in an ED or hospital setting. Additionally, although coding is standardized under the International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM), the practice of assigning specific codes instead of others (e.g., poisoning codes versus use disorder codes) may vary by facility and state and over time. Some diagnosis codes may lack specificity, which can limit the ability to identify the specific drugs involved in an overdose; new diagnosis codes may also be added each year, which could improve specificity over time.</li>
              </ul>
            </div>}
        </div>
      </div>

      <a download={getFileNameFromPath(document.querySelector('#non-fatal-container').attributes['download-url']?.value)} href={document.querySelector('#non-fatal-container').attributes['download-url']?.value} aria-label="Download this data in an Excel file format." className="btn btn-download-local no-border">Download Data (XLSX)</a><span> {isSmallViewport ? <br></br> : ''} with all available ED and inpatient hospitalization discharge data.</span>

      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip" />
    </>
  );
}