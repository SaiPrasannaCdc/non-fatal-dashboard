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

const Hexagon = ({fill}) => {
  return (
    <svg viewBox="0 0 45 51">
      <polygon fill={fill} strokeWidth={1} stroke="gray" points="22 0 44 12.702 44 38.105 22 50.807 0 38.105 0 12.702"/>
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
    'titleAll': 'All Drug',
    'significanceColumn': 'allSignificance',
    'percentageColumn': 'allPercentageChange',
    'color': '#2B2D73',
  },
  'opioids': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'titleAll': 'All Opioids',
    'significanceColumn': 'opioidSignificance',
    'percentageColumn': 'opioidPercentageChange',
    'color': '#4A2866',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'titleAll': 'Heroin',
    'significanceColumn': 'heroinSignificance',
    'percentageColumn': 'heroinPercentageChange',
    'color': '#353535',
  },
  'stimulants': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'titleAll': 'All Stimulants',
    'significanceColumn': 'stimulantSignificance',
    'percentageColumn': 'stimulantPercentageChange',
    'color': '#24574E',
  },
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
            
            if ('US' === row[keyIndex['jurisdiction']]) {
              tempKeyedRawUSData[row[keyIndex['key']]] = obj;
            } else {
              tempKeyedRawData[row[keyIndex['key']]] = obj;
            }

            const startMonth = row[keyIndex['startMonth']];
            const startYear = row[keyIndex['startYear']];
            const endMonth = row[keyIndex['endMonth']];
            const endYear = row[keyIndex['endYear']];

            const yearMonthIndex1 = startYear + '|' + startMonth;
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
            const yearMonthIndex2 = endYear + '|' + endMonth;
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
    setSliderPointMonth(data);
  };

  const handleYearSliderChange = (data) => {
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
      <section className="sub-drawer dumbbell">
        <div>
          <h3 style={{ color: drugColor }}>{timeline} percent change in ED visit rates<sup>†</sup> of suspected {drugScreenOptions[currentDrug]['titleAll']} overdoses</h3>
          <div>
            Compare United States against:
            <select style={{ "marginBottom": "20px", "marginLeft": "10px" }} value={selected} onChange={(e) => { setStateSelected(e.target.value) }}>
              <option value="">Select State</option>
              {statesParticipating.map((key) => <option key={key} value={key}>{supportedStates[key][0]}</option>)}
            </select>
          </div>
        </div>
        <div className={'bar-chart-container'}>
        <div className="bar-chart">
            <span className='chart-title'>US</span>
            <BarChartVertical width={600} height={350} data={runtimePastMonths} range={[runtimeRanges.state.max, runtimeRanges.state.min]} />
          </div>
          <div className="bar-chart" style={{"margin":"60px 0"}}>
          <span className='chart-title'>{supportedStates[selected][0]}</span>
            <BarChartVertical width={600} height={350} data={runtimePastMonthsState} range={[runtimeRanges.state.max, runtimeRanges.state.min]} />
        </div>
        </div>
      </section>
    )
  }

  const GenderAgeSection = () => {

    return (
      <>
        <section className="comparison-section">
          <div className="bar-chart-container">
            <h3 style={{ color: drugColor }}>{timeline} percent change in US Emergency Department visit rates<sup>†</sup> of suspected {drugScreenOptions[currentDrug]['titleAll']} overdoses</h3>

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
    return monthTimeframes[data]['label'];
  }

  const tooltipFormatterYear = (data) => {
    return yearTimeframes[data]['label'];
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
      return (
        <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>{selectedPercentage}%</span>
          <div>
            <span className='data-bite-title' style={{ color: drugColor }}>{timeline} Percent Change<sup>†</sup>  in {getStateName(selected)}</span>
            <p>Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdose</p>
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

  const objectFlip = (obj) => {
    const ret = {};
    Object.keys(obj).forEach(key => {
      ret[obj[key]] = key;
    });
    return ret;
  }

  const DownloadButton = ({ data }) => {
    const fileName = `Non-Fatal-Overdose-Data.csv`;

    //Remove the first column and move the primary columns to the front
    let processedData = [...data].map(row => {
      let newRow = [...row];
      newRow.shift();
      const itemsToAdd = newRow.splice(12, 6);
      newRow = itemsToAdd.concat(newRow);
      return newRow;
    });

    //Insert the header row
    const reversedKeyIndex = objectFlip(keyIndex);
    let headerRow = [];
    for (let i = 1; i < Object.keys(reversedKeyIndex).length; i++) {
      headerRow.push(reversedKeyIndex[i]);
    }

    //Move the primary columns to the front
    const itemsToAdd = headerRow.splice(12, 6);
    headerRow = itemsToAdd.concat(headerRow);

    let footnote1 = ["§", "The state/territory does not share data from syndromic surveillance systems with DOSE." ];
    let footnote2 = ["¶", "The funded state did not provide CDC enough months of data to calculate all percent change cells." ];
    let footnote3 = ["**", "State does not participate in OD2A DOSE ED data sharing." ];
    let footnote4 = ["† †", "Certain comparisons include data from two syndromic surveillance systems; some differences between the systems exist, such as the percent of missing discharge diagnos is codes." ];

    //Add header row to beginning of dataset
    processedData.unshift(headerRow);

    processedData.unshift(footnote1);
    processedData.unshift(footnote2);
    processedData.unshift(footnote3);
    processedData.unshift(footnote4);

    //Parse to CSV
    const csvData = Papa.unparse(processedData);
    const dataBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    //Save and download
    const saveBlob = () => {
      if (typeof window.navigator.msSaveBlob === 'function') {

        window.navigator.msSaveBlob(dataBlob, fileName);
      }
    }

    return (
      <a
        download={fileName}
        onClick={saveBlob}
        href={`data:text/csv;base64,${Base64.encode(csvData)}`}
        aria-label="Download this data in a CSV file format."
        className={`btn btn-download no-border`}
        style={{'backgroundColor':drugColor}}
      >
        Download Data (CSV)
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
    setSelected(null);
  };

  const drugColor = drugScreenOptions[currentDrug].color;
  const drugColorLight = chroma(drugScreenOptions[currentDrug].color).darken(-1).hex();
  const usPercent = Math.round(runtimeUSData[drugScreenOptions[currentDrug]['percentageColumn']]);
  const significanceColumn = keyIndex[drugScreenOptions[currentDrug]['significanceColumn']];
  const percentageColumn = keyIndex[drugScreenOptions[currentDrug]['percentageColumn']];
  const jurisdictionColumn = keyIndex[drugScreenOptions[currentDrug]['jurisdiction']];
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

  return (
    <Context.Provider value={{ fill, applyLegendToRow, drugScreenOptions, currentDrug, data: runtimeData, selected, setStateSelected, applyTooltipsToGeo, Hexagon, supportedStates }}>
      <div className="filters">
        <div>
          <label htmlFor="drug-select">Select a Drug:</label> <select id="drug-select" style={{ "marginBottom": "20px" }} value={currentDrug} onChange={(e) => { setCurrentDrug(e.target.value) }}>
          {Object.keys(drugScreenOptions).map((key) => <option key={key} value={key}>{drugScreenOptions[key]['titleAll']}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="jurisdiction-select">Select a State:</label> <select id="jurisdiction-select" style={{ "marginBottom": "20px" }} value={selected} onChange={(e) => { setStateSelected(e.target.value) }}>
          <option value="">United States</option>
          {statesParticipating.map((key) => <option key={key} value={key}>{supportedStates[key][0]}</option>)}
          </select>
        </div>
      </div>
      <header style={{backgroundColor: drugColor, color: '#fff', fontFamily: 'sans-serif', padding: '.75em 18px', marginBottom: '1em'}}>
        <span style={{  fontSize: '.8em', fontWeight: 'bold' }}>Trends in Emergency Department Visits</span>
        <h2 style={{ fontSize: '1.4em', margin: 0, padding: '0', display: 'block', fontWeight: 'bold', fontFamily: '"Open Sans",apple-system,blinkmacsystemfont,"Segoe UI","Helvetica Neue",arial,sans-serif'  }}>Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdoses</h2>
      </header>
      <div className="callouts">
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{ 'color': drugColor }}>{getPostiveSign(usPercent)}{usPercent}%</span>
          <div>

            <span className='data-bite-title' style={{ color: drugColor }}>

              {timeline}  Percent Change<sup>†</sup> in US</span>
            <p>Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdose</p>
          </div>
        </div>
        {selected && constructStateDataBite()}
        {!selected && constructUSSignificantIncreaseDataBite(significanceColumn)}
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{'color': drugColor}}>{statesParticipating.length}</span>
          <div>
            <span className='data-bite-title' style={{ color: drugColor }}>States Participating</span>
            <p>Funded states with reported data</p>
          </div>
        </div>
      </div>
      <div style={{ 'marginBottom': '25px' }}><strong>{toLabel}</strong> compared to <strong>{ mapFromLabel ? mapFromLabel : fromLabel }</strong></div>
      <div className={'drug-selection ' + currentDrug} style={{ borderTopColor: drugColor }}>
        {Object.keys(drugScreenOptions).map((key) => {
          return <button key={key} style={key === currentDrug ? { background: drugColor } : {}} className={key===currentDrug ? 'active' : ''} onClick={() => setCurrentDrug(key)}>{drugScreenOptions[key]['titleAll']}</button>
        })}
      </div>

      <div className="toggle-area">
        <div id="toggleLegend" className={`${ showLegend ? 'open' : '' }` } onClick={toggleLegend}>
          Show Legend <Caret />
        </div>
        <div id="toggleTimeline" className={`${ showTimeline ? 'open' : '' }`} onClick={toggleTimeline}>
          Edit Time Range <Caret />
        </div>
        <div id="toggleShare" className={`${ showShare ? 'open' : '' }`} onClick={toggleShare}>
          Share <Caret />
        </div>
      </div>
      <div id="closeShare" onClick={toggleShare}>
        X
      </div>
      <div className='sticky-container'>
        <aside className={
          `${ showLegend ? 'show-legend' : '' }` +
          `${ showTimeline ? 'show-timeline' : '' }` +
          `${ showShare ? 'show-share' : '' }`
        }>
          <div className="timeline">
            <div className="legend-title" style={{ 'backgroundColor': drugColor }}>
              Time Range   <span className='legend-help' onClick={toggleLegendHelp}>?</span>
            </div>
            <div className={`${ showLegendHelp ? 'legend-help-message' : 'legend-help-message show' }`}>
              <p>This panel allows you to view the percent change in nonfatal drug overdoses between adjacent months and annually for a select time period.</p>
              <p>You can select either monthly percent change or annual percent change. To select a different month/year, drag the slider below.</p>
            </div>
            <div className="time-frame-container">
              <div>Compare {toLabel} with the previous:
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="month"
                    name="time-selector"
                    checked={selectedTimeframe === 'month'}
                    onChange={(e) => {handleTimeframeChange(e.target.value)}}
                  />
                  Month
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="year"
                    name="time-selector"
                    checked={selectedTimeframe === 'year'}
                    onChange={(e) => {handleTimeframeChange(e.target.value)}}
                  />
                  Year
                </label>
              </div>
              </div>
            </div>
            <div className="range-aside-container" style={{ color: drugColor }}>
              {'month' === selectedTimeframe &&
                <SliderWithTooltip
                  tipFormatter={tooltipFormatterMonth}
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
                  ariaLabelForHandle="Select a month to compare in the map"
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
                  ariaLabelForHandle="Select a year to compare in the map"
                />
              }
            </div>
          </div>
          <div className="legend">
            <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Color Legend</div>
            <ul className="legend">
              {runtimeLegend.map(({color, value}) => <li key={color}>

                <svg viewBox="-5 -5 110 110" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill={color} stroke='#555' strokeWidth={4} />
                </svg>
                {value}
                </li>)}
            </ul>
            <p>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System</p>
          </div>
        </aside>

        <div className="map-container">
          <div className="map-inner-container">
            <div className="now-viewing">
              {!selected && <div><em>Click on a state to see more.</em></div>}
              {selected && <div>Now viewing {getStateName(selected)} <span className="btn btn-reset" onClick={resetFilters}>Reset</span></div>}
            </div>
            <UsaMap/>
          </div>
        </div>

        {selected && <StateInfo />}
        {GenderAgeSection()}
        <div className="footnotes comparison-section">
          <p>* In some cases, the funded state did not provide CDC enough months of data to calculate percent change. Rates are suppressed when based on &lt;20 overdoses, thus no percent change is available; for more information, please see: Healthy People 2010 Criteria for Data Suppression.</p>
          <p><span className="merriweather">†</span> To account for changes occurring across time, monthly and annual trends for the rate of Emergency Department visits involving suspected drug overdoses (e.g., ED visits involving drug overdoses divided by total ED visits and multiplied by 10,000) were analyzed overall and by U.S. state. Annual change, controlling for seasonal effects, was estimated as the change from a month in a given year to the same month in the following year (e.g., January 2018 to January 2019). Significance testing was conducted using chi-square tests</p>
        </div>
      </div>
      <div className='data-tables'>
        <div className="datatable-container">
          <h2 style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
            Trends by State, {timeline} - {drugScreenOptions[currentDrug]['titleAll']}
            {showDatatable && <span>{String.fromCharCode(8722)}</span>}
            {!showDatatable && <span>{String.fromCharCode(43)}</span>}
          </h2>
          {showDatatable &&
            <div className="datatable-body">
              <Datatable runtimeUSData={Object.values(runtimeUSData)} applyLegendToRow={applyLegendToRow} runtimeData={runtimeTableData} Hexagon={Hexagon} keyIndex={keyIndex} jurisdictionColumn={jurisdictionColumn} significanceColumn={significanceColumn} percentageColumn={percentageColumn} supportedStates={supportedStates} drugColor={drugColorLight} />
              <small>
                § The state/territory does not share data from syndromic surveillance systems with DOSE.<br/>
                ¶ The funded jurisdiction did not provide CDC enough months of data to calculate all percent change cells.<br/>
                ** State does not participate in OD2A DOSE ED data sharing.<br/>
              </small>
              <DownloadButton data={csvData} />
            </div>}
        </div>
        <div className="datatable-container">
          <h2 style={{ backgroundColor: drugColor }} onClick={toggleConsiderations}>
          Important Data Considerations
            {showConsiderations && <span>{String.fromCharCode(8722)}</span>}
            {!showConsiderations && <span>{String.fromCharCode(43)}</span>}
          </h2>
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
      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>
    </Context.Provider>
  );
}
