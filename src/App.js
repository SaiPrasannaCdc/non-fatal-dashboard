import React, { useState, useEffect, useRef } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa from 'papaparse';
import UsaMap from './components/UsaMap';
import BarChartVertical from './components/BarChartVertical';
import Datatable from './components/Datatable';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import { Base64 } from 'js-base64';

import Caret from './assets/caret-down.svg';
import Context from './context';
import 'rc-slider/assets/index.css';
import './styles.scss';

const SliderWithTooltip = createSliderWithTooltip(Slider);

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
  return supportedStates[geo][0];
}

const legendOrder = [
  'Significant Increase',
  'Significant Decrease',
  'No Significant Change',
  'Data Not Available/Not Reported',
  'Unfunded State'
];

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
  const [runtime, setRuntime] = useState({})
  const [selected, setSelected] = useState(null)
  const [keyedRawData, setKeyedRawdata] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [keyedRawUSData, setKeyedRawUSdata] = useState([]); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const [keyIndex, setKeyIndex] = useState({});
  const [yearTimeframes, setYearTimeframes] = useState([]);
  const [monthTimeframes, setMonthTimeframes] = useState([]);
  const [allTimeframes, setAllTimeframes] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [sliderPointMonth, setSliderPointMonth] = useState(0);
  const [sliderPointYear, setSliderPointYear] = useState(0);
  const [currentDrug, setCurrentDrug] = useState(Object.keys(drugScreenOptions)[0]);
  const [statesParticipating, setStatesParticipating] = useState([]);
  const [showDatatable, setShowDatatable] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showLegendHelp, setShowLegendHelp] = useState(true);
  const [timeline, setTimeline] = useState('Monthly');
  const [showConsiderations, setShowConsiderations] = useState(false);
  const [demographicsToggle, setDemographicsToggle] = useState('sex');
  
  const {runtimeLegend, runtimeData, runtimeUSData, runtimePastMonths, runtimePastMonthsState, runtimePastMonthsGender, runtimePastMonthsAge, runtimeRanges } = runtime;

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
      return stateData[keyIndex[drugScreenOptions[currentDrug]['significanceColumn']]];
    }

    return '';
  }

  const applyTooltipsToGeo = (geoName) => {
    let toolTipText = '<div class="tooltip-body">';

    const stateData = runtimeData[geoName] ?? false;
    if (stateData) {
      const selectedPercentageRaw = stateData[keyIndex[drugScreenOptions[currentDrug]['percentageColumn']]];
      const significance = stateData[keyIndex[drugScreenOptions[currentDrug]['significanceColumn']]];
      toolTipText += `<div class="state-name-row"><div><strong>${getStateName(geoName)}</strong></div></div><div class="significance-row">${significance}</div>`;

      if ('missing' !== selectedPercentageRaw && 'suppressed' !== selectedPercentageRaw && 'unfunded' !== selectedPercentageRaw ) {
        toolTipText += `<div class="percentage-row"><div>${drugScreenOptions[currentDrug]['titleAll']}:</div><div>${formatPercentage(selectedPercentageRaw)}</div></div>`;
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

      let value = row[keyIndex[drugScreenOptions[currentDrug]['significanceColumn']]];

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
        if (![legendOrder[3], legendOrder[4]].includes(foundRow[drugScreenOptions[currentDrug]['significanceColumn']])) {
          tempStatesParticipating.push(key);
        }
      }
    }

    setStatesParticipating(tempStatesParticipating);

    return filteredData;
  };

  const generateSuppressedOutput = (key, startMonth, startYear, endMonth, endYear) => {
    let output = {key: `${key}|${endYear}|${endMonth}`, startMonth, startYear, endMonth, endYear};
    output[drugScreenOptions[currentDrug]['percentageColumn']] = 'suppressed';
    output[drugScreenOptions[currentDrug]['significanceColumn']] = 'Data Not Available/Not Reported';
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
          const val = parseFloat(datum[drugScreenOptions[currentDrug]['percentageColumn']]);

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

  const StateInfo = () => {

    return (
      <div className="bar-chart-container">
        <div className="bar-chart">
          <span className='chart-title'>{supportedStates[selected][0]}</span>
          <BarChartVertical width={600} height={350} data={runtimePastMonthsState} range={[runtimeRanges.state.max, runtimeRanges.state.min]} />
        </div>
      </div>
    )
  }

  const GenderAgeSection = () => {

    return (
      <>
        <section className="comparison-section">
          <div className="bar-chart-container">
            <h2 className='h3' style={{ color: drugColor }}>{timeline} percent change in US ED visit rates<sup>†</sup> of suspected {drugScreenOptions[currentDrug]['titleAllGram']} overdoses</h2>

            <span className="toggle-wrap" onClick={() => {setDemographicsToggle(demographicsToggle === 'sex' ? 'age' : 'sex')}}>
              <span>Sex Comparison</span><div className="toggle-container"><span className="toggle-background"></span><span className={`toggle-indicator${demographicsToggle === 'age' ? ' age' : ''}`}></span></div><span>Age Comparison</span>
            </span>

            {demographicsToggle === 'sex' && <div className="sex-chart">
              <div className="chart-grid">
                <div>
                  <span className='chart-title'>Male</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsGender['M']} range={[runtimeRanges.gender.max, runtimeRanges.gender.min]} chartType={'Male'} />
                </div>
                <div>
                  <span className='chart-title'>Female</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsGender['F']} range={[runtimeRanges.gender.max, runtimeRanges.gender.min]} chartType={'Female'} />
                </div>
              </div>
            </div>}

            {demographicsToggle === 'age' && <div className="age-chart">
              <div className="chart-grid">
                <div>
                  <span className='chart-title'>Ages 0 - 14</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsAge['0-14']} range={[runtimeRanges.age.max, runtimeRanges.age.min]} chartType={'Age 0-14'} />
                </div>
                <div>
                  <span className='chart-title'>Ages 15 - 24</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsAge['15-24']} range={[runtimeRanges.age.max, runtimeRanges.age.min]} chartType={'Age 15-24'}/>
                </div>
                <div>
                  <span className='chart-title'>Ages 25 - 34</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsAge['25-34']} range={[runtimeRanges.age.max, runtimeRanges.age.min]} chartType={'Age 25-34'} />
                </div>
                <div>
                  <span className='chart-title'>Ages 35 - 54</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsAge['35-54']} range={[runtimeRanges.age.max, runtimeRanges.age.min]} chartType={'Age 35-54'} />
                </div>
                <div>
                  <span className='chart-title'>Ages 55+</span>
                  <BarChartVertical width={600} height={300} data={runtimePastMonthsAge['55+']} range={[runtimeRanges.age.max, runtimeRanges.age.min]} chartType={'Age 55+'} />
                </div>
              </div>
            </div>}
          </div>
        </section>
      </>
    )
  }

  const tooltipFormatterMonth = (data) => {
    let tip  = monthTimeframes[data]['label'].substring(0,3) + '. ' + monthTimeframes[data]['year'];
        tip += " compared to ";
        // tip += " - ";

    if ( ( data - 1 ) >= 0 ) { // make sure we have a previous month to compare
      tip += monthTimeframes[data - 1]['label'].substring(0,3) + '. ' + monthTimeframes[data - 1]['year'];
    } else {
      const selectedMonth = monthTimeframes[data]['month'];

      // select previous month in the months array and December if we are on January
      const prevMonth = selectedMonth - 2 >= 0 ? selectedMonth - 2 : 11;

      // select previous year and subtract a year if we are on January
      const prevYear  = selectedMonth - 2 >= 0 ? monthTimeframes[data]['year'] : monthTimeframes[data]['year'] - 1;
      tip += months[prevMonth].substring(0,3) + '. ' + prevYear;
    }
    return tip;
  }

  const tooltipFormatterYear = (data) => {
    let year = yearTimeframes[data]['label'].split(' ');
    let tip  = yearTimeframes[data]['label'].substring(0,3) + '. ' + year[1];
        tip += " compared to ";
        tip += yearTimeframes[data]['label'].substring(0,3) + '. ' + ( year[1] - 1 );
    return tip;
  }

  if (!runtimeData || Object.keys(runtimeData).length === 0 || !monthTimeframes) {
    return <h3>Loading</h3>;
  }

  const getSliderMarks = (type) => {
    let marks = {};
    
    //Get year marks in between beginning and end
    let indexOffset = 0;

    let tempTimeframes;
    if ('month' === type) {
      tempTimeframes = [...monthTimeframes];
    } else {
      tempTimeframes = [...yearTimeframes];
    }

    let tempYear = tempTimeframes[0].year;
    const lastIndex = tempTimeframes.length - 1;

    tempTimeframes.forEach((element, index, array) => {

      if (0 === index) {
        marks[index] = element.label;
        return;
      }

      if (tempYear !== element.year) {
        marks[index] = element.year;
        tempYear = element.year;
        return;
      }

      if (lastIndex === index) {
        marks[index] = element.label;
        return;
      }
    });

    return marks;
  }

  const constructStateDataBite = () => {
    const selectedPercentageRaw = selected ? runtimeData[selected][keyIndex[drugScreenOptions[currentDrug]['percentageColumn']]] : false;
    let selectedPercentage = false;
    
    if ('missing' === selectedPercentageRaw) {
      return (
        <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>N/A</span>
          <div>
            <h3 style={{ color: drugColor }}>{getStateName(selected)}</h3>
            <p>Data not available/reported for this state and time range.</p>
          </div>
        </div>
      )
    } else {
      selectedPercentage = Math.round(runtimeData[selected][keyIndex[drugScreenOptions[currentDrug]['percentageColumn']]]);
      if(isNaN(selectedPercentage)){
        selectedPercentage = 'N/A';
      } else {
        selectedPercentage += '%';
      }
      return (
        <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>{selectedPercentage}</span>
          <div>
            <span className='data-bite-title' style={{ color: drugColor }}>{timeline} Percent Change<sup>†</sup>  in {getStateName(selected)}</span>
            <p>Suspected {drugScreenOptions[currentDrug]['titleAllGram']} Overdose</p>
          </div>
        </div>
      )
    }
  }

  const constructUSSignificantIncreaseDataBite = (significanceColumn) => {
    
    const numStatesWithSignificantIncrease = Object.values(runtimeData).filter((obj) => {
      return obj[significanceColumn] === 'Significant Increase';
    }).length;

    return (
      <div style={{ 'borderLeft': '5px solid' + drugColor }}>
        <span className="callout" style={{ 'color': drugColor }}>{numStatesWithSignificantIncrease}</span>
        <div>
          <span className='data-bite-title' style={{ 'color': drugColor }}>States </span>
          <p>Number with a Significant Increase</p>
        </div>
      </div>
    );
  }

  const getPostiveSign = (number) => {
    if (number > 0) {
      return ('+');
    }
  }

  let footnote1 = ["§", "State does not currently share data from syndromic surveillance systems with DOSE." ];
  // let footnote2 = ["¶", "The funded state did not provide CDC enough months of data to calculate all percent change cells." ];
  let footnote3 = ["¶", "State does not participate in DOSE syndromic surveillance system." ];
  let footnote4 = ["**", "Certain comparisons include data from two syndromic surveillance systems; some differences between the systems exist, such as the percent of missing discharge diagnosis codes." ];

  const DownloadButton = () => {
    return (
      <a
        download
        href="/drugoverdose/nonfatal/dashboard/data/DOSE_dashboard_output-download.xlsx"
        aria-label="Download this data in an Excel file format."
        className={`btn btn-download no-border`}
        style={{'backgroundColor':drugColor}}
      >
        Download Data (XLSX)
      </a>
    )
  };

  const toggleDatatable = () => {
    setShowDatatable(!showDatatable);
  };

  const toggleConsiderations = () => {
    setShowConsiderations(!showConsiderations);
  };

  const toggleLegend = () => {
    setShowTimeline(false);
    setShowShare(false);
    setShowLegend(!showLegend);
  };

  const toggleTimeline = () => {
    setShowLegend(false);
    setShowShare(false);
    setShowTimeline(!showTimeline);
  };

  const toggleShare = () => {
    setShowLegend(false);
    setShowTimeline(false);
    showShare ? document.body.classList.remove('show-sharing') : document.body.classList.add('show-sharing');
    setShowShare(!showShare);
  };

  const toggleLegendHelp = () => {
    setShowLegendHelp(!showLegendHelp);
  };

  const resetFilters = () => {
    setSelected("");
  };

  const drugColor = drugScreenOptions[currentDrug].color;
  const drugColorLight = chroma(drugScreenOptions[currentDrug].color).darken(-1).hex();
  const usPercent = Math.round(runtimeUSData[drugScreenOptions[currentDrug]['percentageColumn']]);
  const significanceColumn = keyIndex[drugScreenOptions[currentDrug]['significanceColumn']];
  const percentageColumn = keyIndex[drugScreenOptions[currentDrug]['percentageColumn']];
  const jurisdictionColumn = keyIndex[drugScreenOptions[currentDrug]['state']];
  let runtimeTableData = Object.values(runtimeData);

  let fromLabel, toLabel, mapFromLabel;
  if ('month' === selectedTimeframe) {
    mapFromLabel = allTimeframes[sliderPointMonth]['label'];
    toLabel = allTimeframes[sliderPointMonth+1]['label'];
    fromLabel = sliderPointMonth-6 >= 0 ? allTimeframes[sliderPointMonth-6]['label'] : allTimeframes[0]['label'];
  } else {
    toLabel = allTimeframes[sliderPointYear + 12]['label'];
    fromLabel = allTimeframes[sliderPointYear]['label'];
  }

  const MapFootnotes = () => {
    return (
        <>
          <p>* Data were collected for the time period beginning January 2018, but exclude several months during the onset of the COVID-19 pandemic (i.e., March 2020-August 2020). In some cases, the funded state did not provide CDC enough months of data to calculate percent change. Rates are suppressed when based on &lt;20 overdoses, thus no percent change is available; for more information, please see: Healthy People 2010 Criteria for Data Suppression.</p>
          <p><span className="merriweather">†</span> To account for changes occurring across time, monthly and annual trends for the rate of ED visits involving suspected drug overdoses (e.g., ED visits involving drug overdoses divided by total ED visits and multiplied by 10,000) were analyzed overall and by U.S. state. Annual change, controlling for seasonal effects, was estimated as the change from a month in a given year to the same month in the following year (e.g., January 2018 to January 2019). Significance testing was conducted using chi-square tests.</p>
        </>
    );
  }

  return (
    <Context.Provider value={{ fill, applyLegendToRow, drugScreenOptions, currentDrug, data: runtimeData, selected, setStateSelected, applyTooltipsToGeo, Hexagon, supportedStates, getSignificanceForGeo }}>
      <div className="filters-container">

        <div className={ `filter-wrapper ${ showTimeline ? 'show-timeline' : '' }`}>
          <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Filters</div>
          <div className="filters">
            <div className="dropdowns">
              <div>
                <label htmlFor="drug-select">Select a drug syndrome: </label>
                <select id="drug-select" value={currentDrug} onChange={(e) => { setCurrentDrug(e.target.value) }}>
                  {Object.keys(drugScreenOptions).map((key) => <option key={key} value={key}>{drugScreenOptions[key]['titleAll']}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="jurisdiction-select">Select a State: </label>
                <select id="jurisdiction-select" value={selected || ''} onChange={(e) => { setStateSelected(e.target.value) }}>
                  <option value="">United States</option>
                  {Object.keys(fundedStates).map((key) => <option key={key} value={key}>{fundedStates[key][0]}</option>)}
                </select>
              </div>
              <div className="compare">
                <label htmlFor="month-year">Compare {toLabel} with the previous: </label>
                <span className='legend-help' data-tip='<div className=" tooltip-body">
                  <small>This panel allows you to view the percent change in nonfatal drug overdoses between adjacent months and annually for a select time period.</small></div>
                  <small>You can select either monthly percent change or annual percent change. To select a different month/year, drag the slider below.</div>
                  </div>'>?</span>
                <select id="month-year"  value={selectedTimeframe} onChange={(e) => {handleTimeframeChange(e.target.value)}}>
                  <option value="month" name="time-selector">Month</option>
                  <option value="year" name="time-selector">Year</option>
                </select>
              </div>
            </div>

            <div className="timeline">
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
                        tipProps={{visible:true}}
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
                        tipProps={{visible:true}}
                        ariaLabelForHandle="Select a year to compare in the map"
                    />
                }
              </div>
            </div>
          </div>
        </div>

      <header style={{backgroundColor: drugColor, color: '#fff', fontFamily: 'sans-serif', padding: '.75em 18px', marginBottom: '1em'}}>
        <span style={{  fontSize: '.8em', fontWeight: 'bold' }}>Trends in Emergency Department (ED) Visits</span>
        <h2 style={{ fontSize: '1.4em', margin: 0, padding: '0', display: 'block', fontWeight: 'bold', fontFamily: '"Open Sans",apple-system,blinkmacsystemfont,"Segoe UI","Helvetica Neue",arial,sans-serif'  }}>Suspected {drugScreenOptions[currentDrug]['titleAllGram']} Overdoses</h2>
      </header>
      <div className="callouts">
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{ 'color': drugColor }}>{getPostiveSign(usPercent)}{isNaN(usPercent) ? 'N/A' : `${usPercent}%`}</span>
          <div>

            <span className='data-bite-title' style={{ color: drugColor }}>

              {timeline}  Percent Change<sup>†</sup> in US</span>
            <p>Suspected {drugScreenOptions[currentDrug]['titleAllGram']} Overdose</p>
          </div>
        </div>
        {selected && constructStateDataBite()}
        {!selected && constructUSSignificantIncreaseDataBite(significanceColumn)}
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{'color': drugColor}}>{statesParticipating.length}</span>
          <div>
            <span className='data-bite-title' style={{ color: drugColor }}>States Participating</span>
            <p>Funded States with Reported Data</p>
          </div>
        </div>
      </div>
      {/*<div style={{ 'marginBottom': '25px' }}><strong>{toLabel}</strong> compared to <strong>{ mapFromLabel ? mapFromLabel : fromLabel }</strong></div>*/}
      {/*<div className={'drug-selection ' + currentDrug} style={{ borderTopColor: drugColor }}>*/}
      {/*  {Object.keys(drugScreenOptions).map((key) => {*/}
      {/*    return <button key={key} style={key === currentDrug ? { background: drugColor } : {}} className={key===currentDrug ? 'active' : ''} onClick={() => setCurrentDrug(key)}>{drugScreenOptions[key]['titleAll']}</button>*/}
      {/*  })}*/}
      {/*</div>*/}

      <div className="toggle-area-wrap">
        <div className="toggle-area">
          <div id="toggleLegend" className={`${ showLegend ? 'open' : '' }` } onClick={toggleLegend}>
            Show Legend <Caret />
          </div>
          <div id="toggleTimeline" className={`${ showTimeline ? 'open' : '' }`} onClick={toggleTimeline}>
            <span className="hide-on-mobile">Edit</span> Filters <Caret />
          </div>
          {/* <div id="toggleShare" className={`${ showShare ? 'open' : '' }`} onClick={toggleShare}>
            Share <Caret />
          </div> */}
        </div>
      </div>
      <div id="closeShare" onClick={toggleShare}>
        <svg width="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style={{'margin':'auto'}}><path fill="#fff" d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
      </div>
      <div className='sticky-container'>
        <aside className={
          `${ showLegend ? 'show-legend' : '' }` +
          `${ showTimeline ? 'show-timeline' : '' }` +
          `${ showShare ? 'show-share' : '' }`
        }>
          <div className="legend">
            <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Color Legend</div>
            <ul className="legend" style={{paddingLeft: '0.5em'}}>
              {runtimeLegend.map(({color, value}) => <li key={color}>

                <svg viewBox="-5 -5 110 110" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill={color} stroke='#555' strokeWidth={4} />
                </svg>
                {value}
                </li>)}

              <li>
                <Hexagon patternn={'url(#pattern_KJD3DK2)'}></Hexagon>
                <svg
                    // y={-15}
                    // x={barX - 10}
                    aria-hidden="true"
                    data-prefix="fas"
                    data-icon="asterisk"
                    className="svg-inline--fa fa-asterisk fa-w-16"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 18 18"
                    // width="30"
                    // fill={fill(d[significanceColumn])}
                    stroke="#999"

                    style={{ 'marginLeft': '2px'}}
                >
                  <path d="M6.7 6.5 6 .6h2.9l-.6 5.9 6-1.6.4 2.7-5.8.5 3.8 4.9-2.6 1.4-2.7-5.5L5 14.4 2.4 13 6 8.1.3 7.6l.5-2.7z"/>
                </svg>
                <a href="#suppressed">Suppressed Data</a>
              </li>
            </ul>

            <p>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System</p>
            <p><a href="#impdataconsiderations">Data Considerations</a></p>
          </div>
        </aside>

        <div className="map-container">
          <div className="map-inner-container">
            <div className="now-viewing">
              <h2 className="h3" style={{ color: drugColor }}>{timeline} percent change in ED visit rates<sup>†</sup> of suspected {drugScreenOptions[currentDrug]['titleAllGram']} overdoses</h2>
              {!selected && <div><em>Click on a state to see more.</em></div>}
              {selected && <div>Now viewing {getStateName(selected)} <button className="btn btn-reset" onClick={resetFilters}>Reset</button></div>}
            </div>
            <UsaMap/>
          </div>
        </div>

        <section className="sub-drawer dumbbell">
          <a id="stateInfo">state info</a>
          <h2 className="h3" style={{ color: drugColor }}>{timeline} percent change in ED visit rates<sup>†</sup> of suspected {drugScreenOptions[currentDrug]['titleAllGram']} overdoses</h2>
          {selected && (
            <>
              <div>
                Compare United States against:
                <select style={{ "marginBottom": "20px", "marginLeft": "10px" }} value={selected} onChange={(e) => { setStateSelected(e.target.value) }}>
                  <option value="">Select State</option>
                  {Object.keys(fundedStates).map((key) => <option key={key} value={key}>{fundedStates[key][0]}</option>)}

                </select>
              </div>
              <StateInfo />
            </>
          )}
          <div className="bar-chart-container">
            <div className="bar-chart">
              <span className='chart-title'>US</span>
              <BarChartVertical width={600} height={350} data={runtimePastMonths} range={[runtimeRanges.state.max, runtimeRanges.state.min]} />
            </div>
          </div>
        </section>

        {GenderAgeSection()}

        <div className="footnotes comparison-section">
          <a id="suppressed">suppressed data note</a>
          <MapFootnotes />
        </div>
      </div>
      </div>
      <div className='data-tables'>
        <div className="datatable-container">
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
            Trends by State, {timeline} - {drugScreenOptions[currentDrug]['titleAll']}
            {showDatatable && <span>{String.fromCharCode(8722)}</span>}
            {!showDatatable && <span>{String.fromCharCode(43)}</span>}
          </button>
          {showDatatable &&
            <div className="datatable-body">
              <Datatable runtimeUSData={Object.values(runtimeUSData)} applyLegendToRow={applyLegendToRow} runtimeData={runtimeTableData} Hexagon={Hexagon} keyIndex={keyIndex} jurisdictionColumn={jurisdictionColumn} significanceColumn={significanceColumn} percentageColumn={percentageColumn} supportedStates={supportedStates} drugColor={drugColorLight} drugName={drugScreenOptions[currentDrug]['titleAllGram']} />
              <small>
                <MapFootnotes />
                <p>{ footnote1[0] } { footnote1[1] }</p>
                <p>{ footnote3[0] } { footnote3[1] }</p>
                <p>{ footnote4[0] } { footnote4[1] }</p>
                {/*§ The state/territory does not share data from syndromic surveillance systems with DOSE.<br/>*/}
                {/*¶ The funded jurisdiction did not provide CDC enough months of data to calculate all percent change cells.<br/>*/}
                {/*** State does not participate in OD2A DOSE ED data sharing.<br/>*/}
              </small>
            </div>}
        </div>
        <div className="datatable-container" id="impdataconsiderations">
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
                <li><strong>New ICD-10-CM codes were added for fentanyl and methamphetamine during the data collection period:</strong> Syndromic surveillance definitions use information from both the chief complaint and discharge diagnosis fields to identify suspected cases.  ICD-10-CM diagnosis codes were introduced to address gaps in the classification of fentanyl poisonings (T40.41, effective October 1, 2020) and methamphetamine poisonings (T43.65, effective October 1, 2022). Prior to the availability of these codes suspected fentanyl or methamphetamine poisonings may have been classified under a broader drug overdose or poisoning code, decreasing the likelihood that the visit would be captured by the syndrome definition. Additionally, incorporation of new ICD-10-CM codes into routine use at healthcare facilities may vary between facilities or jurisdictions. Due to these limitations, comparisons of data collected before and after the introduction of the respective codes should be interpreted with caution.</li>
                <li><strong>Overdose visit numbers are not mutually exclusive</strong> but rather reflect nesting of drug categories (depicted in the figure below) and some overdose visits involved multiple substances (e.g., a given overdose ED visit could have involved both opioids and stimulants).
                  {/* https://wcms-wp.cdc.gov/ */}
                  <img src="/overdose-prevention/data-dashboards/dose-surveillance-dashboard/img/24_Lyons_DOSEDash_Chart-03.png" alt="drug categories" />
                </li>
              </ol>
            </div>}
        </div>
      </div>
      {/* <a id="dataDownload" data={csvData}>data download</a> */}
      {/* <p>
        <DownloadButton data={csvData} />
      </p> */}
      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>
    </Context.Provider>
  );
}
