import React, { useState, useEffect, useRef } from 'react';
import "babel-polyfill";
import chroma from 'chroma-js';
import Papa, { readRemoteFile } from 'papaparse';
import UsaMap from './components/UsaMap';
import BarChart from './components/BarChart';
import HeaderLineChart from './components/HeaderLineChart';
import Slider, { Range, createSliderWithTooltip } from 'rc-slider';
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
  'No Significant Change',
  'Significant Decrease',
  'Data Not Available/Not Reported',
  'Unfunded State'
]

const drugScreenOptions = {
  'all': {
    'titleSingular': 'All Drug',
    'titlePlural': 'All Drugs',
    'significanceColumn': 'allSignificance',
    'color': '#',
  },
  'opioids': {
    'titleSingular': 'Opioid',
    'titlePlural': 'Opioids',
    'significanceColumn': 'opioidSignificance',
    'color': '#',
  },
  'heroin': {
    'titleSingular': 'Heroin',
    'titlePlural': 'Heroin',
    'significanceColumn': 'heroinSignificance',
    'color': '#',
  },
  'stimulants': {
    'titleSingular': 'Stimulant',
    'titlePlural': 'Stimulants',
    'significanceColumn': 'stimulantSignificance',
    'color': '#',
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

export default function App() {
  const [runtimeLegend, setRuntimeLegend] = useState([])
  const [runtimeData, setRuntimeData] = useState([])
  const [selected, setSelected] = useState(null)
  const [timeframe, setTimeframe] = useState('March 2020');
  const [keyedRawData, setKeyedRawdata] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [keyIndex, setKeyIndex] = useState({});
  const [timeframes, setTimeframes] = useState({});
  const [rangePoints, setRangePoints] = useState([]);
  const [currentDrug, setCurrentDrug] = useState(Object.keys(drugScreenOptions)[0]);

  const fetchData = async () => {
    try {
      //const response = await fetch('./data/non-fatal.json')
      const response = await fetch('http://localhost:8081/mainAggData.csv')
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

      let tempTimeframes = {};
      let res = await fetchData();
      if (res && res.success) {
        let keyedRawData = {};
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
            keyedRawData[row[keyIndex['key']]] = obj;

            const startMonth = row[keyIndex['startMonth']];
            const startYear = row[keyIndex['startYear']];
            const endMonth = row[keyIndex['endMonth']];
            const endYear = row[keyIndex['endYear']];

            const yearMonthIndex1 = startYear + '|' + startMonth;
            if (!tempTimeframes.hasOwnProperty(yearMonthIndex1)) {
              tempTimeframes[yearMonthIndex1] = months[startMonth - 1] + ' ' + startYear;
            }
            const yearMonthIndex2 = endYear + '|' + endMonth;
            if (!tempTimeframes.hasOwnProperty(yearMonthIndex2)) {
              tempTimeframes[yearMonthIndex2] = months[endMonth - 1] + ' ' + endYear;
            }
          }
        });
        setKeyedRawdata(keyedRawData);
        setTimeframes(tempTimeframes);
        setRangePoints([Object.keys(tempTimeframes).length-2, Object.keys(tempTimeframes).length-1]);

        const shifted = [...res.data.data];
        shifted.shift();
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

  // const timeframes = [
  //   'March 2020',
  //   'February 2020',
  //   'January 2020',
  //   'December 2019',
  //   'November 2019',
  //   'October 2019',
  //   'September 2019',
  //   'August 2019',
  //   'July 2019',
  //   'June 2019',
  //   'May 2019',
  //   'April 2019',
  //   'March 2019',
  //   'February 2019',
  //   'January 2019'
  // ]

  let legendMemo = useRef(new Map())

  const generateRuntimeLegend = (data) => {
    const newLegendMemo = new Map(); // Reset memoization

    const result = [];

    let dataSet = Object.values(data)

    const applyColorToLegend = (legendIdx) => {
      // Default to "bluegreen" color scheme if the passed color isn't valid
      let mapColorPalette = [
        '#EF6E2E',
        '#802C74',
        '#313380',
        '#BBD2EB',
        '#E4CEE1',
        '#3690c0',
        '#02818a',
        '#016c59',
        '#014636'
      ]

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

    // // Apply custom sorting or regular sorting
    // let configuredOrder = []

    // // Coerce strings to numbers inside configuredOrder property
    // for(let i = 0; i < configuredOrder.length; i++) {
    //     configuredOrder[i] = numberFromString(configuredOrder[i])
    // }

    // if(configuredOrder.length) {
    //     sorted.sort( (a, b) => {
    //         return configuredOrder.indexOf(a) - configuredOrder.indexOf(b);
    //     })
    // } else {
    //     sorted.sort((a, b) => a - b)
    // }

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

  // Calculates what's going to be displayed on the map and data table at render.
  const generateRuntimeData = (data, filters = []) => {
    const startTimeframe = Object.keys(timeframes)[rangePoints[0]].split('|');
    const startMonth = startTimeframe[1];
    const startYear = startTimeframe[0];;

    const endTimeframe = Object.keys(timeframes)[rangePoints[1]].split('|');
    const endMonth = endTimeframe[1];;
    const endYear = endTimeframe[0];;

    let filteredData = {};
    for (const [key, value] of Object.entries(supportedStates)) {
      const rowKey = value[1] + '|' + startYear + '|' + startMonth + '|all|all:' + value[1] + '|' + endYear + '|' + endMonth + '|all|all';
      const foundRow = keyedRawData[rowKey];
      if (foundRow) {
        filteredData[key] = Object.values(foundRow);
      }
    }

      // data.forEach(row => {
      //     // Filters
      //     if(filters.length) {
      //         for(let i = 0; i < filters.length; i++) {
      //             const {columnName, active} = filters[i]

      //             if (row[columnName] != active) return false // Bail out, not part of filter
      //         }
      //     }
      //     result[row[keyIndex[STATE_COL]]] = row
      // })

    return filteredData;
  }

  useEffect(() => {
    if (true === dataLoaded) {
      const processedData = generateRuntimeData(rawData);
      const processedLegend = generateRuntimeLegend(processedData);

      setRuntimeData(processedData)
      setRuntimeLegend(processedLegend)
    }
  }, [dataLoaded,rangePoints,currentDrug])

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
    return timeframes[Object.keys(timeframes)[data]];
  }

  if (!runtimeData || Object.keys(runtimeData).length === 0) {
    return <h1>Loading</h1>;
  }

  return (
    <Context.Provider value={{ applyLegendToRow, currentDrug, data: runtimeData, selected, setSelected }}>
      <select onChange={(e) => {setCurrentDrug(e.target.value)}}>
        {Object.keys(drugScreenOptions).map((key) => <option value={key}>{drugScreenOptions[key]['titlePlural']}</option>)}
      </select>
      <header className="theme-purple" style={{backgroundColor: '#712177', color: '#fff', fontFamily: 'sans-serif', padding: '.5em 1em', marginBottom: '1em'}}>
        <span style={{textTransform: 'uppercase', fontSize: '.8em'}}>Trends in Emergency Room Visits</span>
        <span style={{fontSize: '1.4em', margin: 0, padding: '0', display: 'block', fontWeight: '500'}}>Suspected Drug Overdoses</span>
      </header>
      <div className="callouts">
        <div>
          <HeaderLineChart width={150} height={100} />
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div>
          <span className="callout">75%</span>
          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
        <div>
          <span className="callout">23%</span>
          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </div>
      <div className="range-container">
      <SliderWithTooltip
          tipFormatter={tooltipFormatter}
          tipProps={{ overlayClassName: 'foo' }}
          pushable={1}
          allowCross={false}
          onChange={setRangePoints}
          defaultValue={rangePoints}
          min={0}
          align={{
            offset: [0, -5],
          }}
          max={Object.keys(timeframes).length - 1}
          //handle={SliderHandle}
      />
        {/* <Range
          pushable={1}
          allowCross={false}
          onChange={setRangePoints}
          defaultValue={rangePoints}
          min={0}
          max={Object.keys(timeframes).length-1}
        /> */}
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
