import React, { useState, Fragment } from 'react';
import { feature } from 'topojson-client';
import topoJSONPre2020 from '../data/county-map-pre-2020.json';
import topoJSONPost2020 from '../data/county-map-post-2020.json';
import { CustomProjection } from '@visx/geo';
import { scaleLinear } from '@visx/scale';
import ReactTooltip from 'react-tooltip';
import { geoAlbersUsaTerritories } from 'd3-composite-projections';
import { UtilityFunctions } from '../utility'

const { features: stateTopoPre2020 } = feature(topoJSONPre2020, topoJSONPre2020.objects.states)
const { features: stateTopoPost2020 } = feature(topoJSONPost2020, topoJSONPost2020.objects.states)

const stateFipsMapping = { '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY', '60': 'AS', '66': 'GU', '72': 'PR', '78': 'VI', '02': 'AK', '01': 'AL', '05': 'AR', '04': 'AZ', '06': 'CA', '08': 'CO', '09': 'CT' };
const statePositions = { 'US': { scale: 1, x: 0, y: 0 }, 'CA': { scale: 2.2, x: 0.3, y: 0, rotate: -14 }, 'AK': { scale: 4, x: 0.3, y: -0.18, rotate: 10 }, 'AL': { 'scale': 1, 'x': 0, 'y': 0 },'AZ': { 'scale': 2, 'x': 0.2, 'y': -0.1 }, 'AR': { 'scale': 1, 'x': 0, 'y': 0 }, 'CO': { 'scale': 4, 'x': 0.125, 'y': 0.01, rotate: -5 }, 'CT': { 'scale': 1, 'x': 0, 'y': 0 }, 'DE': { 'scale': 10, 'x': -0.28, 'y': 0.035, rotate: 12 }, 'DC': { 'scale': 20, 'x': -0.26, 'y': 0.025 }, 'FL': { 'scale': 3, 'x': -0.19, 'y': -0.19 }, 'GA': { 'scale': 5.5, 'x': -0.19, 'y': -0.09, 'rotate': 6 }, 'HI': { 'scale': 4, 'x': 0.16, 'y': -0.215 }, 'ID': { 'scale': 1, 'x': 0, 'y': 0 }, 'IL': { 'scale': 4, 'x': -0.09, 'y': 0.02, rotate: 4 }, 'IN': { 'scale': 5, 'x': -0.13, 'y': 0.03, rotate: 6 }, 'IA': { 'scale': 7, 'x': -0.04, 'y': 0.06, rotate: 2 }, 'KS': { 'scale': 6, 'x': 0.025, 'y': -0.005, rotate: -1 }, 'KY': { 'scale': 7, 'x': -0.15, 'y': -0.01, rotate: 5 }, 'LA': { 'scale': 3, 'x': -0.05, 'y': -0.15 }, 'ME': { 'scale': 1, 'x': 0, 'y': 0 }, 'MD': { 'scale': 6, 'x': -0.25, 'y': 0.02 }, 'MA': { 'scale': 1, 'x': 0, 'y': 0 }, 'MI': { 'scale': 4, 'x': -0.13, 'y': 0.1, rotate: 7 }, 'MN': { 'scale': 4, 'x': -0.02, 'y': 0.14, rotate: 1 }, 'MS': { 'scale': 5, 'x': -0.095, 'y': -0.102, rotate: 4 }, 'MO': { 'scale': 5, 'x': -0.055, 'y': -0.008, rotate: 2 }, 'MT': { 'scale': 3, 'x': 0.15, 'y': 0.15 }, 'NE': { 'scale': 5, 'x': 0.04, 'y': 0.05, 'rotate': -3 }, 'NV': { 'scale': 1, 'x': 0, 'y': 0 }, 'NH': { 'scale': 1, 'x': 0, 'y': 0 }, 'NJ': { 'scale': 7, 'x': -0.285, 'y': 0.05 }, 'NM': { 'scale': 1, 'x': 0, 'y': 0 }, 'NY': { 'scale': 5, 'x': -0.27, 'y': 0.105, 'rotate': 11 }, 'NC': { 'scale': 5, 'x': -0.23, 'y': -0.04, 'rotate': 10 }, 'ND': { 'scale': 1, 'x': 0, 'y': 0 }, 'OH': { 'scale': 1, 'x': 0, 'y': 0 }, 'OK': { 'scale': 5, 'x': 0.02, 'y': -0.06, 'rotate': -2 }, 'OR': { 'scale': 4.5, 'x': 0.3, 'y': 0.13, 'rotate': -15 }, 'PA': { 'scale': 1, 'x': 0, 'y': 0 }, 'RI': { 'scale': 14, 'x': -0.318, 'y': 0.093, 'rotate': 17 }, 'SC': { 'scale': 6, 'x': -0.22, 'y': -0.07, 'rotate': 8 }, 'SD': { 'scale': 1, 'x': 0, 'y': 0 }, 'TN': { 'scale': 1, 'x': 0, 'y': 0 }, 'TX': { 'scale': 1.75, 'x': 0.05, 'y': -0.135 }, 'UT': { 'scale': 4, 'x': 0.2, 'y': 0.03, 'rotate': -9 }, 'VT': { 'scale': 1, 'x': 0, 'y': 0 }, 'VA': { 'scale': 1, 'x': 0, 'y': 0 }, 'WA': { 'scale': 6, 'x': 0.28, 'y': 0.19, 'rotate': -14 }, 'WV': { 'scale': 1, 'x': 0, 'y': 0 }, 'WI': { 'scale': 5, 'x': -0.08, 'y': 0.11, 'rotate': 4 }, 'WY': { 'scale': 1, 'x': 0, 'y': 0 } };

const defaultValueIfEmpty = (v, df) => {
    if (v && v != '') return v;

    else return df;
}

const getYearlyData = (data, yr, drug, st) => {
    var yr_drug_total = 0;
    var yr_total = 0;

    for(let i=0;i<data.length;i++) {
      if (data[i].YYYYMM?.substring(0,4) == yr)
      {
        if (data[i].geoid == st)
        {
          switch (drug) {
            case 'all':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_drug_OD_n);
              break;
            case 'benzodiazepine':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_Benzo_OD_n);
              break;
            case 'opioids':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_opioid_OD_n);
              break;
            case 'fentanyl':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n);
              break;
            case 'heroin':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_heroin_OD_n);
              break;
            case 'stimulants':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_stimulant_OD_n);
              break;
            case 'cocaine':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n);
              break;
            case 'methamphetamine':
              yr_drug_total = yr_drug_total + UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n);
              break;
          }
        }
      }
     }
     return String(((yr_drug_total/yr_total) * 10000).toFixed(2));
}

const getMonthlyData = (data, yrmon, drug, st) => {
    var month_drug = 0;

    for(let i=0;i<data.length;i++) {
      if (data[i].YYYYMM == yrmon)
      {
        if (data[i].geoid == st)
        {
          switch (drug) {
            case 'all':
              month_drug = month_drug + Number((UtilityFunctions.convertValue(data[i].total_drug_OD_n)));
              break;
            case 'benzodiazepine':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_Benzo_OD_n));
              break;
            case 'opioids':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_opioid_OD_n));
              break;
            case 'fentanyl':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_Fentanyl_OD_n));
              break;
            case 'heroin':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_heroin_OD_n));
              break;
            case 'stimulants':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_stimulant_OD_n));
              break;
            case 'cocaine':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_Cocaine_OD_n));
              break;
            case 'methamphetamine':
              month_drug = month_drug + Number(UtilityFunctions.convertValue(data[i].total_Methamphetamine_OD_n));
              break;
          }
        }
      }
    }
    return String(Number(month_drug).toFixed(1));
}

const getFilteredData = (data, currentTimeLine, currentYear, currentMonth, currentDrug, jurisdictions) => {

  var yrData = {};
  var monthData = {};

    var yyyymm = currentYear + currentMonth.padStart(2, '0');
    var retVal = 0; 

    for(let i=0;i<Object.keys(jurisdictions).length;i++) {
      var st = Object.keys(jurisdictions)[i];
      retVal = getMonthlyData(data, yyyymm, currentDrug, st);
      monthData[st] = retVal;
    }

    return monthData;
     
};

const UsaMap = (params) => {

  const { data, stateNames, currentState, currentYear, currentMonth, currentTimeLine, width, drugOptions, jurisdictions, onData } = params;
  
  const [selectedDrugsMap, setselectedDrugsMap] = useState(['all']);

  if (width === 0) return <></>;

  const filteredData = getFilteredData(data, currentTimeLine, currentYear, currentMonth, selectedDrugsMap[0], jurisdictions); 

  const isSmallViewport = width < 500;
  const fontSize = 15;
  const suppressedColor = 'url(#pattern_KJD3DK2)';
  const unavailableColor = '#C9C9C9';
  const unfundedColor = '#FFFFFF';
  const legendWidth = 240;
  const height = Math.max(width / 2, 250);
  const legendHeight = Math.max(width / 2, 350);
  const halfHeight = height / 2;
  const colorScaleHeight = 150;
  const colorScaleHalfHeight = colorScaleHeight / 2;
  const mapWidth = width - legendWidth;
  const statePosition = statePositions[currentState];
  const scaleFactor = (isSmallViewport ? width : mapWidth) * 1.2 * statePosition.scale;

  const values = Object.keys(filteredData).map(key => filteredData[key]);

  const max = Math.max(...values.filter(val => !isNaN(val) && val > 0));
  const min = Math.min(...values.filter(val => !isNaN(val) && val > 0));
  const intervals = 5;
  const intervalWidth = ((max) / intervals).toFixed(4);

  let labelIntervals = [];
  let colorIntervals = [];
  for (let i = 0; i < 5; i++) {
    let val = i == 0 ? max : (max - (intervalWidth) * (i))
    labelIntervals.push( i != 4 ? (String((Number(val < 0 ? 0.0001 : val) - intervalWidth + 0.1).toFixed(1) + ' - ' + String(Number(val < 0 ? 0.0001 : val).toFixed(1)))) : ('0.0 - ' + String(Number(val < 0 ? 0.0001 : val).toFixed(1))))
    colorIntervals.push(Number(val < 0 ? 0.0001 : val).toFixed(1))
  }

  const colorScale = scaleLinear({
    domain: [min, max],
    range: [UtilityFunctions.getSeriesColorStart(selectedDrugsMap[0], 'US'), UtilityFunctions.getSeriesColor(selectedDrugsMap[0], 'US')]
  })

  const colorLegendScale = scaleLinear({
    domain: [min, max],
    range: [halfHeight + colorScaleHalfHeight, halfHeight - colorScaleHalfHeight]
  })

  const getColor = (id) => {

    if (filteredData[stateFipsMapping[id]] == '-2.0') return unfundedColor; 
    if(filteredData[stateFipsMapping[id]] == '-1.0') return unavailableColor;
    if(filteredData[stateFipsMapping[id]] == '0.0') return suppressedColor;
    return colorScale(filteredData[stateFipsMapping[id]]);
  }

  const getDCCordinates = (proj) => {
    var dcCoordinates = [-77.009056, 38.889805]; 
    var projectedCoordinates = proj(dcCoordinates);
    return projectedCoordinates;
  }

  const getRateHTML = (geoId) => {
    return '<span>' + (filteredData[stateFipsMapping[geoId.substring(0, 2)]]  == '0.0' ? 'Data Suppressed' : filteredData[stateFipsMapping[geoId.substring(0, 2)]]) + '</span></br>'
  }

  const getTooltipFragment = (geoId) => {

    var presentState = stateFipsMapping[geoId.substring(0, 2)];
    var heading = '<div class="alignCenterTT"><h2 class="borderBottomLine blackFont" style="margin: 0; padding: 0;"><strong>' + `${stateNames[presentState]}` + '</br></strong></h2></div>'; 
    var rateStr;

    if (Number(filteredData[stateFipsMapping[geoId.substring(0, 2)]]) > 0)
       rateStr = `<table><tr><td><p><strong>` + getRateHTML(geoId) + `</strong>` + '</p></td></tr><tr><td><span>overdoses per 10,000 ED visits</span></td></tr></table>';
    else if (Number(filteredData[stateFipsMapping[geoId.substring(0, 2)]]) == 0)
       rateStr = `<table><tr><td><p><strong>` + getRateHTML(geoId) + `</strong>` + '</p></td></tr></table>';
    else {
      if (filteredData[stateFipsMapping[geoId.substring(0, 2)]] == '-1.0')
        rateStr = `<table><tr><td><p><strong>Data Not Available</strong>` + '</p></td></tr></table>';
      else if (filteredData[stateFipsMapping[geoId.substring(0, 2)]] == '-2.0')
        rateStr = `<table><tr><td><p><strong>Unfunded State</strong>` + '</p></td></tr></table>';
    }
      
    return heading + '<table class="tooltipTableUS"><tr><td><div class="containerTT">' + rateStr + '</div></td></tr></table>'
  }

  const handleDrugSelectionsMapChange = (event, drug) => {
    setselectedDrugsMap([drug])
    onData(drug);
  }

  const getDrugControls = () => {
    const entries = Object.entries(drugOptions);
    entries.sort((a, b) => a[1].lineChartOrder - b[1].lineChartOrder);

    return (
      <Fragment>
        <Fragment>
          <div style={{width: '100%!important', float: 'left', display: 'inline-block'}}>
          {
            entries.map((drug, index) => (
              <div>
                <div class={`drugDiv-${drug[0]}`}>
                  <span class={(selectedDrugsMap.includes(drug[0])) ? drug[0] : 'notSelectedMap'} onClick={(event) => { handleDrugSelectionsMapChange(event, drug[0]) }}></span>
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

  const constructGeoJsx = (geographies, projection, state = false) => {

    //Not sure why this fixes box outlines around islands
    geographies.splice(914, 1);

    return geographies.map(({ centroid, feature: geo, path = '' }) => {
    
      if (!geo.id
        || geo.id.substring(0, 2) === '69' //Filters islands west coast
        || geo.id.substring(0, 2) === '72' //Filters Puerto Rico
        || geo.id.substring(0, 2) === '72' //Filters Puerto Rico
        || geo.id.substring(0, 2) === '78' //Filters Virgin Islands
        || geo.id.substring(0, 2) === '66' //Filters Guam
        || geo.id.substring(0, 2) === '60' //Filters American Somoa
        || (currentState !== 'US' && stateFipsMapping[geo.id.substring(0, 2)] !== currentState)) return;

      if (geo.id == '11')
        return (
      <g
          key={geo.id}
          className="geo-group"
        >
         <circle cx={getDCCordinates(projection)[0]} cy={getDCCordinates(projection)[1]} r="5" stroke={drugOptions[selectedDrugsMap[0]].color} stroke-width="2.1" fill={'none'}/>
          <path
            tabIndex={-1}
            className='single-geo'
            stroke={''}
            strokeWidth={state ? 5 : currentState === 'US' && isSmallViewport ? 0.1 : .5}
            fill= {getColor(geo.id)}
            d={path}
            style={{ pointerEvents: geo.id.length <= 2 ? 'default' : 'default' }}
            data-tip={geo.id.length > 2 && filteredData[geo.id] ? getTooltipFragment(geo.id) : getTooltipFragment(geo.id)}
          />
          <line x1={getDCCordinates(projection)[0] + 6} y1={getDCCordinates(projection)[1] + 2} x2={getDCCordinates(projection)[0] + 70} y2={getDCCordinates(projection)[1]} stroke="black" stroke-width="1"/>
          <text x={getDCCordinates(projection)[0] + 75} y={getDCCordinates(projection)[1]} fill="black" alignmentBaseline="middle" fontWeight={'bold'} fontSize={12}>DC</text>
        </g>
      )

      return (
        <g
          key={geo.id}
          className="geo-group"
        >
         <path
            tabIndex={-1}
            className='single-geo'
            stroke={'#000'}
            strokeWidth={state ? 1 : currentState === 'US' && isSmallViewport ? 0.1 : .5}
            fill= {getColor(geo.id)}
            d={path}
            style={{ pointerEvents: geo.id.length <= 2 ? 'default' : 'default' }}
            data-tip={geo.id.length > 2 && filteredData[geo.id] ? getTooltipFragment(geo.id) : getTooltipFragment(geo.id)}
          />
        </g>
      )
    });
  };

  return (
    <>
      <ReactTooltip
        place="top"
        type="light"
        html={true}
        className="tooltip"
      />
      <br></br>
      <table style={{width: '100%'}}>
        <tr>
          <td style={{width: '79%', verticalAlign: 'top'}} >
              <svg style={{ height, width: isSmallViewport ? width : mapWidth, display: isSmallViewport ? 'block' : 'inline-block' }} fill="none" aria-describedby="main-data-table">
                <defs>
                  <pattern id="pattern_KJD3DK2" patternUnits="userSpaceOnUse" width="9.5" height="9.5" patternTransform="rotate(45)">
                    <line x1="0" y="0" x2="0" y2="9.5" stroke="#0C0824" style={{ strokeWidth: 2 }} />
                  </pattern>
                </defs>
              <g style={{ transform: `rotate(${statePosition.rotate || 0}deg)`, transformOrigin: `${(isSmallViewport ? width : mapWidth) / 2}px ${halfHeight}px` }}>
                <CustomProjection data={currentYear > 2020 ? stateTopoPre2020 : stateTopoPost2020} scale={scaleFactor} translate={[(isSmallViewport ? width : mapWidth) / 2 + (scaleFactor * statePosition.x), halfHeight + (scaleFactor * statePosition.y)]} rotate={50} projection={geoAlbersUsaTerritories}>
                  {({ features, projection }) => constructGeoJsx(features, projection, true)}
                </CustomProjection>
              </g>
              
            </svg>
            <div style={{'paddingLeft': '200px'}}><span><small><i><sup>†</sup>Scale of the figure may change based on the data selected. </i></small></span></div>
          </td>
          <td style={{width: '21%'}}>
            <table>
              <br></br>
              <tr>
                <td style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
                <div style={{'fontWeight': 'bold'}} className="select-input">Select Drug Syndrome:</div>
                <div className="select-input"><em>Click One</em></div>
                <div>&nbsp;</div>
                <div>
                  {getDrugControls()}
                </div>
                  
                </td>
              </tr>
              <br></br>
              <tr>
                <td>
                  <table style={{'border':'solid 2px gray', 'padding':'10px', 'borderRadius': '10px'}}>
                    <tr>
                      <td>
                        <label style={{'fontSize':'16px'}}>Suspected Nonfatal </label>
                        <label style={{'fontSize':'16px'}}>Overdoses per 10,000 </label>
                        <label style={{'fontSize':'16px'}}>Total ED Visits</label>
                      </td>
                    </tr>
                    {!UtilityFunctions.allDataIsSupressedMap(filteredData) && 
                    <tr>
                      <td>
                          <svg style={{ height: legendHeight - 390, width: isSmallViewport ? width : legendWidth, display: isSmallViewport ? 'block' : 'inline-block' }}>
                            {colorIntervals.map((value, idx) => value != 'NaN' && <rect key={`color-interval-${value}`} x={0} y={idx == 0 ? 15 : (15 + (idx * 30))} width={50} height={150 / colorIntervals.length} fill={colorScale(value)} />)}
                            {labelIntervals.map((value, idx) => value != 'NaN' && <text key={`label-interval-${value}`} x={60} y={idx == 0 ? 28 : (28 + (idx * 30))} fill="black" alignmentBaseline="middle">{value}</text>)}
                        </svg>
                      </td>
                    </tr>
                    }
                    <tr>
                      <td>
                        <svg style={{ height: 90, width: isSmallViewport ? width : legendWidth, display: isSmallViewport ? 'block' : 'inline-block' }}>
                            <rect x={0} y={15} width={50} height={10} fill={suppressedColor} style={{ strokeWidth: '1', stroke: 'gray'}}/>
                            <text x={60} y={20} fill="black" alignmentBaseline="middle" fontSize={12}>Data suppressed</text>

                            <rect x={0} y={30} width={50} height={10} fill={unavailableColor} style={{ strokeWidth: '1', stroke: 'gray'}}/>
                            <text x={60} y={35} fill="black" alignmentBaseline="middle" fontSize={12}>Data not available/</text>
                            <text x={60} y={52} fill="black" alignmentBaseline="middle" fontSize={12}>not reported</text>

                            <rect x={0} y={62} width={50} height={10} fill={unfundedColor} style={{ strokeWidth: '1', stroke: 'gray'}}/>
                            <text x={60} y={67} fill="black" alignmentBaseline="middle" fontSize={12}>Unfunded State</text>
                        </svg>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
              
          </td>
        </tr>
      </table>
      
      
    </>
  )
}

export default UsaMap
