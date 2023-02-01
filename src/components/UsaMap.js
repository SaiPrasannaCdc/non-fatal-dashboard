import React from 'react';
import { feature } from 'topojson-client';
import topoJSONPre2020 from '../data/county-map-pre-2020.json';
import topoJSONPost2020 from '../data/county-map-post-2020.json';
import { CustomProjection } from '@visx/geo';
import { scaleLinear } from '@visx/scale';
import ReactTooltip from 'react-tooltip';
import { geoAlbersUsaTerritories } from 'd3-composite-projections';

const { features: countyTopoPre2020 } = feature(topoJSONPre2020, topoJSONPre2020.objects.counties)
const { features: stateTopoPre2020 } = feature(topoJSONPre2020, topoJSONPre2020.objects.states)
const { features: countyTopoPost2020 } = feature(topoJSONPost2020, topoJSONPost2020.objects.counties)
const { features: stateTopoPost2020 } = feature(topoJSONPost2020, topoJSONPost2020.objects.states)

const stateFipsMapping = { '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY', '60': 'AS', '66': 'GU', '72': 'PR', '78': 'VI', '02': 'AK', '01': 'AL', '05': 'AR', '04': 'AZ', '06': 'CA', '08': 'CO', '09': 'CT' };
const statePositions = { 'US': { scale: 1, x: 0, y: 0 }, 'CA': { scale: 2.2, x: 0.3, y: 0, rotate: -14 }, 'AK': { scale: 4, x: 0.3, y: -0.18, rotate: 10 }, 'AL': { 'scale': 1, 'x': 0, 'y': 0 }, 'AZ': { 'scale': 1, 'x': 0, 'y': 0 }, 'AR': { 'scale': 1, 'x': 0, 'y': 0 }, 'CO': { 'scale': 4, 'x': 0.125, 'y': 0.01, rotate: -5 }, 'CT': { 'scale': 1, 'x': 0, 'y': 0 }, 'DE': { 'scale': 10, 'x': -0.28, 'y': 0.035, rotate: 12 }, 'DC': { 'scale': 1, 'x': 0, 'y': 0 }, 'FL': { 'scale': 1, 'x': 0, 'y': 0 }, 'GA': { 'scale': 5.5, 'x': -0.19, 'y': -0.09, 'rotate': 6 }, 'HI': { 'scale': 7, 'x': 0.16, 'y': -0.2 }, 'ID': { 'scale': 1, 'x': 0, 'y': 0 }, 'IL': { 'scale': 4, 'x': -0.09, 'y': 0.02, rotate: 4 }, 'IN': { 'scale': 5, 'x': -0.13, 'y': 0.03, rotate: 6 }, 'IA': { 'scale': 7, 'x': -0.04, 'y': 0.06, rotate: 2 }, 'KS': { 'scale': 6, 'x': 0.025, 'y': -0.005, rotate: -1 }, 'KY': { 'scale': 7, 'x': -0.15, 'y': -0.01, rotate: 5 }, 'LA': { 'scale': 1, 'x': 0, 'y': 0 }, 'ME': { 'scale': 1, 'x': 0, 'y': 0 }, 'MD': { 'scale': 1, 'x': 0, 'y': 0 }, 'MA': { 'scale': 1, 'x': 0, 'y': 0 }, 'MI': { 'scale': 4, 'x': -0.13, 'y': 0.1, rotate: 7 }, 'MN': { 'scale': 4, 'x': -0.02, 'y': 0.14, rotate: 1 }, 'MS': { 'scale': 5, 'x': -0.095, 'y': -0.102, rotate: 4 }, 'MO': { 'scale': 5, 'x': -0.055, 'y': -0.008, rotate: 2 }, 'MT': { 'scale': 1, 'x': 0, 'y': 0 }, 'NE': { 'scale': 5, 'x': 0.04, 'y': 0.05, 'rotate': -3 }, 'NV': { 'scale': 1, 'x': 0, 'y': 0 }, 'NH': { 'scale': 1, 'x': 0, 'y': 0 }, 'NJ': { 'scale': 1, 'x': 0, 'y': 0 }, 'NM': { 'scale': 1, 'x': 0, 'y': 0 }, 'NY': { 'scale': 5, 'x': -0.27, 'y': 0.105, 'rotate': 11 }, 'NC': { 'scale': 5, 'x': -0.23, 'y': -0.04, 'rotate': 10 }, 'ND': { 'scale': 1, 'x': 0, 'y': 0 }, 'OH': { 'scale': 1, 'x': 0, 'y': 0 }, 'OK': { 'scale': 5, 'x': 0.02, 'y': -0.06, 'rotate': -2 }, 'OR': { 'scale': 4.5, 'x': 0.3, 'y': 0.13, 'rotate': -15 }, 'PA': { 'scale': 1, 'x': 0, 'y': 0 }, 'RI': { 'scale': 14, 'x': -0.318, 'y': 0.093, 'rotate': 17 }, 'SC': { 'scale': 6, 'x': -0.22, 'y': -0.07, 'rotate': 8 }, 'SD': { 'scale': 1, 'x': 0, 'y': 0 }, 'TN': { 'scale': 1, 'x': 0, 'y': 0 }, 'TX': { 'scale': 1, 'x': 0, 'y': 0 }, 'UT': { 'scale': 4, 'x': 0.2, 'y': 0.03, 'rotate': -9 }, 'VT': { 'scale': 1, 'x': 0, 'y': 0 }, 'VA': { 'scale': 1, 'x': 0, 'y': 0 }, 'WA': { 'scale': 6, 'x': 0.28, 'y': 0.19, 'rotate': -14 }, 'WV': { 'scale': 1, 'x': 0, 'y': 0 }, 'WI': { 'scale': 5, 'x': -0.08, 'y': 0.11, 'rotate': 4 }, 'WY': { 'scale': 1, 'x': 0, 'y': 0 } };

const UsaMap = ({ params }) => {

  const { data, stateNames, currentState, currentYear, width } = params;

  if (width === 0) return <></>;

  const filteredData = data.county[currentYear];

  const isSmallViewport = width < 500;
  const fontSize = 15;
  const zeroColor = 'rgb(10, 2, 87)';
  const suppressedColor = '#999';
  const unavailableColor = '#EEE';
  const legendWidth = 200;
  const height = Math.max(width / 2, 250);
  const halfHeight = height / 2;
  const colorScaleHeight = 150;
  const colorScaleHalfHeight = colorScaleHeight / 2;
  const mapWidth = width - legendWidth;
  const statePosition = statePositions[currentState];
  const scaleFactor = (isSmallViewport ? width : mapWidth) * 1.2 * statePosition.scale;

  const values = Object.keys(filteredData).map(key => filteredData[key].rate);
  const max = Math.max(...values.filter(val => !isNaN(val)));
  const min = Math.min(...values.filter(val => !isNaN(val) && val != 0));
  const numLabelIntervals = 2;
  const numColorIntervals = 20;
  const labelIntervalWidth = (max - min) / numLabelIntervals;
  const colorIntervalWidth = (max - min) / numColorIntervals;

  let labelIntervals = [];
  for (let i = max; i >= min - 0.01; i -= labelIntervalWidth) {
    labelIntervals.push(i)
  }

  let colorIntervals = [];
  for (let i = max; i >= min; i -= colorIntervalWidth) {
    colorIntervals.push(i)
  }

  const colorScale = scaleLinear({
    domain: [min, max],
    range: ['#280E78', '#F0A53C']
  })

  const colorLegendScale = scaleLinear({
    domain: [min, max],
    range: [halfHeight + colorScaleHalfHeight, halfHeight - colorScaleHalfHeight]
  })

  const getColor = (id) => {
    if(id.length < 3) return 'transparent';
    if(!filteredData[id]) return unavailableColor;
    if(isNaN(filteredData[id].rate)) return suppressedColor;
    if(filteredData[id].rate == 0) return zeroColor;
    return colorScale(filteredData[id].rate);
  }

  const constructGeoJsx = (geographies, projection, state = false) => {
    //Not sure why this fixes box outlines around islands
    geographies.splice(914, 1);

    return geographies.map(({ centroid, feature: geo, path = '' }) => {
      if (!geo.id
        || geo.id.substring(0, 2) === '72' //Filters Puerto Rico
        || geo.id.substring(0, 2) === '78' //Filters Virgin Islands
        || geo.id.substring(0, 2) === '66' //Filters Guam
        || geo.id.substring(0, 2) === '60' //Filters American Somoa
        || (currentState !== 'US' && stateFipsMapping[geo.id.substring(0, 2)] !== currentState)) return;

      return (
        <g
          key={geo.id}
          className="geo-group"
        >
          <path
            tabIndex={-1}
            className='single-geo'
            stroke={state ? '#000' : '#777'}
            strokeWidth={state ? 1 : currentState === 'US' && isSmallViewport ? 0.1 : .5}
            fill={getColor(geo.id)}
            d={path}
            style={{ pointerEvents: geo.id.length <= 2 ? 'none' : 'default' }}
            data-tip={geo.id.length > 2 && filteredData[geo.id] ? `<h3><strong>${filteredData[geo.id].county}, ${stateNames[stateFipsMapping[geo.id.substring(0, 2)]]}</strong></h3><p><strong>Rate:</strong> ${filteredData[geo.id].rate}</p>` : undefined}
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
      <svg style={{ height, width: isSmallViewport ? width : mapWidth, display: isSmallViewport ? 'block' : 'inline-block' }} fill="none" aria-describedby="main-data-table">
        <g style={{ transform: `rotate(${statePosition.rotate || 0}deg)`, transformOrigin: `${(isSmallViewport ? width : mapWidth) / 2}px ${halfHeight}px` }}>
          <CustomProjection data={currentYear > 2020 ? countyTopoPre2020 : countyTopoPost2020} scale={scaleFactor} translate={[(isSmallViewport ? width : mapWidth) / 2 + (scaleFactor * statePosition.x), halfHeight + (scaleFactor * statePosition.y)]} projection={geoAlbersUsaTerritories}>
            {({ features, projection }) => constructGeoJsx(features, projection)}
          </CustomProjection>
          <CustomProjection data={currentYear > 2020 ? stateTopoPre2020 : stateTopoPost2020} scale={scaleFactor} translate={[(isSmallViewport ? width : mapWidth) / 2 + (scaleFactor * statePosition.x), halfHeight + (scaleFactor * statePosition.y)]} rotate={50} projection={geoAlbersUsaTerritories}>
            {({ features, projection }) => constructGeoJsx(features, projection, true)}
          </CustomProjection>
        </g>
      </svg>
      <svg style={{ height, width: isSmallViewport ? width : legendWidth, display: isSmallViewport ? 'block' : 'inline-block' }}>
        <text x={0} y={halfHeight - colorScaleHalfHeight - 35} fill="black" fontSize={fontSize}>Rate per 100,000 persons</text>
        {colorIntervals.map(value => <rect key={`color-interval-${value}`} x={0} y={colorLegendScale(value)} width={50} height={150 / colorIntervals.length} fill={colorScale(value)} />)}
        {labelIntervals.map(value => <text key={`label-interval-${value}`} x={60} y={colorLegendScale(value)} fill="black" alignmentBaseline="middle">{Math.round(value / 10) * 10}</text>)}


        <rect x={0} y={colorLegendScale(colorIntervals[colorIntervals.length - 1] - (colorIntervalWidth * 5))} width={50} height={150 / colorIntervals.length} fill={zeroColor} />
        <text x={60} y={colorLegendScale(colorIntervals[colorIntervals.length - 1] - (colorIntervalWidth * 5)) + 5} fill="black" alignmentBaseline="middle" fontSize={fontSize}>0</text>

        <rect x={0} y={colorLegendScale(colorIntervals[colorIntervals.length - 1] - (colorIntervalWidth * 8))} width={50} height={150 / colorIntervals.length} fill={suppressedColor} />
        <text x={60} y={colorLegendScale(colorIntervals[colorIntervals.length - 1] - (colorIntervalWidth * 8)) + 5} fill="black" alignmentBaseline="middle" fontSize={fontSize}>Data suppressed</text>

        <rect x={0} y={colorLegendScale(colorIntervals[colorIntervals.length - 1] - (colorIntervalWidth * 11))} width={50} height={150 / colorIntervals.length} fill={unavailableColor} />
        <text x={60} y={colorLegendScale(colorIntervals[colorIntervals.length - 1] - (colorIntervalWidth * 11)) + 5} fill="black" alignmentBaseline="middle" fontSize={fontSize}>Data not available/not reported</text>
      </svg>
    </>
  )
}

export default UsaMap
