import React, { useState, useEffect, useRef } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa from 'papaparse';
import UsaMap from './components/UsaMap';
import BarChart from './components/BarChart';
import Datatable from './components/Datatable';
import DumbbellChart from './components/DumbbellChart';
//import HeaderLineChart from './components/HeaderLineChart';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import { Base64 } from 'js-base64';
import { renderToString } from 'react-dom/server'

import PlayIcon from './assets/play.svg';
import StopIcon from './assets/stop.svg';
import PauseIcon from './assets/pause.svg';
import ReactTooltip from 'react-tooltip';

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
      <polygon fill={fill} points="22 0 44 12.702 44 38.105 22 50.807 0 38.105 0 12.702"/>
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

const unfundedStates = [
  'US-WY',
  'US-ND',
  'US-TX'
];

const legendOrder = [
  'Significant Increase',
  'Significant Decrease',
  'No Significant Change',
  'Data Not Available/Not Reported',
  'Unfunded Jurisdiction'
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
  'Feburary',
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
  const [runtimeLegend, setRuntimeLegend] = useState([])
  const [runtimeData, setRuntimeData] = useState([])
  const [runtimeUSGenderData, setRuntimeUSGenderData] = useState([])
  const [runtimeUSAgeData, setRuntimeUSAgeData] = useState([])
  const [runtimeUSData, setRuntimeUSData] = useState([])
  const [selected, setSelected] = useState(null)
  const [timeframe, setTimeframe] = useState('March 2020');
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
  const [monthCount, setMonthCount] = useState(0);
  const [statesParticipating, setStatesParticipating] = useState(0);
  const [modal, setModal] = useState(null);
  const [showDatatable, setShowDatatable] = useState(false);

  const fetchData = async () => {
    try {
      //const response = await fetch('./data/non-fatal.json')
      const response = await fetch(dataUrl)
        //.then(response => response.json())
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

      let tempYearTimeframes = [];
      let addedYearTimeframes = [];

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

        setYearTimeframes(tempMonthTimeframes.slice(13));
        setMonthTimeframes(tempMonthTimeframes.slice(1)); //Remove the first month/year combo since it doesn't have a previous month
        setAllTimeframes(tempMonthTimeframes); //Remove the first month/year combo since it doesn't have a previous month
        
        setMonthCount(tempMonthTimeframes.length - 2); //Range slider animation count
        
        setSliderPointMonth(tempMonthTimeframes.slice(1).length - 1); //Default range points are the first two month
        setSliderPointYear(tempMonthTimeframes.slice(13).length - 1); //Default range points are the first two month

        const shifted = [...res.data.data];
        shifted.shift(); //Get rid of header row
        setRawData(shifted);
        
        setDataLoaded(true);
      }
    })();
  }, []);

  const applyLegendToRow = (rowObj) => {
    let hash = hashObj(rowObj)

    let idx = legendMemo.current.get(hash)

    if(runtimeLegend[idx]?.disabled) return false

    return generateColorsArray(runtimeLegend[idx]?.color)
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
      const legendColors = applyLegendToRow(stateData);
      const hexagonHTML = renderToString(<Hexagon fill={legendColors[0]} />);
      toolTipText += `<div class="state-name-row"><div>${hexagonHTML}</div><div><strong>${getStateName(geoName)}</strong></div></div><div class="significance-row">${significance}</div>`;

      if ('missing' !== selectedPercentageRaw && 'suppressed' !== selectedPercentageRaw) {
        toolTipText += `<div class="percentage-row"><div>${drugScreenOptions[currentDrug]['titlePlural']}:</div><div>${formatPercentage(selectedPercentageRaw)}</div></div>`;
      }
    }
    toolTipText += '</div>';
    return (
      [toolTipText]
    )
}

  let legendMemo = useRef(new Map())

  //Palette with reds and yellow and grays
  // let mapColorPalette = [
  //   '#A62434',
  //   '#F2594B',
  //   '#FFD97D',
  //   '#CCCCCC',
  //   '#EBEBEB',
  //   '#3690c0',
  //   '#02818a',
  //   '#016c59',
  //   '#014636'
  // ];
  //Palette with purple, orange, and grays
  let mapColorPalette = [
    '#EA6432',
    '#742867',
    '#A9A9A9',
    '#D3D3D3',
    '#F5F5F5',
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
    }
    setSelectedTimeframe(timeframe);
  };

  const generateRuntimeUSData = (data, filters = []) => {
    
    // if (!runtimeTimeframes) {
    //   return {};
    // }

    let startMonth;
    let startYear;
    let endMonth;
    let endYear;

    if ('year' === selectedTimeframe) {
      startMonth = allTimeframes[sliderPointYear+12]['month'];
      startYear = allTimeframes[sliderPointYear+12]['year'];
      endMonth = allTimeframes[sliderPointYear+13]['month'];
      endYear = allTimeframes[sliderPointYear+13]['year'];
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
  const generateRuntimeData = (data, filters = []) => {

    if (!monthTimeframes) {
      return {};
    }

    let startMonth;
    let startYear;
    let endMonth;
    let endYear;

    if ('year' === selectedTimeframe) {
      startMonth = allTimeframes[sliderPointYear + 12]['month'];
      startYear = allTimeframes[sliderPointYear + 12]['year'];
      endMonth = allTimeframes[sliderPointYear + 13]['month'];
      endYear = allTimeframes[sliderPointYear + 13]['year'];
    } else {
      startMonth = allTimeframes[sliderPointMonth]['month']; 
      startYear = allTimeframes[sliderPointMonth]['year'];
      endMonth = allTimeframes[sliderPointMonth + 1]['month'];
      endYear = allTimeframes[sliderPointMonth + 1]['year'];
    }

    let filteredData = {};

    let tempStatesParticipating = 0;
    for (const [key, value] of Object.entries(supportedStates)) {
      const rowKey = value[1] + '|' + startYear + '|' + startMonth + '|all|all:' + value[1] + '|' + endYear + '|' + endMonth + '|all|all';
      const foundRow = keyedRawData[rowKey];
      if (foundRow) {
        filteredData[key] = Object.values(foundRow);

        //Count the states that have data
        if (![legendOrder[3], legendOrder[4]].includes(foundRow[drugScreenOptions[currentDrug]['significanceColumn']])) {
          tempStatesParticipating++;
        }
      }
    }

    setStatesParticipating(tempStatesParticipating);

    return filteredData;
  };

  // Calculates what's going to be displayed on the map and data table at render.
  const generateRuntimeUSGenderData = (data, gender, filters = []) => {

    if (!monthTimeframes) {
      return {};
    }

    let startMonth;
    let startYear;
    let endMonth;
    let endYear;

    if ('year' === selectedTimeframe) {
      startMonth = allTimeframes[sliderPointYear + 12]['month'];
      startYear = allTimeframes[sliderPointYear + 12]['year'];
      endMonth = allTimeframes[sliderPointYear + 13]['month'];
      endYear = allTimeframes[sliderPointYear + 13]['year'];
    } else {
      startMonth = allTimeframes[sliderPointMonth]['month'];
      startYear = allTimeframes[sliderPointMonth]['year'];
      endMonth = allTimeframes[sliderPointMonth + 1]['month'];
      endYear = allTimeframes[sliderPointMonth + 1]['year'];
    }

    let filteredData = [];
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|M|all:US|' + endYear + '|' + endMonth + '|M|all']);
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|F|all:US|' + endYear + '|' + endMonth + '|F|all']);
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|Missing|all:US|' + endYear + '|' + endMonth + '|Missing|all']);

    return filteredData;
  };

  // Calculates what's going to be displayed on the map and data table at render.
  const generateRuntimeUSAgeData = (data, age, filters = []) => {

    if (!monthTimeframes) {
      return {};
    }

    let startMonth;
    let startYear;
    let endMonth;
    let endYear;

    if ('year' === selectedTimeframe) {
      startMonth = allTimeframes[sliderPointYear + 12]['month'];
      startYear = allTimeframes[sliderPointYear + 12]['year'];
      endMonth = allTimeframes[sliderPointYear + 13]['month'];
      endYear = allTimeframes[sliderPointYear + 13]['year'];
    } else {
      startMonth = allTimeframes[sliderPointMonth]['month'];
      startYear = allTimeframes[sliderPointMonth]['year'];
      endMonth = allTimeframes[sliderPointMonth + 1]['month'];
      endYear = allTimeframes[sliderPointMonth + 1]['year'];
    }

    let filteredData = [];
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|all|0-14:US|' + endYear + '|' + endMonth + '|all|0-14']);
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|all|15-24:US|' + endYear + '|' + endMonth + '|all|15-24']);
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|all|25-34:US|' + endYear + '|' + endMonth + '|all|25-34']);
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|all|35-54:US|' + endYear + '|' + endMonth + '|all|35-54']);
    filteredData.push(keyedRawUSData['US|' + startYear + '|' + startMonth + '|all|55+:US|' + endYear + '|' + endMonth + '|all|55+']);

    return filteredData;
  };

  useEffect(() => {
    if (true === dataLoaded) {
      const processedData = generateRuntimeData(rawData);
      const processedUSGenderData = generateRuntimeUSGenderData(rawData);
      const processedUSAgeData = generateRuntimeUSAgeData(rawData);
      const processedUSData = generateRuntimeUSData(keyedRawUSData);
      const processedLegend = generateRuntimeLegend(processedData);

      setRuntimeData(processedData);
      setRuntimeUSData(processedUSData);
      setRuntimeUSGenderData(processedUSGenderData);
      setRuntimeUSAgeData(processedUSAgeData);
      setRuntimeLegend(processedLegend);
    }
  }, [dataLoaded, sliderPointMonth, sliderPointYear, currentDrug, selectedTimeframe])
  
  const StateInfo = () => {
    let barChartKeys = ['usPercent', 'statePercent'];
    const barColors = [];
    let barChartData = [];
    const usBarColors = [];
    
    return (
      <section className="sub-drawer">
        <h3>Percent change estimates in rates of suspected overdoses per 10,000 ED visits from {fromLabel} to {toLabel}.</h3>
        <div>
          Compare United States against: <select style={{ "marginBottom": "20px" }} onChange={(e) => { setStateSelected(e.target.value) }}>
            <option value="">Select State</option>
            {Object.keys(supportedStates).map((key) => <option selected={selected===key}  value={key}>{supportedStates[key][0]}</option>)}
          </select>
        </div>
        <div className={'bar-chart-container'}>
          <div className="bar-chart">
            <DumbbellChart width={644} height={350} legendOrder={legendOrder} mapColorPalette={mapColorPalette} keyIndex={keyIndex} drugScreenOptions={drugScreenOptions} formatPercentage={formatPercentage} stateData={Object.values(runtimeData[selected])} usData={Object.values(runtimeUSData)}  />
          </div>
        </div>
      </section>
    )
  }

  const GenderAgeSection = () => {

    const genderKeys = ['malePercent', 'femalePercent'];
    const genderColorKeys = ['maleColor','femaleColor'];
    console.log(runtimeUSGenderData);
    let genderData = [];
    
    Object.values(drugScreenOptions).map((drugScreenOption, index) => {
      const drugPercentColumn = drugScreenOption['percentageColumn'];
      const drugSignificanceColumn = drugScreenOption['significanceColumn'];
      let genderBarGroupObject = {
        'index': index,
        'malePercent': '',
        'femalePercent': '',
        'type': drugScreenOption['titleAll']
      }
      runtimeUSGenderData.map((row) => {
        const gender = row['gender'];
        const significance = row[drugSignificanceColumn];
        if ('M' === gender) {
          genderBarGroupObject['malePercent'] = row[drugPercentColumn];
          genderBarGroupObject['maleSignificance'] = significance;
          genderBarGroupObject['maleColor'] = mapColorPalette[legendOrder.indexOf(significance)];
        } else if ('F' === gender) {
          genderBarGroupObject['femalePercent'] = row[drugPercentColumn];
          genderBarGroupObject['femaleSignificance'] = significance;
          genderBarGroupObject['femaleColor'] = mapColorPalette[legendOrder.indexOf(significance)];
        } else if ('Missing' === gender) {
          // barGroupObject['missingPercent'] = row[drugPercentColumn];
          // barGroupObject['missingSignificance'] = significance;
          // barGroupObject['missingColor'] = mapColorPalette[legendOrder.indexOf(significance)];
        }
      });

      genderData.push(genderBarGroupObject);
    });

    const ageKeys = ['age0to14Percent', 'age15to24Percent', 'age25to34Percent', 'age35to54Percent',  'age55PlusPercent'];
    const ageColorKeys = ['age0to14Color','age15to24Color','age25to34Color','age35to54Color','age55PlusColor'];

    let ageData = [];
    Object.values(drugScreenOptions).map((drugScreenOption, index) => {
      const drugPercentColumn = drugScreenOption['percentageColumn'];
      const drugSignificanceColumn = drugScreenOption['significanceColumn'];
      let ageBarGroupObject = {
        'index': index,
        'age0to14Percent': '',
        'age15to24Percent': '',
        'age25to34Percent': '',
        'age35to54Percent': '',
        'age55PlusPercent': '',
        'type': drugScreenOption['titleAll']
      }
      runtimeUSAgeData.map((row) => {
        const age = row['ageRange'];
        const significance = row[drugSignificanceColumn];
        if ('0-14' === age) {
          ageBarGroupObject['age0to14Percent'] = row[drugPercentColumn];
          ageBarGroupObject['age0to14Significance'] = significance;
          ageBarGroupObject['age0to14Color'] = mapColorPalette[legendOrder.indexOf(significance)];
        } else if ('15-24' === age) {
          ageBarGroupObject['age15to24Percent'] = row[drugPercentColumn];
          ageBarGroupObject['age15to24Significance'] = significance;
          ageBarGroupObject['age15to24Color'] = mapColorPalette[legendOrder.indexOf(significance)];
        } else if ('25-34' === age) {
          ageBarGroupObject['age25to34Percent'] = row[drugPercentColumn];
          ageBarGroupObject['age25to34Significance'] = significance;
          ageBarGroupObject['age25to34Color'] = mapColorPalette[legendOrder.indexOf(significance)];
        } else if ('35-54' === age) {
          ageBarGroupObject['age35to54Percent'] = row[drugPercentColumn];
          ageBarGroupObject['age35to54Significance'] = significance;
          ageBarGroupObject['age35to54Color'] = mapColorPalette[legendOrder.indexOf(significance)];
        } else if ('55+' === age) {
          ageBarGroupObject['age55PlusPercent'] = row[drugPercentColumn];
          ageBarGroupObject['age55PlusSignificance'] = significance;
          ageBarGroupObject['age55PlusColor'] = mapColorPalette[legendOrder.indexOf(significance)];
        }
      });

      ageData.push(ageBarGroupObject);
    });

    return (
      <section class="gender-age-section">
        <h3></h3>
        <div className={'bar-chart-container'}>
          <div className="bar-chart">
            <h3>Gender Comparison</h3>
            <BarChart width={644} height={350} dataKeys={genderKeys} formatPercentage={formatPercentage} data={genderData} colorKeys={genderColorKeys} />
          </div>
          <div className="bar-chart">
            <h3>Age Comparison</h3>
            <BarChart width={644} height={650} dataKeys={ageKeys} formatPercentage={formatPercentage} data={ageData} colorKeys={ageColorKeys} />
          </div>
        </div>
      </section>
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

  const getDrugTabs = () => {
    let items = [];
    for (const [key, value] of Object.entries(drugScreenOptions)) {
      items.push()
    }

  }

  const constructStateDataBite = () => {
    const selectedPercentageRaw = selected ? runtimeData[selected][keyIndex[drugScreenOptions[currentDrug]['percentageColumn']]] : false;
    let selectedPercentage = false;
    
    if ('missing' === selectedPercentageRaw) {
      return (
        <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>N/A</span>
          <div>
            <h3>{getStateName(selected)}</h3>
            <p>Data not available/reported for this jurisdiction and time range.</p>
          </div>
        </div>
      )
    } else {
      selectedPercentage = Math.round(runtimeData[selected][keyIndex[drugScreenOptions[currentDrug]['percentageColumn']]]);
      return (
        <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>{selectedPercentage}%</span>
          <div>
            <h3>{getStateName(selected)}</h3>
            <p>Percent change estimates in rates of suspected drug overdoses</p>
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
          <h3>Number of Jursidictions with a Significant Increase</h3>
          {/* <p>Some other general US statistic</p> */}
        </div>
      </div>
    );
  }

  // const animateTimeSeries = () => {
  //   //Range animation
  //   //TODO: Handle stopping of the animation when user interacts with the map
  //   for (let i = 0; i < timeframes.length - 1; i++) {
  //     setTimeout(() => {
  //       setRangePoints([i,i+1]);
  //     }, 300 * (i + 1));
  //   }
  // }

  const getPostiveSign = (number) => {
    if (number > 0) {
      return ('+');
    }
  }

  const DownloadButton = ({ data }) => {
    const fileName = `download.csv`;

    const csvData = Papa.unparse(data);

    const saveBlob = () => {
      if (typeof window.navigator.msSaveBlob === 'function') {
        const dataBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
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
        style={{'background-color':drugColor}}
      >
        Download Data (CSV)
      </a>
    )
  };

  const toggleDatatable = () => {
    setShowDatatable(!showDatatable);
  };

  const resetFilters = () => {
    setSelected(null);
  };

  const drugColor = drugScreenOptions[currentDrug].color;
  const drugColorLight = chroma(drugScreenOptions[currentDrug].color).darken(-1).hex();
  const usPercent = Math.round(runtimeUSData[drugScreenOptions[currentDrug]['percentageColumn']]);
  const significanceColumn = keyIndex[drugScreenOptions[currentDrug]['significanceColumn']];
  const percentageColumn = keyIndex[drugScreenOptions[currentDrug]['percentageColumn']];
  let runtimeTableData = Object.values(runtimeData);

  //If a state is selected, limit the datatable
  // if (selected) {
  //   runtimeTableData = runtimeTableData.filter((row) => {
  //     return selected === row[keyIndex['geo']];
  //   });
  // }

  let fromLabel;
  let toLabel;
  if ('month' === selectedTimeframe) {
    toLabel = allTimeframes[sliderPointMonth+1]['label'];
    fromLabel = allTimeframes[sliderPointMonth]['label'];
  } else {
    toLabel = allTimeframes[sliderPointYear + 12]['label'];
    fromLabel = allTimeframes[sliderPointYear + 11]['label'];
  }

  return (
    <Context.Provider value={{ applyLegendToRow, currentDrug, data: runtimeData, selected, setStateSelected, applyTooltipsToGeo, Hexagon }}>
      <div class="filters">
        <div>
          Select a Drug: <select style={{ "marginBottom": "20px" }} onChange={(e) => { setCurrentDrug(e.target.value) }}>
            {Object.keys(drugScreenOptions).map((key) => <option selected={currentDrug===key} value={key}>{drugScreenOptions[key]['titlePlural']}</option>)}
          </select>
        </div>
        <div>
          Select a Jurisdiction: <select style={{ "marginBottom": "20px" }} onChange={(e) => { setStateSelected(e.target.value) }}>
            <option value="">United States</option>
            {Object.keys(supportedStates).map((key) => <option selected={selected===key}  value={key}>{supportedStates[key][0]}</option>)}
          </select>
        </div>
      </div>
      <header style={{backgroundColor: drugColor, color: '#fff', fontFamily: 'sans-serif', padding: '.5em 1em', marginBottom: '1em'}}>
        <span style={{ textTransform: 'uppercase', fontSize: '.8em' }}>Trends in Emergency Department Visits for Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdose</span>
        <span style={{ fontSize: '1.4em', margin: 0, padding: '0', display: 'block', fontWeight: '500' }}>Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdoses</span>
      </header>
      <div className="callouts">
        {/* <HeaderLineChart width={150} height={100} lineColor={drugColor} /> */}
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{ 'color': drugColor }}>{getPostiveSign(usPercent)}{usPercent}%</span>
          <div>
            <h3>US</h3>
            <p>Percent change in suspected {drugScreenOptions[currentDrug]['titleAll']} overdose rates per 10,000 ED visits from {fromLabel} to {toLabel}</p>
          </div>
        </div>
        {selected && constructStateDataBite()}
        {!selected && constructUSSignificantIncreaseDataBite(significanceColumn)}
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{'color': drugColor}}>{statesParticipating}</span>
          <div>
            <h3>States Participating</h3>
            <p>Funded states with reported data</p>
          </div>
        </div>
      </div>
      <div style={{ 'marginBottom': '25px' }}><strong>{toLabel}</strong> compared to <strong>{fromLabel}</strong></div>
      <div className="drug-selection" style={{ borderTopColor: drugColor }}>
        {Object.keys(drugScreenOptions).map((key) => {
          return <div style={key === currentDrug ? { borderTopColor: drugColor } : {}} className={key===currentDrug ? 'active' : ''} onClick={() => setCurrentDrug(key)}>{drugScreenOptions[key]['titleAll']}</div>
        })}
      </div>
      <div className="map-container">
        <div className="map-inner-container">
          <div className="now-viewing">
            {!selected && <div><em>* Click on a state to see more.</em></div>}
            {selected && <div>Now viewing {getStateName(selected)} <span className="btn btn-reset" onClick={resetFilters}>Reset</span></div>}
          </div>
          <UsaMap/>
        </div>
        <aside>
          
          
          <div>
            <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Time Range</div>
            <div class="time-frame-container">
              <div>Compare {toLabel} with the previous: </div>
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
            <div className="range-aside-container" style={{ color: drugColor }}>
              {/* <div className="animation-controls" style={{color: drugColor}}>
                <PlayIcon onClick={animateTimeSeries}/>
              </div> */}
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
                />
              }
            </div>
          </div>
          <div>
            <div className="legend-title" style={{ 'backgroundColor': drugColor }}>Legend</div>
            <ul className="legend">
              {runtimeLegend.map(({color, value}) => <li><Hexagon fill={color} />{value}</li>)}
            </ul>
            <p>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System</p>
          </div>
        </aside>
      </div>
      {selected && <StateInfo />}
      {GenderAgeSection()}
      <div className="datatable-container">
        <h3 style={{ backgroundColor: drugColor }} onClick={toggleDatatable}>
          Monthly Trends by State - {drugScreenOptions[currentDrug]['titleAll']}
          {showDatatable && <span>{String.fromCharCode(8722)}</span>}
          {!showDatatable && <span>{String.fromCharCode(43)}</span>}
        </h3>
        {showDatatable &&
          <div className="datatable-body">
            <p className="datatable-description">CDC’s Drug Overdose Surveillance and Epidemiology (DOSE) System:* Monthly Trends<sup>†</sup> in Emergency Department Visits for Suspected {drugScreenOptions[currentDrug]['titleAll']} Overdose<sup>§</sup>, {fromLabel} to {toLabel},<sup>¶</sup> by OD2A-funded Jurisdiction</p>
            <Datatable runtimeUSData={Object.values(runtimeUSData)} applyLegendToRow={applyLegendToRow} runtimeData={runtimeTableData} Hexagon={Hexagon} keyIndex={keyIndex} significanceColumn={significanceColumn} percentageColumn={percentageColumn} supportedStates={supportedStates} drugColor={drugColorLight} />
            <DownloadButton data={rawData} />
          </div>}
      </div>
    </Context.Provider>
  );
}
