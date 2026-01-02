import React, { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import StateChart from './components/StateChart';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';
import Slider from 'rc-slider';
import UsaMap from './components/UsaMap';
import AgeChart from './components/AgeChart';
import SexChart from './components/SexChart';
import SexAgeChart from './components/SexAgeChart';
import UpDownArrow from './components/UpDownArrow';
import AngleArrow from './components/AngleArrow';
import ReactTooltip from 'react-tooltip';
import Context from './context';
import 'rc-slider/assets/index.css';
import './styles.scss';
import { UtilityFunctions } from './utility'

const viewportCutoffSmall = 550;
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

/* const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
}; */

/**
 * Generates variations of the primary color for hover and active
 * 
 * @param {*} color 
 * @returns 
 */

const Hexagon = ({fill, patternn}) => {
  return (
    <svg viewBox="0 0 45 51">
      <defs>
          <pattern id="pattern_KJD3DK2" patternUnits="userSpaceOnUse" width="9.5" height="9.5" patternTransform="rotate(45)">
            <line x1="0" y="0" x2="0" y2="9.5" stroke="#0C0824" style={{ strokeWidth: 2 }} />
          </pattern>
        </defs>
      <polygon fill={ (patternn && patternn != '') ? patternn : fill } strokeWidth={1} stroke="gray" points="22 0 44 12.702 44 38.105 22 50.807 0 38.105 0 12.702"/>
    </svg>
  )
}

const monthNames = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December', 'all': 'All Months' };
const stateNames = { 'US': 'Overall', 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming' };

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

const drugOptions = {
  'all': {
    'titleSingular': 'Drug',
    'titlePlural': 'All Drugs',
    'titleAll': 'All Drugs',
    'titleAllGram': 'All Drug',
    'titleForDropDown': 'All Drugs',
    'rateColumn': 'drug_rate',
    'percentageColumn': 'drug_pct',
    'color': '#325D7D',
    'barChartOrder': '1',
    'lineChartOrder': '1',
  },
  'benzodiazepine': {
    'titleSingular': 'Benzodiazepine',
    'titlePlural': 'Benzodiazepine',
    'titleAll': 'Benzodiazepine',
    'titleAllGram': 'Benzodiazepine',
    'titleForDropDown': 'Benzodiazepine',
    'rateColumn': 'benzodiazepine_rate',
    'percentageColumn': 'benzodiazepine_pct',
    'color': '#B83A5E',
    'barChartOrder': '8',
    'lineChartOrder': '8',
  },
  'opioids': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioids',
    'titleAllGram': 'All Opioid',
    'titleForDropDown': 'All Opioids',
    'rateColumn': 'opioid_rate',
    'percentageColumn': 'opioid_pct',
    'color': '#000C77',
    'barChartOrder': '5',
    'lineChartOrder': '5',
  },
  'fentanyl': {
    'titleSingular': 'Fentanyl',
    'titlePlural': 'Fentanyl',
    'titleAll': 'Fentanyl',
    'titleAllGram': 'Fentanyl',
    'titleForDropDown': 'Fentanyl',
    'rateColumn': 'fentanyl_rate',
    'percentageColumn': 'fentanyl_pct',
    'color': '#294891',
    'barChartOrder': '6',
    'lineChartOrder': '6',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'titleAllGram': 'Heroin',
    'titleForDropDown': 'Heroin',
    'rateColumn': 'heroin_rate',
    'percentageColumn': 'heroin_pct',
    'color': '#0C6F96',
    'barChartOrder': '7',
    'lineChartOrder': '7',
  },
  'stimulants': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulants',
    'titleAllGram': 'All Stimulant',
    'titleForDropDown': 'All Stimulants',
    'rateColumn': 'stimulant_rate',
    'percentageColumn': 'stimulant_pct',
    'color': '#411B6D',
    'barChartOrder': '2',
    'lineChartOrder': '2',
  },
  'cocaine': {
    'titleSingular': 'Cocaine',
    'titlePlural': 'Cocaine',
    'titleAll': 'Cocaine',
    'titleAllGram': 'Cocaine',
    'titleForDropDown': 'Cocaine',
    'rateColumn': 'cocaine_rate',
    'percentageColumn': 'cocaine_pct',
    'color': '#671AAA',
    'barChartOrder': '3',
    'lineChartOrder': '3',
  },
  'methamphetamine': {
    'titleSingular': 'Methamphetamine',
    'titlePlural': 'Methamphetamine',
    'titleAll': 'Methamphetamine',
    'titleAllGram': 'Methamphetamine',
    'titleForDropDown': 'Methamphetamine',
    'rateColumn': 'methamphetamine_rate',
    'percentageColumn': 'methamphetamine_pct',
    'color': '#A378E8',
    'barChartOrder': '4',
    'lineChartOrder': '4',
  }
}

export default function App( params ) {

  const { accessible, dataUrl } = params;

  const [currentDrug, setCurrentDrug] = useState(Object.keys(drugOptions)[0]);
  const [timeline, setTimeline] = useState('Monthly');
  const [timelineBar, setTimelineBar] = useState('Monthly');
  const [timelineLine, setTimelineLine] = useState('Monthly');
  const [currentState, setCurrentState] = useState('US');
  const [currentStateBar, setCurrentStateBar] = useState('US');
  const [currentStateLine, setCurrentStateLine] = useState('US')
  const [currentYear, setCurrentYear] = useState('');
  const [currentYearMap, setCurrentYearMap] = useState('');
  const [currentYearBar, setCurrentYearBar] = useState('');
  const [currentYearSexAge, setCurrentYearSexAge] = useState('');
  const [currentDataType, setCurrentDataType] = useState('rate');

  const [currentMonth, setCurrentMonth] = useState('');
  const [currentMonthMap, setCurrentMonthMap] = useState('');
  const [currentMonthBar, setCurrentMonthBar] = useState('');
  const [currentMonthSexAge, setCurrentMonthSexAge] = useState('');
  
  const [keyedRawUSDataAnnual, setKeyedRawUSdataAnnual] = useState([]);
  const [keyedRawUSDataMonthly, setKeyedRawUSdataMonthly] = useState([]);
  const [keyedRawDataAnnual, setKeyedRawdataAnnual] = useState([]);
  const [keyedRawDataMonthly, setKeyedRawdataMonthly] = useState([]);
  const [monthsForDropDown, setMonthsForDropDown] = useState([]); 
  const [monthsForDropDownMap, setMonthsForDropDownMap] = useState([]);
  const [monthsForDropDownBar, setMonthsForDropDownBar] = useState([]);
  const [monthsForDropDownSexAge, setMonthsForDropDownSexAge] = useState([]); 
  const [yearsForDropDown, setYearsForDropDown] = useState([]); 
  const [jurisCountData, setJurisCountData] = useState([]);
  const [jurisCount, setJurisCount] = useState([]);
  const [jurisForDropDown, setJurisForDropDown] = useState([]);
  const [jurisForDropDownLine, setJurisForDropDownLine] = useState([]);
  const [jurisForDropDownMap, setJurisForDropDownMap] = useState([]);
  const [startUSMonthYearForSliderM, setStartUSMonthYearForSliderM] = useState('');
  const [startMonthYearForSliderM, setStartMonthYearForSliderM] = useState('');
  const [endUSMonthYearForSliderM, setEndUSMonthYearForSliderM] = useState('');
  const [endMonthYearForSliderM, setEndMonthYearForSliderM] = useState('');
  const [startUSMonthYearForSliderA, setStartUSMonthYearForSliderA] = useState('');
  const [startMonthYearForSliderA, setStartMonthYearForSliderA] = useState('');
  const [endUSMonthYearForSliderA, setEndUSMonthYearForSliderA] = useState('');
  const [endMonthYearForSliderA, setEndMonthYearForSliderA] = useState('');
  const [sliderKey, setSliderKey] = useState(0);
  const [mapKey, setMapKey] = useState(0);
  

  const [showAnnual, setMonthlyToggle] = useState(false);
  const [showAnnualBar, setMonthlyToggleBar] = useState(false);
  const [showAnnualLine, setMonthlyToggleLine] = useState(false);
  const [showPercent, setPercentToggle] = useState(false);  
  const [showOverall, setOverallToggle] = useState(false);

  const [selectedDrugs, setselectedDrugs] = useState(['all']);
  const [selectedDrugsBar, setselectedDrugsBar] = useState(['benzodiazepine', 'opioids', 'fentanyl', 'heroin', 'stimulants', 'cocaine', 'methamphetamine']);
  const [selectedDrugsLine, setselectedDrugsLine] = useState(['all']);
  const [selectedDrugsSexAge, setselectedDrugsSexAge] = useState(['all']);

  const [showConsiderations, setShowConsiderations] = useState(false);
  const [showFootNotes, setShowFootNotes] = useState(false);
  const [showLineChart, setShowLineChart] = useState(true);

  const [lookupPeriodStartYearM, setLookupPeriodStartYearM] = useState('');
  const [lookupPeriodStartMonthM, setLookupPeriodStartMonthM] = useState('');
  const [lookupPeriodEndYearM, setLookupPeriodEndYearM] = useState('');
  const [lookupPeriodEndMonthM, setLookupPeriodEndMonthM] = useState('');

  const [lookupPeriodStartYearA, setLookupPeriodStartYearA] = useState('');
  const [lookupPeriodStartMonthA, setLookupPeriodStartMonthA] = useState('');
  const [lookupPeriodEndYearA, setLookupPeriodEndYearA] = useState('');
  const [lookupPeriodEndMonthA, setLookupPeriodEndMonthA] = useState('');

  const [hdrInfoFromMap, setDataFromMap] = useState('all');
  const [mapMonthly, setMapMonthly] = useState('Monthly');
  const [sexAgeMonthly, setSexAgeMetric] = useState('Monthly');
  const [mapSort, setSortFromMap] = useState('M');

  const [isPeriod, setPeriodToggle] = useState(true);

  const [stateSort, setStateSort] = useState('S');
  const [barSort, setBarSort] = useState('B');

  const [width, setWidth] = useState(accessible ? 0 : 100);

  const isSmallViewport = width < viewportCutoffSmall;

  const wrapperStyle = { width: 900, marginBottom: 30, marginLeft: 10, marginTop: 5 };
  const wrapperStyleM = { width: width - 20, marginBottom: 30, marginLeft: 10, marginTop: 5 };

  const stateBarChartRef = useRef();
  const drugsBarChartRef = useRef();
  const lineChartRef = useRef();
  const sexChartRef = useRef();
  const ageChartRef = useRef();
  const sexAgeChartRef = useRef();

  const toggleLineChart = () => setShowLineChart(!showLineChart);

  const defaultValueIfEmpty = (v, df) => {
    if (v && v != '') return v;

    else return df;
  }

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
      if(val == 'not available' || val == 'NA')
        return 'Data not available';
      
      return 'InValid';
    } else {
      return (isFloat ? (Math.round(numericVal * 10) / 10).toFixed(1) : numericVal);
    }
  };

  const prepareData = (stData, usData, jurisCntData) => {

    let tempKeyedRawDataMonthly = [];
    let tempKeyedRawDataAnnual = [];
    let tempKeyedRawUSDataMonthly = [];
    let tempKeyedRawUSDataAnnual = [];

    //juris count data 
    setJurisCountData(jurisCntData);

    //us data
    for(let y=0;y<Object.keys(usData.Monthly['US']).length;y++)
    {
      let mon = Object.keys(usData.Monthly['US'])[y]; 
      for(let z=0;z<Object.keys(usData.Monthly['US'][mon]).length;z++)
      {
        let sex = Object.keys(usData.Monthly['US'][mon])[z]; 
        let sexD = '';
        switch (sex) {
            case 'F':
              sexD = 'Female'
              break;
            case 'M':
              sexD = 'Male'
              break; 
            default:
              sexD = sex;
        }

        for(let a=0;a<Object.keys(usData.Monthly['US'][mon][sex]).length;a++)
        {
          let ageGroup = Object.keys(usData.Monthly['US'][mon][sex])[a]; 
          for(let b=0;b<usData.Monthly['US'][mon][sex][ageGroup].length;b++)
          {
            let obj = {};
            obj['geoid'] = 'US';
            obj['Sex'] = sexD;
            obj['Age_Group'] = ageGroup;
            obj['YYYYMM'] = usData.Monthly['US'][mon][sex][ageGroup][b].year + String(mon).padStart(2, '0');
            obj['total_drug_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].all;
            obj['total_drug_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].all_pct;
            obj['total_Benzo_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].benzodiazepine;
            obj['total_Benzo_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].benzodiazepine_pct;
            obj['total_opioid_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].opioids;
            obj['total_opioid_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].opioids_pct;
            obj['total_Fentanyl_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].fentanyl;
            obj['total_Fentanyl_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].fentanyl_pct;
            obj['total_heroin_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].heroin;
            obj['total_heroin_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].heroin_pct;
            obj['total_stimulant_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].stimulants;
            obj['total_stimulant_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].stimulants_pct;
            obj['total_Cocaine_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].cocaine;
            obj['total_Cocaine_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].cocaine_pct;
            obj['total_Methamphetamine_OD_n'] = usData.Monthly['US'][mon][sex][ageGroup][b].methamphetamine;
            obj['total_Methamphetamine_OD_pct'] = usData.Monthly['US'][mon][sex][ageGroup][b].methamphetamine_pct;

            tempKeyedRawUSDataMonthly.push(obj);
          }
        }
      }
    }

    for(let y=0;y<Object.keys(usData.Annual['US']).length;y++)
    {
      let mon = Object.keys(usData.Annual['US'])[y]; 
      for(let z=0;z<Object.keys(usData.Annual['US'][mon]).length;z++)
      {
        let sex = Object.keys(usData.Annual['US'][mon])[z]; 
        let sexD = '';
        switch (sex) {
            case 'F':
              sexD = 'Female'
              break;
            case 'M':
              sexD = 'Male'
              break; 
            default:
              sexD = sex;
        }

        for(let a=0;a<Object.keys(usData.Annual['US'][mon][sex]).length;a++)
        {
          let ageGroup = Object.keys(usData.Annual['US'][mon][sex])[a]; 
          for(let b=0;b<usData.Annual['US'][mon][sex][ageGroup].length;b++)
          {
            let obj = {};
            obj['geoid'] = 'US';
            obj['Sex'] = sexD;
            obj['Age_Group'] = ageGroup;
            obj['YYYYMM'] = usData.Annual['US'][mon][sex][ageGroup][b].year + String(mon).padStart(2, '0');
            obj['total_drug_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].all;
            obj['total_drug_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].all_pct;
            obj['total_Benzo_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].benzodiazepine;
            obj['total_Benzo_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].benzodiazepine_pct;
            obj['total_opioid_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].opioids;
            obj['total_opioid_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].opioids_pct;
            obj['total_Fentanyl_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].fentanyl;
            obj['total_Fentanyl_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].fentanyl_pct;
            obj['total_heroin_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].heroin;
            obj['total_heroin_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].heroin_pct;
            obj['total_stimulant_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].stimulants;
            obj['total_stimulant_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].stimulants_pct;
            obj['total_Cocaine_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].cocaine;
            obj['total_Cocaine_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].cocaine_pct;
            obj['total_Methamphetamine_OD_n'] = usData.Annual['US'][mon][sex][ageGroup][b].methamphetamine;
            obj['total_Methamphetamine_OD_pct'] = usData.Annual['US'][mon][sex][ageGroup][b].methamphetamine_pct;

            tempKeyedRawUSDataAnnual.push(obj);
          }
        }
      }
    }

    //state data
    for(let x=0;x<Object.keys(stData.Monthly).length;x++) {
      let st = Object.keys(stData.Monthly)[x]
      for(let y=0;y<Object.keys(stData.Monthly[st]).length;y++)
      {
        let mon = Object.keys(stData.Monthly[st])[y]; 
        for(let b=0;b<stData.Monthly[st][mon].length;b++)
        {
          let obj = {};
          obj['geoid'] = st;
          obj['YYYYMM'] = stData.Monthly[st][mon][b].year + String(mon).padStart(2, '0');
          obj['total_drug_OD_n'] = stData.Monthly[st][mon][b].all;
          obj['total_Benzo_OD_n'] = stData.Monthly[st][mon][b].benzodiazepine;
          obj['total_opioid_OD_n'] = stData.Monthly[st][mon][b].opioids;
          obj['total_Fentanyl_OD_n'] = stData.Monthly[st][mon][b].fentanyl;
          obj['total_heroin_OD_n'] = stData.Monthly[st][mon][b].heroin;
          obj['total_stimulant_OD_n'] = stData.Monthly[st][mon][b].stimulants;
          obj['total_Cocaine_OD_n'] = stData.Monthly[st][mon][b].cocaine;
          obj['total_Methamphetamine_OD_n'] = stData.Monthly[st][mon][b].methamphetamine;

          tempKeyedRawDataMonthly.push(obj);
        }
      }
    }

    for(let x=0;x<Object.keys(stData.Annual).length;x++) {
      let st = Object.keys(stData.Annual)[x]
      for(let y=0;y<Object.keys(stData.Annual[st]).length;y++)
      {
        let mon = Object.keys(stData.Annual[st])[y]; 
        for(let b=0;b<stData.Annual[st][mon].length;b++)
        {
          let obj = {};
          obj['geoid'] = st;
          obj['YYYYMM'] = stData.Annual[st][mon][b].year + String(mon).padStart(2, '0');
          obj['total_drug_OD_n'] = stData.Annual[st][mon][b].all;
          obj['total_Benzo_OD_n'] = stData.Annual[st][mon][b].benzodiazepine;
          obj['total_opioid_OD_n'] = stData.Annual[st][mon][b].opioids;
          obj['total_Fentanyl_OD_n'] = stData.Annual[st][mon][b].fentanyl;
          obj['total_heroin_OD_n'] = stData.Annual[st][mon][b].heroin;
          obj['total_stimulant_OD_n'] = stData.Annual[st][mon][b].stimulants;
          obj['total_Cocaine_OD_n'] = stData.Annual[st][mon][b].cocaine;
          obj['total_Methamphetamine_OD_n'] = stData.Annual[st][mon][b].methamphetamine;

          tempKeyedRawDataAnnual.push(obj);
        }
      }
    }

    setKeyedRawUSdataMonthly(tempKeyedRawUSDataMonthly);
    setKeyedRawUSdataAnnual(tempKeyedRawUSDataAnnual);
    setKeyedRawdataMonthly(tempKeyedRawDataMonthly);
    setKeyedRawdataAnnual(tempKeyedRawDataAnnual);

    tempKeyedRawUSDataMonthly.sort((a, b) => {
      if (a['YYYYMM'] < b['YYYYMM']) {
        return -1;
      } else if (a['YYYYMM'] === b['YYYYMM'] && a['YYYYMM'] < b['YYYYMM']) {
        return -1;
      } else {
        return 1;
      }
    });

    tempKeyedRawUSDataAnnual.sort((a, b) => {
      if (a['YYYYMM'] < b['YYYYMM']) {
        return -1;
      } else if (a['YYYYMM'] === b['YYYYMM'] && a['YYYYMM'] < b['YYYYMM']) {
        return -1;
      } else {
        return 1;
      }
    });

    if (tempKeyedRawUSDataMonthly && tempKeyedRawUSDataMonthly.length > 0) {
      let cntUS = tempKeyedRawUSDataMonthly.length;
      setCurrentYear(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
      setCurrentYearMap(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
      setCurrentYearBar(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
      setCurrentYearSexAge(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
      setCurrentMonth(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
      setCurrentMonthMap(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
      setCurrentMonthBar(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
      setCurrentMonthSexAge(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
      setYearsForDropDown(getYears(tempKeyedRawUSDataMonthly[0]['YYYYMM'], tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM']));
      setMonthsForDropDown(getMonths(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
      setMonthsForDropDownBar(getMonths(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
      setMonthsForDropDownMap(getMonths(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
      setMonthsForDropDownSexAge(getMonths(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
      setJurisCount(getJurisCount(tempKeyedRawDataMonthly, Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
      setJurisForDropDown(getJurisInitial(tempKeyedRawDataMonthly, Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), false));
      setJurisForDropDownLine(getJurisInitial(tempKeyedRawDataMonthly, Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), false));
      setJurisForDropDownMap(getJurisInitial(tempKeyedRawDataMonthly, Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), true));
      setLookupPeriodStartYearM('2023');
      setLookupPeriodStartMonthM('1');
      setLookupPeriodEndYearM(String(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)));
      setLookupPeriodEndMonthM(String(Number(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
      setStartUSMonthYearForSliderM(tempKeyedRawUSDataMonthly[0]['YYYYMM']); 
      setEndUSMonthYearForSliderM(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM']); 
      setStartMonthYearForSliderM(tempKeyedRawUSDataMonthly[0]['YYYYMM']); 
      setEndMonthYearForSliderM(tempKeyedRawUSDataMonthly[cntUS-1]['YYYYMM']); 
    }

    if (tempKeyedRawUSDataAnnual && tempKeyedRawUSDataAnnual.length > 0) {
      let cntUS = tempKeyedRawUSDataAnnual.length;
      setLookupPeriodStartYearA('2023');
      setLookupPeriodStartMonthA('1');
      setLookupPeriodEndYearA(String(tempKeyedRawUSDataAnnual[cntUS-1]['YYYYMM'].substring(0,4)));
      setLookupPeriodEndMonthA(String(Number(tempKeyedRawUSDataAnnual[cntUS-1]['YYYYMM'].substring(4))));
      setStartUSMonthYearForSliderA(tempKeyedRawUSDataAnnual[0]['YYYYMM']); 
      setEndUSMonthYearForSliderA(tempKeyedRawUSDataAnnual[cntUS-1]['YYYYMM']); 
      setStartMonthYearForSliderA(tempKeyedRawUSDataAnnual[0]['YYYYMM']); 
      setEndMonthYearForSliderA(tempKeyedRawUSDataAnnual[cntUS-1]['YYYYMM']); 
    }
  };

    useEffect(() => {
    const fetchData = async () => {

      const binaryData = await (await fetch(dataUrl)).arrayBuffer();
      const wb = XLSX.read(binaryData);

      //Populate state data
      let supportedJurisdictions = {};

      const stateSheet = wb.Sheets['Jurisdiction'];
      let columnInfoSt = getColumnsInfo(stateSheet);
      let columnHeadersSt = columnInfoSt.columnHeaders;
      let columnsSt = columnInfoSt.columns;
      let getValueSt = (key, j) => stateSheet[columnHeadersSt[key] + j].v;

      let stateData = {};
      let datasetNodeSt;

      for (let i = 2; i <= columnsSt; i++) {

        datasetNodeSt = createIfUndefined(stateData, getValueSt('rate_time', i), {});
        datasetNodeSt = createIfUndefined(datasetNodeSt, getValueSt('jurisdiction', i), {});
        datasetNodeSt = createIfUndefined(datasetNodeSt, getValueSt('month', i), []);
        let yearDatumSt = { year: getValueSt('year', i) };
        Object.keys(drugOptions).forEach(drug => {
          yearDatumSt[drug] = formatNumber(getValueSt(drugOptions[drug].rateColumn, i));
        });
        datasetNodeSt.push(yearDatumSt);

        /* //prepare jurisdictions data
        let ds = 'ED';
        let yr = getValueSt('year', i);
        let tmp = getValueSt('month', i);
        let st = getValueSt('jurisdiction', i);
        let mon = tmp == 'all' ? '00' : String(tmp).padStart(2, '0');
        let key = ds + '_' + yr + mon;
        if(supportedJurisdictions[key])
          supportedJurisdictions[key] = supportedJurisdictions[key] + ',' + st;
        else
          supportedJurisdictions[key] = st; */
      }

      //Populate overall data
      const overallSheet = wb.Sheets['Overall'];
      let columnInfoOverall = getColumnsInfo(overallSheet);
      let columnHeadersOverall = columnInfoOverall.columnHeaders;
      let columnsOverall = columnInfoOverall.columns;
      let getValueOverall = (key, k) => overallSheet[columnHeadersOverall[key] + k].v;

      let overallData = {};
      let datasetNodeOverall;

      for (let i = 2; i <= columnsOverall; i++) {
       
        datasetNodeOverall = createIfUndefined(overallData, getValueOverall('rate_time', i), {});
        datasetNodeOverall = createIfUndefined(datasetNodeOverall, getValueOverall('geoid', i), {});
        datasetNodeOverall = createIfUndefined(datasetNodeOverall, getValueOverall('month', i), []);
        datasetNodeOverall = createIfUndefined(datasetNodeOverall, getValueOverall('sex', i), []);
        datasetNodeOverall = createIfUndefined(datasetNodeOverall, getValueOverall('age_range', i), []);
        
        let yearDatumOverall = { year: getValueOverall('year', i) };
        Object.keys(drugOptions).forEach(drug => {
            yearDatumOverall[drug] = formatNumber(getValueOverall(drugOptions[drug].rateColumn, i));
            yearDatumOverall[drug + '_pct'] = formatNumber(getValueOverall(drugOptions[drug].percentageColumn, i));
        });
        datasetNodeOverall.push(yearDatumOverall);
      }

      //Populate Juris count data
      /* const jurisCountSheet = wb.Sheets['Jurisdiction_count'];
      let columnInfoJuris = getColumnsInfo(jurisCountSheet);
      let columnHeadersJuris = columnInfoJuris.columnHeaders;
      let columnsJuris = columnInfoJuris.columns;
      let getValueJuris = (key, l) => jurisCountSheet[columnHeadersJuris[key] + l].v;
 */
      let jurisCountsData = {};

      for (let x = 2; x <= columnsOverall; x++) {
        let mon = String(getValueOverall('month', x)).padStart(2, '0');
        let yr = getValueOverall('year', x);
        let rt = getValueOverall('rate_time', x);
        let count = getValueOverall('jurisdiction_count', x);

       jurisCountsData[yr + mon + rt] = count;

      }

      prepareData(stateData, overallData, jurisCountsData);
      
    }

    fetchData();


  }, []);

  const setMonthSelected = (mon) => {
    let monNum = getKeyByValue(monthNames, mon)
    setCurrentMonth(monNum);
  };


   const setYearSelected = (yr, freq) => {
      setCurrentYear(yr);

      if (freq == "Monthly" && endUSMonthYearForSliderM.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderM.substring(4));
        setMonthsForDropDown(getMonths(mon))
        setMonthSelected(monthNames[Number(mon)]);
      }
      else if (freq == "Annual" && endUSMonthYearForSliderA.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderA.substring(4));
        setMonthsForDropDown(getMonths(mon))
        setMonthSelected(monthNames[Number(mon)]);
      }
      else {

        var tmpMonths = getMonthsYrChanged(yr, freq);
        setMonthsForDropDown(tmpMonths);

        if (tmpMonths.includes(monthNames[Number(currentMonth)]))
          setMonthSelected(monthNames[Number(currentMonth)]);
        else
          setMonthSelected((tmpMonths[0]));
      }
  };

  const setMonthSelectedBar = (mon) => {
    let monNum = getKeyByValue(monthNames, mon)
    setCurrentMonthBar(monNum);
  };

  const setYearSelectedBar = (yr, freq) => {

      setCurrentYearBar(yr);

      if (freq == "Monthly" && endUSMonthYearForSliderM.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderM.substring(4));
        setMonthsForDropDownBar(getMonths(mon))
        setMonthSelectedBar(monthNames[Number(mon)]);
      }
      else if (freq == "Annual" && endUSMonthYearForSliderA.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderA.substring(4));
        setMonthsForDropDownBar(getMonths(mon))
        setMonthSelectedBar(monthNames[Number(mon)]);
      }
      else {
         var tmpMonths = getMonthsYrChanged(yr, freq);
        setMonthsForDropDownBar(tmpMonths);

        if (tmpMonths.includes(monthNames[Number(currentMonthBar)]))
          setMonthSelectedBar(monthNames[Number(currentMonthBar)]);
        else
          setMonthSelectedBar(tmpMonths[0]);
      }
  };

 
  const setMonthSelectedMap = (mon) => {
    let monNum = getKeyByValue(monthNames, mon)
    setCurrentMonthMap(monNum);
  };

  const setYearSelectedMap = (yr, freq) => {

      setCurrentYearMap(yr);

      if (freq == "Monthly" && endUSMonthYearForSliderM.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderM.substring(4));
        setMonthsForDropDownMap(getMonths(mon))
        setMonthSelectedMap(monthNames[Number(mon)]);
      }
      else if (freq == "Annual" && endUSMonthYearForSliderA.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderA.substring(4));
        setMonthsForDropDownMap(getMonths(mon))
        setMonthSelectedMap(monthNames[Number(mon)]);
      }
      else {
         var tmpMonths = getMonthsYrChanged(yr, freq);
        setMonthsForDropDownMap(tmpMonths);

        if (tmpMonths.includes(monthNames[Number(currentMonthMap)]))
          setMonthSelectedMap(monthNames[Number(currentMonthMap)]);
        else
          setMonthSelectedMap(tmpMonths[0]);
      }
  };

  const setMonthSelectedSexAge = (mon) => {
    let monNum = getKeyByValue(monthNames, mon)
    setCurrentMonthSexAge(monNum);
  };

  const setYearSelectedSexAge = (yr, freq) => {

      setCurrentYearSexAge(yr);

      if (freq == "Monthly" && endUSMonthYearForSliderM.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderM.substring(4));
        setMonthsForDropDownSexAge(getMonths(mon))
        setMonthSelectedSexAge(monthNames[Number(mon)]);
      }
      else if (freq == "Annual" && endUSMonthYearForSliderA.includes(yr)) {
        let mon = Number(endUSMonthYearForSliderA.substring(4));
        setMonthsForDropDownSexAge(getMonths(mon))
        setMonthSelectedSexAge(monthNames[Number(mon)]);
      }
      else {
        var tmpMonths = getMonthsYrChanged(yr, freq);
        setMonthsForDropDownSexAge(tmpMonths);
        if (tmpMonths.includes(monthNames[Number(currentMonthSexAge)]))
          setMonthSelectedSexAge(monthNames[Number(currentMonthSexAge)]);
        else
          setMonthSelectedSexAge(tmpMonths[0]);
      }
  };

  const handleData = (forHdr) => {
    setDataFromMap(forHdr);
  };

  const handleSort = (forSort) => {
    setSortFromMap(forSort);
  };
 
  const getMonths = (mon) => {

    var monthsForListBox = [];
    if (mon == null)
    {
      for (let i=12;i>0;i--)
        monthsForListBox.push(monthNames[i])
    }
    else
    {
    for (let i=mon;i>0;i--)
        monthsForListBox.push(monthNames[i])
    }

    return monthsForListBox;

}

const getMonthsYrChanged = (yr, freq) => {

    var months = [];

    for (var x=0;x<Object.keys(jurisCountData).length;x++)
    {
      if (Object.keys(jurisCountData)[x].startsWith(yr) && Object.keys(jurisCountData)[x].includes(freq))
          months.push(Number(Object.keys(jurisCountData)[x].substring(4).substring(0,2)))
    }

    months.sort((a, b) => b - a);

    var monthsForListBox = [];
    
    for (let i=0;i<months.length;i++)
        monthsForListBox.push(monthNames[months[i]])

    return monthsForListBox;

}


const didOnAfterChangeTriggerMonthly = (value) => {

    var sliderStartYr = currentStateLine == 'US' ? startUSMonthYearForSliderM.substring(0,4) : startMonthYearForSliderM.substring(0,4);
    var sliderStartMon = currentStateLine == 'US' ? String(Number(startUSMonthYearForSliderM.substring(4))) : String(Number(startMonthYearForSliderM.substring(4)));
    var sliderEndYr = currentStateLine == 'US' ? endUSMonthYearForSliderM.substring(0,4) : endMonthYearForSliderM.substring(0,4);
    var sliderEndMon = currentStateLine == 'US' ? String(Number(endUSMonthYearForSliderM.substring(4))) : String(Number(endMonthYearForSliderM.substring(4)));

    var monthsArray = UtilityFunctions.generateYYMMArray(Number(sliderStartYr), Number(sliderStartMon), Number(sliderEndYr), Number(sliderEndMon));

    let stmonYr =  monthsArray[value[0] - 1];
    let endmonYr =  monthsArray[value[1] - 1];

    setLookupPeriodStartYearM(stmonYr.substring(0,4));
    setLookupPeriodStartMonthM(String(Number(stmonYr.substring(4))));
    setLookupPeriodEndYearM(endmonYr.substring(0,4));
    setLookupPeriodEndMonthM(String(Number(endmonYr.substring(4))));

    var monthsArraySel = UtilityFunctions.generateYYMMArray(Number(stmonYr.substring(0,4)), Number(stmonYr.substring(4)), Number(endmonYr.substring(0,4)), Number(endmonYr.substring(4)));
    var monthsArraySelCnt = Object.keys(monthsArraySel).length;

    var jurisForDate = {};
    for (let i=0; i<monthsArraySel.length;i++) {
      jurisForDate[monthsArraySel[i]] = jurisCountData[monthsArraySel[i] + timelineLine];
    }

    let finalMonYr = Object.entries(jurisForDate)[monthsArraySelCnt-1][0];
    let startMonYr = Object.entries(jurisForDate)[0][0];

    let jurisF = getJuris(Number(finalMonYr.substring(0,4)), Number(finalMonYr.substring(4)), timelineLine);
    let jurisS = getJuris(Number(startMonYr.substring(0,4)), Number(startMonYr.substring(4)), timelineLine);
    let finalJuris = UtilityFunctions.getObjectWithCommonKeys(jurisF, jurisS); 

    setJurisForDropDownLine(finalJuris);

  };

  const didOnAfterChangeTriggerAnnual = (value) => {

    var sliderStartYr = currentStateLine == 'US' ? startUSMonthYearForSliderA.substring(0,4) : startMonthYearForSliderA.substring(0,4);
    var sliderStartMon = currentStateLine == 'US' ? String(Number(startUSMonthYearForSliderA.substring(4))) : String(Number(startMonthYearForSliderA.substring(4)));
    var sliderEndYr = currentStateLine == 'US' ? endUSMonthYearForSliderA.substring(0,4) : endMonthYearForSliderA.substring(0,4);
    var sliderEndMon = currentStateLine == 'US' ? String(Number(endUSMonthYearForSliderA.substring(4))) : String(Number(endMonthYearForSliderA.substring(4)));

    var monthsArray = UtilityFunctions.generateYYMMArray(Number(sliderStartYr), Number(sliderStartMon), Number(sliderEndYr), Number(sliderEndMon));

    let stmonYr =  monthsArray[value[0] - 1];
    let endmonYr =  monthsArray[value[1] - 1];

    setLookupPeriodStartYearA(stmonYr.substring(0,4));
    setLookupPeriodStartMonthA(String(Number(stmonYr.substring(4))));
    setLookupPeriodEndYearA(endmonYr.substring(0,4));
    setLookupPeriodEndMonthA(String(Number(endmonYr.substring(4))));

    var monthsArraySel = UtilityFunctions.generateYYMMArray(Number(stmonYr.substring(0,4)), Number(stmonYr.substring(4)), Number(endmonYr.substring(0,4)), Number(endmonYr.substring(4)));
    var monthsArraySelCnt = Object.keys(monthsArraySel).length;

    var jurisForDate = {};
    for (let i=0; i<monthsArraySel.length;i++) {
      jurisForDate[monthsArraySel[i]] = jurisCountData[monthsArraySel[i] + timelineLine];
    }

    let finalMonYr = Object.entries(jurisForDate)[monthsArraySelCnt-1][0];
    let startMonYr = Object.entries(jurisForDate)[0][0];

    let jurisF = getJuris(Number(finalMonYr.substring(0,4)), Number(finalMonYr.substring(4)), timelineLine);
    let jurisS = getJuris(Number(startMonYr.substring(0,4)), Number(startMonYr.substring(4)), timelineLine);
    let finalJuris = UtilityFunctions.getObjectWithCommonKeys(jurisF, jurisS); 

    setJurisForDropDownLine(finalJuris);

  };

  const getMonthYear = ( startYear, value) => {
    let hdr = '12-month rolling averages from \n'
    var rem = lookupPeriodStartMonthA + '/' + lookupPeriodStartYearA + ' - ' + lookupPeriodEndMonthA + '/' + lookupPeriodEndYearA;
    if (timelineLine == 'Annual') {
      return hdr + rem;
    }
    else {
      const startDate = new Date(startYear + '-01-01'); 
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + value, 1);
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    }
  }

  function getYear(startYear, value) {
      return (Number(startYear) + value - 1);
  }
  
function getNumberofMonthsBetween(startYearMonth, endYearMonth) {
    let startMon = Number(startYearMonth.substring(4));
    let startYr = Number(startYearMonth.substring(0,4));
    let endMon = Number(endYearMonth.substring(4));
    let endYr = Number(endYearMonth.substring(0,4));
    let monsInStartYr = 13 - startMon;
    let monsInEndYr = endMon;
    let numOfYearBetween = endYr - startYr - 1;
    let totalMonths = monsInStartYr + (numOfYearBetween * 12) + monsInEndYr;

    return totalMonths;
  }

  function getNumberofYearsBetween(startYearMonth, endYearMonth) {
    let startYr = Number(startYearMonth.substring(0,4));
    let endYr = Number(endYearMonth.substring(0,4));
    let numOfYearsBetween = endYr - startYr + 1;

    return numOfYearsBetween;
  }

  function getMarksForRangeMonthly(startYearMonth, endYearMonth) {

    let marks = {};
    let startMon = Number(startYearMonth.substring(4));
    let startYr = Number(startYearMonth.substring(0,4));
    let endMon = Number(endYearMonth.substring(4));
    let endYr = Number(endYearMonth.substring(0,4));
    let numberOfMon = getNumberofMonthsBetween(startYearMonth, endYearMonth);

    marks[1] = monthNames[startMon] + ' ' + String(startYr);
    marks[numberOfMon] = monthNames[endMon] + ' ' + String(endYr);

    return marks;
  }

  function getMarksForRangeAnnual(startYearMonth, endYearMonth) {

    let marks = {};
    let startYr = Number(startYearMonth.substring(0,4));
    let endYr = Number(endYearMonth.substring(0,4));
    let numberOfYears = getNumberofYearsBetween(startYearMonth, endYearMonth);

    marks[1] = String(startYr);
    marks[numberOfYears] = String(endYr);

    return marks;
  }

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function sortObjectByKeyDescending(obj) {
    
    let sortedKeys = Object.keys(obj).sort((a, b) => b - a);
    let sortedObject = [];
  
    for (let key of sortedKeys) {
      sortedObject.push(String(obj[key]));
    }

    return sortedObject;
  }

const getYears = (startYrInp, endYrInp) => {

    let years = [];
    if (currentState === 'US')
    {
      let startYr = Number(String(startYrInp).substring(0,4));
      let endYr = Number(String(endYrInp).substring(0,4));
      for (let stYr=startYr;stYr<=endYr;stYr++)
        years.push(stYr)
    }
    else
    {
      let startYr = Number(String(startYrInp).substring(0,4));
      let endYr = Number(String(endYrInp).substring(0,4));
      for (let stYr=startYr;stYr<=endYr;stYr++)
        years.push(stYr)
    }
    
    return sortObjectByKeyDescending(years);
  }; 

   const isValidStateData = (rec) => {

    if (rec.total_drug_OD_n == 7777.0)
      return false;
    if (rec.total_Benzo_OD_n == 7777.0)
      return false;
    if (rec.total_opioid_OD_n == 7777.0)
      return false;
    if (rec.total_Fentanyl_OD_n == 7777.0)
      return false;
    if (rec.total_heroin_OD_n == 7777.0)
      return false;
    if (rec.total_stimulant_OD_n == 7777.0)
      return false;
    if (rec.total_Cocaine_OD_n == 7777.0)
      return false;
    if (rec.total_Methamphetamine_OD_n == 7777.0)
      return false;

    return true;
   }

   const isParticipatingStateData = (rec) => {

    if (currentDrug == 'all' && rec.total_drug_OD_n == 8888.0)
      return false;
    if (currentDrug == 'benzodiazepine' && rec.total_Benzo_OD_n == 8888.0)
      return false;
    if (currentDrug == 'opioids' && rec.total_opioid_OD_n == 8888.0)
      return false;
    if (currentDrug == 'fentanyl' && rec.total_Fentanyl_OD_n == 8888.0)
      return false;
    if (currentDrug == 'heroin' && rec.total_heroin_OD_n == 8888.0)
      return false;
    if (currentDrug == 'stimulants' && rec.total_stimulant_OD_n == 8888.0)
      return false;
    if (currentDrug == 'cocaine' && rec.total_Cocaine_OD_n == 8888.0)
      return false;
    if (currentDrug == 'methamphetamine' && rec.total_Methamphetamine_OD_n == 8888.0)
      return false;

    return true;
   }

   const getJurisCount = (stateData, yr, mon) => {

      var juris = {};
      var tmpJuris = [];

      for (let i=0;i<stateData.length;i++) {
        if (!tmpJuris.includes(stateData[i].geoid) && stateData[i].geoid.length > 0 && stateData[i].YYYYMM == String(yr) + String(mon).padStart(2, '0')) {
          if (isValidStateData(stateData[i]) && isParticipatingStateData(stateData[i]))
            tmpJuris.push(stateData[i].geoid)
        }
      }

      tmpJuris.sort();

      for (let i=0;i<tmpJuris.length;i++) {
        juris[tmpJuris[i]] = stateNames[tmpJuris[i]];
      }

      return Object.keys(juris).length;
  }

  const getJurisInitial = (stateData, yr, mon, isMap) => {

      var juris = {};
      var tmpJuris = [];

      for (let i=0;i<stateData.length;i++) {
        if (!tmpJuris.includes(stateData[i].geoid) && stateData[i].geoid.length > 0 && stateData[i].YYYYMM == String(yr) + String(mon).padStart(2, '0'))
          if (!isMap) {
            //if (isValidStateData(stateData[i])) {
              tmpJuris.push(stateData[i].geoid)
            //}
          }
          else
          {
            tmpJuris.push(stateData[i].geoid)
          }
      }

      tmpJuris.sort();

      for (let i=0;i<tmpJuris.length;i++) {
        juris[tmpJuris[i]] = stateNames[tmpJuris[i]];
      }

      return juris;
  }

  const getJuris = (yr, mon, freq) => {

      var juris = {};
      var tmpJuris = [];

      var monFinal;
      if (freq == 'Monthly')
        monFinal = endUSMonthYearForSliderM.includes(yr) ? Number(endUSMonthYearForSliderM.substring(4)) : mon;
      else
        monFinal = endUSMonthYearForSliderA.includes(yr) ? Number(endUSMonthYearForSliderA.substring(4)) : mon;

      if (freq == 'Monthly') {
        for (let i=0;i<keyedRawDataMonthly.length;i++) {
          if (!tmpJuris.includes(keyedRawDataMonthly[i].geoid) && keyedRawDataMonthly[i].geoid.length > 0 && keyedRawDataMonthly[i].YYYYMM == String(yr) + String(monFinal).padStart(2, '0'))
            //if (isValidStateData(keyedRawDataMonthly[i]))
              tmpJuris.push(keyedRawDataMonthly[i].geoid)
        }
      }
      else
      {
        for (let i=0;i<keyedRawDataAnnual.length;i++) {
          if (!tmpJuris.includes(keyedRawDataAnnual[i].geoid) && keyedRawDataAnnual[i].geoid.length > 0 && keyedRawDataAnnual[i].YYYYMM == String(yr) + String(monFinal).padStart(2, '0'))
            //if (isValidStateData(keyedRawDataAnnual[i]))
              tmpJuris.push(keyedRawDataAnnual[i].geoid)
        }
      }

      tmpJuris.sort();

      for (let i=0;i<tmpJuris.length;i++) {
        juris[tmpJuris[i]] = stateNames[tmpJuris[i]];
      }

      return juris;
  }

  const toggleConsiderations = () => {
    setShowConsiderations(!showConsiderations);
  };

  const toggleFootNotes = () => {
    setShowFootNotes(!showFootNotes);
  };

  const getToggleControls = () => {
  
      return (
        <Fragment>
                <table>
                  <tr>
                    <td style={{width: '88%', textAlign: 'right'}}>
                    </td>
                    <td style={{width: '12%', textAlign: 'right'}}>
                      {currentStateLine != 'US' &&
                        <div style={{float: 'right'}}>
                            <label class="toggleD" title={'Toggle to compare with overall ' + drugOptions[selectedDrugsLine[0]].titleForDropDown +  ' (' + Object.keys(jurisForDropDownLine).length + ' Jurisdictions)'}>
                                <input id="toggleOverall" class="toggleD-input" type="checkbox" checked={showOverall}
                                onChange={(e) => {
                                  if(e.target.checked) {
                                    setOverallToggle(true)
                                  }
                                  else {
                                    setOverallToggle(false)
                                  }
                                }}/>
                                <span class="toggleD-label" data-off="Overall Off" 
                                      data-on="Overall On">
                                </span>
                                <span class="toggleD-handle"></span>
                            </label>
                        </div>
                        }
                      {/* <div style={{float: 'right'}}>
                              <label class="toggleB" title={'Toggle to hover over a data point on the line chart to view percent change for the selected compared to the previous.'}>
                                  <input id="togglePercent" class="toggleB-input" type="checkbox" checked={showPercent}
                                  onChange={(e) => {
                                    if(e.target.checked) {
                                      setPercentToggle(true)
                                    }
                                    else {
                                      setPercentToggle(false)
                                    }
                                  }}/>
                                  <span class="toggleB-label" data-off="% Chg Off" 
                                        data-on="% Chg On">
                                  </span>
                                  <span class="toggleB-handle"></span>
                              </label>
                          </div> */}
                    </td>
                  </tr>
                </table>
        </Fragment>
      )
  }

  const stateBarChartMemo = useMemo(() =>
    <>
   <div id="state-chart-container" className="chart-container" ref={stateBarChartRef}>
      <StateChart
        data={timeline == 'Annual' ? keyedRawDataAnnual :  keyedRawDataMonthly}
        dataOverall={timeline == 'Annual' ? keyedRawUSDataAnnual :  keyedRawUSDataMonthly}
        width={width} 
        height={900} 
        el={stateBarChartRef}
        currentState={currentState}
        currentDrug={currentDrug}
        currentTimeframe={timeline}
        currentMonth={currentMonth}
        currentYear={currentYear}
        drugOptions={drugOptions}
        stateNames={stateNames}
        setCurrentState={setCurrentState}
        accessible={accessible}
        sortBy={stateSort == 'S' ? false : true}
        />
    </div>
  </>,
  [width, currentDrug, timeline, currentMonth, currentYear, currentState, stateSort]);

  const drugsBarChartMemo = useMemo(() =>
    <>
   <div id="bar-chart-container" className="chart-container" ref={drugsBarChartRef}>
      <BarChart
        data={currentStateBar === 'US' ? (timelineBar == 'Annual' ? keyedRawUSDataAnnual :  keyedRawUSDataMonthly) : (timelineBar == 'Annual' ? keyedRawDataAnnual :  keyedRawDataMonthly)}
        width={width} 
        height={830} 
        el={drugsBarChartRef}
        currentState={currentStateBar}
        selectedDrugs={selectedDrugsBar}
        currentYear={currentYearBar}
        currentMonth={currentMonthBar} 
        drugOptions={drugOptions}
        accessible={accessible}
        sortBy={barSort == 'B' ? false : true}
        />
    </div>
  </>,
  [width, currentStateBar, selectedDrugsBar, currentYearBar, currentMonthBar, timelineBar, barSort]);

  const lineChartMemo = useMemo(() =>
  <>
    <table style={{width: '100%'}}>
      <tr>
        <td>
          <div class="containerLC">
            <div class={currentStateLine === 'US' ? "chartDivAll" : "chartDivAll"} ref={lineChartRef}>
              <LineChart 
              data={timelineLine == 'Annual' ? keyedRawDataAnnual :  keyedRawDataMonthly}
              dataOverall={timelineLine == 'Annual' ? keyedRawUSDataAnnual :  keyedRawUSDataMonthly}
              jurisCountData={jurisCountData}
              monthNames={monthNames}
              stateNames={stateNames}
              drugOptions={drugOptions}
              currentTimeframe={timelineLine}
              currentDrug={currentStateLine === 'US' ? currentDrug : selectedDrugsLine[0]}
              currentState={currentStateLine}
              currentYear={currentYear}
              currentMonth={currentMonth}
              width={width}
              el={lineChartRef}
              lookupPeriodStartYear={timelineLine == 'Monthly' ? lookupPeriodStartYearM : lookupPeriodStartYearA}
              lookupPeriodStartMonth={timelineLine == 'Monthly' ? lookupPeriodStartMonthM : lookupPeriodStartMonthA}
              lookupPeriodEndYear={timelineLine == 'Monthly' ? lookupPeriodEndYearM : lookupPeriodEndYearA}
              lookupPeriodEndMonth={timelineLine == 'Monthly' ? lookupPeriodEndMonthM : lookupPeriodEndMonthA}
              showPercent={showPercent}
              showOverall={showOverall}
              isPeriod={true}
              selectedDrugs={selectedDrugsLine} 
              currentDataSource={'ED'}
              accessible={accessible}
              />
            </div>
          </div>
        </td>
      </tr>
    
    </table>
  </>,
  [timelineLine, currentDrug, currentStateLine, currentYear, currentMonth, width, showPercent,showOverall, isPeriod, selectedDrugsLine, lookupPeriodStartYearM, lookupPeriodStartMonthM, lookupPeriodEndYearM, lookupPeriodEndMonthM, lookupPeriodStartYearA, lookupPeriodStartMonthA, lookupPeriodEndYearA, lookupPeriodEndMonthA]);

  const usaMapMemo = useMemo(() =>
      <>
        <UsaMap 
        data={mapMonthly == 'Annual' ? keyedRawDataAnnual :  keyedRawDataMonthly}
        stateNames={stateNames}
        currentState={'US'}
        currentYear={currentYearMap}
        currentMonth={currentMonthMap}
        currentTimeLine={mapMonthly}
        width={width} 
        drugOptions={drugOptions}
        jurisdictions={jurisForDropDownMap}
        onData={handleData}
        onSort={handleSort}
        key={mapKey}
        accessible={accessible}
        sortBy={mapSort == 'M' ? false : true}
        />
  </>,
  [currentYearMap, currentMonthMap, width, mapMonthly, mapKey, mapSort]);

  const sexChartMemo = useMemo(() =>
    <>
    <div className="column column-right">
        <div className={!accessible ? "subsection marked " : " " + (!accessible ? (selectedDrugsSexAge[0] + 'ToolTip') : '')}>
          {!accessible && <span className="individual-header margin-top">By Sex</span>}
          <div class={currentState === 'US' ? "chartDivAll" : "chartDivAll"} ref={sexChartRef}>
            <SexChart
                data={sexAgeMonthly == 'Annual' ? keyedRawUSDataAnnual :  keyedRawUSDataMonthly}
                year={'2023'}
                width={(!isSmallViewport && !accessible) ? (width * 0.5) : width}
                height={!isSmallViewport ? 640 : 600} //TODO
                el={sexChartRef}
                currentDrug={selectedDrugsSexAge[0]} 
                drugOptions={drugOptions}
                currentTimeLine={sexAgeMonthly}
                currentYear={currentYearSexAge}
                currentMonth={currentMonthSexAge}
                currentDataType={currentDataType}
                accessible={accessible}
                widthReduction={(!isSmallViewport && !accessible) ? true : false}
              />
          </div>
        </div>
      </div>
    </>,
  [sexAgeMonthly, currentYearSexAge, currentMonthSexAge, width, selectedDrugsSexAge, currentDataType]);
  
  const ageChartMemo = useMemo(() =>
    <>
    <div className="column column-right">
        <div className={!accessible ? "subsection marked " : " " + (!accessible ? (selectedDrugsSexAge[0] + 'ToolTip') : '')}>
          {!accessible && <span className="individual-header margin-top">By Age (In years)</span>}
          <div class={currentState === 'US' ? "chartDivAll" : "chartDivAll"} ref={ageChartRef}>
            <AgeChart
                data={sexAgeMonthly == 'Annual' ? keyedRawUSDataAnnual :  keyedRawUSDataMonthly}
                maxes={{'month': 6150,'quarter': 17726}}
                year={'2023'}
                width={(!isSmallViewport && !accessible) ? (width * 0.5) : width}
                height={640} //TODO
                header={false}
                el={ageChartRef}
                overallMax={100}
                currentDrug={selectedDrugsSexAge[0]} 
                drugOptions={drugOptions}
                currentTimeLine={sexAgeMonthly}
                currentYear={currentYearSexAge}
                currentMonth={currentMonthSexAge}
                currentDataType={currentDataType}
                accessible={accessible}
                widthReduction={(!isSmallViewport && !accessible) ? true : false}
              />
          </div>
        </div>
      </div>
      </>,
  [sexAgeMonthly, currentYearSexAge, currentMonthSexAge, width, selectedDrugsSexAge, currentDataType]);
        
  const sexAgeChartMemo = useMemo(() =>
    <>
    <div className={"column column-right"}>
        <div className={!accessible ? "subsection marked " : " " + (!accessible ? (selectedDrugsSexAge[0] + 'ToolTip') : '')}>
          {!accessible && <span className="individual-header margin-top">By Age (In years) and Sex</span>}
          <div class='' ref={sexAgeChartRef}>
            <SexAgeChart 
            data={sexAgeMonthly == 'Annual' ? keyedRawUSDataAnnual :  keyedRawUSDataMonthly}
            currentTimeframe={sexAgeMonthly}
            currentYear={currentYearSexAge}
            currentMonth={currentMonthSexAge}
            width={(!isSmallViewport && !accessible) ? (width * 0.5) : width}
            height={640} //TODO
            currentDrug={selectedDrugsSexAge[0]} 
            drugOptions={drugOptions} 
            currentDataType={currentDataType}
            accessible={accessible}
            widthReduction={(!isSmallViewport && !accessible) ? true : false}
            />
          </div>
        </div>
       </div> 
      </>,
  [sexAgeMonthly, currentYearSexAge, currentMonthSexAge, width, selectedDrugsSexAge, currentDataType]);

  const loading = <div className="loading-container">
      <div className="loading-spinner"></div>
  </div>;

  useEffect(() => {
    ReactTooltip.rebuild();
  });
 
  if (endUSMonthYearForSliderM == null || endUSMonthYearForSliderM?.length == 0) {
    return loading;
  }

  const getPriorMonth = () => {

    if (endUSMonthYearForSliderM) {
        let mon = Number(endUSMonthYearForSliderM.substring(4));
        if (mon != 1)
          return monthNames[mon] + ' ' + endUSMonthYearForSliderM.substring(0,4);
        else
          return monthNames[12] + ' ' + endUSMonthYearForSliderM.substring(0,4);
      }
      else
        return '';
  }

  const drugTab = (drugName, drugLabel) => (
    <button
      className={`drug-tab${drugName === currentDrug ? (' ' + drugName) : ''}`}
      onClick={() => {
        setCurrentDrug(drugName);
        setselectedDrugs([drugName])
      }}
    >{drugLabel || drugName}</button>
  );

  const handleDrugSelectionsBarChange = (event, drug) => {
    if (selectedDrugsBar.includes(drug)) {
      if (selectedDrugsBar.length > 1) {
        setselectedDrugsBar(selectedDrugsBar.filter(dr=>dr !== drug))
      }
    }
    else
    {
      setselectedDrugsBar([...selectedDrugsBar, drug])
    }
  }

  const getDrugControlsBar = () => {
        const entries = Object.entries(drugOptions);
        entries.sort((a, b) => a[1].barChartOrder - b[1].barChartOrder);
    
        if (!isSmallViewport) {
        return (
          <Fragment>
            <Fragment>
              <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
              {
                entries.map((drug, index) => (
                  index < 4 &&
                    <div class={`drugDiv-${drug[0]}`}>
                      <span class={(selectedDrugsBar.includes(drug[0])) ? drug[0] : 'notSelectedBar'} onClick={(event) => { handleDrugSelectionsBarChange(event, drug[0]) }}></span>
                      <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                    </div>
                    
                ))
              }
              </div>
            </Fragment>
            <Fragment>
            <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
              {
                entries.map((drug, index) => (
                  index >= 4 &&
                  <div class={`drugDiv-${drug[0]}`}>
                          <span class={(selectedDrugsBar.includes(drug[0])) ? drug[0] : 'notSelectedBar'} onClick={(event) => { handleDrugSelectionsBarChange(event, drug[0]) }}></span>
                          <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                        </div>
                ))
              }
              </div>
            </Fragment>
          </Fragment>
        )
      }
      else {
              return (
              <Fragment>
                      <Fragment>
                        <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
                        {
                          entries.map((drug, index) => (
                            <div>
                              <div class={`drugDiv-${drug[0]}`}>
                                <span class={(selectedDrugsBar.includes(drug[0])) ? drug[0] : 'notSelectedBar'} onClick={(event) => { handleDrugSelectionsBarChange(event, drug[0]) }}></span>
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

  const handleDrugSelectionsLineChange = (event, drug) => {

    if (currentStateLine == 'US' || (currentStateLine != 'US' && !showOverall)) {
      if (selectedDrugsLine.includes(drug)) {
        if (selectedDrugsLine.length > 1) {
          setselectedDrugsLine(selectedDrugsLine.filter(dr=>dr !== drug))
        }
      }
      else
      {
        setselectedDrugsLine([...selectedDrugsLine, drug])
      }
    }
    else
    {
      setselectedDrugsLine([drug])
    }
  }

  const getDrugControlsLine = () => {
    const entries = Object.entries(drugOptions);
    entries.sort((a, b) => a[1].lineChartOrder - b[1].lineChartOrder);

    if (!isSmallViewport) {
    return (
      <Fragment>
        <Fragment>
          <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
          {
            entries.map((drug, index) => (
              index < 4 &&
                <div class={`drugDiv-${drug[0]}`}>
                  <span class={(selectedDrugsLine.includes(drug[0])) ? drug[0] : 'notSelectedLine'} onClick={(event) => { handleDrugSelectionsLineChange(event, drug[0]) }}></span>
                  <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                </div>
                
            ))
          }
          </div>
        </Fragment>
        <Fragment>
        <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
          {
            entries.map((drug, index) => (
              index >= 4 &&
              <div class={`drugDiv-${drug[0]}`}>
                      <span class={(selectedDrugsLine.includes(drug[0])) ? drug[0] : 'notSelectedLine'} onClick={(event) => { handleDrugSelectionsLineChange(event, drug[0]) }}></span>
                      <label key={drug[0]} class="lblDrug">{drug[1].titleForDropDown}</label>
                    </div>
            ))
          }
          </div>
        </Fragment>
      </Fragment>
      )
    }
    else{
          return (
            <Fragment>
                <Fragment>
                  <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
                  {
                  entries.map((drug, index) => (
                    <div>
                      <div class={`drugDiv-${drug[0]}`}>
                        <span class={(selectedDrugsLine.includes(drug[0])) ? drug[0] : 'notSelectedLine'} onClick={(event) => { handleDrugSelectionsLineChange(event, drug[0]) }}></span>
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

  const handleDrugSelectionsSexAgeChange = (event, drug) => {
    if (sexAgeMonthly == 'Annual') {
      setselectedDrugsSexAge([drug])
    }
    else
    {
      if (drug == 'all' || drug == 'opioids' || drug == 'stimulants')
        setselectedDrugsSexAge([drug])
    }
  }

  const getDrugControlsSexAge = () => {
    const entries = Object.entries(drugOptions);
    entries.sort((a, b) => a[1].lineChartOrder - b[1].lineChartOrder);

    if (!isSmallViewport) {
    return (
      <Fragment>
        <Fragment>
          <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
          {
            entries.map((drug, index) => (
              index < 4 &&
                <div class={`drugDiv-${drug[0]}`}>
                  <span class={(selectedDrugsSexAge.includes(drug[0])) ? drug[0] : 'notSelectedSexAge'} onClick={(event) => { handleDrugSelectionsSexAgeChange(event, drug[0]) }}></span>
                  <label key={drug[0]} class={(sexAgeMonthly == 'Monthly' && (drug[0] != 'all' && drug[0] != 'opioids' && drug[0] != 'stimulants')) ? "lblDrugGray" : "lblDrug"}>{drug[1].titleForDropDown}</label>
                </div>
                
            ))
          }
          </div>
        </Fragment>
        <Fragment>
        <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
          {
            entries.map((drug, index) => (
              index >= 4 &&
              <div class={`drugDiv-${drug[0]}`}>
                      <span class={(selectedDrugsSexAge.includes(drug[0])) ? drug[0] : 'notSelectedSexAge'} onClick={(event) => { handleDrugSelectionsSexAgeChange(event, drug[0]) }}></span>
                      <label key={drug[0]} class={(sexAgeMonthly == 'Monthly' && (drug[0] != 'all' && drug[0] != 'opioids' && drug[0] != 'stimulants')) ? "lblDrugGray" : "lblDrug"}>{drug[1].titleForDropDown}</label>
                    </div>
            ))
          }
          </div>
        </Fragment>
      </Fragment>
    )
  }
  else {
    return (
            <Fragment>
                <Fragment>
                  <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
                  {
                  entries.map((drug, index) => (
                    <div>
                      <div class={`drugDiv-${drug[0]}`}>
                        <span class={(selectedDrugsSexAge.includes(drug[0])) ? drug[0] : 'notSelectedSexAge'} onClick={(event) => { handleDrugSelectionsSexAgeChange(event, drug[0]) }}></span>
                        <label key={drug[0]} class={(sexAgeMonthly == 'Monthly' && (drug[0] != 'all' && drug[0] != 'opioids' && drug[0] != 'stimulants')) ? "lblDrugGray" : "lblDrug"}>{drug[1].titleForDropDown}</label>
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

  const hasCovidPeriod = () => {
    if   ((timelineLine == 'Monthly' && UtilityFunctions.containsCovidPeriod(lookupPeriodStartYearM, lookupPeriodStartMonthM, lookupPeriodEndYearM, lookupPeriodEndMonthM)) ||
         (timelineLine == 'Annual' && UtilityFunctions.containsCovidPeriod(lookupPeriodStartYearA, lookupPeriodStartMonthA, lookupPeriodEndYearA, lookupPeriodEndMonthA)))
      return true;
    else
      return false;
  }


  const getFootNotesForData = (chart) => {

    if (!isSmallViewport) {
      return (
            <div>
              <table style={{ width: '100%' }}>
                <tr style={{ textAlign: 'left'}}>
                  <td style={{ width: '10%' }}></td>
                  <td style={{ width: '95%' }}><small><i><sup>*</sup>{!accessible ? 'Data suppressed' : (hasCovidPeriod() ? 'Data suppressed. Please note data from March – August 2020 represent the COVID-19 pandemic and are distinct from data suppression related to small sample size.' : 'Data suppressed.')}</i></small></td>
                </tr>
                <tr style={{ textAlign: 'left'}}>
                  <td style={{ width: '10%' }}></td>
                  <td style={{ width: '95%' }}><small><i><sup>†</sup>{'Data not available/not reported'}</i></small></td>
                </tr>
                <tr style={{ textAlign: 'left'}}>
                  <td style={{ width: '10%' }}></td>
                  <td style={{ width: '95%' }}><small><i><sup>**</sup>{'Unfunded State'}</i></small></td>
                </tr>
              </table>
            </div>
      )
    }
    else {
      return (
          <div>
              {(chart == 'Line' || chart == 'Bar') && 
              <table style={{ width: '100%' }}>
                <tr style={{ textAlign: 'left'}}>
                  <td style={{ width: '100%' }}>
                    <div><span><small><sup>‡</sup>{'Rate of suspected nonfatal overdoses per 10,000 Total ED Visits.'}</small></span></div>
                  </td>
                </tr>
                <br></br>
              </table>
              }
              {(chart == 'State') && 
              <table style={{ width: '100%' }}>
                <tr style={{ textAlign: 'left'}}>
                  <td style={{ width: '100%' }}>
                    <div><span><small><sup>‡</sup>{'Rate of suspected nonfatal overdoses involving ' + drugOptions[currentDrug].titleAll + ' per 10,000 Total ED Visits.'}</small></span></div>
                  </td>
                </tr>
                <br></br>
              </table>
              }
              <table style={{ width: '100%' }}>
                <tr style={{ textAlign: 'left'}}>
                  <td style={{ width: '100%' }}>
                    <div><small><i><sup>*</sup>{!accessible ? 'Data suppressed' : ((chart == 'Line' && hasCovidPeriod()) ? 'Data suppressed. Please note data from March – August 2020 represent the COVID-19 pandemic and are distinct from data suppression related to small sample size.' : 'Data suppressed.')}</i></small></div>
                    <div><small><i><sup>†</sup>{'Data not available/not reported'}</i></small></div>
                    {chart == 'Bar' && <div><small><i><sup>¶</sup>{'These categories are not mutually exclusive and reflect nesting. Some overdose visits may involve multiple substances.'}</i></small></div>}
                    {chart == 'Line' && <div><small><i><sup>¶</sup>{'Monthly comparisons should be interpreted with caution due to seasonality, with common increases in nonfatal drug overdoses in summer and decreases in winter'}<sup>2</sup>.</i></small></div>}
                    <div><small><i><sup>**</sup>{'Unfunded State'}</i></small></div></td>
                </tr>
              </table>
            </div>
      )
    }
 }

  function getMonthlyValueForCurrentDrug() {
    for(let i=0;i<keyedRawUSDataMonthly.length;i++)
    {
      if (keyedRawUSDataMonthly[i].YYYYMM == endUSMonthYearForSliderM)
      {
        if (keyedRawUSDataMonthly[i].Sex === 'Total' && keyedRawUSDataMonthly[i].Age_Group === 'Total' && keyedRawUSDataMonthly[i].geoid == 'US')
        {
          let val;
          switch (currentDrug) {
            case 'all':
              val = Number(keyedRawUSDataMonthly[i].total_drug_OD_n);
              break;
            case 'benzodiazepine':
              val = Number(keyedRawUSDataMonthly[i].total_Benzo_OD_n);
              break;

            case 'opioids':
              val = Number(keyedRawUSDataMonthly[i].total_opioid_OD_n);
              break;

            case 'fentanyl':
              val = Number(keyedRawUSDataMonthly[i].total_Fentanyl_OD_n);
              break;

            case 'heroin':
              val = Number(keyedRawUSDataMonthly[i].total_heroin_OD_n);
              break;

            case 'stimulants':
              val = Number(keyedRawUSDataMonthly[i].total_stimulant_OD_n);
              break;

              case 'cocaine':
              val = Number(keyedRawUSDataMonthly[i].total_Cocaine_OD_n);
              break;

              case 'methamphetamine':
              val = Number(keyedRawUSDataMonthly[i].total_Methamphetamine_OD_n);
              break;
          }
          return val;
        }
      }
      }
  }

  function getPercentFromPriorMonth() {

    var startYr = startUSMonthYearForSliderM.substring(0,4);
    var startMon =String(Number(startUSMonthYearForSliderM.substring(4)));
    var endYr = endUSMonthYearForSliderM.substring(0,4);
    var endMon = String(Number(endUSMonthYearForSliderM.substring(4)));

    var monthsArray = UtilityFunctions.generateYYMMArray(Number(startYr), Number(startMon), Number(endYr), Number(endMon))
    var idx = monthsArray.indexOf(endUSMonthYearForSliderM);
    var priorMonth = monthsArray[idx - 1]
    var priorMon = 0;
    for(let i=0;i<keyedRawUSDataMonthly.length;i++)
    {
      if (keyedRawUSDataMonthly[i].YYYYMM == priorMonth)
      {
        if (keyedRawUSDataMonthly[i].Sex === 'Total' && keyedRawUSDataMonthly[i].Age_Group === 'Total' && keyedRawUSDataMonthly[i].geoid == 'US')
        {
          switch (currentDrug) {
            case 'all':
              priorMon = Number(keyedRawUSDataMonthly[i].total_drug_OD_n);
              break;
            case 'benzodiazepine':
              priorMon = Number(keyedRawUSDataMonthly[i].total_Benzo_OD_n);
              break;

            case 'opioids':
              priorMon = Number(keyedRawUSDataMonthly[i].total_opioid_OD_n);
              break;

            case 'fentanyl':
              priorMon = Number(keyedRawUSDataMonthly[i].total_Fentanyl_OD_n);
              break;

            case 'heroin':
              priorMon = Number(keyedRawUSDataMonthly[i].total_heroin_OD_n);
              break;

            case 'stimulants':
              priorMon = Number(keyedRawUSDataMonthly[i].total_stimulant_OD_n);
              break;

            case 'cocaine':
              priorMon = Number(keyedRawUSDataMonthly[i].total_Cocaine_OD_n);
              break;

            case 'methamphetamine':
              priorMon = Number(keyedRawUSDataMonthly[i].total_Methamphetamine_OD_n);
              break;
          }
          break;
        }
      }
    }

    return  ((getMonthlyValueForCurrentDrug() - priorMon) / priorMon) * 100; 
  }

  const isDisabledDrug = () => {

    if (selectedDrugsSexAge[0] != 'all' && selectedDrugsSexAge[0] != 'opioids' && selectedDrugsSexAge[0] != 'stimulants')
      return true;
    else
      return false;
    
  }

    const getHeaderColor = (selDrugs) => {

      if (selDrugs.length > 1)
        return '#005EAA'

      var drugIndexes = [];
      for (var x=0;x<selDrugs.length;x++)
        drugIndexes.push(drugOptions[selDrugs[x]].barChartOrder)
      
      var selIdx = Math.min(...drugIndexes);

      for (var y=0;y<Object.keys(drugOptions).length;y++)
      {
        if (drugOptions[Object.keys(drugOptions)[y]].barChartOrder == String(selIdx))
          return drugOptions[Object.keys(drugOptions)[y]].color;
      }
    
  }
  
  const setDrug = (val) => {
    setCurrentDrug(val);
    setselectedDrugs([val])
  }

  const getFileNameFromPath = (path) => {
    if(!path){
      return 'DOSE_SyS_Dashboard_Download.xlsx';
    }
    // Get the filename from the path and remove any query parameters
    const filename = path.split('/').pop();
    return filename.split('?')[0];
  }

  const getHeaderText = () => {
  if (timelineLine == 'Monthly')
    return (
      <Fragment>
      <text>
        Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>§</sup> : ''} {selectedDrugsLine.length > 1 ? '' : ('Involving ' + drugOptions[selectedDrugsLine[0]].titleForDropDown)} per 10,000 Total ED Visits, {currentStateLine == 'US' ? ' Overall' : stateNames[currentStateLine]}, {monthNames[Number(lookupPeriodStartMonthM)] + ' ' + lookupPeriodStartYearM + ' – ' + monthNames[Number(lookupPeriodEndMonthM)] + ' ' + lookupPeriodEndYearM}
      </text>
      </Fragment>
      )
    else
      return (
      <Fragment>
      <text className="data-bite-header">
        Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>§</sup> : ''} {selectedDrugsLine.length > 1 ? '' : ('Involving ' + drugOptions[selectedDrugsLine[0]].titleForDropDown)} per 10,000 Total ED Visits, {currentStateLine == 'US' ? ' Overall' : stateNames[currentStateLine]}, {monthNames[Number(lookupPeriodStartMonthA)] + ' ' + lookupPeriodStartYearA + ' – ' + monthNames[Number(lookupPeriodEndMonthA)] + ' ' + lookupPeriodEndYearA}
      </text>
      </Fragment>
      )
  }

  const drugColor = drugOptions[currentDrug].color;
  const usRate = String(getMonthlyValueForCurrentDrug().toFixed(1)); 
  const usPercent = String(getPercentFromPriorMonth().toFixed(1)); 

  return (
    <Context.Provider value={{ drugOptions, currentDrug, Hexagon }}>
      <div className="filters-container" ref={outerContainerRef}>
        <div>
          {!isSmallViewport &&
          <table style={{'width': '100%'}}>
            <tr>
              <td>
                  <div>
                      <div className="drug-tab-section">
                        {drugTab('all', <span>All Drugs</span>)}
                        {drugTab('stimulants', <span>All Stimulants</span>)}
                        {drugTab('opioids', <span>All Opioids</span>)}
                        {drugTab('fentanyl', <span>Fentanyl</span>)}
                      </div>
                      <div className="drug-tab-section">
                        {drugTab('cocaine',<span>Cocaine</span>)}
                        {drugTab('methamphetamine', <span>Methamphetamine</span>)}
                        {drugTab('heroin', <span>Heroin</span>)}
                        {drugTab('benzodiazepine', <span>Benzodiazepine</span>)}
                      </div>
                    </div>
              </td>
            </tr>
            <tr>
              <td colspan='4'>
                <div style={{'float': 'right', 'margin-right' : '20px'}}>
                  <button id="reset-button" style={{ 'backgroundColor': '#000066' }} onClick={() => {

                    let cntUS = keyedRawUSDataMonthly.length; 

                    setCurrentDrug('all');
                    setselectedDrugs(['all'])
                    setCurrentState('US');
                    setCurrentStateBar('US');
                    setTimeline('Monthly');
                    setTimelineBar('Monthly');
                    setTimelineLine('Monthly');
                    setCurrentStateLine('US');

                    setMonthlyToggle(false);
                    setMonthlyToggleBar(false);
                    setMonthlyToggleLine(false);
                    setPercentToggle(false);  
                    setOverallToggle(false);
                    
                    setCurrentYear(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                    setCurrentYearMap(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                    setCurrentYearBar(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                    setCurrentYearSexAge(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                    setCurrentMonth(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                    setCurrentMonthMap(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                    setCurrentMonthBar(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                    setCurrentMonthSexAge(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                    setYearsForDropDown(getYears(keyedRawUSDataMonthly[0]['YYYYMM'], keyedRawUSDataMonthly[cntUS-1]['YYYYMM']));
                    setMonthsForDropDown(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                    setMonthsForDropDownBar(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                    setMonthsForDropDownMap(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                    setMonthsForDropDownSexAge(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                    setJurisCount(getJurisCount(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                    setJurisForDropDown(getJurisInitial(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), false));
                    setJurisForDropDownLine(getJurisInitial(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), false));
                    setJurisForDropDownMap(getJurisInitial(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), true));

                    setLookupPeriodStartYearM('2023');
                    setLookupPeriodStartMonthM('1');

                    setLookupPeriodStartYearA('2023');
                    setLookupPeriodStartMonthA('1');

                    setLookupPeriodEndYearM(String(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)));
                    setLookupPeriodEndMonthM(String(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));

                    setLookupPeriodEndYearA(String(keyedRawUSDataAnnual[cntUS-1]['YYYYMM'].substring(0,4)));
                    setLookupPeriodEndMonthA(String(Number(keyedRawUSDataAnnual[cntUS-1]['YYYYMM'].substring(4))));

                    setStartUSMonthYearForSliderM(keyedRawUSDataMonthly[0]['YYYYMM']); 
                    setEndUSMonthYearForSliderM(keyedRawUSDataMonthly[cntUS-1]['YYYYMM']); 
                    setStartMonthYearForSliderM(keyedRawUSDataMonthly[0]['YYYYMM']); 
                    setEndMonthYearForSliderM(keyedRawUSDataMonthly[cntUS-1]['YYYYMM']); 

                    setStartUSMonthYearForSliderA(keyedRawUSDataAnnual[0]['YYYYMM']); 
                    setEndUSMonthYearForSliderA(keyedRawUSDataAnnual[cntUS-1]['YYYYMM']); 
                    setStartMonthYearForSliderA(keyedRawUSDataAnnual[0]['YYYYMM']); 
                    setEndMonthYearForSliderA(keyedRawUSDataAnnual[cntUS-1]['YYYYMM']);

                    setselectedDrugs(['all']);
                    setselectedDrugsBar(['benzodiazepine', 'opioids', 'fentanyl', 'heroin', 'stimulants', 'cocaine', 'methamphetamine']);
                    setselectedDrugsLine(['all']);
                    setselectedDrugsSexAge(['all']);
                    setShowConsiderations(false);
                    setShowFootNotes(false);

                    setMapMonthly('Monthly');
                    handleData('all')
                    setSexAgeMetric('Monthly');

                    setSliderKey(Date.now());
                    setMapKey(Date.now());

                              }}>Reset</button>
                </div>
              </td>
            </tr>
          </table>
          } 
           {isSmallViewport &&
            <table style={{'width': '100%'}}>
              <tr>
                  <td style={{'width': '100%', 'textAlign': 'left'}}><div><strong>Select a Drug:</strong></div></td>
              </tr>
              <tr>
                  <td>
                    <div>
                    <select id="drug-select" value={currentDrug} onChange={(e) => { setDrug(e.target.value); }}>
                      <option value="all">All drugs</option>
                      <option value="stimulants">All Stimulants</option>
                      <option value="opioids">All Opioids</option>
                      <option value="fentanyl">Fentanyl</option>
                      <option value="cocaine">Cocaine</option>
                      <option value="methamphetamine">Methamphetamine</option>
                      <option value="heroin">Heroin</option>
                      <option value="benzodiazepine">Benzodiazepine</option>
                    </select>
                  </div>
                  </td>
                  <td>
                    <div style={{'float': 'right'}}>
                    <button id="reset-buttonM" style={{ 'backgroundColor': '#000066' }} onClick={() => {

                      let cntUS = keyedRawUSDataMonthly.length; 

                      setCurrentDrug('all');
                      setselectedDrugs(['all'])
                      setCurrentState('US');
                      setCurrentStateBar('US');
                      setTimeline('Monthly');
                      setTimelineBar('Monthly');
                      setTimelineLine('Monthly');
                      setCurrentStateLine('US');

                      setMonthlyToggle(false);
                      setMonthlyToggleBar(false);
                      setMonthlyToggleLine(false);
                      setPercentToggle(false);  
                      setOverallToggle(false);
                      
                      setCurrentYear(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                      setCurrentYearMap(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                      setCurrentYearBar(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                      setCurrentYearSexAge(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)))
                      setCurrentMonth(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                      setCurrentMonthMap(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                      setCurrentMonthBar(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                      setCurrentMonthSexAge(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4));
                      setYearsForDropDown(getYears(keyedRawUSDataMonthly[0]['YYYYMM'], keyedRawUSDataMonthly[cntUS-1]['YYYYMM']));
                      setMonthsForDropDown(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                      setMonthsForDropDownBar(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                      setMonthsForDropDownMap(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                      setMonthsForDropDownSexAge(getMonths(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                      setJurisCount(getJurisCount(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));
                      setJurisForDropDown(getJurisInitial(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), false));
                      setJurisForDropDownLine(getJurisInitial(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), false));
                      setJurisForDropDownMap(getJurisInitial(keyedRawDataMonthly, Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)), Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4)), true));

                      setLookupPeriodStartYearM('2023');
                      setLookupPeriodStartMonthM('1');

                      setLookupPeriodStartYearA('2023');
                      setLookupPeriodStartMonthA('1');

                      setLookupPeriodEndYearM(String(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(0,4)));
                      setLookupPeriodEndMonthM(String(Number(keyedRawUSDataMonthly[cntUS-1]['YYYYMM'].substring(4))));

                      setLookupPeriodEndYearA(String(keyedRawUSDataAnnual[cntUS-1]['YYYYMM'].substring(0,4)));
                      setLookupPeriodEndMonthA(String(Number(keyedRawUSDataAnnual[cntUS-1]['YYYYMM'].substring(4))));

                      setStartUSMonthYearForSliderM(keyedRawUSDataMonthly[0]['YYYYMM']); 
                      setEndUSMonthYearForSliderM(keyedRawUSDataMonthly[cntUS-1]['YYYYMM']); 
                      setStartMonthYearForSliderM(keyedRawUSDataMonthly[0]['YYYYMM']); 
                      setEndMonthYearForSliderM(keyedRawUSDataMonthly[cntUS-1]['YYYYMM']); 

                      setStartUSMonthYearForSliderA(keyedRawUSDataAnnual[0]['YYYYMM']); 
                      setEndUSMonthYearForSliderA(keyedRawUSDataAnnual[cntUS-1]['YYYYMM']); 
                      setStartMonthYearForSliderA(keyedRawUSDataAnnual[0]['YYYYMM']); 
                      setEndMonthYearForSliderA(keyedRawUSDataAnnual[cntUS-1]['YYYYMM']);

                      setselectedDrugs(['all']);
                      setselectedDrugsBar(['benzodiazepine', 'opioids', 'fentanyl', 'heroin', 'stimulants', 'cocaine', 'methamphetamine']);
                      setselectedDrugsLine(['all']);
                      setselectedDrugsSexAge(['all']);
                      setShowConsiderations(false);
                      setShowFootNotes(false);

                      setMapMonthly('Monthly');
                      handleData('all')
                      setSexAgeMetric('Monthly');

                      setSliderKey(Date.now());
                      setMapKey(Date.now());

                                }}>Reset</button>
                  </div>
                  </td>
              </tr>
            </table>

          }
        </div>

      <div style={{'width':'100%', 'backgroundColor': drugColor}}>
          <h2 className="data-bite-header">
            Suspected Nonfatal Overdose ED Visits Involving {drugOptions[currentDrug].titleAll} per 10,000 Total ED visits in {jurisCount} Participating Jurisdictions, {getPriorMonth()} 
          </h2>
        </div>
      </div>

      <div className={isSmallViewport ? "calloutsM" : "callouts"}>
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{ 'color': drugColor }}>{isNaN(usRate) ? 'N/A' : `${Number(usRate).toFixed(1)}`}</span>
          <div>
            <span className='data-bite-title' style={{ color: drugColor }}>
              Monthly Suspected Nonfatal Overdose Visits for {drugOptions[currentDrug].titleAll}</span>
              <p>Per 10,000 total ED visits</p>
          </div>
        </div>
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <table>
            <tr>
              <td style={{ 'width': ((!isNaN(usPercent) && usPercent > 9.9) ? '45%' : '40%')}} className="topPos">
                <table>
                  <tr>
                    <td style={{ 'width': '40%'}} className="topPos">
                        <UpDownArrow
                          width={15}
                          height={60}
                          colorScale={drugColor}
                          defaultValueIfEmpty={defaultValueIfEmpty}
                          percentValue={usPercent}
                        ></UpDownArrow>
                    </td>
                    <td>
                        <span className="callout" style={{ 'color': drugColor, 'float': 'left' }}>{isNaN(usPercent) ? 'N/A' : `${Number(usPercent < 0 ? (usPercent * -1) : usPercent).toFixed(1)}` + '%'}</span>
                    </td>
                  </tr>
                </table>
              </td>
              <td>
                  <span className='data-bite-title' style={{ color: drugColor }}>
                    {usPercent <= 0 ? (usPercent == 0 ? 'No Change' : 'Decrease') : 'Increase' } in Suspected Nonfatal Overdose Visits for {drugOptions[currentDrug].titleAll}</span>
                    <p>Per 10,000 total ED visits from the prior month</p>
              </td>
            </tr>
          </table>
        </div>
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{'color': drugColor}}>{jurisCount}</span>
          <div>
            <span className='data-bite-title' style={{ color: drugColor }}>Jurisdictions Participating</span>
            <p>Funded states with reported Data</p>
          </div>
        </div>
      </div>
        
        <section>
          <div className="datatable-container-header">
                    <button className="h2 h2-toggle button-toggle" style={{ backgroundColor: getHeaderColor(selectedDrugsLine) }} onClick={toggleLineChart}>
                    <text className="data-bite-header-toggle sub" style={{ backgroundColor: getHeaderColor(selectedDrugsLine) }}>{getHeaderText()}</text>
                    {showLineChart && <span>{String.fromCharCode(8722)}</span>}
                    {!showLineChart && <span>{String.fromCharCode(43)}</span>}
                    </button>
         {showLineChart && <div>         
        {!isSmallViewport &&
        <table>
            <tr>
              <td></td>
              <td style={{'width': '100%', 'textAlign': 'center'}}>
                <div><small><em>User can adjust the timeframe by moving the point on the time scale</em></small></div>
              </td>
            </tr>
             <tr>
              <td style={{'width': '16.8%', 'textAlign': 'left', 'verticalAlign': 'top', 'fontWeight': 'bold'}}><div className="select-input">Select Time Period:</div></td>
              <td style={{'width': '84%'}}>
                { !showAnnualLine &&
                  <div style={wrapperStyle}>
                    <Range 
                    min={1} 
                    max={getNumberofMonthsBetween(startUSMonthYearForSliderM, endUSMonthYearForSliderM)}
                    defaultValue={[49, getNumberofMonthsBetween(startUSMonthYearForSliderM, endUSMonthYearForSliderM)]} 
                    step={1} marks={getMarksForRangeMonthly(startUSMonthYearForSliderM, endUSMonthYearForSliderM)} 
                    tipFormatter={value => `${getMonthYear(Number(startUSMonthYearForSliderM.substring(0,4)), value)}`} 
                    onAfterChange={didOnAfterChangeTriggerMonthly}
                    key={sliderKey}
                    />
                  </div>
                }
                { showAnnualLine &&
                  <div style={wrapperStyle}>
                    <Range 
                    min={1} 
                    max={getNumberofMonthsBetween(startUSMonthYearForSliderA, endUSMonthYearForSliderA)}
                    defaultValue={[38, getNumberofMonthsBetween(startUSMonthYearForSliderA, endUSMonthYearForSliderA)]} 
                    step={1} marks={getMarksForRangeMonthly(startUSMonthYearForSliderA, endUSMonthYearForSliderA)} 
                    tipFormatter={value => `${getMonthYear(Number(startUSMonthYearForSliderA.substring(0,4)), value)}`} 
                    onAfterChange={didOnAfterChangeTriggerAnnual}
                    key={sliderKey}
                    />
                  </div>
                }
              </td>
              </tr>
            </table>
        }
        {isSmallViewport &&
        <table>
            <tr>
              <td style={{'width': '100%', 'textAlign': 'center'}}>
                <div><small><em>User can adjust the timeframe by moving the point on the time scale</em></small></div>
              </td>
            </tr>
             <tr>
              <td style={{'width': '100%', 'textAlign': 'left', 'verticalAlign': 'top', 'fontWeight': 'bold'}}><div className="select-input">Select Time Period:</div></td>
            </tr>
            <tr>
              <td style={{'width': '84%'}}>
                { !showAnnualLine &&
                  <div style={wrapperStyleM}>
                    <Range 
                    min={1} 
                    max={getNumberofMonthsBetween(startUSMonthYearForSliderM, endUSMonthYearForSliderM)}
                    defaultValue={[49, getNumberofMonthsBetween(startUSMonthYearForSliderM, endUSMonthYearForSliderM)]} 
                    step={1} marks={getMarksForRangeMonthly(startUSMonthYearForSliderM, endUSMonthYearForSliderM)} 
                    tipFormatter={value => `${getMonthYear(Number(startUSMonthYearForSliderM.substring(0,4)), value)}`} 
                    onAfterChange={didOnAfterChangeTriggerMonthly}
                    key={sliderKey}
                    />
                  </div>
                }
                { showAnnualLine &&
                  <div style={wrapperStyleM}>
                    <Range 
                    min={1} 
                    max={getNumberofMonthsBetween(startUSMonthYearForSliderA, endUSMonthYearForSliderA)}
                    defaultValue={[38, getNumberofMonthsBetween(startUSMonthYearForSliderA, endUSMonthYearForSliderA)]} 
                    step={1} marks={getMarksForRangeMonthly(startUSMonthYearForSliderA, endUSMonthYearForSliderA)} 
                    tipFormatter={value => `${getMonthYear(Number(startUSMonthYearForSliderA.substring(0,4)), value)}`} 
                    onAfterChange={didOnAfterChangeTriggerAnnual}
                    key={sliderKey}
                    />
                  </div>
                }
              </td>
              </tr>
        </table>
        }
        {!isSmallViewport &&
            <table style={{'width': '100%'}}>
              <tr>
              <td style={{'width': '12%'}}></td>
              <td style={{'width': '20%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">Select Jurisdiction:</div></td>
              <td style={{'width': '20%'}}>
                <select id="jurisdiction-select" value={currentStateLine || ''} onChange={(e) => { setCurrentStateLine(e.target.value); setselectedDrugsLine([currentDrug])}}>
                <option value="US">Overall</option>
                {Object.keys(jurisForDropDownLine).map((key) => <option key={key} value={key}>{jurisForDropDownLine[key]}</option>)}
              </select>
              </td>
              <td style={{'width': '15%', 'textAlign': 'left'}}>
                <table>
                  <tr>
                    <td style={{'width': '50%', 'textAlign': 'left'}}>
                        <div>
                          <input
                            id="radioUSMonthlyLine"
                            name="radioUSMonthlyLine"
                            type="radio"
                            value="Monthly"
                            checked={showAnnualLine === false}
                            onChange={(e) => {
                              setMonthlyToggleLine(false);
                              setTimelineLine('Monthly');
                              setPeriodToggle(true);
                              setStartUSMonthYearForSliderM(keyedRawUSDataMonthly[0]['YYYYMM']);
                              setLookupPeriodStartYearM('2023');
                              setLookupPeriodStartMonthM('1');
                            }} />
                          <label
                            htmlFor="radioUSMonthlyLine">Monthly</label>
                        </div>
                      </td>
                      <td style={{'width': '50%', 'textAlign': 'left', 'paddingLeft': '15px'}}>
                        <div>
                          <input
                          id="radioUSAnnualLine"
                          name="radioUSAnnualLine"
                          type="radio"
                          value="Annual"
                          checked={showAnnualLine === true}
                          onChange={(e) => {
                            setMonthlyToggleLine(true);
                            setTimelineLine('Annual');
                            setPeriodToggle(false);
                            setStartUSMonthYearForSliderA(keyedRawUSDataAnnual[0]['YYYYMM']);
                            setLookupPeriodStartYearA('2023');
                            setLookupPeriodStartMonthA('1');
                          }} 
                          />
                          <label
                          htmlFor="radioUSAnnualLine">Annual</label>
                        </div>
                      </td>
                  </tr>
                </table>
              </td>
              <td style={{'width': '22%'}}></td>
            </tr>
            </table>
        }
        {isSmallViewport &&
            <table style={{'width': '100%'}}>
              <tr>
              <td style={{'width': '100%', 'textAlign': 'left', 'fontWeight': 'bold'}}><div className="select-input">Select Jurisdiction:</div></td>
              </tr>
              <tr>
                <td style={{'width': '100%'}}>
                  <select id="jurisdiction-select" value={currentStateLine || ''} onChange={(e) => { setCurrentStateLine(e.target.value); setselectedDrugsLine([currentDrug])}}>
                  <option value="US">Overall</option>
                  {Object.keys(jurisForDropDownLine).map((key) => <option key={key} value={key}>{jurisForDropDownLine[key]}</option>)}
                </select>
                </td>
                <td>
                  {getToggleControls()}
                </td>
              </tr>
              <br></br>
              <tr>
              <td style={{'width': '100%', 'textAlign': 'left'}}>
                <table>
                  <tr>
                    <td style={{'width': '50%', 'textAlign': 'left'}}>
                        <div className="inputContainer">
                          <input
                            id="radioUSMonthlyLine"
                            name="radioUSMonthlyLine"
                            type="radio"
                            value="Monthly"
                            checked={showAnnualLine === false}
                            onChange={(e) => {
                              setMonthlyToggleLine(false);
                              setTimelineLine('Monthly');
                              setPeriodToggle(true);
                              setStartUSMonthYearForSliderM(keyedRawUSDataMonthly[0]['YYYYMM']);
                              setLookupPeriodStartYearM('2023');
                              setLookupPeriodStartMonthM('1');
                            }} />
                          <label htmlFor="radioUSMonthlyLine">Monthly</label>
                          &nbsp;&nbsp;
                          <input
                          id="radioUSAnnualLine"
                          name="radioUSAnnualLine"
                          type="radio"
                          value="Annual"
                          checked={showAnnualLine === true}
                          onChange={(e) => {
                            setMonthlyToggleLine(true);
                            setTimelineLine('Annual');
                            setPeriodToggle(false);
                            setStartUSMonthYearForSliderA(keyedRawUSDataAnnual[0]['YYYYMM']);
                            setLookupPeriodStartYearA('2023');
                            setLookupPeriodStartMonthA('1');
                          }} 
                          />
                          <label htmlFor="radioUSAnnualLine">Annual</label>
                        </div>
                      </td>
                  </tr>
                </table>
              </td>
              <td style={{'width': '22%'}}></td>
            </tr>
            </table>
        }
            <br></br>
           {!isSmallViewport && getToggleControls()}
          { timelineLine == 'Annual' &&
            <table>
              <tr>
                <td style={{'textAlign': 'center'}}>
                  <strong>Note: </strong><span>Annual option displays a 12-month rolling average ending at the selected time period [e.g., Feb 2024 - Jan 2025]</span>
                </td>
              </tr>
              <br></br>
            </table>
          }
          {!isSmallViewport &&
        <table>
            <tr>
              <td style={{'width': '8%'}}></td>
              <td style={{'width': '84%'}}>
                <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
                  <tr>
                    <td style={{'width': '23%', 'verticalAlign': 'top'}}>
                      <div style={{'fontWeight': 'bold', 'textAlign': 'right', 'paddingTop': '3px', 'paddingLeft': '3px'}} className="select-input">Select Drug Syndrome:</div>
                      <div style={{'textAlign': 'left'}} className="select-input"><em>Click to select/unselect</em></div>
                    </td>
                    <td class="drugsDivTop" style={{textAlign: 'left', verticalAlign: 'top', paddingLeft: '65px', paddingTop: '5px'}}>
                      {getDrugControlsLine()}
                    </td>
                  </tr>
                  </table>
              </td>
              <td style={{'width': '8%'}}></td>
            </tr>
          </table>
        }
        {isSmallViewport &&

        <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
            <tr>
              <td style={{'width': '100%', 'verticalAlign': 'top'}}>
                <div style={{'fontWeight': 'bold', 'textAlign': 'left', 'paddingTop': '3px', 'paddingLeft': '3px'}} className="select-input">Select Drug Syndrome:</div>
                <div style={{'textAlign': 'left'}} className="select-input"><em>Click to select/unselect</em></div>
              </td>
            </tr>
            <tr>
              <td class="drugsDivTop" style={{textAlign: 'left', verticalAlign: 'top', paddingLeft: '15px', paddingTop: '5px'}}>
                {getDrugControlsLine()}
              </td>
            </tr>
            </table>
          }
          <br></br>
          {
            currentStateLine == 'IL' && (selectedDrugsLine.includes('fentanyl') || selectedDrugsLine.includes('heroin')) &&
             <table>
              <tr>
                <td style={{'textAlign': 'center'}}>
                  <strong>Note: </strong><span>Fentanyl and Heroin data are not available / not reported for Illinois.</span>
                </td>
              </tr>
              <br></br>
            </table>
            
          }
          {isSmallViewport && !accessible && <div style={{color: '#000066', textAlign: 'center'}}><span><small>{'Suspected nonfatal overdoses per 10,000 Total ED Visits.'}</small></span></div>}
          {lineChartMemo}
          {!accessible && !isSmallViewport && <br></br>}
          {!accessible && isSmallViewport && <br></br>}
          
          {!accessible && !isSmallViewport && //regular view and not accessible
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '5%'}}></td>
              <td style={{width: '80%'}}>
                <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
                <div><span><small><i><sup>†</sup>Data not available/not reported.</i></small></span></div>
                <div><span><small><i><sup>§</sup>Scale of the figure may change based on the data presented.</i></small></span></div>
                 <div><span><small><i><sup>¶</sup>Monthly comparisons should be interpreted with caution due to seasonality, with common increases in nonfatal drug overdoses in summer and decreases in winter<sup>2</sup>.</i></small></span></div>
                {hasCovidPeriod() &&
                  <div><span><small><i><sup>‡</sup>Grayed out area represents the COVID-19 pandemic and is distinct from data suppression.</i></small></span></div>
                }
                <div><span><small><i><sup>**</sup>Unfunded State.</i></small></span></div>
              </td>
              <td style={{width: '15%'}}></td>
            </tr>
          </table>
          }
          {!accessible && isSmallViewport && //mobile view and not accessible
            <table style={{width: '100%'}}>
              <tr>
                <td style={{width: '100%'}}>
                  <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
                  <div><span><small><i><sup>†</sup>Data not available/not reported.</i></small></span></div>
                  <div><span><small><i><sup>§</sup>Scale of the figure may change based on the data presented.</i></small></span></div>
                  <div><span><small><i><sup>¶</sup>Monthly comparisons should be interpreted with caution due to seasonality, with common increases in nonfatal drug overdoses in summer and decreases in winter<sup>2</sup>.</i></small></span></div>
                  {hasCovidPeriod() &&
                    <div><span><small><i><sup>‡</sup>Grayed out area represents the COVID-19 pandemic and is distinct from data suppression.</i></small></span></div>
                  }
                  <div><span><small><i><sup>**</sup>Unfunded State.</i></small></span></div>
                </td>
              </tr>
            </table>
          }

        {accessible && !isSmallViewport &&
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '100%'}}>
                {hasCovidPeriod() && <div><span><small><i><sup>§</sup>Data suppressed. Please note data from March – August 2020 represent the COVID-19 pandemic and are distinct from data suppression related to small sample size.</i></small></span></div>}
                 <div><span><small><i><sup>¶</sup>Monthly comparisons should be interpreted with caution due to seasonality, with common increases in nonfatal drug overdoses in summer and decreases in winter<sup>2</sup>.</i></small></span></div>
              </td>
            </tr>
          </table>
        }
        {accessible && isSmallViewport &&
          getFootNotesForData('Line')
        }
      </div>}
      </div> 
      </section>

      <section>

          <div style={{'width':'100%', 'backgroundColor': getHeaderColor(selectedDrugsBar)}}>
          {timelineBar == 'Monthly' &&
          <h2 className="data-bite-header">
            Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>§</sup> : ''} per 10,000 Total ED visits by Drug Type<sup>¶</sup> in {currentStateBar == 'US' ? jurisCountData[currentYearBar + String(currentMonthBar).padStart(2, '0') + timelineBar] + ' Participating Jurisdictions' : stateNames[currentStateBar]}, {monthNames[Number(currentMonthBar)] + ' ' + currentYearBar}
          </h2>
          }
          {timelineBar == 'Annual' &&
          <h2 className="data-bite-header">
             Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>§</sup> : ''} per 10,000 Total ED visits by Drug Type<sup>¶</sup> in {currentStateBar == 'US' ? jurisCountData[currentYearBar + String(currentMonthBar).padStart(2, '0') + timelineBar] + ' Participating Jurisdictions' : stateNames[currentStateBar]}, {UtilityFunctions.getPeriod(currentYearBar, currentMonthBar)}
          </h2>
          }
        </div>

          <div>
            {!isSmallViewport &&
          <table style={{'width': '100%'}}>
          <tr>
              <td style={{'width': '4%'}}></td>
              <td style={{'width': '16%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">Select Jurisdiction:</div></td>
              <td style={{'width': '18%'}}>
                <select id="jurisdiction-select" value={currentStateBar || ''} onChange={(e) => { setCurrentStateBar(e.target.value); setselectedDrugsLine([currentDrug])}}>
                <option value="US">Overall</option>
                {Object.keys(jurisForDropDown).map((key) => <option key={key} value={key}>{jurisForDropDown[key]}</option>)}
              </select>
              </td>

              <td style={{'width': '18%', 'textAlign': 'right', 'fontWeight': 'bold'}}>
                <div className="select-input">Select Time Period:</div>
              </td>
              
              <td style={{'width': '11%'}}>
                <select id="month-select-bar" value={monthNames[currentMonthBar] || ''} onChange={(e) => { setMonthSelectedBar(e.target.value); setJurisForDropDown(getJuris(currentYearBar, getKeyByValue(monthNames, e.target.value), timelineBar)) }}>
                  {monthsForDropDownBar?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </td>
              <td style={{'width': '6%'}}>
                <select id="year-select-bar" value={currentYearBar || ''} onChange={(e) => { setYearSelectedBar(e.target.value, timelineBar); setJurisForDropDown(getJuris(e.target.value, currentMonthBar, timelineBar));}}>
                  {yearsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </td>
              <td style={{'width': '18%'}}>
                <table>
                  <tr>
                    <td style={{'width': '50%', 'textAlign': 'right'}}>
                        <div>
                          <input
                            id="radioUSMonthlyBar"
                            name="radioUSMonthlyBar"
                            type="radio"
                            value="Monthly"
                            checked={showAnnualBar === false}
                            onChange={(e) => {
                              setMonthlyToggleBar(false);
                              setTimelineBar('Monthly');
                              setPeriodToggle(true);
                              setYearSelectedBar(currentYearBar, 'Monthly');
                              setJurisForDropDown(getJuris(currentYearBar, currentMonthBar, 'Monthly'));
                            }} />
                          <label
                            htmlFor="radioUSMonthlyBar">Monthly</label>
                        </div>
                      </td>
                      <td style={{'width': '50%', 'textAlign': 'left', 'paddingLeft': '15px'}}>
                        <div>
                          <input
                          id="radioUSAnnualBar"
                          name="radioUSAnnualBar"
                          type="radio"
                          value="Annual"
                          checked={showAnnualBar === true}
                          onChange={(e) => {
                            setMonthlyToggleBar(true);
                            setTimelineBar('Annual');
                            setPeriodToggle(false);
                            setYearSelectedBar(currentYearBar, 'Annual');
                            setJurisForDropDown(getJuris(currentYearBar, currentMonthBar, 'Annual'));
                          }} 
                          />
                          <label
                          htmlFor="radioUSAnnualBar">Annual</label>
                        </div>
                      </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          }
          {isSmallViewport &&
          <div>
          <table style={{'width': '100%', 'paddingBottom': '20px'}}>
            <tr>
                <td style={{'width': '100%', 'textAlign': 'left', 'fontWeight': 'bold'}}><div className="select-input">Select Jurisdiction:</div></td>
            </tr>
            <tr>
                <td style={{'width': '100%'}}>
                  <select id="jurisdiction-select" value={currentStateBar || ''} onChange={(e) => { setCurrentStateBar(e.target.value); setselectedDrugsLine([currentDrug])}}>
                  <option value="US">Overall</option>
                  {Object.keys(jurisForDropDown).map((key) => <option key={key} value={key}>{jurisForDropDown[key]}</option>)}
                </select>
              </td>
            </tr>
            </table>
            <table>
            <tr>
                <td style={{'width': '18%', 'textAlign': 'left', 'fontWeight': 'bold'}}>
                  <div className="select-input">Select Time Period:</div>
                </td>
          </tr>
          <tr> 
              <td>
                <table>
                  <tr>
                    <td style={{'width': '100%'}}>
                      <div className="inputContainer">
                        <select id="month-select-bar" value={monthNames[currentMonthBar] || ''} onChange={(e) => { setMonthSelectedBar(e.target.value); setJurisForDropDown(getJuris(currentYearBar, getKeyByValue(monthNames, e.target.value), timelineBar)) }}>
                          {monthsForDropDownBar?.map((key) => <option key={key} value={key}>{key}</option>)}
                        </select>
                        &nbsp;&nbsp;
                        <select id="year-select-bar" value={currentYearBar || ''} onChange={(e) => { setYearSelectedBar(e.target.value, timelineBar); setJurisForDropDown(getJuris(e.target.value, currentMonthBar, timelineBar));}}>
                          {yearsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>    
            </tr>
          <br></br>
          <tr>
              <td style={{'width': '100%'}}>
                <table>
                  <tr>
                    <td style={{'width': '100%', 'textAlign': 'left'}}>
                        <div className="inputContainer">
                          <input
                            id="radioUSMonthlyBar"
                            name="radioUSMonthlyBar"
                            type="radio"
                            value="Monthly"
                            checked={showAnnualBar === false}
                            onChange={(e) => {
                              setMonthlyToggleBar(false);
                              setTimelineBar('Monthly');
                              setPeriodToggle(true);
                              setYearSelectedBar(currentYearBar, 'Monthly');
                              setJurisForDropDown(getJuris(currentYearBar, currentMonthBar, 'Monthly'));
                            }} />
                          <label htmlFor="radioUSMonthlyBar">Monthly</label>
                          &nbsp;&nbsp;
                          <input
                          id="radioUSAnnualBar"
                          name="radioUSAnnualBar"
                          type="radio"
                          value="Annual"
                          checked={showAnnualBar === true}
                          onChange={(e) => {
                            setMonthlyToggleBar(true);
                            setTimelineBar('Annual');
                            setPeriodToggle(false);
                            setYearSelectedBar(currentYearBar, 'Annual');
                            setJurisForDropDown(getJuris(currentYearBar, currentMonthBar, 'Annual'));
                          }} 
                          />
                          <label htmlFor="radioUSAnnualBar">Annual</label>
                        </div>
                      </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          </div>
          }
          <br></br>
          { timelineBar == 'Annual' &&
            <table>
              <tr>
                <td style={{'textAlign': 'center'}}>
                  <strong>Note: </strong><span>Annual option displays a 12-month rolling average ending at the selected time period {UtilityFunctions.getPeriod(currentYearBar, currentMonthBar)}</span>
                </td>
              </tr>
              <br></br>
            </table>
          }
          {!isSmallViewport &&
        <table>
            <tr>
              <td style={{'width': '8%'}}></td>
              <td style={{'width': '84%'}}>
                <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
                  <tr>
                    <td style={{'width': '23%', 'verticalAlign': 'top'}}>
                      <div style={{'fontWeight': 'bold', 'textAlign': 'right', 'paddingTop': '3px', 'paddingLeft': '3px'}} className="select-input">Select Drug Syndrome:</div>
                      <div style={{'textAlign': 'left'}} className="select-input"><em>Click to select/unselect</em></div>
                    </td>
                    <td class="drugsDivTop" style={{textAlign: 'left', verticalAlign: 'top', paddingLeft: '65px', paddingTop: '5px'}}>
                      {getDrugControlsBar()}
                    </td>
                  </tr>
                  </table>
              </td>
              <td style={{'width': '8%'}}></td>
            </tr>
          </table>
        }
          {isSmallViewport &&
          <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
            <tr>
              <td style={{'width': '100%', 'verticalAlign': 'top'}}>
                <div style={{'fontWeight': 'bold', 'textAlign': 'left', 'paddingTop': '3px', 'paddingLeft': '3px'}} className="select-input">Select Drug Syndrome:</div>
                <div style={{'textAlign': 'left'}} className="select-input"><em>Click to select/unselect</em></div>
              </td>
            </tr>
            <tr>
              <td class="drugsDivTop" style={{textAlign: 'left', verticalAlign: 'top', paddingLeft: '15px', paddingTop: '5px'}}>
                {getDrugControlsBar()}
              </td>
            </tr>
            </table>
          }
        </div> 
       <br></br>
       {accessible &&
       <table>
        <tr>
          <td className="alignRight">
            <span className="boldFont">Sort By: </span>Drug
              <input className="data-type-checkbox" type="checkbox" onChange={e => setBarSort(e.target.checked ? 'B' : 'R')} defaultChecked="true" />
              Rate
          </td>
        </tr>
       </table>
              
              }
        {drugsBarChartMemo}
        {!accessible && <br></br>}
        {!accessible && !isSmallViewport &&
        <table style={{width: '100%'}}>
          <tr>
            <td style={{width: '15%'}}></td>
            <td style={{width: '80%'}}>
              <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
              <div><span><small><i><sup>†</sup>Data not available/not reported.</i></small></span></div>
              <div><span><small><i><sup>§</sup>Scale of the figure may change based on the data presented.</i></small></span></div>
              <div><span><small><i><sup>¶</sup>These categories are not mutually exclusive and reflect nesting. Some overdose visits may involve multiple substances.</i></small></span></div>
              <div><span><small><i><sup>**</sup>Unfunded State.</i></small></span></div>
            </td>
            <td style={{width: '5%'}}></td>
          </tr>
        </table>
        }
        {!accessible && isSmallViewport &&
        <table style={{width: '100%'}}>
          <tr>
            <td style={{width: '100%'}}>
              <div><span><small><i><sup>*</sup>Data suppressed.</i></small></span></div>
              <div><span><small><i><sup>†</sup>Data not available/not reported.</i></small></span></div>
              <div><span><small><i><sup>§</sup>Scale of the figure may change based on the data presented.</i></small></span></div>
              <div><span><small><i><sup>¶</sup>These categories are not mutually exclusive and reflect nesting. Some overdose visits may involve multiple substances.</i></small></span></div>
              <div><span><small><i><sup>**</sup>Unfunded State.</i></small></span></div>
            </td>
          </tr>
        </table>
        }
        {accessible && !isSmallViewport &&
        <table style={{width: '100%'}}>
          <tr>
            <td style={{width: '100%'}}>
              <div><span><small><i><sup>¶</sup>These categories are not mutually exclusive and reflect nesting. Some overdose visits may involve multiple substances.</i></small></span></div>
            </td>
          </tr>
        </table>
        }
        {accessible && isSmallViewport &&
          getFootNotesForData('Bar')
        }
      </section>

<section>
        <div style={{'width':'100%', 'backgroundColor': drugOptions[hdrInfoFromMap].color}}>
          {mapMonthly == 'Monthly' &&
          <h2 className="data-bite-header">
            Geographic distribution of Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>†</sup> : ''} Involving {drugOptions[hdrInfoFromMap].titleForDropDown} per 10,000 Total ED Visits in {jurisCountData[currentYearMap + String(currentMonthMap).padStart(2, '0') + mapMonthly]} Participating Jurisdictions, {monthNames[Number(currentMonthMap)] + ' ' + currentYearMap}
          </h2>
          }
          {mapMonthly == 'Annual' &&
          <h2 className="data-bite-header">
             Geographic distribution of Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>†</sup> : ''} Involving {drugOptions[hdrInfoFromMap].titleForDropDown} per 10,000 Total ED Visits in {jurisCountData[currentYearMap + String(currentMonthMap).padStart(2, '0') + mapMonthly]} Participating Jurisdictions, {UtilityFunctions.getPeriod(currentYearMap, currentMonthMap)}
          </h2>
          }
        </div>
            {!isSmallViewport &&
                  <table>
                    <tr>
                      <td style={{'width': '30%', 'textAlign': 'right'}}><div><strong>Select Time Period:</strong></div></td>
                      <td style={{'width': '18%'}}>
                          <table style={{'width': '100%'}}>
                          <tr>
                              <td style={{'width': '30%'}}>
                                <select id="month-select-map" value={monthNames[currentMonthMap] || ''} onChange={(e) => { setMonthSelectedMap(e.target.value);}}>
                                  {monthsForDropDownMap.map((key) => <option key={key} value={key}>{key}</option>)}
                                </select>
                              </td>
                              <td style={{'width': '30%'}}>
                              <select id="year-select-map" value={currentYearMap || ''} onChange={(e) => { setYearSelectedMap(e.target.value, mapMonthly);}}>
                                {yearsForDropDown.map((key) => <option key={key} value={key}>{key}</option>)}
                              </select>
                              </td>
                            </tr>
                          </table>
                      </td>
                      <td style={{'width': '16%', 'textAlign': 'right'}}>
                        <table>
                          <tr>
                              <td style={{'width': '50%', 'textAlign': 'right'}}>
                              <div>
                                <input
                                  id="radioUSMonthlyMap"
                                  name="radioUSMonthlyMap"
                                  type="radio"
                                  value="Monthly"
                                  checked={mapMonthly === 'Monthly'}
                                  onChange={(e) => {
                                    setMapMonthly(e.target.value);
                                    setYearSelectedMap(currentYearMap, 'Monthly');
                                  }} />
                                <label
                                  htmlFor="radioUSMonthlyMap">Monthly</label>
                              </div>
                            </td>
                            <td style={{'width': '50%', 'textAlign': 'right', 'paddingLeft': '15px'}}>
                              <div>
                                <input
                                id="radioUSAnnualMap"
                                name="radioUSAnnualMap"
                                type="radio"
                                value="Annual"
                                checked={mapMonthly === 'Annual'}
                                onChange={(e) => {
                                  setMapMonthly(e.target.value);
                                  setYearSelectedMap(currentYearMap, 'Annual');
                                }} 
                                />
                                <label
                                htmlFor="radioUSAnnualMap">Annual</label>
                              </div>
                            </td>
                            </tr>
                          </table>
                        </td>
                        <td style={{'width': '6%'}}></td>
                        <td style={{'width': '22%'}}>
                          {!accessible && 
                           <table>
                            <tr>
                              <td style={{ 'width' : '15%', 'textAlign': 'right'}}>
                                 <AngleArrow
                                    width={15}
                                    height={30}
                                    colorScale={'#000000'}
                                    defaultValueIfEmpty={defaultValueIfEmpty}
                                    percentValue={1}
                                  ></AngleArrow>
                              </td>
                              <td style={{ 'textAlign': 'right'}}>
                                  <svg style={{ height: 100, width: isSmallViewport ? width : 240, display: isSmallViewport ? 'block' : 'inline-block' }}>
                                    <text x={20} y={30} fill="black" alignmentBaseline="middle" fontSize={15} fontWeight={'bold'}>Want to know more?</text>
                                    <text x={20} y={50} fill="black" alignmentBaseline="middle" fontSize={15}>Hover over any jurisdiction to </text>
                                    <text x={20} y={70} fill="black" alignmentBaseline="middle" fontSize={15}>see overdose-specific </text>
                                    <text x={20} y={90} fill="black" alignmentBaseline="middle" fontSize={15}>visits</text>
                                </svg>
                              </td>
                            </tr>
                          </table>
                          }
                        </td>
                    </tr>
                  </table>
                  }
                  {isSmallViewport &&
                  <table>
                    <tr>
                      <td style={{'width': '100%', 'textAlign': 'left'}}><div><strong>Select Time Period:</strong></div></td>
                    </tr>
                    <tr>
                      <td style={{'width': '100%'}}>
                          <table style={{'width': '100%'}}>
                          <tr>
                              <td style={{'width': '100%'}}>
                                <div className="inputContainer">
                                  <select id="month-select-map" value={monthNames[currentMonthMap] || ''} onChange={(e) => { setMonthSelectedMap(e.target.value);}}>
                                    {monthsForDropDownMap.map((key) => <option key={key} value={key}>{key}</option>)}
                                  </select>
                                  &nbsp;&nbsp;
                                  <select id="year-select-map" value={currentYearMap || ''} onChange={(e) => { setYearSelectedMap(e.target.value, mapMonthly);}}>
                                  {yearsForDropDown.map((key) => <option key={key} value={key}>{key}</option>)}
                                </select>
                                </div>
                              </td>
                            </tr>
                          </table>
                      </td>
                    </tr>
                    <br></br>
                    <tr>
                      <td style={{'width': '100%', 'textAlign': 'left'}}>
                        <table>
                          <tr>
                              <td style={{'width': '100%', 'textAlign': 'left'}}>
                              <div className="inputContainer">
                                <input
                                  id="radioUSMonthlyMap"
                                  name="radioUSMonthlyMap"
                                  type="radio"
                                  value="Monthly"
                                  checked={mapMonthly === 'Monthly'}
                                  onChange={(e) => {
                                    setMapMonthly(e.target.value);
                                    setYearSelectedMap(currentYearMap, 'Monthly');
                                  }} />
                                <label htmlFor="radioUSMonthlyMap">Monthly</label>
                                &nbsp;&nbsp;
                                <input
                                id="radioUSAnnualMap"
                                name="radioUSAnnualMap"
                                type="radio"
                                value="Annual"
                                checked={mapMonthly === 'Annual'}
                                onChange={(e) => {
                                  setMapMonthly(e.target.value);
                                  setYearSelectedMap(currentYearMap, 'Annual');
                                }} 
                                />
                                <label htmlFor="radioUSAnnualMap">Annual</label>
                              </div>
                            </td>
                            </tr>
                          </table>
                        </td>
                        </tr>
                  </table>
                  }
          { mapMonthly == 'Annual' &&
              <table>
                <tr>
                  <td style={{'textAlign': 'center'}}>
                    <strong>Note: </strong><span>Annual option displays a 12-month rolling average ending at the selected time period {UtilityFunctions.getPeriod(currentYearMap, currentMonthMap)}</span>
                  </td>
                </tr>
                <br></br>
              </table>
            }
          {usaMapMemo}

        {accessible && isSmallViewport &&
          getFootNotesForData()
        }
      </section>

        {/* State Chart Start */}
        <div style={{'width':'100%', 'backgroundColor': drugColor}}>
          {timeline == 'Monthly' &&
          <h2 className="data-bite-header">
            Suspected Nonfatal Overdose ED Visits Involving {drugOptions[currentDrug].titleAll} per 10,000 Total ED visits by Jurisdiction, {monthNames[Number(currentMonth)] + ' ' + currentYear}
          </h2>
          }
          {timeline == 'Annual' &&
          <h2 className="data-bite-header">
            Suspected Nonfatal Overdose ED Visits Involving {drugOptions[currentDrug].titleAll} per 10,000 Total ED visits by Jurisdiction, {UtilityFunctions.getPeriod(currentYear, currentMonth)}
          </h2>
          }
        </div>
        <div>
          {!isSmallViewport &&
          <table style={{'width': '100%'}}>
          <tr>
              <td style={{'width': '20%', 'textAlign': 'right', 'fontWeight': 'bold'}}>
                <div className="select-input">Select Time Period:</div>
              </td>
              <td style={{'width': '11%'}}>
                <select id="month-select" value={monthNames[currentMonth] || ''} onChange={(e) => { setMonthSelected(e.target.value) }}>
                  {monthsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </td>
              <td style={{'width': '6%'}}>
                <select id="year-select" value={currentYear || ''} onChange={(e) => { setYearSelected(e.target.value, timeline);}}>
                  {yearsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </td>
              <td style={{'width': '35%'}}>
                <table>
                  <tr>
                    <td style={{'width': '14%', 'textAlign': 'right'}}>
                        <div>
                          <input
                            id="radioUSMonthlyState"
                            name="radioUSMonthlyState"
                            type="radio"
                            value="Monthly"
                            checked={showAnnual === false}
                            onChange={(e) => {
                                setMonthlyToggle(false)
                                setTimeline('Monthly');
                                setPeriodToggle(true);
                                setYearSelected(currentYear, 'Monthly');
                            }} />
                          <label
                            htmlFor="radioUSMonthlyState">Monthly</label>
                        </div>
                      </td>
                      <td style={{'width': '50%', 'textAlign': 'left', 'paddingLeft': '15px'}}>
                        <div>
                          <input
                          id="radioUSAnnualState"
                          name="radioUSAnnualState"
                          type="radio"
                          value="Annual"
                          checked={showAnnual === true}
                          onChange={(e) => {
                              setMonthlyToggle(true);
                              setTimeline('Annual');
                              setPeriodToggle(false);
                              setYearSelected(currentYear, 'Annual');
                          }} 
                          />
                          <label
                          htmlFor="radioUSAnnualState">Annual</label>
                        </div>
                      </td>
                  </tr>
                </table>
              </td>
              {accessible &&
              <td>
                  <span className="boldFont">Sort By: </span>Jurisdiction
                  <input className="data-type-checkbox" type="checkbox" onChange={e => setStateSort(e.target.checked ? 'S' : 'R')} defaultChecked="true" />
                  Rate
              </td>
              }
            </tr>
          </table>
          }
          {isSmallViewport &&
          <table style={{'width': '100%'}}>
            <tr>
              <td style={{'width': '20%', 'textAlign': 'left', 'fontWeight': 'bold'}}>
                <div className="select-input">Select Time Period:</div>
              </td>
            </tr>
            <tr>
              <td style={{'width': '100%'}}>
                <div className="inputContainer">
                <select id="month-select" value={monthNames[currentMonth] || ''} onChange={(e) => { setMonthSelected(e.target.value) }}>
                  {monthsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
                &nbsp;&nbsp;
                <select id="year-select" value={currentYear || ''} onChange={(e) => { setYearSelected(e.target.value, timeline);}}>
                  {yearsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
                </div>
              </td>
              <td style={{'width': '15%', 'textAlign': 'left', 'paddingLeft': '15px'}}></td>
            </tr>
            <br></br>
            <tr>
              <td style={{'width': '100%'}}>
                <table>
                  <tr>
                    <td style={{'width': '100%', 'textAlign': 'left'}}>
                      <div className="inputContainer">
                        <div>
                          <input
                            id="radioUSMonthlyState"
                            name="radioUSMonthlyState"
                            type="radio"
                            value="Monthly"
                            checked={showAnnual === false}
                            onChange={(e) => {
                                setMonthlyToggle(false)
                                setTimeline('Monthly');
                                setPeriodToggle(true);
                                setYearSelected(currentYear, 'Monthly');
                            }} />
                          <label htmlFor="radioUSMonthlyState">Monthly</label>
                          &nbsp;&nbsp;
                          <input
                          id="radioUSAnnualState"
                          name="radioUSAnnualState"
                          type="radio"
                          value="Annual"
                          checked={showAnnual === true}
                          onChange={(e) => {
                              setMonthlyToggle(true);
                              setTimeline('Annual');
                              setPeriodToggle(false);
                              setYearSelected(currentYear, 'Annual');
                          }} 
                          />
                          <label
                          htmlFor="radioUSAnnualState">Annual</label>
                        </div>
                        </div>
                      </td>
                  </tr>
                </table>
              </td>
            </tr>
            <br></br>
            {accessible &&
            <tr>
              <td className="alignRight">
                <span className="boldFont">Sort By: </span>Jurisdiction
                  <input className="data-type-checkbox" type="checkbox" onChange={e => setStateSort(e.target.checked ? 'S' : 'R')} defaultChecked="true" />
                  Rate
              </td>
            </tr>
            }
          </table>
          }
        </div>
        { timeline == 'Annual' &&
            <table>
              <tr>
                <td style={{'textAlign': 'center'}}>
                  <strong>Note: </strong><span>Annual option displays a 12-month rolling average ending at the selected time period {UtilityFunctions.getPeriod(currentYear, currentMonth)}</span>
                </td>
              </tr>
            </table>
          }
          {stateBarChartMemo}
          {!accessible && getFootNotesForData()}
          {accessible && isSmallViewport && getFootNotesForData('State')}
          {/* State Chart End */}

       <section>

        <div style={{'width':'100%', 'backgroundColor': getHeaderColor(selectedDrugsSexAge)}}>
          {sexAgeMonthly == 'Monthly' &&
          <h2 className="data-bite-header">
            Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>†</sup> : ''} Involving {drugOptions[selectedDrugsSexAge[0]].titleAll} per 10,000 Total ED Visits by Sex, Age, and by Sex and Age, in {jurisCountData[currentYearSexAge + String(currentMonthSexAge).padStart(2, '0') + sexAgeMonthly]} Participating Jurisdictions, {monthNames[Number(currentMonthSexAge)] + ' ' + currentYearSexAge}
          </h2>
          }
          {sexAgeMonthly == 'Annual' &&
          <h2 className="data-bite-header">
            Suspected Nonfatal Overdose ED Visits{!accessible ? <sup>†</sup> : ''} Involving {drugOptions[selectedDrugsSexAge[0]].titleAll} per 10,000 Total ED Visits by Sex, Age, and by Sex and Age, in {jurisCountData[currentYearSexAge + String(currentMonthSexAge).padStart(2, '0') + sexAgeMonthly]} Participating Jurisdictions, {UtilityFunctions.getPeriod(currentYearSexAge, currentMonthSexAge)}
          </h2>
          }
        </div>

        {!isSmallViewport &&
                  <table>
                    <tr>
                      <td></td>
                      <td>
                         <table>
                        <tr>
                          <td style={{'width': '30%', 'textAlign': 'right'}}><div><strong>Select Time Period:</strong></div></td>
                          <td style={{'width': '22%'}}>
                              <table style={{'width': '100%'}}>
                              <tr>
                                  <td style={{'width': '30%'}}>
                                    <select id="month-select-sexAge" value={monthNames[currentMonthSexAge] || ''} onChange={(e) => { setMonthSelectedSexAge(e.target.value) }}>
                                    {monthsForDropDownSexAge.map((key) => <option key={key} value={key}>{key}</option>)}
                                  </select>
                                  </td>
                                  <td style={{'width': '30%'}}>
                                  <select id="year-select-sexAge" value={currentYearSexAge || ''} onChange={(e) => { setYearSelectedSexAge(e.target.value, sexAgeMonthly); }}>
                                  {yearsForDropDown.map((key) => <option key={key} value={key}>{key}</option>)}
                                </select>
                                  </td>
                                </tr>
                              </table>
                          </td>
                          <td style={{'width': '20%', 'textAlign': 'right'}}>
                            <table>
                              <tr>
                                  <td style={{'width': '50%', 'textAlign': 'right'}}>
                                <div>
                                    <input
                                      id="radioUSMonthlySexAge"
                                      name="radioUSMonthlySexAge"
                                      type="radio"
                                      value="Monthly"
                                      checked={sexAgeMonthly === 'Monthly'}
                                      disabled={isDisabledDrug()}
                                      onChange={(e) => {
                                        setSexAgeMetric(e.target.value);
                                        setYearSelectedSexAge(currentYearSexAge, 'Monthly');
                                      }} />
                                    <label
                                      htmlFor="radioUSMonthlySexAge">Monthly</label>
                                  </div>
                                </td>
                                <td style={{'width': '50%', 'textAlign': 'right', 'paddingLeft': '15px'}}>
                                  <div>
                                    <input
                                    id="radioUSYearlySexAge"
                                    name="radioUSYearlySexAge"
                                    type="radio"
                                    value="Annual"
                                    checked={sexAgeMonthly === 'Annual'}
                                    onChange={(e) => {
                                      setSexAgeMetric(e.target.value);
                                      setYearSelectedSexAge(currentYearSexAge, 'Annual');
                                    }} />
                                    <label
                                    htmlFor="radioUSYearlySexAge">Annual</label>
                                  </div>
                                </td>
                                </tr>
                              </table>
                            </td>
                            <td style={{'width': '26%'}}>
                            </td>
                        </tr>
                      </table>
                      </td>
                    </tr>
                    <tr>
                      <td colspan={3}>
                        { sexAgeMonthly == 'Annual' &&
                            <table>
                              <tr>
                                <td style={{'textAlign': !isSmallViewport ? 'center' : 'left'}}>
                                  <strong>Note: </strong><span>Annual option displays a 12-month rolling average ending at the selected time period {UtilityFunctions.getPeriod(currentYearSexAge, currentMonthSexAge)}</span>
                                </td>
                              </tr>
                              <br></br>
                            </table>
                          }
                          { sexAgeMonthly == 'Monthly' &&
                            <table>
                              <tr>
                                <td style={{'textAlign': !isSmallViewport ? 'center' : 'left'}}>
                                  <strong>Note: </strong><span>Due to data suppression rules for counts under 20 ED visits, monthly demographic figures are not available for Cocaine, Methamphetamine, Fentanyl, Heroin, and Benzodiazepine Drug Syndromes. These data can be viewed at the Annual level.</span>
                                </td>
                              </tr>
                              <br></br>
                            </table>
                          }
                      </td>
                    </tr>
                    <tr>
                      <td style={{'width': '8%'}}></td>
                      <td style={{'width': '84%'}}>
                        <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
                          <tr>
                            <td style={{'width': '23%', 'verticalAlign': 'top'}}>
                              <div style={{'fontWeight': 'bold', 'textAlign': 'right', 'paddingTop': '3px', 'paddingLeft': '3px'}} className="select-input">Select Drug Syndrome:</div>
                              <div style={{'textAlign': 'left'}} className="select-input"><em>Click One</em></div>
                            </td>
                            <td class="drugsDivTop" style={{textAlign: 'left', verticalAlign: 'top', paddingLeft: '65px', paddingTop: '5px'}}>
                              {getDrugControlsSexAge()}
                            </td>
                          </tr>
                          </table>
                      </td>
                      <td style={{'width': '8%'}}></td>
                    </tr>
                    <tr>
                      <td colspan='3'>
                        Percent
                          <input className="data-type-checkbox" type="checkbox" onChange={e => setCurrentDataType(e.target.checked ? 'percent' : 'rate')} checked={currentDataType == 'percent' ? true : false} defaultChecked="false"/>
                        Rate
                        <br></br>
                      </td>
                    </tr>
                  </table>
                }
                {isSmallViewport &&
                  <table>
                    <tr>
                      <td>
                        <table>
                        <tr>
                          <td style={{'width': '100%', 'textAlign': 'left'}}><div><strong>Select Time Period:</strong></div></td>
                        </tr>
                        <tr>
                          <td style={{'width': '100%'}}>
                              <table style={{'width': '100%'}}>
                              <tr>
                                  <td style={{'width': '30%'}}>
                                    <select id="month-select-sexAge" value={monthNames[currentMonthSexAge] || ''} onChange={(e) => { setMonthSelectedSexAge(e.target.value) }}>
                                    {monthsForDropDownSexAge.map((key) => <option key={key} value={key}>{key}</option>)}
                                  </select>
                                  &nbsp;&nbsp;
                                  <select id="year-select-sexAge" value={currentYearSexAge || ''} onChange={(e) => { setYearSelectedSexAge(e.target.value, sexAgeMonthly); }}>
                                  {yearsForDropDown.map((key) => <option key={key} value={key}>{key}</option>)}
                                </select>
                                  </td>
                                </tr>
                              </table>
                          </td>
                        </tr>
                      </table>
                        <br></br>
                        <table>
                        <tr>
                          <td style={{'width': '100%', 'textAlign': 'left'}}>
                            <table>
                              <tr>
                                  <td style={{'width': '100%', 'textAlign': 'left'}}>
                                <div>
                                    <input
                                      id="radioUSMonthlySexAge"
                                      name="radioUSMonthlySexAge"
                                      type="radio"
                                      value="Monthly"
                                      checked={sexAgeMonthly === 'Monthly'}
                                      disabled={isDisabledDrug()}
                                      onChange={(e) => {
                                        setSexAgeMetric(e.target.value);
                                        setYearSelectedSexAge(currentYearSexAge, 'Monthly');
                                      }} />
                                    <label htmlFor="radioUSMonthlySexAge">Monthly</label>
                                    &nbsp;&nbsp;
                                    <input
                                    id="radioUSYearlySexAge"
                                    name="radioUSYearlySexAge"
                                    type="radio"
                                    value="Annual"
                                    checked={sexAgeMonthly === 'Annual'}
                                    onChange={(e) => {
                                      setSexAgeMetric(e.target.value);
                                      setYearSelectedSexAge(currentYearSexAge, 'Annual');
                                    }} />
                                    <label
                                    htmlFor="radioUSYearlySexAge">Annual</label>
                                  </div>
                                </td>
                                </tr>
                              </table>
                            </td>
                        <td style={{'width': '26%'}}>
                        </td>
                    </tr>
                  </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        { sexAgeMonthly == 'Annual' &&
                            <table>
                              <tr>
                                <td style={{'textAlign': !isSmallViewport ? 'center' : 'left'}}>
                                  <strong>Note: </strong><span>Annual option displays a 12-month rolling average ending at the selected time period {UtilityFunctions.getPeriod(currentYearSexAge, currentMonthSexAge)}</span>
                                </td>
                              </tr>
                              <br></br>
                            </table>
                          }
                          { sexAgeMonthly == 'Monthly' &&
                            <table>
                              <tr>
                                <td style={{'textAlign': !isSmallViewport ? 'center' : 'left'}}>
                                  <strong>Note: </strong><span>Due to data suppression rules for counts under 20 ED visits, monthly demographic figures are not available for Cocaine, Methamphetamine, Fentanyl, Heroin, and Benzodiazepine Drug Syndromes. These data can be viewed at the Annual level.</span>
                                </td>
                              </tr>
                              <br></br>
                            </table>
                          }
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
                          <tr>
                            <td style={{'width': '100%', 'verticalAlign': 'top'}}>
                              <div style={{'fontWeight': 'bold', 'textAlign': 'left', 'paddingTop': '3px', 'paddingLeft': '3px'}} className="select-input">Select Drug Syndrome:</div>
                              <div style={{'textAlign': 'left'}} className="select-input"><em>Click One</em></div>
                            </td>
                          </tr>
                          <tr>
                            <td class="drugsDivTop" style={{textAlign: 'left', verticalAlign: 'top', paddingLeft: '15px', paddingTop: '5px'}}>
                              {getDrugControlsSexAge()}
                            </td>
                          </tr>
                          </table>
                      </td>
                    </tr>
                  </table>
                }

          <br></br>
          {}
          {!accessible && !isSmallViewport &&
            <table>
              <tr>
                <td style={{width: '50%'}}>
                  {sexChartMemo}
                </td>
                <td style={{width: '50%'}}>
                  {ageChartMemo}
                </td>
              </tr>
              <tr>
                <td style={{width: '50%'}}>
                  {sexAgeChartMemo}
                </td>
                <td style={{width: '50%'}}>
                </td>
              </tr>
            </table>
          }
          {accessible && !isSmallViewport &&
            <table>
              <tr>
                <td style={{width: '100%'}}>
                  {sexChartMemo}
                </td>
              </tr>
              <tr>
                <td style={{width: '100%'}}>
                  {ageChartMemo}
                </td>
              </tr>
              <tr>
                <td style={{width: '0%'}}>
                  {sexAgeChartMemo}
                </td>
              </tr>
            </table>
          }
          {!accessible && isSmallViewport &&
            <table>
              <tr>
                <td style={{width: '100%'}}>
                  {sexChartMemo}
                </td>
              </tr>
              <br></br>
              <tr>
                <td style={{width: '100%'}}>
                  {ageChartMemo}
                </td>
              </tr>
              <br></br>
              <tr>
                <td style={{width: '100%'}}>
                  {sexAgeChartMemo}
                </td>
              </tr>
            </table>
          }
          {accessible && isSmallViewport &&
            <table>
              <tr>
                <td style={{width: '100%'}}>
                  {sexChartMemo}
                </td>
              </tr>
              <br></br>
              <tr>
                <td style={{width: '100%'}}>
                  {ageChartMemo}
                </td>
              </tr>
              <br></br>
              <tr>
                <td style={{width: '0%'}}>
                  {sexAgeChartMemo}
                </td>
              </tr>
            </table>
          }
      </section>

      <div className='data-tables'>
        <div className="datatable-container" id="impdataconsiderations">
          <button className="h2" style={{ backgroundColor: '#005EAA' }} onClick={toggleConsiderations}>
          Important Data Considerations
            {showConsiderations && <span>{String.fromCharCode(8722)}</span>}
            {!showConsiderations && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showConsiderations &&
            <div className="datatable-body">
             <p><strong>Important caveats to consider when interpreting the data include:</strong></p>
              <ol>
                <li>This iteration of the dashboard incorporates DOSE data from 2019 onward. Data from 2018 are excluded due to over 40% of jurisdictions reporting facility coverage below 70% [mean: 76.9%, median: 84.4%, range: 1.5%-100%]. Of the 48 jurisdictions who currently submit data to DOSE-SYS, 19 jurisdictions reported facility coverage less than 70% in 2018, and an additional 4 did not submit data to DOSE in 2018 (e.g., were not yet enrolled).</li>
                <li>All data previously available on this dashboard (i.e., data collected through 2023) have been updated to reflect revisions in syndrome definitions. Datasets downloaded before March 2024 used older syndrome definitions, and data collected prior to August 2023 have been updated with new syndrome definitions released January 2024 (see <a target="_blank" href="https://knowledgerepository.syndromicsurveillance.org/search/syndrome?keys=overdose%20od2a%202.0&sort_by=field_submitting_author_organiza&sort_order=DESC&f%5B0%5D=submitting_author_organization%3ACDC&page=1">Knowledge Repository</a>).</li>
                <li><strong>Some data may be missing.</strong> Data sent from emergency departments (EDs) to health departments may be delayed or paused for a period of time.  Missing data are noted in footnotes, where applicable.</li>
                <li>Nonfatal Drug Overdose Surveillance and Epidemiology – Syndromic Data (DOSE-SYS) Dashboard <strong>may differ from data accessible through the National Syndromic Surveillance Program (NSSP) BioSense Platform.</strong> Many jurisdictions extract data from NSSP’s Electronic Surveillance System for the Early Notification of Community-based Epidemics (ESSENCE) database as part of their data submission process. However, DOSE-SYS data may differ from NSSP ESSENCE data due to differences in jurisdiction data preparation as well as the dynamic nature of NSSP’s progressively updating data.</li>
                <li><strong>Reporting facilities and the data they report can change.</strong> Several jurisdictions continue efforts to onboard new facilities that can begin to share data in syndromic surveillance systems, and some facilities experience periodic interruptions in, or might stop, syndromic surveillance data feeds. Some of these issues became more pronounced during the earlier phase of the COVID-19 pandemic<sup>B</sup>. Syndromic data also can be updated with new information over time, for example, with additional diagnosis codes. Therefore, estimates reported might change over time as more facilities begin sharing data or sharing higher quality data or stop sharing data for a period of time. Some EDs might also have increases in the proportion of ED visits in syndromic data that contain diagnosis codes, which facilitates the identification of drug overdose-related visits. The reason a patient seeks medical care (called the chief complaint) is available in NSSP often within 24 hours for ~80% of ED visits. DOSE-SYS data are reported with a two-month time lag and not typically updated.</li>
                <li><strong>These are suspected nonfatal drug overdose-related ED visits.</strong> Because data used to identify suspected nonfatal drug overdose visits are based on ED visit chief complaints and diagnosis codes from initial clinical impressions or observations, syndromic data may not represent the final, most updated information about the ED visit. Additionally, toxicological testing is not uniformly captured in these data<sup>C</sup> and therefore may underreport specific drug types involved.</li>
                <li><strong>Data likely represent an undercount,</strong> given potential inaccuracies in preliminary coding and potentially incomplete clinical descriptions captured in chief complaint information.</li>
                <li><strong>New ICD-10-CM codes were added for fentanyl and methamphetamine poisonings during the data collection period:</strong> Syndrome definitions use information from both the chief complaint and diagnosis codes to identify drug overdose cases. ICD-10-CM diagnosis codes were introduced to address gaps in the classification of fentanyl poisonings (T40.41, effective October 1, 2020) and methamphetamine poisonings (T43.65, effective October 1, 2022). Prior to the availability of these codes, suspected fentanyl or methamphetamine poisonings may have been classified under a broader drug overdose or poisoning code, decreasing the likelihood that the visit would be captured by the drug-specific syndrome definition. Additionally, incorporation of new ICD-10-CM codes into routine use at healthcare facilities may vary between facilities or jurisdictions. Due to these limitations, comparisons of data collected before and after the introduction of the respective codes should be interpreted with caution.</li>
                <li><strong>Drug overdose visit numbers are not mutually exclusive</strong> but rather reflect nesting of drug categories and some drug overdose visits involved multiple substances (e.g., a given drug overdose ED visit could have involved both opioids and stimulants).</li>
                <li>DOSE-SYS data could be suppressed for a variety of reasons. For example, rates based on 1-19 overdose counts are suppressed to avoid sharing information that could be identifiable and because of possible instability of rate estimates. For more information, please see <a target="_blank" href="https://www.cdc.gov/nchs/data/statnt/statnt24.pdf">Healthy People 2010 Criteria for Data Suppression</a>.  Additionally, data are shown for the time period beginning January 2019 and exclude several months during the onset of the COVID-19 pandemic (i.e., March 2020-August 2020) for all jurisdictions. Other situations when data coverage was incomplete may also lead to data suppression.</li>
                <li>This dashboard shows ED visits for suspected nonfatal drug overdoses of unintentional or undetermined intent. For full definitions, query syntax, and technical briefs, see: <a target="_blank" href="https://knowledgerepository.syndromicsurveillance.org/search/syndrome?keys=overdose%20od2a%202.0&sort_by=field_submitting_author_organiza&sort_order=DESC&f%5B0%5D=submitting_author_organization%3ACDC&page=1">Knowledge Repository</a>.</li>
              </ol>
            </div>}
        </div>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: '#005EAA' }} onClick={toggleFootNotes}>
            References 
            {showFootNotes && <span>{String.fromCharCode(8722)}</span>}
            {!showFootNotes && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showFootNotes &&
            <div className="datatable-body">
            <ul id='noBullets'>
              <li><strong><sup>A</sup></strong>Vivolo-Kantor AM, Smith H, Scholl L, Differences and similarities between emergency department syndromic surveillance and hospital discharge data for nonfatal drug overdose. Annals of Epidemiology. 2021; 62; 43-50. <a target="_blank" href="https://doi.org/10.1016/j.annepidem.2021.05.008">https://doi.org/10.1016/j.annepidem.2021.05.008</a>.</li>
              <li><strong><sup>B</sup></strong>Holland KM, Jones C, Vivolo-Kantor AM, et al. Trends in US Emergency Department Visits for Mental Health, Overdose, and Violence Outcomes Before and During the COVID-19 Pandemic. JAMA Psychiatry. 2021;78(4):372–379. <a target="_blank" href="https://pubmed.ncbi.nlm.nih.gov/33533876/">doi:10.1001/jamapsychiatry.2020.4402</a>.</li>
              <li><strong><sup>C</sup></strong>Morrow JB, Ropero-Miller JD, Catlin ML, et al. The Opioid Epidemic: Moving Toward an Integrated, Holistic Analytical Response. Journal of Analytical Toxicology. 2019; 43(1); 1–9. <a target="_blank" href="https://doi.org/10.1093/jat/bky049">https://doi.org/10.1093/jat/bky049</a>.</li>
              </ul>
          </div>}
        </div>
      </div>

      <a download={getFileNameFromPath(document.querySelector('#non-fatal-container').attributes['download-url']?.value)} href={document.querySelector('#non-fatal-container').attributes['download-url']?.value} aria-label="Download this data in an Excel file format." className="btn btn-download no-border">Download Data (XLSX)</a><span> {isSmallViewport ? <br></br> : ''} with all available suspected nonfatal drug overdose visit estimates per 10,000 ED visits.</span>

      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>

    </Context.Provider>
  );
  
}
