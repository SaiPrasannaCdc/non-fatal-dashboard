import React, { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import debounce from 'lodash.debounce';
import Papa from 'papaparse';
import UsaMap from './components/UsaMap';
import BarChartVertical from './components/BarChartVertical';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';
import Datatable from './components/Datatable';
import Slider from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import { Base64 } from 'js-base64';

import Caret from './assets/caret-down.svg';
import Context from './context';
import 'rc-slider/assets/index.css';
import './styles.scss';
import { UtilityFunctions } from './utility'

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const wrapperStyle = { width: 830, marginBottom: 50, marginLeft: 10, marginTop: 5 };

const handle = (props) => {
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
};

/**
 * Generates variations of the primary color for hover and active
 * 
 * @param {*} color 
 * @returns 
 */
const generateColorsArray = (color = '#000000') => {
  let colorObj = chroma(color)

  //Do not saturate grays because they turn pink
  const colorRgb = colorObj.rgb();
  if (colorRgb[0] === colorRgb[1] && colorRgb[1] === colorRgb[2]) {
    return [
      color,
      colorObj.darken(1.25).hex(),
      colorObj.darken(1.5).hex()
    ];
  } else {
    return [
      color,
      colorObj.saturate(1.75).hex(),
      colorObj.darken(0.5).saturate(1.75).hex()
    ];
  }
  
}

const hashObj = (row) => {
  let str = JSON.stringify(row)

  let hash = 0;
  
  if (str.length == 0) return hash;

  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash<<5)-hash) + char;
    hash = hash & hash;
  }

  return hash;
}

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

const supportedStates = {
  // States
  'US-AL': ['Alabama', 'AL'],
  'US-AK': ['Alaska', 'AK'],
  'US-AZ': ['Arizona', 'AZ'],
  'US-AR': ['Arkansas', 'AR'],
  'US-CA': ['California', 'CA'],
  'US-CO': ['Colorado', 'CO'],
  'US-CT': ['Connecticut', 'CT'],
  'US-DE': ['Delaware', 'DE'],
  'US-DC': ['District of Columbia', 'DC'],
  'US-FL': ['Florida', 'FL'],
  'US-GA': ['Georgia', 'GA'],
  'US-HI': ['Hawaii', 'HI'],
  'US-ID': ['Idaho', 'ID'],
  'US-IL': ['Illinois', 'IL'],
  'US-IN': ['Indiana', 'IN'],
  'US-IA': ['Iowa', 'IA'],
  'US-KS': ['Kansas', 'KS'],
  'US-KY': ['Kentucky', 'KY'],
  'US-LA': ['Louisiana', 'LA'],
  'US-ME': ['Maine', 'ME'],
  'US-MD': ['Maryland', 'MD'],
  'US-MA': ['Massachusetts', 'MA'],
  'US-MI': ['Michigan', 'MI'],
  'US-MN': ['Minnesota', 'MN'],
  'US-MS': ['Mississippi', 'MS'],
  'US-MO': ['Missouri', 'MO'],
  'US-MT': ['Montana', 'MT'],
  'US-NE': ['Nebraska', 'NE'],
  'US-NV': ['Nevada', 'NV'],
  'US-NH': ['New Hampshire', 'NH'],
  'US-NJ': ['New Jersey', 'NJ'],
  'US-NM': ['New Mexico', 'NM'],
  'US-NY': ['New York', 'NY'],
  'US-NC': ['North Carolina', 'NC'],
  'US-ND': ['North Dakota', 'ND'],
  'US-OH': ['Ohio', 'OH'],
  'US-OK': ['Oklahoma', 'OK'],
  'US-OR': ['Oregon', 'OR'],
  'US-PA': ['Pennsylvania', 'PA'],
  //'US-PR': ['Puerto Rico', 'PR'],
  'US-RI': ['Rhode Island', 'RI'],
  'US-SC': ['South Carolina', 'SC'],
  'US-SD': ['South Dakota', 'SD'],
  'US-TN': ['Tennessee', 'TN'],
  'US-TX': ['Texas', 'TX'],
  'US-UT': ['Utah', 'UT'],
  'US-VT': ['Vermont', 'VT'],
  'US-VA': ['Virginia', 'VA'],
  'US-WA': ['Washington', 'WA'],
  'US-WV': ['West Virginia', 'WV'],
  'US-WI': ['Wisconsin', 'WI'],
  'US-WY': ['Wyoming', 'WY']
};

const fundedStates = {
  // States
  'US-AL': ['Alabama', 'AL'],
  'US-AK': ['Alaska', 'AK'],
  'US-AZ': ['Arizona', 'AZ'],
  'US-AR': ['Arkansas', 'AR'],
  'US-CA': ['California', 'CA'],
  'US-CO': ['Colorado', 'CO'],
  'US-CT': ['Connecticut', 'CT'],
  'US-DE': ['Delaware', 'DE'],
  'US-DC': ['District of Columbia', 'DC'],
  'US-FL': ['Florida', 'FL'],
  'US-GA': ['Georgia', 'GA'],
  'US-HI': ['Hawaii', 'HI'],
  'US-ID': ['Idaho', 'ID'],
  'US-IL': ['Illinois', 'IL'],
  'US-IN': ['Indiana', 'IN'],
  'US-IA': ['Iowa', 'IA'],
  'US-KS': ['Kansas', 'KS'],
  'US-KY': ['Kentucky', 'KY'],
  'US-LA': ['Louisiana', 'LA'],
  'US-ME': ['Maine', 'ME'],
  'US-MD': ['Maryland', 'MD'],
  'US-MA': ['Massachusetts', 'MA'],
  'US-MI': ['Michigan', 'MI'],
  'US-MN': ['Minnesota', 'MN'],
  'US-MS': ['Mississippi', 'MS'],
  'US-MO': ['Missouri', 'MO'],
  'US-MT': ['Montana', 'MT'],
  'US-NE': ['Nebraska', 'NE'],
  'US-NV': ['Nevada', 'NV'],
  'US-NH': ['New Hampshire', 'NH'],
  'US-NJ': ['New Jersey', 'NJ'],
  'US-NM': ['New Mexico', 'NM'],
  'US-NY': ['New York', 'NY'],
  'US-NC': ['North Carolina', 'NC'],
  // 'US-ND': ['North Dakota', 'ND'],
  'US-OH': ['Ohio', 'OH'],
  'US-OK': ['Oklahoma', 'OK'],
  'US-OR': ['Oregon', 'OR'],
  'US-PA': ['Pennsylvania', 'PA'],
  //'US-PR': ['Puerto Rico', 'PR'],
  'US-RI': ['Rhode Island', 'RI'],
  'US-SC': ['South Carolina', 'SC'],
  'US-SD': ['South Dakota', 'SD'],
  'US-TN': ['Tennessee', 'TN'],
  'US-TX': ['Texas', 'TX'],
  'US-UT': ['Utah', 'UT'],
  'US-VT': ['Vermont', 'VT'],
  'US-VA': ['Virginia', 'VA'],
  'US-WA': ['Washington', 'WA'],
  'US-WV': ['West Virginia', 'WV'],
  'US-WI': ['Wisconsin', 'WI'],
  'US-WY': ['Wyoming', 'WY']
};

const monthNames = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December', 'all': 'All Months' };
let stateNames = { 'US': 'Overall', 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming' };
const supportedYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

const getStateName = (geo) => {
  return supportedStates[geo][0];
}

const legendOrder = [
  'Significant Increase',
  'Significant Decrease',
  'No Significant Change',
  'Data Not Available/Not Reported',
  'Unfunded State'
];

const drugOptions = {
  'all': {
    'titleSingular': 'Drug',
    'titlePlural': 'All Drugs',
    'titleAll': 'All Drugs',
    'titleAllGram': 'All Drug',
    'titleForDropDown': 'All Drugs',
    'significanceColumn': 'allSignificance',
    'percentageColumn': 'allPercentageChange',
    'color': '#325D7D',
    'lineChartOrder': '1',
  },
  'benzodiazepine': {
    'titleSingular': 'Benzodiazepine',
    'titlePlural': 'Benzodiazepine',
    'titleAll': 'Benzodiazepine',
    'titleAllGram': 'Benzodiazepine',
    'titleForDropDown': 'Benzodiazepine',
    'significanceColumn': 'benzoSignificance',
    'percentageColumn': 'benzoPercentageChange',
    'color': '#B83A5E',
    'lineChartOrder': '8',
  },
  'opioids': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioids',
    'titleAllGram': 'All Opioid',
    'titleForDropDown': 'All Opioids',
    'significanceColumn': 'opioidSignificance',
    'percentageColumn': 'opioidPercentageChange',
    'color': '#000C77',
    'lineChartOrder': '5',
  },
  'fentanyl': {
    'titleSingular': 'Fentanyl',
    'titlePlural': 'Fentanyl',
    'titleAll': 'Fentanyl',
    'titleAllGram': 'Fentanyl',
    'titleForDropDown': 'Fentanyl',
    'significanceColumn': 'fentanylSignificance',
    'percentageColumn': 'fentanylPercentageChange',
    'color': '#294891',
    'lineChartOrder': '6',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'titleAllGram': 'Heroin',
    'titleForDropDown': 'Heroin',
    'significanceColumn': 'heroinSignificance',
    'percentageColumn': 'heroinPercentageChange',
    'color': '#0C6F96',
    'lineChartOrder': '7',
  },
  'stimulants': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulants',
    'titleAllGram': 'All Stimulant',
    'titleForDropDown': 'All Stimulants',
    'significanceColumn': 'stimulantSignificance',
    'percentageColumn': 'stimulantPercentageChange',
    'color': '#411B6D',
    'lineChartOrder': '2',
  },
  'cocaine': {
    'titleSingular': 'Cocaine',
    'titlePlural': 'Cocaine',
    'titleAll': 'Cocaine',
    'titleAllGram': 'Cocaine',
    'titleForDropDown': 'Cocaine',
    'significanceColumn': 'cocaineSignificance',
    'percentageColumn': 'cocainePercentageChange',
    'color': '#671AAA',
    'lineChartOrder': '3',
  },
  'methamphetamine': {
    'titleSingular': 'Methamphetamine',
    'titlePlural': 'Methamphetamine',
    'titleAll': 'Methamphetamine',
    'titleAllGram': 'Methamphetamine',
    'titleForDropDown': 'Methamphetamine',
    'significanceColumn': 'methamphetamineSignificance',
    'percentageColumn': 'methamphetaminePercentageChange',
    'color': '#A378E8',
    'lineChartOrder': '4',
  }
}

const drugScreenOptions = {
  'all': {
    'titleSingular': 'Drug',
    'titlePlural': 'All Drugs',
    'titleAll': 'All Drugs',
    'titleAllGram': 'All Drug',
    'significanceColumn': 'allSignificance',
    'percentageColumn': 'allPercentageChange',
    'color': '#325D7D',
  },
  'benzodiazepine': {
    'titleSingular': 'Benzodiazepine',
    'titlePlural': 'Benzodiazepine',
    'titleAll': 'Benzodiazepine',
    'titleAllGram': 'Benzodiazepine',
    'significanceColumn': 'benzoSignificance',
    'percentageColumn': 'benzoPercentageChange',
    'color': '#B83A5E',
  },
  'opioids': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioids',
    'titleAllGram': 'All Opioid',
    'significanceColumn': 'opioidSignificance',
    'percentageColumn': 'opioidPercentageChange',
    'color': '#000C77',
  },
  'fentanyl': {
    'titleSingular': 'Fentanyl',
    'titlePlural': 'Fentanyl',
    'titleAll': 'Fentanyl',
    'titleAllGram': 'Fentanyl',
    'significanceColumn': 'fentanylSignificance',
    'percentageColumn': 'fentanylPercentageChange',
    'color': '#294891',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'titleAllGram': 'Heroin',
    'significanceColumn': 'heroinSignificance',
    'percentageColumn': 'heroinPercentageChange',
    'color': '#0C6F96',
  },
  'stimulants': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulants',
    'titleAllGram': 'All Stimulant',
    'significanceColumn': 'stimulantSignificance',
    'percentageColumn': 'stimulantPercentageChange',
    'color': '#411B6D',
  },
  'cocaine': {
    'titleSingular': 'Cocaine',
    'titlePlural': 'Cocaine',
    'titleAll': 'Cocaine',
    'titleAllGram': 'Cocaine',
    'significanceColumn': 'cocaineSignificance',
    'percentageColumn': 'cocainePercentageChange',
    'color': '#671AAA',
  },
  'methamphetamine': {
    'titleSingular': 'Methamphetamine',
    'titlePlural': 'Methamphetamine',
    'titleAll': 'Methamphetamine',
    'titleAllGram': 'Methamphetamine',
    'significanceColumn': 'methamphetamineSignificance',
    'percentageColumn': 'methamphetaminePercentageChange',
    'color': '#A378E8',
  }
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default function App({ dataUrl }) {
  const [selected, setSelected] = useState(null)
  const [currentDrug, setCurrentDrug] = useState(Object.keys(drugScreenOptions)[0]);
  const [timeline, setTimeline] = useState('Monthly');
  const [currentState, setCurrentState] = useState('US')
  const [selectedYr, setSelectedYr] = useState('')
  const [selectedYrSexAge, setSelectedYrSexAge] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedMonthSexAge, setSelectedMonthSexAge] = useState('1')
  const [keyedRawData, setKeyedRawdata] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [keyedRawUSData, setKeyedRawUSdata] = useState([]); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const [monthsForDropDown, setMonthsForDropDown] = useState([]);  
  const [yearsForDropDown, setYearsForDropDown] = useState([]); 
  const [jurisForDropDown, setJurisForDropDown] = useState([]);
  const [startUSMonthYearForSlider, setStartUSMonthYearForSlider] = useState('');
  const [startMonthYearForSlider, setStartMonthYearForSlider] = useState('');
  const [endUSMonthYearForSlider, setEndUSMonthYearForSlider] = useState('');
  const [endMonthYearForSlider, setEndMonthYearForSlider] = useState('');
/*   const [startUSMonthYearFromSlider, setStartUSMonthYearFromSlider] = useState('');
  const [startMonthYearFromSlider, setStartMonthYearFromSlider] = useState('');
  const [endUSMonthYearFromSlider, setEndUSMonthYearFromSlider] = useState('');
  const [endMonthYearFromSlider, setEndMonthYearFromSlider] = useState(''); */
  const [showAnnual, setMonthlyToggle] = useState(false);
  const [showPercent, setPercentToggle] = useState(false);  
  const [showOverall, setOverallToggle] = useState(false);

  const [selectedDrugs, setselectedDrugs] = useState(['all']);
  const [selectedDrugsSexAge, setselectedDrugsSexAge] = useState(['all']);
  const [selectAllFlag, setSelectAllFlag] = useState(false);
  const [deselectAllFlag, setDeselectAllFlag] = useState(false);
  const [showConsiderations, setShowConsiderations] = useState(false);
  const [showFootNotes, setShowFootNotes] = useState(false);
  const [keyIndex, setKeyIndex] = useState({});

  const [lookupPeriodStartYear, setLookupPeriodStartYear] = useState('');
  const [lookupPeriodStartMonth, setLookupPeriodStartMonth] = useState('');
  const [lookupPeriodEndYear, setLookupPeriodEndYear] = useState('');
  const [lookupPeriodEndMonth, setLookupPeriodEndMonth] = useState('');

  const [isPeriod, setPeriodToggle] = useState(true);

  const [width, setWidth] = useState(0);

  const isSmallViewport = width < 500;

  const drugsBarChartRef = useRef();
  const lineChartRef = useRef();

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

  const fetchData = async () => {
    try {
      const response = await fetch(dataUrl)
        .then(v => v.text())
        .then(v => Papa.parse(v))
        .then(
          v => {
            return { success: true, data: v };
          }
        )
        .catch(err => {
          console.log(err)
        });
        
      return response;
      
    } catch (error) {
      console.log(error);
      return { success: false, data: [] };
    }
  }

  const setStateSelected = (geo) => {
    if (selected === geo) {
      setSelected(null);
    } else {
      setSelected(geo);
    }
  };

   const setYearSelected = (yr) => {
      setSelectedYr(yr);

      if (endUSMonthYearForSlider.includes(yr)) {
        let mon = Number(endUSMonthYearForSlider.substring(4));
        setMonthsForDropDown(getMonths(mon))
        setSelectedMonth(String(mon));
      }
      else {
        setMonthsForDropDown(getMonths());
        setSelectedMonth('12');
      }
  };

  const setMonthSelected = (mon) => {

    if (monthNames[selectedMonth] === mon) {
      setSelectedMonth(null);
    } else {
      let monNum = getKeyByValue(monthNames, mon)
      setSelectedMonth(monNum);
    }
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

const didOnAfterChangeTrigger = (value) => {

    var sliderStartYr = currentState == 'US' ? startUSMonthYearForSlider.substring(0,4) : startMonthYearForSlider.substring(0,4);
    var sliderStartMon = currentState == 'US' ? String(Number(startUSMonthYearForSlider.substring(4))) : String(Number(startMonthYearForSlider.substring(4)));
    var sliderEndYr = currentState == 'US' ? endUSMonthYearForSlider.substring(0,4) : endMonthYearForSlider.substring(0,4);
    var sliderEndMon = currentState == 'US' ? String(Number(endUSMonthYearForSlider.substring(4))) : String(Number(endMonthYearForSlider.substring(4)));

    var monthsArray = UtilityFunctions.generateYYMMArray(Number(sliderStartYr), Number(sliderStartMon), Number(sliderEndYr), Number(sliderEndMon))

    let stmonYr =  monthsArray[value[0] - 1];
    let endmonYr =  monthsArray[value[1] - 1];

    setLookupPeriodStartYear(stmonYr.substring(0,4));
    setLookupPeriodStartMonth(String(Number(stmonYr.substring(4))));
    setLookupPeriodEndYear(endmonYr.substring(0,4));
    setLookupPeriodEndMonth(String(Number(endmonYr.substring(4))));
  };

function getMonthYear( startYear, value) {
    if (value > 12) {
      let mod = value % 12;
      return  monthNames[mod] + ' ' + String((Number(startYear) + Math.round(value/12)))
    }
    else {
      return monthNames[value] + ' ' + startYear;
    }
  }
  
function getNumberofMonthsBetween(startYearMonth, endYearMonth) {
    let startMon = Number(startYearMonth.substring(4));
    let startYr = Number(startYearMonth.substring(0,4));
    let endMon = Number(endYearMonth.substring(4));
    let endYr = Number(endYearMonth.substring(0,4));
    let monsInStartYr = 13 - startMon;
    let monsInEndYr = endMon;
    let numOfYearBetween = endYr - startYr - 1;
    let totalMonths = monsInStartYr + numOfYearBetween + monsInEndYr;

    return totalMonths;
  }

  function getMarksForRange(startYearMonth, endYearMonth) {

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

   const getJuris = (stateData) => {

      var juris = {};
      var tmpJuris = [];

      for (let i=0;i<stateData.length;i++) {
        if (!tmpJuris.includes(stateData[i].geoid) && stateData[i].geoid.length > 0)
          tmpJuris.push(stateData[i].geoid)
      }

      tmpJuris.sort();

      for (let i=0;i<tmpJuris.length;i++) {
        juris[tmpJuris[i]] = stateNames[tmpJuris[i]];
      }

      return juris;
  }

  let first = true;
  let keyCounts = {};

/*   useEffect(() => {
    (async () => {
      setDataLoaded(false);
      let tempMonthTimeframes = [];
      let addedMonthTimeframes = [];

      let res = await fetchData();
      if (res && res.success) {
        let tempKeyedRawData = {};
        let tempKeyedRawUSData = {};

        res.data.data.map((row) => {
          if (first) {
            row.forEach(key => {
              let index = row.indexOf(key);
              if (index !== -1) {
                keyIndex[key] = index;
                keyCounts[key] = {};
              } else {
                throw ('Cannot find key ' + key);
              }
            });
      
            first = false;
          } else {
            let obj = {};
            Object.keys(keyIndex).map((key) => {
              obj[key] = row[keyIndex[key]];
            })
            
            if ('US' === row[keyIndex['state']]) {
              tempKeyedRawUSData[row[keyIndex['key']]] = obj;
            } else {
              tempKeyedRawData[row[keyIndex['key']]] = obj;
            }

            const startMonth = row[keyIndex['startMonth']];
            const startYear = row[keyIndex['startYear']];
            const endMonth = row[keyIndex['endMonth']];
            const endYear = row[keyIndex['endYear']];

            const yearMonthIndex1 = startYear + '|' + startMonth;
            if(startYear && startMonth){
              if (!addedMonthTimeframes.includes(yearMonthIndex1)) {
                tempMonthTimeframes.push(
                  {
                    'key': yearMonthIndex1,
                    'label': months[startMonth - 1] + ' ' + startYear,
                    'year': Number.parseInt(startYear),
                    'month': Number.parseInt(startMonth)
                  }
                );
              }
              addedMonthTimeframes.push(yearMonthIndex1);
            }

            const yearMonthIndex2 = endYear + '|' + endMonth;
            if(endYear && endMonth){
              if (!addedMonthTimeframes.includes(yearMonthIndex2)) {
                tempMonthTimeframes.push(
                  {
                    'key': yearMonthIndex2,
                    'label': months[endMonth - 1] + ' ' + endYear,
                    'year': Number.parseInt(endYear),
                    'month': Number.parseInt(endMonth)
                  }
                );
                addedMonthTimeframes.push(yearMonthIndex2);
              }
            }
          }
        });

        setKeyedRawdata(tempKeyedRawData);
        setKeyedRawUSdata(tempKeyedRawUSData);

        tempMonthTimeframes.sort((a, b) => {
          if (a['year'] < b['year']) {
            return -1;
          } else if (a['year'] === b['year'] && a['month'] < b['month']) {
            return -1;
          } else {
            return 1;
          }
        });

        setYearTimeframes(tempMonthTimeframes.slice(12));
        setMonthTimeframes(tempMonthTimeframes.slice(1)); //Remove the first month/year combo since it doesn't have a previous month
        setAllTimeframes(tempMonthTimeframes); //Remove the first month/year combo since it doesn't have a previous month
        
        setSliderPointMonth(tempMonthTimeframes.slice(1).length - 1); //Default range points are the first two month
        setSliderPointYear(tempMonthTimeframes.slice(12).length - 1); //Default range points are the first two month

        const shifted = [...res.data.data];
        shifted.shift(); //Get rid of header row
        setRawData(shifted);

        setDataLoaded(true);
      }
    })();
  }, []);

  const csvData = rawData; */

  useEffect(() => {
    (async () => {
      setDataLoaded(false);

      let res = await fetchData();

      if (res && res.success) {
        let tempKeyedRawData = [];
        let tempKeyedRawUSData = [];

        res.data.data.map((row) => {
          if (first) {
            row.forEach(key => {
              let index = row.indexOf(key);
              if (index !== -1) {
                keyIndex[key] = index;
                keyCounts[key] = {};
              } else {
                throw ('Cannot find key ' + key);
              }
            });
      
            first = false;
          } else {
            let obj = {};
            Object.keys(keyIndex).map((key) => {
              obj[key] = row[keyIndex[key]];
            })
            
            if ('US' === row[keyIndex['geoid']]) {
              tempKeyedRawUSData.push(obj);
            } else {
              tempKeyedRawData.push(obj);
            }
          }
        });

        setKeyedRawdata(tempKeyedRawData);
        setKeyedRawUSdata(tempKeyedRawUSData);

        tempKeyedRawUSData.sort((a, b) => {
          if (a['YYYYMM'] < b['YYYYMM']) {
            return -1;
          } else if (a['YYYYMM'] === b['YYYYMM'] && a['YYYYMM'] < b['YYYYMM']) {
            return -1;
          } else {
            return 1;
          }
        });

        if (tempKeyedRawUSData && tempKeyedRawUSData.length > 0) {
          let cntUS = tempKeyedRawUSData.length;
          setYearSelected(Number(tempKeyedRawUSData[cntUS-1]['YYYYMM'].substring(0,4)))
          setYearsForDropDown(getYears(tempKeyedRawUSData[0]['YYYYMM'], tempKeyedRawUSData[cntUS-1]['YYYYMM']));
          setMonthsForDropDown(getMonths(Number(tempKeyedRawUSData[cntUS-1]['YYYYMM'].substring(4))));
          setMonthSelected(monthNames[Number(tempKeyedRawUSData[cntUS-1]['YYYYMM'].substring(4))]);
          setJurisForDropDown(getJuris(tempKeyedRawData));
          setLookupPeriodStartYear(String(tempKeyedRawUSData[0]['YYYYMM'].substring(0,4)));
          setLookupPeriodStartMonth(String(Number(tempKeyedRawUSData[0]['YYYYMM'].substring(4))));
          setLookupPeriodEndYear(String(tempKeyedRawUSData[cntUS-1]['YYYYMM'].substring(0,4)));
          setLookupPeriodEndMonth(String(Number(tempKeyedRawUSData[cntUS-1]['YYYYMM'].substring(4))));
          setStartUSMonthYearForSlider(tempKeyedRawUSData[0]['YYYYMM']); 
          setEndUSMonthYearForSlider(tempKeyedRawUSData[cntUS-1]['YYYYMM']); 
          //setStartUSMonthYearFromSlider(tempKeyedRawUSData[0]['YYYYMM']); 
          //setEndUSMonthYearFromSlider(tempKeyedRawUSData[cntUS-1]['YYYYMM']); 
          setStartMonthYearForSlider(tempKeyedRawUSData[0]['YYYYMM']); 
          setEndMonthYearForSlider(tempKeyedRawUSData[cntUS-1]['YYYYMM']); 
          //setStartMonthYearFromSlider(tempKeyedRawUSData[0]['YYYYMM']); 
          //setEndMonthYearFromSlider(tempKeyedRawUSData[cntUS-1]['YYYYMM']); 
        }

        const shifted = [...res.data.data];
        shifted.shift(); //Get rid of header row
        setRawData(shifted);

        setDataLoaded(true);

      }
    })();
  }, []);

  const csvData = rawData;

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
                      <div style={{float: 'right'}}>
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
                          </div>
                    </td>
                    <td style={{width: '12%', textAlign: 'right'}}>
                      {currentState != 'US' &&
                        <div style={{float: 'right'}}>
                            <label class="toggleC" title={'Toggle to compare with overall.'}>
                                <input id="toggleOverall" class="toggleC-input" type="checkbox" checked={showOverall}
                                onChange={(e) => {
                                  if(e.target.checked) {
                                    setOverallToggle(true)
                                  }
                                  else {
                                    setOverallToggle(false)
                                  }
                                }}/>
                                <span class="toggleC-label" data-off="Overall Off" 
                                      data-on="Overall On">
                                </span>
                                <span class="toggleC-handle"></span>
                            </label>
                        </div>
                        }
                    </td>
                  </tr>
                </table>
        </Fragment>
        )
      }

  const drugsBarChartMemo = useMemo(() =>
    <>
   <div id="bar-chart-container" className="chart-container" ref={drugsBarChartRef}>
      <BarChart
        data={currentState === 'US' ? keyedRawUSData : keyedRawData}
        width={width} 
        height={900} //TODO
        el={drugsBarChartRef}
        currentState={currentState}
        currentDrug={currentDrug}
        selectedDrugs={selectedDrugs}
        currentYear={selectedYr}
        currentMonth={selectedMonth}
        timeline={timeline}
        drugOptions={drugOptions}
        />
    </div>
  </>,
  [currentState === 'US' ? keyedRawUSData : keyedRawData, width, currentState, selectedDrugs, selectedYr, selectedMonth, timeline]);

  const lineChartMemo = useMemo(() =>
      <>
        {getToggleControls()}
        <table style={{width: '100%'}}>
          <tr>
            <td>
              <div class="containerLC">
                <div class={currentState === 'US' ? "chartDivAll" : "chartDivAll"} ref={lineChartRef}>
                  <LineChart 
                  data={{keyedRawUSData, keyedRawData}}
                  monthNames={monthNames}
                  stateNames={stateNames}
                  drugOptions={drugOptions}
                  currentTimeframe={timeline}
                  currentDrug={currentDrug}
                  currentState={currentState}
                  currentYear={selectedYr}
                  currentMonth={selectedMonth}
                  width={width}
                  el={lineChartRef}
                  lookupPeriodStartYear={lookupPeriodStartYear}
                  lookupPeriodStartMonth={lookupPeriodStartMonth}
                  lookupPeriodEndYear={lookupPeriodEndYear}
                  lookupPeriodEndMonth={lookupPeriodEndMonth}
                  showPercent={showPercent}
                  showOverall={showOverall}
                  isPeriod={isPeriod}
                  selectedDrugs={selectedDrugs} 
                  supportedYears={supportedYears}
                  currentDataSource={'ED'}
                  jurisdictionsCnt={Object.keys(jurisForDropDown).length}
                  />
                </div>
              </div>
            </td>
          </tr>
        
        </table>
      </>,
      [timeline, currentDrug, currentState, selectedYr, selectedMonth, width, showPercent,showOverall, isPeriod, selectedDrugs, lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth]);

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  if (endUSMonthYearForSlider == null || endUSMonthYearForSlider?.length == 0) {
    return <h3>Loading</h3>;
  }

  const getPriorMonth = () => {

    if (endUSMonthYearForSlider) {
        let mon = Number(endUSMonthYearForSlider.substring(4));
        if (mon != 1)
          return monthNames[mon] + ', ' + endUSMonthYearForSlider.substring(0,4);
        else
          return monthNames[12] + ', ' + endUSMonthYearForSlider.substring(0,4);
      }
      else
        return '';
  }

  const MapFootnotes = () => {
    return (
        <>
          <p>* Data were collected for the time period beginning January 2018, but exclude several months during the onset of the COVID-19 pandemic (i.e., March 2020-August 2020). In some cases, the funded state did not provide CDC enough months of data to calculate percent change. Rates are suppressed when based on &lt;20 overdoses, thus no percent change is available; for more information, please see: Healthy People 2010 Criteria for Data Suppression.</p>
          <p><span className="merriweather">†</span> To account for changes occurring across time, monthly and annual trends for the rate of ED visits involving suspected drug overdoses (e.g., ED visits involving drug overdoses divided by total ED visits and multiplied by 10,000) were analyzed overall and by U.S. state. Annual change, controlling for seasonal effects, was estimated as the change from a month in a given year to the same month in the following year (e.g., January 2018 to January 2019). Significance testing was conducted using chi-square tests.</p>
        </>
    );
  }

  function getMonthlyValueForAllDrugs() {
    for(let i=0;i<keyedRawUSData.length;i++)
        {
          if (keyedRawUSData[i].YYYYMM == endUSMonthYearForSlider)
          {
            if (keyedRawUSData[i].Sex === 'Total' && keyedRawUSData[i].Age_Group === 'Total' && keyedRawUSData[i].geoid == 'US')
            {
              return String(keyedRawUSData[i].total_drug_OD_n/10000);
            }
          }
      }
  }

  const getSelectedDrugs = () => {

    let selDrugs = [];

    for (let i=0;i<selectedDrugs.length;i++)
      selDrugs[i] = drugOptions[selectedDrugs[i]].titleAll;

    return selDrugs.join()?.replaceAll(',',', ');
  }; 
  
  const getStateName = (geo) => {
   return geo == 'US' ? 'US' : stateNames[geo];
}

  const drugTab = (drugName, drugLabel) => (
    <button
      className={`drug-tab${selectedDrugs.includes(drugName) ? (' ' + drugName) : ''}`}
      onClick={() => {
        if (currentState === 'US') {
          if (selectedDrugs.includes(drugName)) {
            if (selectedDrugs.length > 1) {
              setselectedDrugs(selectedDrugs.filter(dr=>dr !== drugName))
              setDeselectAllFlag(false);
              setSelectAllFlag(false);
            }
          }
          else
          {
            setCurrentDrug(drugName);
            setselectedDrugs([...selectedDrugs, drugName])
            setDeselectAllFlag(false);
            setSelectAllFlag(false);
          }
        }
        else
        {
          setselectedDrugs([drugName]);
          setCurrentDrug(drugName);
        }
      }}
    >{drugLabel || drugName}</button>
  )

  function getPercentFromPriorMonth() {

    var startYr = startUSMonthYearForSlider.substring(0,4);
    var startMon =String(Number(startUSMonthYearForSlider.substring(4)));
    var endYr = endUSMonthYearForSlider.substring(0,4);
    var endMon = String(Number(endUSMonthYearForSlider.substring(4)));

    var monthsArray = UtilityFunctions.generateYYMMArray(Number(startYr), Number(startMon), Number(endYr), Number(endMon))
    var idx = monthsArray.indexOf(endUSMonthYearForSlider);
    var priorMonth = monthsArray[idx - 1]
    var curMon = 0; 
    var priorMon = 0;
    for(let i=0;i<keyedRawUSData.length;i++)
    {
      if (keyedRawUSData[i].YYYYMM == endUSMonthYearForSlider)
      {
        if (keyedRawUSData[i].Sex === 'Total' && keyedRawUSData[i].Age_Group === 'Total' && keyedRawUSData[i].geoid == 'US')
        {
          curMon= keyedRawUSData[i].total_drug_OD_n/10000;
        }
      }
      if (keyedRawUSData[i].YYYYMM == priorMonth)
      {
        if (keyedRawUSData[i].Sex === 'Total' && keyedRawUSData[i].Age_Group === 'Total' && keyedRawUSData[i].geoid == 'US')
        {
          priorMon= keyedRawUSData[i].total_drug_OD_n/10000;
        }
      }
    }

    return  ((curMon - priorMon) / priorMon) * 100; 
  }

  const drugColor = drugOptions[currentDrug].color;
  const usRate = getMonthlyValueForAllDrugs(); 
  const usPercent = getPercentFromPriorMonth(); 

  return (
    <Context.Provider value={{ drugScreenOptions, currentDrug, selected, setStateSelected, Hexagon, supportedStates }}>
      <div className="filters-container" ref={outerContainerRef}>

      <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
          <h2 className="data-bite-header1 sub">
            {getPriorMonth()} Suspected Nonfatal Overdose Visits for All Drugs, Overall {'(' + Object.keys(jurisForDropDown).length + ' Jurisdictions)'}<sup>[4]</sup>
          </h2>
        </div>
      </div>

      &nbsp;

        <div className="callouts">
          <div style={{'borderLeft': '5px solid' + '#000066'}}>
            <span className="callout" style={{ 'color': '#000066' }}>{isNaN(usRate) ? 'N/A' : `${Number(usRate).toFixed(2)}`}</span>
            <div>
              <span className='data-bite-title' style={{ color: '#000066' }}>
                {timeline} Suspected Nonfatal Overdose Visits for All Drugs</span>
                <p>Per 10,000 total ED visits</p>
            </div>
          </div>
          <div style={{'borderLeft': '5px solid' + '#000066'}}>
            <span className="callout" style={{ 'color': '#000066' }}>{isNaN(usPercent) ? 'N/A' : `${Number(usPercent < 0 ? (usPercent * -1) : usPercent).toFixed(2)}`}</span> 
            <div>
              <span className='data-bite-title' style={{ color: '#000066' }}>
                {usPercent < 0 ? 'Decrease' : 'Increase' } in Suspected Nonfatal Overdose Visits for All Drugs</span>
                <p>Per 10,000 total ED visits from the prior month</p>
            </div>
          </div>
          <div style={{'borderLeft': '5px solid' + '#000066'}}>
            <span className="callout" style={{'color': '#000066'}}>{Object.keys(jurisForDropDown).length}</span>
            <div>
              <span className='data-bite-title' style={{ color: '#000066' }}>Jurisdictions Participating</span>
              <p>Funded states with reported Data</p>
            </div>
          </div>
        </div>

        <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
          <h2 className="data-bite-header1 sub">
            What were the trends in Suspected Nonfatal Overdose Visits in {timeline == 'Monthly' ? monthNames[selectedMonth] + ', ' + selectedYr : selectedYr}{selectedDrugs.length == 1 ? (' for ' + drugOptions[selectedDrugs[0]].titleAll + ',') : ', '} {currentState == 'US' ? 'Overall (' + Object.keys(jurisForDropDown).length + ' Jurisdictions)' : getStateName(currentState)}<sup>[4]</sup>
          </h2>
        </div>

        &nbsp;
        <div>
          <table style={{'width': '100%'}}>
            <tr>
              <td style={{'width': '27%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">View Data For:</div></td>
              <td style={{'width': '18%'}}>
                <select id="jurisdiction-select2" value={currentState || ''} onChange={(e) => { setCurrentState(e.target.value); setselectedDrugs(['all']); setCurrentDrug('all')}}>
                <option value="US">Overall &#40;{Object.keys(jurisForDropDown).length} Jurisdictions&#41;</option>
                {Object.keys(jurisForDropDown).map((key) => <option key={key} value={key}>{jurisForDropDown[key]}</option>)}
              </select>
              </td>
              <td style={{'width': '12%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">Select Time:</div></td>
              <td style={{'width': '45%'}}>
                <div style={{float: 'left'}}>
                        <label class="toggleA" title={'Toggle to select between Monthly and Annual view. The default is Monthly.'}>
                            <input id="toggleMonthly" class="toggleA-input" type="checkbox" checked={showAnnual}
                            onChange={(e) => {
                              if(e.target.checked) {
                                setMonthlyToggle(true)
                                setTimeline('Annual');
                                setPeriodToggle(false)
                              }
                              else {
                                setMonthlyToggle(false)
                                setTimeline('Monthly');
                                setPeriodToggle(true)
                              }
                            }}/>
                            <span class="toggleA-label" data-off="Monthly" 
                                  data-on="Annual">
                            </span>
                            <span class="toggleA-handle"></span>
                        </label>
                    </div>
              </td>
            </tr>
            <br></br>
            <tr>
              <td colspan='4' style={{'textAlign': 'left'}}>
                <div className="select-input" style={{'textAlign': 'left', 'fontWeight': 'bold'}}>Select a drug syndrome:</div>
                <div style={{'textAlign': 'left', 'fontSize': '14px'}}>Select {currentState === 'US' ? 'one or more' : 'a'} drug syndrome and time period to see updated trends in the graphs and tables below:</div>
            </td>
            </tr>
            <br></br>
            <tr>
              <td colspan='4'>
                <div>
                  <div className="drug-tab-section">
                    {drugTab('all', <span>All Drugs</span>)}
                    {drugTab('benzodiazepine', <span>Benzodiazepine</span>)}
                    {drugTab('heroin', <span>Heroin</span>)}
                    {drugTab('stimulants', <span>All Stimulants</span>)}
                  </div>
                  <div className="drug-tab-section">
                    {drugTab('opioids', <span>All Opioids</span>)}
                    {drugTab('fentanyl', <span>Fentanyl</span>)}
                    {drugTab('cocaine',<span>Cocaine</span>)}
                    {drugTab('methamphetamine', <span>Methamphetamine</span>)}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan='4'>
                <div style={{'float': 'right', 'margin-right' : '20px'}}>
                  <button id="reset-button" style={{ 'backgroundColor': '#000066' }} onClick={() => {
                    setYearsForDropDown(getYears(startUSMonthYearForSlider, endUSMonthYearForSlider));
                    setCurrentDrug('all');
                    setselectedDrugs(['all'])
                    setMonthlyToggle(true);
                    setCurrentState('US');
                    setYearSelected(getYears(startUSMonthYearForSlider, endUSMonthYearForSlider)[0])

                              }}>Reset</button>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <section>
        <div className="map-container">
            <div className="map-inner-container">
              <div className="now-viewing">
                <h2 className="h3" style={{ color: '#000066' }}>{timeline} {selectedDrugs.length == 1 ? drugOptions[selectedDrugs[0]].titleAll : '' } Suspected Nonfatal Overdose Visits in {timeline == 'Monthly' ? monthNames[selectedMonth] + ', ' + selectedYr : selectedYr}<sup>†</sup></h2>
                {currentState == 'US' && <div><em>Drug Syndrome: {currentState === 'US' ? getSelectedDrugs() : drugOptions[selectedDrugs[0]].titleAll}</em></div>}
              </div>
            </div>
        </div>  
        <br></br>
          <table style={{'width': '100%'}}>
            <tr>
              <td style={{'width': '14%'}}></td>
              <td style={{'width': '25%', 'textAlign': 'right', 'fontWeight': 'bold'}}>
                <div className="select-input">Select Time Period:</div>
              </td>
              
              <td style={{'width': '10%'}}>
                <select id="month-select" value={monthNames[selectedMonth] || ''} onChange={(e) => { setMonthSelected(e.target.value) }} disabled={showAnnual}>
                  {monthsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </td>
              <td style={{'width': '51%'}}>
              <select id="year-select2" value={selectedYr || ''} onChange={(e) => { setYearSelected(e.target.value) }}>
                {yearsForDropDown?.map((key) => <option key={key} value={key}>{key}</option>)}
              </select>
              </td>
            </tr>
             
          </table>
          <br></br>
          {drugsBarChartMemo}
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '15%'}}></td>
              <td style={{width: '80%'}}>
                <div><span><small><i><sup>†</sup>Scale of the chart may change based on the data presented.</i></small></span></div>
              </td>
              <td style={{width: '5%'}}></td>
            </tr>
          </table>
          <br></br>
          <a download="DOSE_dashboard_output-download.xlsx" href={'https://www.cdc.gov/overdose-prevention/data-dashboards/dose-surveillance-dashboard/data/DOSE_dashboard_output-download.xlsx'} aria-label="Download this data in an Excel file format." className="btn btn-download no-border">Download the dataset</a><span> with all available suspected nonfatal drug overdose visit estimates per 10,000 ED visits.</span>
        </section>

        <section>
      <div className="map-container">
      <div className="map-inner-container">
      <div className="now-viewing">
        <h2 className="h3" style={{ color: '#000066' }}>{timeline} {selectedDrugs.length == 1 ? drugOptions[selectedDrugs[0]].titleAll : ''} Suspected Nonfatal Drug Overdose Visits per 10,000 total ED Visits over time<sup>†</sup></h2>
      </div>
      </div>
      </div>
      &nbsp;
      {timeline == 'Monthly' &&
          <table>
 
            <tr>
              <td style={{'width': '15%', 'textAlign': 'right', 'verticalAlign': 'top', 'fontWeight': 'bold'}}><div className="select-input">Select Time Period:</div></td>
              <td>
                <div style={wrapperStyle}>
                  <Range 
                  min={1} 
                  max={getNumberofMonthsBetween(startUSMonthYearForSlider, endUSMonthYearForSlider)}
                  defaultValue={[1,getNumberofMonthsBetween(startUSMonthYearForSlider, endUSMonthYearForSlider)]} 
                  step={1} marks={getMarksForRange(startUSMonthYearForSlider, endUSMonthYearForSlider)} 
                  tipFormatter={value => `${getMonthYear(Number(startUSMonthYearForSlider.substring(0,4)), value)}`} 
                  onAfterChange={didOnAfterChangeTrigger}
                  />
                </div>
              </td>
            </tr>
          </table>
          }
          {lineChartMemo}
          <table style={{width: '100%'}}>
            <tr>
              <td style={{width: '5%'}}></td>
              <td style={{width: '80%'}}>
                <div><span><small><i><sup>†</sup>Scale of the chart may change based on the data presented. *Monthly comparisons should be interpreted with caution due to seasonality, with common increases in nonfatal drug overdoses in summer and decreases in winter [2].</i></small></span></div>
              </td>
              <td style={{width: '15%'}}></td>
            </tr>
          </table>

    </section>

    <section>
        <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
          <h2 className="data-bite-header1 sub">Monthly Suspected Nonfatal Overdose ED visits across Jurisdictions per 10,000 Total ED Visits<sup>†</sup></h2>
        </div>
        <div style={{ textAlign: 'center' }}>Place holder (To be Done)</div>
      </section>

      <section>
      <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
      <h2 className="data-bite-header1 sub">How do Suspected Nonfatal Overdose ED visits vary by Age and Sex?</h2>
      </div>
      <div style={{ textAlign: 'center' }}>Place holder (To be Done)</div>
    </section>

      <div className='data-tables'>
        <div className="datatable-container" id="impdataconsiderations">
          <button className="h2" style={{ backgroundColor: '#000066' }} onClick={toggleConsiderations}>
          Important Data Considerations
            {showConsiderations && <span>{String.fromCharCode(8722)}</span>}
            {!showConsiderations && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showConsiderations &&
            <div className="datatable-body">
             <p><strong>Important caveats to consider when interpreting the data include:</strong></p>
              <ol>
                <li><strong>Some data may be missing.</strong> Data sent from emergency departments (EDs) to health departments may be delayed or paused for a period of time.  Missing data are noted in footnotes, where applicable.</li>
                <li>Nonfatal Drug Overdose Surveillance and Epidemiology – Syndromic Data (DOSE-SYS) Dashboard values <strong>may differ from data accessible through the National Syndromic Surveillance Program (NSSP) BioSense Platform.</strong> Many jurisdictions extract data from NSSP’s Electronic Surveillance System for the Early Notification of Community-based Epidemics (ESSENCE) database as part of their data submission process. However, DOSE-SYS data may differ from NSSP ESSENCE data due to differences in jurisdiction data preparation as well as the dynamic nature of NSSP’s progressively updating data.</li>
                <li><strong>Reporting facilities and the data they report can change.</strong> Several jurisdictions continue efforts to onboard new facilities that can begin to share data in syndromic surveillance systems, and some facilities experience periodic interruptions in, or might stop, syndromic surveillance data feeds. Some of these issues became more pronounced during the earlier phase of the COVID-19 pandemic. [6] Syndromic data also can be updated with new information over time, for example, with additional diagnosis codes. Therefore, estimates reported might change over time as more facilities begin sharing data or sharing higher quality data or stop sharing data for a period of time. Some EDs might also have increases in the proportion of ED visits in syndromic data that contain diagnosis codes, which facilitates the identification of drug overdose-related visits.</li>
                <li><strong>Syndromic data are frequently updated over time.</strong> The chief complaint, or the reason for the ED visit, is available in NSSP often within 24 hours for ~80% of ED visits. However, the chief complaint field may be incomplete. ED visit data may be progressively updated over the course of several weeks, and relevant drug overdose discharge diagnosis codes or revised chief complaint text may be received during this time. DOSE-SYS data are reported with a two-month time lag and not typically updated each month.</li>
                <li><strong>These are suspected drug overdose-related ED visits.</strong> Because data used to identify suspected nonfatal drug overdose visits are based on ED visit chief complaints and diagnosis codes from initial clinical impressions or observations, syndromic data may not represent the final, most updated information about the ED visit. Additionally, toxicological testing is not uniformly captured in these data [7] and therefore may underreport specific drug types involved.</li>
                <li><strong>Data likely represent an undercount,</strong> given potential inaccuracies in preliminary coding and potentially incomplete clinical descriptions captured in chief complaint information.</li>
                <li><strong>New ICD-10-CM codes were added for fentanyl and methamphetamine poisonings during the data collection period:</strong> Syndromic surveillance definitions use information from both the chief complaint and diagnosis codes to identify drug overdose cases. ICD-10-CM diagnosis codes were introduced to address gaps in the classification of fentanyl poisonings (T40.41, effective October 1, 2020) and methamphetamine poisonings (T43.65, effective October 1, 2022). Prior to the availability of these codes, suspected fentanyl or methamphetamine poisonings may have been classified under a broader drug overdose or poisoning code, decreasing the likelihood that the visit would be captured by the drug-specific syndrome definition. Additionally, incorporation of new ICD-10-CM codes into routine use at healthcare facilities may vary between facilities or jurisdictions. Due to these limitations, comparisons of data collected before and after the introduction of the respective codes should be interpreted with caution.</li>
                <li><strong>Drug overdose visit numbers are not mutually exclusive</strong> but rather reflect nesting of drug categories (depicted in the figure below) and some drug overdose visits involved multiple substances (e.g., a given drug overdose ED visit could have involved both opioids and stimulants).</li>
              </ol>
            </div>}
        </div>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: '#000066' }} onClick={toggleFootNotes}>
            Footnotes 
            {showFootNotes && <span>{String.fromCharCode(8722)}</span>}
            {!showFootNotes && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showFootNotes &&
            <div className="datatable-body">
            <ul id='noBullets'>
              <li><strong><sup>1</sup></strong>All data previously available on this dashboard (i.e., for the years 2018–2023) have been updated to reflect revisions in syndrome definitions. Datasets downloaded before March 2024 used older syndrome definitions, and data collected prior to August 2023 have been updated with the new syndrome definitions. For more information on the definitions used to identify drug overdose visits in syndromic surveillance data, including how these definitions have changed, visit <a target="_blank" href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-detail.html">About DOSE</a>.</li>
              <li><strong><sup>2</sup></strong>Vivolo-Kantor AM, Smith H, Scholl L, Differences and similarities between emergency department syndromic surveillance and hospital discharge data for nonfatal drug overdose. Annals of Epidemiology. 2021; 62; 43-50. <a target="_blank" href="https://doi.org/10.1016/j.annepidem.2021.05.008">https://doi.org/10.1016/j.annepidem.2021.05.008</a>.</li>
              <li><strong><sup>3</sup></strong>Data were collected for the time period beginning January 2018 and exclude several months during the onset of the COVID-19 pandemic (i.e., March 2020-August 2020). In some cases, the funded jurisdiction did not provide CDC enough months of data, which had to be suppressed when based on &lt;20 drug overdose visits; thus, no drug overdose visit estimates are available. For more information, please see: <a target="_blank" href="https://www.cdc.gov/nchs/data/statnt/statnt24.pdf">Healthy People 2010 Criteria for Data Suppression.</a></li>
              <li><strong><sup>4</sup></strong>This dashboard shows ED visits for suspected nonfatal drug overdoses of unintentional or undetermined intent. For full definitions, see: <a target="_blank" href="https://knowledgerepository.syndromicsurveillance.org/search/syndrome?keys=overdose%20od2a%202.0&sort_by=field_submitting_author_organiza&sort_order=DESC&f%5B0%5D=submitting_author_organization%3ACDC&page=1">Knowledge Repository</a></li>
              <li><strong><sup>5</sup></strong>Holland KM, Jones C, Vivolo-Kantor AM, et al. Trends in US Emergency Department Visits for Mental Health, Overdose, and Violence Outcomes Before and During the COVID-19 Pandemic. JAMA Psychiatry. 2021;78(4):372–379. <a target="_blank" href="https://pubmed.ncbi.nlm.nih.gov/33533876/">doi:10.1001/jamapsychiatry.2020.4402</a>.</li>
              <li><strong><sup>6</sup></strong>Morrow JB, Ropero-Miller JD, Catlin ML, et al. The Opioid Epidemic: Moving Toward an Integrated, Holistic Analytical Response. Journal of Analytical Toxicology. 2019; 43(1); 1–9. <a target="_blank" href="https://doi.org/10.1093/jat/bky049">https://doi.org/10.1093/jat/bky049</a>.</li>
              </ul>
          </div>}
        </div>
      </div>

      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>

    </Context.Provider>
  );
}
