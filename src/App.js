import React, { useState, useEffect, useRef } from 'react';

import chroma from 'chroma-js';

import UsaMap from './components/UsaMap';
import BarChart from './components/BarChart';
import HeaderLineChart from './components/HeaderLineChart';
import Context from './context';

import './styles.scss';

const PRIMARY_COL = 'Coverage Status'
const STATE_COL = 'state'

const data = [
  {
    "Insured Rate": "43",
    "Coverage Status": "Significant Increase",
    "state": "AL",
    "Year (Good filter option)": 2010,
    "link": ""
  },
  {
    "Insured Rate": "20",
    "Coverage Status": "Significant Increase",
    "state": "AL",
    "Year (Good filter option)": 2003,
    "link": ""
  },
  {
    "Insured Rate": "0",
    "Coverage Status": "No Significant Change",
    "state": "Alaska",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "72.7",
    "Coverage Status": "Significant Increase",
    "state": "Arizona",
    "Year (Good filter option)": "2010",
    "link": "#lorem"
  },
  {
    "Insured Rate": "78.7",
    "Coverage Status": "Significant Increase",
    "state": "Arkansas",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "37.2",
    "Coverage Status": "Significant Increase",
    "state": "California",
    "Year (Good filter option)": "2010",
    "link": "https://search.cdc.gov/search/?query=California&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "50.6",
    "Coverage Status": "Significant Increase",
    "state": "Colorado",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "83.2",
    "Coverage Status": "Significant Increase",
    "state": "Connecticut",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "90",
    "Coverage Status": "Significant Increase",
    "state": "Delaware",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "77",
    "Coverage Status": "Significant Increase",
    "state": "District of Columbia",
    "Year (Good filter option)": "2010",
    "link": "https://search.cdc.gov/search/index.html?query=Washington+D.C.&sitelimit=&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "83",
    "Coverage Status": "Significant Increase",
    "state": "Florida",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "83.7",
    "Coverage Status": "No Significant Change",
    "state": "Georgia",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "N/A",
    "Coverage Status": "Significant Increase",
    "state": "Hawaii",
    "Year (Good filter option)": "2010",
    "link": "https://cdc.gov/"
  },
  {
    "Insured Rate": "80.96",
    "Coverage Status": "Significant Increase",
    "state": "Idaho",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "86.9",
    "Coverage Status": "Significant Increase",
    "state": "Illinois",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "85",
    "Coverage Status": "Significant Increase",
    "state": "Indiana",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "89.6",
    "Coverage Status": "Significant Increase",
    "state": "Iowa",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "N/A",
    "Coverage Status": "Significant Increase",
    "state": "Kansas",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "0",
    "Coverage Status": "Significant Increase",
    "state": "Kentucky",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "79.2",
    "Coverage Status": "Significant Increase",
    "state": "Louisiana",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "88",
    "Coverage Status": "Significant Increase",
    "state": "Maine",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "9.1",
    "Coverage Status": "Significant Increase",
    "state": "Maryland",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "95.7",
    "Coverage Status": "Significant Increase",
    "state": "Massachusetts",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "86.1",
    "Coverage Status": "Significant Increase",
    "state": "Michigan",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "21",
    "Coverage Status": "Significant Increase",
    "state": "Minnesota",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "78.46",
    "Coverage Status": "Significant Increase",
    "state": "Mississippi",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "85",
    "Coverage Status": "Significant Increase",
    "state": "Missouri",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "81.599",
    "Coverage Status": "No Significant Change",
    "state": "Montana",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "86.3",
    "Coverage Status": "Significant Increase",
    "state": "Nebraska",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "80.3",
    "Coverage Status": "Significant Increase",
    "state": "Nevada",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "88.7",
    "Coverage Status": "Significant Increase",
    "state": "New Hampshire",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "88.5",
    "Coverage Status": "Significant Increase",
    "state": "New Jersey",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "80.96",
    "Coverage Status": "Significant Increase",
    "state": "New Mexico",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "88.6",
    "Coverage Status": "Significant Increase",
    "state": "New York",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "81",
    "Coverage Status": "No Significant Change",
    "state": "North Carolina",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "88.9",
    "Coverage Status": "Significant Increase",
    "state": "North Dakota",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "57.2",
    "Coverage Status": "Significant Increase",
    "state": "Ohio",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "80.8",
    "Coverage Status": "Significant Increase",
    "state": "Oklahoma",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "83.5",
    "Coverage Status": "Data not available",
    "state": "Oregon",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "88.5",
    "Coverage Status": "Significant Increase",
    "state": "Pennsylvania",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "87.7",
    "Coverage Status": "Data not available",
    "state": "Rhode Island",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "81.2",
    "Coverage Status": "Significant Increase",
    "state": "South Carolina",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "89.4",
    "Coverage Status": "Significant Increase",
    "state": "South Dakota",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "83.5",
    "Coverage Status": "Significant Increase",
    "state": "Tennessee",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "8",
    "Coverage Status": "Significant Increase",
    "state": "Texas",
    "Year (Good filter option)": "2010",
    "link": "https://search.cdc.gov/search/?query=Texas&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "44.1",
    "Coverage Status": "Significant Increase",
    "state": "Utah",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "45.2",
    "Coverage Status": "Data not available",
    "state": "Vermont",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "55",
    "Coverage Status": "Significant Increase",
    "state": "Virginia",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "55",
    "Coverage Status": "Significant Increase",
    "state": "Washington",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "82.5",
    "Coverage Status": "Significant Increase",
    "state": "West Virginia",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "26",
    "Coverage Status": "Significant Increase",
    "state": "Wisconsin",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "59.3",
    "Coverage Status": "Significant Increase",
    "state": "Los Angeles",
    "Year (Good filter option)": "2010",
    "link": "https://cdc.gov/"
  },
  {
    "Insured Rate": "23",
    "Coverage Status": "Significant Increase",
    "state": "Dallas",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "83.5",
    "Coverage Status": "Significant Increase",
    "state": "Wyoming",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "18",
    "Coverage Status": "Significant Increase",
    "state": "Virgin Islands",
    "Year (Good filter option)": "2010",
    "link": ""
  },
  {
    "Insured Rate": "43",
    "Coverage Status": "Significant Increase",
    "state": "PR",
    "Year (Good filter option)": "2010",
    "link": "https://cdc.gov/"
  },
  {
    "Insured Rate": "43",
    "Coverage Status": "Significant Increase",
    "state": "Alabama",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "72.7",
    "Coverage Status": "No Significant Change",
    "state": "Alaska",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "0",
    "Coverage Status": "Significant Increase",
    "state": "Arizona",
    "Year (Good filter option)": "2015",
    "link": "https://search.cdc.gov/search/?query=Arizona&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "67",
    "Coverage Status": "SIGnificant Decrease",
    "state": "Arkansas",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "29",
    "Coverage Status": "Significant Increase",
    "state": "California",
    "Year (Good filter option)": "2015",
    "link": "https://search.cdc.gov/search/?query=California&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "50.6",
    "Coverage Status": "Significant Increase",
    "state": "Colorado",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "90",
    "Coverage Status": "Significant Increase",
    "state": "Connecticut",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "83.2",
    "Coverage Status": "Significant Increase",
    "state": "Delaware",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "95",
    "Coverage Status": "Significant Increase",
    "state": "District of Columbia",
    "Year (Good filter option)": "2015",
    "link": "https://search.cdc.gov/search/index.html?query=Washington+D.C.&sitelimit=&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "95",
    "Coverage Status": "Significant Increase",
    "state": "Puerto Rico",
    "Year (Good filter option)": "2015",
    "link": "https://search.cdc.gov/search/index.html?query=Washington+D.C.&sitelimit=&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "83.7",
    "Coverage Status": "Significant Increase",
    "state": "Florida",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "83",
    "Coverage Status": "No Significant Change",
    "state": "Georgia",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "15",
    "Coverage Status": "Significant Increase",
    "state": "Hawaii",
    "Year (Good filter option)": "2015",
    "link": "https://cdc.gov/"
  },
  {
    "Insured Rate": "80.96",
    "Coverage Status": "Significant Increase",
    "state": "Idaho",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "86.9",
    "Coverage Status": "Significant Increase",
    "state": "Illinois",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "85",
    "Coverage Status": "Significant Increase",
    "state": "Indiana",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "89.6",
    "Coverage Status": "Significant Increase",
    "state": "Iowa",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "87.5",
    "Coverage Status": "Significant Increase",
    "state": "Kansas",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "83.1",
    "Coverage Status": "Significant Increase",
    "state": "Kentucky",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "79.2",
    "Coverage Status": "Significant Increase",
    "state": "Louisiana",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "88",
    "Coverage Status": "Significant Increase",
    "state": "Maine",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "9.1",
    "Coverage Status": "Significant Increase",
    "state": "Maryland",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "95.7",
    "Coverage Status": "Significant Increase",
    "state": "Massachusetts",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "86.1",
    "Coverage Status": "Significant Increase",
    "state": "Michigan",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "21",
    "Coverage Status": "Significant Increase",
    "state": "Minnesota",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "78.46",
    "Coverage Status": "Significant Increase",
    "state": "Mississippi",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "85",
    "Coverage Status": "Significant Increase",
    "state": "Missouri",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "81.599",
    "Coverage Status": "No Significant Change",
    "state": "Montana",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "86.3",
    "Coverage Status": "Significant Increase",
    "state": "Nebraska",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "80.3",
    "Coverage Status": "Significant Increase",
    "state": "Nevada",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "88.7",
    "Coverage Status": "Significant Increase",
    "state": "New Hampshire",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "88.5",
    "Coverage Status": "Significant Increase",
    "state": "New Jersey",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "80.96",
    "Coverage Status": "Significant Increase",
    "state": "New Mexico",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "88.6",
    "Coverage Status": "Significant Increase",
    "state": "New York",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "81",
    "Coverage Status": "No Significant Change",
    "state": "North Carolina",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "88.9",
    "Coverage Status": "Significant Increase",
    "state": "North Dakota",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "57.2",
    "Coverage Status": "Significant Increase",
    "state": "Ohio",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "80.8",
    "Coverage Status": "Significant Increase",
    "state": "Oklahoma",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "83.5",
    "Coverage Status": "Data not available",
    "state": "Oregon",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "88.5",
    "Coverage Status": "Significant Increase",
    "state": "Pennsylvania",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "87.7",
    "Coverage Status": "Data not available",
    "state": "Rhode Island",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "81.2",
    "Coverage Status": "Significant Increase",
    "state": "South Carolina",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "89.4",
    "Coverage Status": "Significant Increase",
    "state": "South Dakota",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "83.5",
    "Coverage Status": "Significant Increase",
    "state": "Tennessee",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "26.96",
    "Coverage Status": "Significant Increase",
    "state": "Texas",
    "Year (Good filter option)": "2015",
    "link": "https://search.cdc.gov/search/?query=Texas&utf8=%E2%9C%93&affiliate=cdc-main"
  },
  {
    "Insured Rate": "44.1",
    "Coverage Status": "Significant Increase",
    "state": "Utah",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "45.2",
    "Coverage Status": "Data not available",
    "state": "Vermont",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "27.8",
    "Coverage Status": "Significant Increase",
    "state": "Virginia",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "55",
    "Coverage Status": "Significant Increase",
    "state": "Washington",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "82.5",
    "Coverage Status": "Significant Increase",
    "state": "West Virginia",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "89.3",
    "Coverage Status": "Significant Increase",
    "state": "Wisconsin",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "59.3",
    "Coverage Status": "Significant Increase",
    "state": "Los Angeles",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "89.3",
    "Coverage Status": "Significant Increase",
    "state": "Dallas",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "83.5",
    "Coverage Status": "Significant Increase",
    "state": "Wyoming",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "18",
    "Coverage Status": "Significant Increase",
    "state": "Virgin Islands",
    "Year (Good filter option)": "2015",
    "link": ""
  },
  {
    "Insured Rate": "33.5",
    "Coverage Status": "Significant Increase",
    "state": "PR",
    "Year (Good filter option)": "2015",
    "link": "https://cdc.gov/"
  }
]

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

export default function App() {
  const [runtimeLegend, setRuntimeLegend] = useState([])
  const [runtimeData, setRuntimeData] = useState([])
  const [selected, setSelected] = useState(null)
  const [timeframe, setTimeframe] = useState('March 2020')

  const applyLegendToRow = (rowObj) => {
    let hash = hashObj(rowObj)

    let idx = legendMemo.current.get(hash)

    if(runtimeLegend[idx]?.disabled) return false

    return generateColorsArray(runtimeLegend[idx]?.color)
  }

  const timeframes = [
    'March 2020',
    'February 2020',
    'January 2020',
    'December 2019',
    'November 2019',
    'October 2019',
    'September 2019',
    'August 2019',
    'July 2019',
    'June 2019',
    'May 2019',
    'April 2019',
    'March 2019',
    'February 2019',
    'January 2019'
  ]

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
      let value = row[PRIMARY_COL]

      if(undefined === value) continue

      if(false === uniqueValues.has(value)) {
          uniqueValues.set(value, [hashObj(row)]);
      } else {
          uniqueValues.get(value).push(hashObj(row))
      }
    }

    let sorted = [...uniqueValues.keys()]

    // Apply custom sorting or regular sorting
    let configuredOrder = []

    // Coerce strings to numbers inside configuredOrder property
    for(let i = 0; i < configuredOrder.length; i++) {
        configuredOrder[i] = numberFromString(configuredOrder[i])
    }

    if(configuredOrder.length) {
        sorted.sort( (a, b) => {
            return configuredOrder.indexOf(a) - configuredOrder.indexOf(b);
        })
    } else {
        sorted.sort((a, b) => a - b)
    }

    // Add legend item for each
    sorted.forEach((val) => {
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
      const result = {}

      data.forEach(row => {
          // Filters
          if(filters.length) {
              for(let i = 0; i < filters.length; i++) {
                  const {columnName, active} = filters[i]

                  if (row[columnName] != active) return false // Bail out, not part of filter
              }
          }

          result[row[STATE_COL]] = row
      })

      return result
  }

  useEffect(() => {
    const processedData = generateRuntimeData(data)
    const processedLegend = generateRuntimeLegend(processedData)

    setRuntimeData(processedData)
    setRuntimeLegend(processedLegend)
  }, [])

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

  return (
    <Context.Provider value={{applyLegendToRow, data: runtimeData, selected, setSelected}}>
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
      <div className="map-container">
        <UsaMap />
        <aside>
          <div className="time-select">
            <ul>
              {timeframes.map(item => <li className={item === timeframe ? 'active' : ''} onClick={() => setTimeframe(item)}>{item}</li>)}
            </ul>
          </div>
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
