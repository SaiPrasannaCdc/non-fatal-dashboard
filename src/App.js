import React, { useState, useEffect, useRef } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa from 'papaparse';
import UsaMap from './components/UsaMap';
import BarChart from './components/BarChart';
//import HeaderLineChart from './components/HeaderLineChart';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import PlayIcon from './assets/play.svg';
import StopIcon from './assets/stop.svg';
import PauseIcon from './assets/pause.svg';

import Context from './context';
import 'rc-slider/assets/index.css';
import './styles.scss';

const STATE_COL = 'geo';
const SliderWithTooltip = createSliderWithTooltip(Slider.Range);

const generateColorsArray = (color = '#000000') => {
  let colorObj = chroma(color)

  return [
      color,
      colorObj.saturate(1.75).hex(),
      colorObj.darken(0.5).saturate(1.75).hex()
  ]
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
  'US-WY': ['Wyoming', 'WY'],
  'US-PR': ['Puerto Rico']
};

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
    'titlePlural': 'Drugs',
    'significanceColumn': 'allSignificance',
    'percentageColumn': 'allPercentageChange',
    'color': '#2B2D73',
  },
  'opioids': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'significanceColumn': 'opioidSignificance',
    'percentageColumn': 'opioidPercentageChange',
    'color': '#4A2866',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'significanceColumn': 'heroinSignificance',
    'percentageColumn': 'heroinPercentageChange',
    'color': '#353535',
  },
  'stimulants': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
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
  const [runtimeUSData, setRuntimeUSData] = useState([])
  const [selected, setSelected] = useState(null)
  const [timeframe, setTimeframe] = useState('March 2020');
  const [keyedRawData, setKeyedRawdata] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [keyedRawUSData, setKeyedRawUSdata] = useState([]); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const [keyIndex, setKeyIndex] = useState({});
  const [timeframes, setTimeframes] = useState([]);
  const [rangePoints, setRangePoints] = useState([0,1]);
  const [currentDrug, setCurrentDrug] = useState(Object.keys(drugScreenOptions)[0]);
  const [count, setCount] = useState(0);

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

  let first = true;
  let keyCounts = {};

  useEffect(() => {
    (async () => {
      setDataLoaded(false);
      let tempTimeframes = [];
      let addedTimeframes = [];
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
            if (!addedTimeframes.includes(yearMonthIndex1)) {
              tempTimeframes.push(
                {
                  'key': yearMonthIndex1,
                  'label': months[startMonth - 1] + ' ' + startYear,
                  'year': Number.parseInt(startYear),
                  'month': Number.parseInt(startMonth)
                }
              );
            }
            addedTimeframes.push(yearMonthIndex1);
            const yearMonthIndex2 = endYear + '|' + endMonth;
            if (!addedTimeframes.includes(yearMonthIndex2)) {
              tempTimeframes.push(
                {
                  'key': yearMonthIndex2,
                  'label': months[endMonth - 1] + ' ' + endYear,
                  'year': Number.parseInt(endYear),
                  'month': Number.parseInt(endMonth)
                }
              );
              addedTimeframes.push(yearMonthIndex2);
            }
          }
        });

        setKeyedRawdata(tempKeyedRawData);
        setKeyedRawUSdata(tempKeyedRawUSData);

        tempTimeframes.sort((a, b) => {
          if (a['year'] < b['year']) {
            return -1;
          } else if (a['year'] === b['year'] && a['month'] < b['month']) {
            return -1;
          } else {
            return 1;
          }
        });

        setTimeframes(tempTimeframes);
        setCount(tempTimeframes.length - 1); //Range slider animation count
        setRangePoints([0, 1]); //Default range points are the first two month

        const shifted = [...res.data.data];
        shifted.shift(); //Get rid of header row
        setRawData(shifted);
        
        //Range animation
        //TODO: Handle stopping of the animation when user interacts with the map
        for (let i = 0; i < tempTimeframes.length - 1; i++) {
          setTimeout(() => {
            setRangePoints([i,i+1]);
          }, 300 * (i + 1));
      }

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

  let legendMemo = useRef(new Map())

  const generateRuntimeLegend = (data) => {
    const newLegendMemo = new Map(); // Reset memoization

    const result = [];

    let dataSet = Object.values(data)

    const applyColorToLegend = (legendIdx) => {
      // Default to "bluegreen" color scheme if the passed color isn't valid
      let mapColorPalette = [
        '#A62434',
        '#F2594B',
        '#FFD97D',
        '#D3D3D3',
        '#F8F8F8',
        '#3690c0',
        '#02818a',
        '#016c59',
        '#014636'
      ];

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

  const handleRangeChange = (data) => {
    setRangePoints(data);
  };

  const generateRuntimeUSData = (data, filters = []) => {
    
    if (!timeframes) {
      return {};
    }

    const startMonth = timeframes[rangePoints[0]]['month'];
    const startYear = timeframes[rangePoints[0]]['year'];
    const endMonth = timeframes[rangePoints[1]]['month'];
    const endYear = timeframes[rangePoints[1]]['year'];

    const rowKey = 'US|' + startYear + '|' + startMonth + '|all|all:US|' + endYear + '|' + endMonth + '|all|all';
    return keyedRawUSData[rowKey];
  };

  // Calculates what's going to be displayed on the map and data table at render.
  const generateRuntimeData = (data, filters = []) => {

    if (!timeframes) {
      return {};
    }

    const startMonth = timeframes[rangePoints[0]]['month'];
    const startYear = timeframes[rangePoints[0]]['year'];

    const endMonth = timeframes[rangePoints[1]]['month'];
    const endYear = timeframes[rangePoints[1]]['year'];

    let filteredData = {};

    for (const [key, value] of Object.entries(supportedStates)) {
      const rowKey = value[1] + '|' + startYear + '|' + startMonth + '|all|all:' + value[1] + '|' + endYear + '|' + endMonth + '|all|all';
      const foundRow = keyedRawData[rowKey];
      if (foundRow) {
        filteredData[key] = Object.values(foundRow);
      }
    }

    return filteredData;
  };

  useEffect(() => {
    if (true === dataLoaded) {
      const processedData = generateRuntimeData(rawData);
      const processedUSData = generateRuntimeUSData(rawData);
      const processedLegend = generateRuntimeLegend(processedData);

      setRuntimeData(processedData)
      setRuntimeUSData(processedUSData)
      setRuntimeLegend(processedLegend)
    }
  }, [dataLoaded, rangePoints, currentDrug])
  
  const StateInfo = () => {
    return (
      <section className="sub-drawer">
        <a href="#" style={{textDecoration: 'none', color: '#333', position: 'absolute', right: '1em', fontSize: '1.2em', top: '.3em'}}onClick={(e) => {e.preventDefault(); setSelected(null);}}>⨉</a>
        <div className="state-info">
          <div style={{position: 'relative', zIndex: '2'}}>
            <h3>{selected}</h3>
            <p style={{maxWidth: '200px'}}>{timeframe} compared to the previous year.</p>
          </div>
          {/* <Hexagon fill="#E3D3E4" /> */}
        </div>
        <div className="bar-chart">
          <BarChart width={544} height={200} />
        </div>
      </section>
    )
  }

  const tooltipFormatter = (data) => {
    return timeframes[data]['label'];
  }

  if (!runtimeData || Object.keys(runtimeData).length === 0 || !timeframes) {
    return <h1>Loading</h1>;
  }

  const getSliderMarks = () => {
    let marks = {};
    
    //Get year marks in between beginning and end
    const lastIndex = Object.entries(timeframes).length - 1;

    let tempYear = timeframes[0].year;
    timeframes.forEach((element, index, array) => {
      if (0 === index) {
        marks[index] = element.label;
      }

      if (tempYear !== element.year) {
        marks[index] = element.year;
        tempYear = element.year;
      }

      if (lastIndex === index) {
        marks[index] = element.label;
      }
    });

    return marks;
  }

  const drugColor = drugScreenOptions[currentDrug].color;
  let usPercent = Math.round(runtimeUSData[drugScreenOptions[currentDrug]['percentageColumn']]);
  let selectedPercentage = selected ? Math.round(runtimeData[selected][keyIndex[drugScreenOptions[currentDrug]['percentageColumn']]]) : false;
  
  return (
    <Context.Provider value={{ applyLegendToRow, currentDrug, data: runtimeData, selected, setSelected }}>
      <select style={{"marginBottom":"20px"}} onChange={(e) => {setCurrentDrug(e.target.value)}}>
        {Object.keys(drugScreenOptions).map((key) => <option value={key}>{drugScreenOptions[key]['titlePlural']}</option>)}
      </select>
      <header style={{backgroundColor: drugColor, color: '#fff', fontFamily: 'sans-serif', padding: '.5em 1em', marginBottom: '1em'}}>
        <span style={{textTransform: 'uppercase', fontSize: '.8em'}}>Trends in Emergency Room Visits</span>
        <span style={{ fontSize: '1.4em', margin: 0, padding: '0', display: 'block', fontWeight: '500' }}>Suspected All {drugScreenOptions[currentDrug]['titleSingular']} Overdoses</span>
      </header>
      <div className="callouts">
        {/* <HeaderLineChart width={150} height={100} lineColor={drugColor} /> */}
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{ 'color': drugColor }}>{usPercent}%</span>
          <div>
            <h3>US</h3>
            <p>Percent change estimates in rates of suspected drug overdoses</p>
          </div>
        </div>
        {selected &&
          <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>{selectedPercentage}%</span>
            <div>
              <h3>{selected}</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
        }
        {!selected && 
          <div style={{ 'borderLeft': '5px solid' + drugColor }}>
          <span className="callout" style={{ 'color': drugColor }}>??%</span>
          <div>
            <h3>US - Something</h3>
            <p>Some other general US statistic</p>
          </div>
        </div>
        }
        <div style={{'borderLeft': '5px solid' + drugColor}}>
          <span className="callout" style={{'color': drugColor}}>XX</span>
          <div>
            <h3>Placeholder</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </div>
      <div className="range-container">
        <div style={{ 'marginBottom': '25px'}}>Select a date range: <strong>{timeframes[rangePoints[0]]['label']}</strong> &mdash; <strong>{timeframes[rangePoints[1]]['label']}</strong></div>
        <div></div>
        <div className="range-inner-container">
          <div className="animation-controls" style={{color: drugColor}}>
            <PlayIcon />
            {/* <PauseIcon />
            <StopIcon /> */}
          </div>
          <SliderWithTooltip
            tipFormatter={tooltipFormatter}
            pushable={1}
            allowCross={false}
            onChange={(e) => {handleRangeChange(e)}}
            defaultValue={rangePoints}
            min={0}
            value={rangePoints}
            //tipProps={{visible:true, overlayClassName: 'foo'}}
            align={{
              offset: [0, -5],
            }}
            max={timeframes.length - 1}
            marks={getSliderMarks()}
            handleStyle={{
              borderColor: drugColor,
              backgroundColor: drugColor,
            }}
          />
        </div>
        <div></div>
      </div>
      <div className="map-container">
        <UsaMap />
        <aside>
          {/* <div className="time-select">
            <ul>
              {timeframes.map(item => <li className={item === timeframe ? 'active' : ''} onClick={() => setTimeframe(item)}>{item}</li>)}
            </ul>
          </div> */}
          <div className="legend-title">Legend</div>
          <ul className="legend">
            {runtimeLegend.map(({color, value}) => <li><Hexagon fill={color} />{value}</li>)}
          </ul>
          <p>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System</p>
        </aside>
      </div>
      {selected && <StateInfo />}
    </Context.Provider>
  );
}
