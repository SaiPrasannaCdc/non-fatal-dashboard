import React, { useState, useEffect, useRef } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa from 'papaparse';
import UsaMap from './components/UsaMap';
import BarChartVertical from './components/BarChartVertical';
import Datatable from './components/Datatable';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';

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
  'December'
];

export default function AppNew({ dataUrl }) {
  const [runtime, setRuntime] = useState({})
  const [selected, setSelected] = useState(null)
  const [selectedYr, setSelectedYr] = useState(null)
  const [currentState, setCurrentState] = useState('US');
  const [keyedRawData, setKeyedRawdata] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [keyedRawUSData, setKeyedRawUSdata] = useState([]); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const [keyIndex, setKeyIndex] = useState({});
  const [yearTimeframes, setYearTimeframes] = useState([]);
  const [monthTimeframes, setMonthTimeframes] = useState([]);
  const [allTimeframes, setAllTimeframes] = useState([]);
  const [selectedDrugs, setselectedDrugs] = useState(['all']);
  const [selectAllFlag, setSelectAllFlag] = useState(false);
  const [deselectAllFlag, setDeselectAllFlag] = useState(false);
  const [showMonthly, setMonthlyToggle] = useState(false);
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
  const [showFootNotes, setShowFootNotes] = useState(false);
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

  const setYearSelected = (st) => {
    if (selectedYr === st) {
      setSelectedYr(null);
    } else {
      setSelectedYr(st);
    }
  };

  const GetYears = () => { //SKV TODO
    let years = [];
    years['2018'] = '2018';
    years['2019'] = '2019';
    years['2020'] = '2020';
    years['2021'] = '2021';
    years['2022'] = '2022';

    return years;
  }; 

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

 /*  const StateInfo = () => {

    return (
      <div className="bar-chart-container">
        <div className="bar-chart">
          <span className='chart-title'>{supportedStates[selected][0]}</span>
          <BarChartVertical width={600} height={350} data={runtimePastMonthsState} range={[runtimeRanges.state.max, runtimeRanges.state.min]} />
        </div>
      </div>
    )
  } */

  /* const GenderAgeSection = () => {

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
  } */

  /* const tooltipFormatterMonth = (data) => {
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
  } */

  /* const tooltipFormatterYear = (data) => {
    let year = yearTimeframes[data]['label'].split(' ');
    let tip  = yearTimeframes[data]['label'].substring(0,3) + '. ' + year[1];
        tip += " compared to ";
        tip += yearTimeframes[data]['label'].substring(0,3) + '. ' + ( year[1] - 1 );
    return tip;
  } */

  if (!runtimeData || Object.keys(runtimeData).length === 0 || !monthTimeframes) {
    return <h3>Loading</h3>;
  }

  /* const getSliderMarks = (type) => {
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
  } */

/*   const constructStateDataBite = () => {
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
            <p>Suspected {drugScreenOptions[currentDrug]['titleAllGram']} Overdoses</p>
          </div>
        </div>
      )
    }
  } */

/*   const constructUSSignificantIncreaseDataBite = (significanceColumn) => {
    
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
  } */

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

  const drugColor = drugScreenOptions[currentDrug].color;
  const usPercent = Math.round(runtimeUSData[drugScreenOptions[currentDrug]['percentageColumn']]);

  return (
    <Context.Provider value={{ fill, applyLegendToRow, drugScreenOptions, currentDrug, data: runtimeData, selected, setStateSelected, setYearSelected, applyTooltipsToGeo, Hexagon, supportedStates, getSignificanceForGeo }}>

      <div className="filters-container">
        <div className="twoSections">
          <div className="fill-space" style={{'color':'#fff', 'backgroundColor': '#000066', 'font-size': '1.6em', 'font-family': 'var(--fonts-nunito)', 'padding-left': '12px', 'padding-top': '6px', 'padding-bottom': '6px', 'padding-right': '12px', 'font-weight' : '600'}}>
          {allTimeframes[Object.keys(allTimeframes).length - 1].label} Suspected Nonfatal Overdose Visits for All Drugs,  Overall &#40;{Object.keys(fundedStates).length} Jurisdictions&#41;<sup>[4]</sup>
          </div>
          <div style={{'backgroundColor': '#000066', 'font-size': '1.6em', 'font-family': 'var(--fonts-nunito)', 'width' : '230px'}}>
          <select id="jurisdiction-select1" value={selected || ''} onChange={(e) => { setStateSelected(e.target.value) }}>
              <option value="">Overall &#40;{Object.keys(fundedStates).length} Jurisdictions&#41;</option>
              {Object.keys(fundedStates).map((key) => <option key={key} value={key}>{fundedStates[key][0]}</option>)}
            </select>
          </div>
        </div>

        &nbsp;

        <div className="callouts">
          <div style={{'borderLeft': '5px solid' + '#000066'}}>
            <span className="callout" style={{ 'color': '#000066' }}>{getPostiveSign(usPercent)}{isNaN(usPercent) ? 'N/A' : `${usPercent}%`}</span> {/* SKV TBD*/}
            <div>
              <span className='data-bite-title' style={{ color: '#000066' }}>
                {timeline} Suspected Nonfatal Overdose Visits for All Drugs</span>
                <p>Per 10,000 total ED visits</p>
            </div>
          </div>
          <div style={{'borderLeft': '5px solid' + '#000066'}}>
            <span className="callout" style={{ 'color': '#000066' }}>{getPostiveSign(usPercent)}{isNaN(usPercent) ? 'N/A' : `${usPercent}%`}</span> {/* SKV TBD*/}
            <div>
              <span className='data-bite-title' style={{ color: '#000066' }}>
                Decrease in Suspected Nonfatal Overdose Visits for All Drugs</span>
                <p>Per 10,000 total ED visits from the prior month</p>
            </div>
          </div>
          <div style={{'borderLeft': '5px solid' + '#000066'}}>
            <span className="callout" style={{'color': '#000066'}}>{statesParticipating.length}</span>
            <div>
              <span className='data-bite-title' style={{ color: '#000066' }}>Jurisdictions Participating</span>
              <p>Funded states with reported Data</p>
            </div>
          </div>
        </div>

        <div className="twoSections">
          <div className="fill-space" style={{'color':'#fff', 'backgroundColor': '#000066', 'font-size': '1.6em', 'font-family': 'var(--fonts-nunito)', 'padding-left': '12px', 'padding-top': '6px', 'padding-bottom': '6px', 'padding-right': '12px', 'font-weight' : '600'}}>
          What were the trends in Suspected Nonfatal Overdose Visits in {allTimeframes[Object.keys(allTimeframes).length - 1].year} for All Drugs, Overall &#40;{Object.keys(fundedStates).length} Jurisdictions&#41;<sup>[4]</sup>
          </div>
          <div style={{'backgroundColor': '#000066', 'font-size': '1.6em', 'font-family': 'var(--fonts-nunito)', 'width' : '90px'}}>
            <select id="year-select" value={selectedYr || ''} onChange={(e) => { setYearSelected(e.target.value) }}>
              {Object.keys(GetYears()).map((key) => <option key={key} value={key}>{key}</option>)}
            </select>
          </div>
        </div>

        &nbsp;
        <div>
          <table style={{'width': '100%'}}>
            <tr>
              <td style={{'width': '25%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">View Data For:</div></td>
              <td style={{'width': '25%'}}>
                <select id="jurisdiction-select2" value={selected || ''} onChange={(e) => { setStateSelected(e.target.value) }}>
                <option value="">Overall &#40;{Object.keys(fundedStates).length} Jurisdictions&#41;</option>
                {Object.keys(fundedStates).map((key) => <option key={key} value={key}>{fundedStates[key][0]}</option>)}
              </select>
              </td>
              <td style={{'width': '12%', 'textAlign': 'right', 'fontWeight': 'bold'}}><div className="select-input">Select Time:</div></td>
              <td style={{'width': '38%'}}>
                <div style={{float: 'left'}}>
                        <label class="toggleA" title={'Toggle to hover over a data point on the line chart to view percent change for the selected year compared to the previous year.'}>
                            <input id="toggleMonthly" class="toggleA-input" type="checkbox" checked={showMonthly}
                            onChange={(e) => {
                              if(e.target.checked) {
                                setMonthlyToggle(true)
                              }
                              else {
                                setMonthlyToggle(false)
                              }
                            }}/>
                            <span class="toggleA-label" data-off="Monthly Off" 
                                  data-on="Monthly On">
                            </span>
                            <span class="toggleA-handle"></span>
                        </label>
                    </div>
              </td>
            </tr>
            <br></br>
            <tr>
              <td colspan='4' style={{'textAlign': 'left'}}>
                <div className="select-input" style={{'textAlign': 'left', 'fontWeight': 'bold'}}>Select Drug Syndrome:</div>
                <div style={{'textAlign': 'left', 'fontSize': '14px'}}>Select one or more drug syndrome and time period to see updated trends in the graphs and tables below</div>
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
                  <button id="reset-button" style={{ backgroundColor: drugColor }} onClick={() => {
                              }}>Reset</button>
                </div>
              </td>
            </tr>
            <br></br>
            <tr>
              <td colspan='4'>
                <div className="centerAlign"> Work in Progress</div>
              </td>
            </tr>
          </table>
        </div>
        
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
          <h2 className="data-bite-header1 sub">Monthly Suspected Nonfatal Overdose ED visits across Jurisdictions per 10,000 Total ED Visits<sup>†</sup></h2>
        </div>
        <div className="centerAlign"> Place Holder (To be Done)</div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        &nbsp;

        <div style={{'width':'100%', 'backgroundColor': '#000066'}}>
          <h2 className="data-bite-header1 sub">How do Suspected Nonfatal Overdose ED visits vary by Age and Sex?</h2>
        </div>
        <div className="centerAlign">Place Holder (To be Done)</div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
      </div>
      <div className='data-tables'>
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
          <button className="h2" style={{ backgroundColor: drugColor }} onClick={toggleFootNotes}>
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
    </Context.Provider>
  );
}
