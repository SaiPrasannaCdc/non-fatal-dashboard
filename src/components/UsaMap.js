import React, { useContext } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/react'
import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import topoJSON from '../data/county-map.json';
import chroma from 'chroma-js';
import { CustomProjection } from '@visx/geo';
import { scaleLinear } from '@visx/scale';
import ReactTooltip from 'react-tooltip';
import { geoAlbersUsaTerritories } from 'd3-composite-projections';

import Context from '../context';

const { features: countyTopo } = feature(topoJSON, topoJSON.objects.counties)
const { features: stateTopo } = feature(topoJSON, topoJSON.objects.states)

const UsaMap = () => {

  const { data, currentYear } = useContext(Context);

  const filteredData = data.county[currentYear];

  const width = 880;
  const height = 500;

  const values = Object.keys(filteredData).map(key => filteredData[key].rate);
  const max = Math.max(...values.filter(val => !isNaN(val)));
  const min = Math.min(...values.filter(val => !isNaN(val)));
  const numLabelIntervals = 2;
  const numColorIntervals = 20;
  const labelIntervalWidth = (max - min) / numLabelIntervals;
  const colorIntervalWidth = (max - min) / numColorIntervals;
  const legendWidth = 200;

  let labelIntervals = [];
  for(let i = max; i >= min - 0.01; i -= labelIntervalWidth){
    labelIntervals.push(i)
  }
  
  let colorIntervals = [];
  for(let i = max; i >= min; i -= colorIntervalWidth){
    colorIntervals.push(i)
  }

  const colorScale = scaleLinear({
    domain: [min, max],
    range: ['#280E78', '#F0A53C']
  })

  const colorLegendScale = scaleLinear({
    domain: [min, max],
    range: [300, 150]
  })

  const constructGeoJsx = (geographies, projection, state = false) => {
    //Not sure why this fixes box outlines around islands
    geographies.splice(914, 1);

    return geographies.map(({ centroid, feature: geo, path = '' }) => {
      if(!geo.id) return;

      return (
        <g
          key={geo.id}
          className="geo-group"
        >
          <path
            tabIndex={-1}
            className='single-geo'
            stroke={state ? '#000' : '#777'}
            strokeWidth={state ? 1 : .5}
            fill={filteredData[geo.id] ? (isNaN(filteredData[geo.id].rate) ? '#666' : colorScale(filteredData[geo.id].rate)) : 'transparent'}
            d={path}
            style={{pointerEvents: geo.id.length <= 2 ? 'none' : 'default'}}
            data-tip={geo.id.length > 2 && filteredData[geo.id] ? `<h3><strong>${filteredData[geo.id].county}</strong></h3><p><strong>Rate:</strong> ${filteredData[geo.id].rate}</p>` : undefined}
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
      <svg viewBox={`0 0 ${width} ${height}`} fill="none" aria-describedby="main-data-table">
        <CustomProjection data={countyTopo} scale={(1 - (legendWidth / width)) * 1000} translate={[(width / 2) - (legendWidth / 2), height / 2]} projection={geoAlbersUsaTerritories}>
          {({ features, projection }) => constructGeoJsx(features, projection)}
        </CustomProjection>
        <CustomProjection data={stateTopo} scale={(1 - (legendWidth / width)) * 1000} translate={[(width / 2) - (legendWidth / 2), height / 2]} projection={geoAlbersUsaTerritories}>
          {({ features, projection }) => constructGeoJsx(features, projection, true)}
        </CustomProjection>
        <text x={width - legendWidth} y={100} fill="black" fontSize={12}>Rate per 100,000 population</text>
        {colorIntervals.map(value => <rect x={width - legendWidth} y={colorLegendScale(value)} width={50} height={150 / colorIntervals.length} fill={colorScale(value)} />)}
        {labelIntervals.map((value, i) => <text x={width - legendWidth + 60} y={colorLegendScale(value)} fill="black" alignmentBaseline="middle">{Math.round(value / 10) * 10}</text>)}
      </svg>
    </>
  )
}

export default UsaMap
