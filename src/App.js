import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import debounce from 'lodash.debounce';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa from 'papaparse';
import BarChartVertical from './components/BarChartVertical';
import Datatable from './components/Datatable';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import BarChart from './components/BarChart';
import {colorScale} from './constants/Constants';

import Caret from './assets/caret-down.svg';
import Context from './context';
import 'rc-slider/assets/index.css';
import './styles.scss';

const SliderWithTooltip = createSliderWithTooltip(Slider);

const getDimension = (ref, dimension) => {
  if (!ref.current) {
    return 0;
  }

  return dimension === 'width' ? ref.current.clientWidth : ref.current.clientHeight
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const toFixed = (num, places = 1) => {
  if (num !== undefined) {
    if (num.toFixed) {
      return num.toFixed(places);
    }
    if (!isNaN(parseFloat(num))) {
      return parseFloat(num).toFixed(places)
    }
  }
  return num;
};

const getAdjustedPercent = (percent, count) => {
  if (count > 0 && percent == 0) {
    return '<0.1';
  }

  return percent;
}

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

const getStateName = (geo) => {
   return geo == 'US' ? 'US' : supportedStates[geo][0];
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
  'December',
];

const monthNames = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December', 'all': 'All Months' };
let stateNames = { 'US': 'Overall', 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming' };
const supportedYears = ['2018', '2019', '2020', '2021', '2022', '2023'];

export default function App({ dataUrl }) {
  const [runtime, setRuntime] = useState({})
  const [selected, setSelected] = useState('US')
  const [selectedSec, setSelectedSec] = useState('US')
  const [selectedYrSexAge, setSelectedYrSexAge] = useState('2024')
  const [selectedMonthSexAge, setSelectedMonthSexAge] = useState('1')
  const [keyedRawData, setKeyedRawdata] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [keyedRawUSData, setKeyedRawUSdata] = useState([]); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const [keyIndex, setKeyIndex] = useState({});
  const [yearTimeframes, setYearTimeframes] = useState([]);
  const [monthTimeframes, setMonthTimeframes] = useState([]);
  const [allTimeframes, setAllTimeframes] = useState([]);
  const [selectedDrugsSexAge, setselectedDrugsSexAge] = useState(['all']);
  
  const [selectAllFlag, setSelectAllFlag] = useState(false);
  const [deselectAllFlag, setDeselectAllFlag] = useState(false);
  const [showPercent, setPercentToggle] = useState(false);  
  const [showOverall, setOverallToggle] = useState(false);  
  const [lookupPeriodStartYear, setLookupPeriodStartYear] = useState('2018');
  const [lookupPeriodStartMonth, setLookupPeriodStartMonth] = useState('1');
  const [lookupPeriodEndYear, setLookupPeriodEndYear] = useState('2024');
  const [lookupPeriodEndMonth, setLookupPeriodEndMonth] = useState('12');
  const [isPeriod, setPeriodToggle] = useState(false);
  const [sliderPointMonth, setSliderPointMonth] = useState(0);
  const [sliderPointYear, setSliderPointYear] = useState(0);
  const [statesParticipating, setStatesParticipating] = useState([]);
  const [sexAgeMetric, setSexAgeMetric] = useState('Monthly');

  const [hdrInfoFromMap, setDataFromMap] = useState('all');
  const [showDatatable, setShowDatatable] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showLegendHelp, setShowLegendHelp] = useState(true);

  const [demographicsToggle, setDemographicsToggle] = useState('sex');

  const [selectedYr, setSelectedYr] = useState('2024')
  const [selectedMonth, setSelectedMonth] = useState('1')
  const [currentState, setCurrentState] = useState('US');
  const [selectedDrugs, setselectedDrugs] = useState(['all']);
  const [showMonthly, setMonthlyToggle] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [currentDrug, setCurrentDrug] = useState(Object.keys(drugOptions)[0]);
  const [timeline, setTimeline] = useState('Annual');
  const [showConsiderations, setShowConsiderations] = useState(false);
  const [showFootNotes, setShowFootNotes] = useState(false);
  const [width, setWidth] = useState(0);
  
  const {runtimeLegend, runtimeData, runtimeUSData, runtimePastMonths, runtimePastMonthsState, runtimePastMonthsGender, runtimePastMonthsAge, runtimeRanges } = runtime;

  const drugsBarChartRef = useRef();

  const isSmallViewport = width < 500;

  const debouncedSetWidth = useMemo(
    () => debounce(setWidth, 300)
    , []);

  const resizeObserver = new ResizeObserver(entries => {
    const { width: newWidth } = entries[0].contentRect;

    if (newWidth !== width) {
      debouncedSetWidth(newWidth);
    }
  });


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
    setCurrentState(geo);
}

const setYearSelected = (st) => {
    setSelectedYr(st);
}

const setMonthSelected = (mon) => {
    let monNum = getKeyByValue(monthNames, mon)
    setSelectedMonth(monNum);
}

  const handleData = (forHdr) => {
    setDataFromMap(forHdr);
  };

  const setStateSelectedSec = (geo) => {
    if (selectedSec === geo) {
      setSelectedSec(null);
    } else {
      setSelectedSec(geo);
    }
  };

  const setYearSelectedSexAge = (st) => {
    if (selectedYrSexAge === st) {
      setSelectedYrSexAge(null);
    } else {
      setSelectedYrSexAge(st);
    }
  };

  function sortObjectByKeyDescending(obj) {
    
    let sortedKeys = Object.keys(obj).sort((a, b) => b - a);
    let sortedObject = [];
  
    for (let key of sortedKeys) {
      sortedObject.push(String(obj[key]));
    }

    return sortedObject;
  }

  const getYears = () => {

    let years = [];

    for (let i=0;i<Object.keys(yearTimeframes).length;i++)
    {
      if ((yearTimeframes[i].year in years) === false)
        years[yearTimeframes[i].year] = yearTimeframes[i].year
    }

    const sortedObject = sortObjectByKeyDescending(years);

    return sortedObject;
  }; 

  const getSelectedDrugs = () => {

    let selDrugs = [];

    for (let i=0;i<selectedDrugs.length;i++)
      selDrugs[i] = drugOptions[selectedDrugs[i]].titleAll;

    return selDrugs.join()?.replaceAll(',',', ');
  }; 

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
  );

  let first = true;
  let keyCounts = {};

  useEffect(() => {
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

  const csvData = rawData;

  const fill = (significance) => {
    return mapColorPalette[legendOrder.indexOf(significance)];
  };

  const applyLegendToRow = (rowObj) => {
    let colorArr
    let hash = hashObj(rowObj)

    let idx = legendMemo.current.get(hash)

    if(runtimeLegend[idx]?.disabled) return false

    // unfunded states are coming up undefined so making sure we can set the color
    colorArr = idx >= 0 ? generateColorsArray(runtimeLegend[idx]?.color) : ['#ffffff', '#ffffff', '#ffffff']

    return colorArr
  }

  const formatPercentage = (percentage) => {
    if ('undefined' === percentage || '' === percentage) {
      return '';
    }
    if (Number.parseFloat(percentage) > 0) {
      percentage = '+' + percentage;
    }
    percentage += '%';
    return percentage;
  };

  const getSignificanceForGeo = (geoName) => {
    const stateData = runtimeData[geoName] ?? false;
    if (stateData) {
      return stateData[keyIndex[drugOptions[currentDrug]['significanceColumn']]];
    }

    return '';
  }

  const applyTooltipsToGeo = (geoName) => {
    let toolTipText = '<div class="tooltip-body">';

    const stateData = runtimeData[geoName] ?? false;
    if (stateData) {
      const selectedPercentageRaw = stateData[keyIndex[drugOptions[currentDrug]['percentageColumn']]];
      const significance = stateData[keyIndex[drugOptions[currentDrug]['significanceColumn']]];
      toolTipText += `<div class="state-name-row"><div><strong>${getStateName(geoName)}</strong></div></div><div class="significance-row">${significance}</div>`;

      if ('missing' !== selectedPercentageRaw && 'suppressed' !== selectedPercentageRaw && 'unfunded' !== selectedPercentageRaw ) {
        toolTipText += `<div class="percentage-row"><div>${drugOptions[currentDrug]['titleAll']}:</div><div>${formatPercentage(selectedPercentageRaw)}</div></div>`;
      }
    }
    toolTipText += '</div>';
    return (
      [toolTipText]
    )
}

  let legendMemo = useRef(new Map())

  //Palette with purple, orange, and grays
  let mapColorPalette = [
    '#ee7600',
    '#36648b',
    '#7a7a7a',
    '#cccccc',
    '#ffffff',
    '#3690c0',
    '#02818a',
    '#016c59',
    '#014636'
  ];

  const generateRuntimeLegend = (data) => {
    const newLegendMemo = new Map(); // Reset memoization

    const result = [];

    let dataSet = Object.values(data)

    const applyColorToLegend = (legendIdx) => {
      return mapColorPalette[legendIdx]
    }

    // Category
    let uniqueValues = new Map()

    for(let i = 0; i < dataSet.length; i++) {
      let row = dataSet[i]

      let value = row[keyIndex[drugOptions[currentDrug]['significanceColumn']]];

      if(undefined === value) continue

      if(false === uniqueValues.has(value)) {
          uniqueValues.set(value, [hashObj(row)]);
      } else {
          uniqueValues.get(value).push(hashObj(row))
      }
    }

    let sorted = [...uniqueValues.keys()]

    sorted.sort((a, b) => {
      return legendOrder.indexOf(a) - legendOrder.indexOf(b);
    });

    // Add legend item for each
    legendOrder.forEach((val) => {
        result.push({
            value: val,
        })

        let lastIdx = result.length - 1
        let arr = uniqueValues.get(val)

        if(arr) {
            arr.forEach(hashedRow => newLegendMemo.set(hashedRow, lastIdx))
        }
    })

    // Add color to new legend item
    for(let i = 0; i < result.length; i++) {
        result[i].color = applyColorToLegend(i)
    }

    legendMemo.current = newLegendMemo

    return result
  }

  const handleMonthSliderChange = (data) => {
    console.log(data)
    setSliderPointMonth(data);
  };

  const handleYearSliderChange = (data) => {
    console.log(data)
    setSliderPointYear(data);
  };

  const handleTimeframeChange = (timeframe) => {
    let tempTimeframes = monthTimeframes;
    if ('year' === timeframe) {
      tempTimeframes = monthTimeframes.slice(12);
      setTimeline('Annual');
    } else {
      setTimeline('Monthly');
    }
    setSelectedTimeframe(timeframe);
  };

  const generateRuntimeUSData = () => {

    let startMonth;
    let startYear;
    let endMonth;
    let endYear;

    if ('year' === selectedTimeframe) {
      startMonth = allTimeframes[sliderPointYear]['month'];
      startYear = allTimeframes[sliderPointYear]['year'];
      endMonth = allTimeframes[sliderPointYear+12]['month'];
      endYear = allTimeframes[sliderPointYear+12]['year'];
    } else {
      startMonth = allTimeframes[sliderPointMonth]['month'];
      startYear = allTimeframes[sliderPointMonth]['year'];
      endMonth = allTimeframes[sliderPointMonth+1]['month'];
      endYear = allTimeframes[sliderPointMonth+1]['year'];
    }

    const rowKey = 'US|' + startYear + '|' + startMonth + '|all|all:US|' + endYear + '|' + endMonth + '|all|all';
    return keyedRawUSData[rowKey];
  };

  // Calculates what's going to be displayed on the map and data table at render.
  const generateRuntimeData = () => {

    if (!monthTimeframes) {
      return {};
    }

    let startMonth;
    let startYear;
    let endMonth;
    let endYear;

    if ('year' === selectedTimeframe) {
      startMonth = allTimeframes[sliderPointYear]['month'];
      startYear = allTimeframes[sliderPointYear]['year'];
      endMonth = allTimeframes[sliderPointYear + 12]['month'];
      endYear = allTimeframes[sliderPointYear + 12]['year'];
    } else {
      startMonth = allTimeframes[sliderPointMonth]['month']; 
      startYear = allTimeframes[sliderPointMonth]['year'];
      endMonth = allTimeframes[sliderPointMonth + 1]['month'];
      endYear = allTimeframes[sliderPointMonth + 1]['year'];
    }

    let filteredData = {};

    let tempStatesParticipating = [];
    for (const [key, value] of Object.entries(supportedStates)) {
      const rowKey = value[1] + '|' + startYear + '|' + startMonth + '|all|all:' + value[1] + '|' + endYear + '|' + endMonth + '|all|all';
      const foundRow = keyedRawData[rowKey];
      if (foundRow) {
        filteredData[key] = Object.values(foundRow);

        //Count the states that have data
        if (![legendOrder[3], legendOrder[4]].includes(foundRow[drugOptions[currentDrug]['significanceColumn']])) {
          tempStatesParticipating.push(key);
        }
      }
    }

    setStatesParticipating(tempStatesParticipating);

    return filteredData;
  };

  const generateSuppressedOutput = (key, startMonth, startYear, endMonth, endYear) => {
    let output = {key: `${key}|${endYear}|${endMonth}`, startMonth, startYear, endMonth, endYear};
    output[drugOptions[currentDrug]['percentageColumn']] = 'suppressed';
    output[drugOptions[currentDrug]['significanceColumn']] = 'Data Not Available/Not Reported';
    return output;
  };

  const iteratePastMonths = (callback) => {
    const selectedMonth = 'year' === selectedTimeframe ? sliderPointYear : sliderPointMonth;

    for(let i = 0; i < 6; i++){
      let currentMonth = selectedMonth - i;
  
      if(allTimeframes[currentMonth]){
        callback(
          true,
          allTimeframes[currentMonth]['month'],
          allTimeframes[currentMonth]['year'],
          allTimeframes[currentMonth + ('year' === selectedTimeframe ? 12 : 1)]['month'],
          allTimeframes[currentMonth + ('year' === selectedTimeframe ? 12 : 1)]['year']
        );
      } else if(currentMonth < 0) {
        let startYear = allTimeframes[0].year;
        let startMonth = allTimeframes[0].month + currentMonth;
        if(startMonth < 1) {
          startMonth = 12 + startMonth;
          startYear = startYear - 1;
        }
        let endYear = startYear;
        let endMonth = startMonth;
        if('year' === selectedTimeframe){
          endYear++;
        } else {
          endMonth++;
          if(endMonth > 12){
            endMonth -= 12;
            endYear++;
          }
        }

        callback(
          false,
          `${startMonth}`,
          `${startYear}`,
          `${endMonth}`,
          `${endYear}`
        )
      }
    }
  };

  const generateRuntimePastMonthsRanges = () => {
    const timeframes = 'year' === selectedTimeframe ? yearTimeframes : monthTimeframes;

    let output = {};

    const options = [
      {state: 'US', gender: 'all', age: 'all', key: 'state'},
      {state: selected ? selected.replace(/US-/g, '') : '', gender: 'all', age: 'all', key: 'state'},
      {state: 'US', gender: 'M', age: 'all', key: 'gender'},
      {state: 'US', gender: 'F', age: 'all', key: 'gender'},
      {state: 'US', gender: 'all', age: '0-14', key: 'age'},
      {state: 'US', gender: 'all', age: '15-24', key: 'age'},
      {state: 'US', gender: 'all', age: '25-34', key: 'age'},
      {state: 'US', gender: 'all', age: '35-54', key: 'age'},
      {state: 'US', gender: 'all', age: '55+', key: 'age'},
    ];

    options.forEach(option => {
      if(option.state === '') return;

      output[option.key] = output[option.key] || {max: Number.MIN_VALUE, min: Number.MAX_VALUE};
      timeframes.forEach(timeframe => {
        let year = 'year' === selectedTimeframe ? timeframe.year - 1 : timeframe.year;
        let month = 'year' === selectedTimeframe ? timeframe.month : timeframe.month - 1;
        if(month === 0) {
          month = 12;
          year--;
        }
        const datum = (option.state === 'US' ? keyedRawUSData : keyedRawData)[`${option.state}|${year}|${month}|${option.gender}|${option.age}:${option.state}|${timeframe.key}|${option.gender}|${option.age}`];

        if(datum) {
          const val = parseFloat(datum[drugOptions[currentDrug]['percentageColumn']]);

          if(val < output[option.key].min) {
            output[option.key].min = val;
          }
          if(val > output[option.key].max) {
            output[option.key].max = val;
          }
        }
      });
    });

    return output;
  };

  const generateRuntimePastMonths = () => {
    let data = [];

    iteratePastMonths((valid, startMonth, startYear, endMonth, endYear) => {
      if(valid) {
        data.push(keyedRawUSData[`US|${startYear}|${startMonth}|all|all:US|${endYear}|${endMonth}|all|all`]);
      } else {
        data.push(generateSuppressedOutput('US', startMonth, startYear, endMonth, endYear));
      }
    });

    return data;
  };

  const generateRuntimePastMonthsState = () => {

    let data = [];
    let state = selected ? selected.replace(/US-/g, '') : '';

    iteratePastMonths((valid, startMonth, startYear, endMonth, endYear) => {
      if(valid){
        data.push(keyedRawData[`${state}|${startYear}|${startMonth}|all|all:${state}|${endYear}|${endMonth}|all|all`]);
      } else {
        data.push(generateSuppressedOutput(state, startMonth, startYear, endMonth, endYear));
      }
    });

    return data;
  };

  const generateRuntimePastMonthsGender = () => {
    let data = {'M': [], 'F': []};

    iteratePastMonths((valid, startMonth, startYear, endMonth, endYear) => {
      if(valid){
        Object.keys(data).forEach(key => {
          data[key].push(keyedRawUSData[`US|${startYear}|${startMonth}|${key}|all:US|${endYear}|${endMonth}|${key}|all`]);
        });
      } else {
        Object.keys(data).forEach(key => {
          data[key].push(generateSuppressedOutput('US', startMonth, startYear, endMonth, endYear));
        });
      }
    });

    return data;
    
  };

  const generateRuntimePastMonthsAge = () => {
    let data = {
      '0-14': [], 
      '15-24': [],
      '25-34': [],
      '35-54': [],
      '55+': []
    };

    iteratePastMonths((valid, startMonth, startYear, endMonth, endYear) => {
      if(valid){
        Object.keys(data).forEach(key => {
          data[key].push(keyedRawUSData[`US|${startYear}|${startMonth}|all|${key}:US|${endYear}|${endMonth}|all|${key}`]);
        });
      } else {
        Object.keys(data).forEach(key => {
          data[key].push(generateSuppressedOutput('US', startMonth, startYear, endMonth, endYear));
        });
      }
    });

    return data;
  };

  function getFraction(number) {
    return number % 1;
  }

  function getMonthYear(year, month) {
    if (month == 12)
      return 'January' + ' ' + (year + 1)
    else
      return months[month] + ' ' + year;
  }

  const drugsBarChartMemo = useMemo(() =>
    <>
   <div id="bar-chart-container" className="chart-container" ref={drugsBarChartRef}>
      <BarChart
        data={runtimePastMonthsState}
        width={900} 
        height={900} //TODO
        el={drugsBarChartRef}
        currentState={selectedSec}
        currentDrug={currentDrug}
        selectedDrugs={selectedDrugs}
        currentYear={selectedYr}
        drugOptions={drugOptions}
        setCurrentState={setStateSelectedSec}
        />
    </div>
  </>,
  [runtimePastMonthsState, width, selectedDrugs, selectedYr, selectedSec]);

  useEffect(() => {
    if (true === dataLoaded) {
      const processedData = generateRuntimeData();
      const processedUSData = generateRuntimeUSData();
      const processedLegend = generateRuntimeLegend(processedData);
      const processedPastMonths = generateRuntimePastMonths();
      const processedPastMonthsState = generateRuntimePastMonthsState();
      const processedPastMonthsGender = generateRuntimePastMonthsGender();
      const processedPastMonthsAge = generateRuntimePastMonthsAge()
      const processedRanges = generateRuntimePastMonthsRanges();

      setRuntime({
        runtimeData: processedData, 
        runtimeUSData: processedUSData, 
        runtimeLegend: processedLegend,
        runtimePastMonths: processedPastMonths,
        runtimePastMonthsState: processedPastMonthsState,
        runtimePastMonthsGender: processedPastMonthsGender,
        runtimePastMonthsAge: processedPastMonthsAge,
        runtimeRanges: processedRanges
      });
    }
  }, [selected, dataLoaded, sliderPointMonth, sliderPointYear, currentDrug, selectedTimeframe, setSelected])

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  if (!runtimeData || Object.keys(runtimeData).length === 0 || !monthTimeframes) {
    return <h3>Loading</h3>;
  }

  const getPostiveSign = (number) => {
    if (number > 0) {
      return ('+');
    }
  }

  const toggleConsiderations = () => {
    setShowConsiderations(!showConsiderations);
  };

  const toggleFootNotes = () => {
    setShowFootNotes(!showFootNotes);
  };

  const drugColor = drugOptions[currentDrug].color;
  const usPercent = 100; //Math.round(runtimeUSData[drugOptions['all']['percentageColumn']]); //SKV TODO
  const usRate = 100; //SKV TODO

  return (
    <Context.Provider value={{ fill, applyLegendToRow, drugOptions, currentDrug, data: runtimeData, selected, setStateSelected, setStateSelectedSec, setYearSelected, setMonthSelected, applyTooltipsToGeo, Hexagon, supportedStates, getSignificanceForGeo }}>

    <div className="filters-container">

      <div style={{'color': 'red'}}>Note: All the data in this page is fillers only, till we recieve development data from Business.</div>

      <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
        <h2 className="data-bite-header1 sub">
        April, 2025 Suspected Nonfatal Overdose Visits for All Drugs, Overall {'(' + Object.keys(fundedStates).length + ' Jurisdictions)'}<sup>[4]</sup>
        </h2>
      </div>
      &nbsp;
      <div className="callouts">
        <div style={{'borderLeft': '5px solid' + '#000066'}}>
        <span className="callout" style={{ 'color': '#000066' }}>{getPostiveSign(usRate)}{isNaN(usRate) ? 'N/A' : `${usRate}`}</span> {/* SKV TBD*/}
        <div>
        <span className='data-bite-title' style={{ color: '#000066' }}>
          Monthly Suspected Nonfatal Overdose Visits for All Drugs</span>
          <p>Per 10,000 total ED visits</p>
      </div>
      </div>
        <div style={{'borderLeft': '5px solid' + '#000066'}}>
        <span className="callout" style={{ 'color': '#000066' }}>{getPostiveSign(usPercent)}{isNaN(usPercent) ? 'N/A' : `${usPercent}%`}</span> {/* SKV TBD*/}
        <div>
          <span className='data-bite-title' style={{ color: '#000066' }}>
            Increase in Suspected Nonfatal Overdose Visits for All Drugs</span>
            <p>Per 10,000 total ED visits from the prior month</p>
        </div>
      </div>
      <div style={{'borderLeft': '5px solid' + '#000066'}}>
        <span className="callout" style={{'color': '#000066'}}>{Object.keys(fundedStates).length}</span>
        <div>
          <span className='data-bite-title' style={{ color: '#000066' }}>Jurisdictions Participating</span>
          <p>Funded states with reported Data</p>
        </div>
      </div>
    </div>
    <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
      <h2 className="data-bite-header1 sub">
      What were the trends in Suspected Nonfatal Overdose Visits in {timeline == "Monthly" ? (monthNames[selectedMonth] + ', ') : ''} {selectedYr}{selectedDrugs.length == 1 ? (' for ' + drugOptions[selectedDrugs[0]].titleAll + ',') : ', '} {currentState == 'US' ? 'Overall (' + Object.keys(fundedStates).length + ' Jurisdictions)' : getStateName(currentState)}<sup>[4]</sup>
      </h2>
    </div>
    &nbsp;
    <div>
        <table style={{'width': '100%'}}>
        <tr>
          <td style={{'width': '27%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">View Data For:</div></td>
          <td style={{'width': '18%'}}>
            <select id="jurisdiction-select" value={currentState || ''} onChange={(e) => { setStateSelected(e.target.value); setselectedDrugs(['all']); setCurrentDrug('all')}}>
            <option value="US">Overall &#40;{Object.keys(fundedStates).length} Jurisdictions&#41;</option>
            {Object.keys(fundedStates).map((key) => <option key={key} value={key}>{fundedStates[key][0]}</option>)}
          </select>
          </td>
          <td style={{'width': '12%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">Select Time:</div></td>
          <td style={{'width': '45%'}}>
            <div style={{float: 'left'}}>
              <label class="toggleA" title={'Toggle to change between Monthly and Annual.'}>
                  <input id="toggleMonthly" class="toggleA-input" type="checkbox" checked={showMonthly}
                  onChange={(e) => {
                    if(e.target.checked) {
                      setMonthlyToggle(true)
                      setTimeline('Monthly');
                      setPeriodToggle(true)
                    }
                    else {
                      setMonthlyToggle(false)
                      setTimeline('Annual');
                      setPeriodToggle(false)
                    }
                  }}/>
                  <span class="toggleA-label" data-off="Annual" 
                        data-on="Monthly">
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
                setCurrentDrug('all');
                setselectedDrugs(['all'])
                setMonthlyToggle(false);
                setTimeline('Annual')
                setStateSelected('US');
                setYearSelected(getYears()[0])
                setMonthSelected('January')
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
            <select id="month-select" value={monthNames[selectedMonth] || ''} onChange={(e) => { setMonthSelected(e.target.value) }} disabled={!showMonthly}>
              {months.map((key) => <option key={key} value={key}>{key}</option>)}
            </select>
          </td>
          <td style={{'width': '51%'}}>
          <select id="year-select" value={selectedYr || ''} onChange={(e) => { setYearSelected(e.target.value) }}>
            {getYears().map((key) => <option key={key} value={key}>{key}</option>)}
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
      <div style={{ textAlign: 'center' }}>Work in Progress</div>
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
    </div>

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
          <li>Nonfatal Drug Overdose Surveillance and Epidemiology – Syndromic Data (DOSE-SYS) Dashboard values<strong>may differ from data accessible through the National Syndromic Surveillance Program (NSSP) BioSense Platform.</strong> Many jurisdictions extract data from NSSP’s Electronic Surveillance System for the Early Notification of Community-based Epidemics (ESSENCE) database as part of their data submission process. However, DOSE-SYS data may differ from NSSP ESSENCE data due to differences in jurisdiction data preparation as well as the dynamic nature of NSSP’s progressively updating data.</li>
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
        <li><strong><sup>4</sup></strong>This dashboard shows ED visits for suspected nonfatal drug overdoses of unintentional or undetermined intent. For full definitions, see: <a target="_blank" href="https://knowledgerepository.syndromicsurveillance.org/search/syndrome?keys=overdose%20od2a%202.0&sort_by=field_submitting_author_organiza&sort_order=DESC&f%5B0%5D=submitting_author_organization%3ACDC&page=1">Knowledge Repository</a>.</li>
        <li><strong><sup>5</sup></strong>Holland KM, Jones C, Vivolo-Kantor AM, et al. Trends in US Emergency Department Visits for Mental Health, Overdose, and Violence Outcomes Before and During the COVID-19 Pandemic. JAMA Psychiatry. 2021;78(4):372–379. <a target="_blank" href="https://pubmed.ncbi.nlm.nih.gov/33533876/">doi:10.1001/jamapsychiatry.2020.4402</a>.</li>
        <li><strong><sup>6</sup></strong>Morrow JB, Ropero-Miller JD, Catlin ML, et al. The Opioid Epidemic: Moving Toward an Integrated, Holistic Analytical Response. Journal of Analytical Toxicology. 2019; 43(1); 1–9. <a target="_blank" href="https://doi.org/10.1093/jat/bky049">https://doi.org/10.1093/jat/bky049</a>.</li>
        </ul>
      </div>}
      </div>
    </div>
    </Context.Provider>
  );
}
