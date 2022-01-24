import React, { useContext } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/react'
import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import hexTopoJSON from '../data/hex-topo.json';
import chroma from 'chroma-js';
import { Mercator } from '@visx/geo';
import ReactTooltip from 'react-tooltip';

import Context from '../context';

const { features: unitedStatesHex } = feature(hexTopoJSON, hexTopoJSON.objects.states)

const offsets = {
  'US-VT': [50, -8],
  'US-NH': [34, 2],
  'US-MA': [30, -1],
  'US-RI': [28, 2],
  'US-CT': [35, 10],
  'US-NJ': [42, 1],
  'US-DE': [33, 0],
  'US-MD': [47, 10]
};

const nudges = {
  'US-FL': [15, 3],
  'US-AK': [0, -8],
  'US-CA': [-10, 0],
  'US-NY': [5, 0],
  'US-MI': [13, 20],
  'US-LA': [-10, -3],
  'US-HI': [-10, 10],
  'US-ID': [0, 10],
  'US-WV': [-2, 2]
}

const UsaMap = () => {
  const { data, applyLegendToRow, setStateSelected, selected, applyTooltipsToGeo, supportedStates } = useContext(Context);
  
  const geoLabel = (geo, bgColor = "#FFFFFF", projection) => {
    let centroid = projection(geoCentroid(geo))
    let abbr = geo.properties.iso

    if(undefined === abbr) return null

    let textColor = "#FFF"

    // Dynamic text color
    if (chroma.contrast(textColor, bgColor) < 2.5 ) {
      textColor = '#202020';
    }

    let x = 0, y = 5

    return (
      <g transform={`translate(${centroid})`}>
        <text x={x} y={y} fontSize={16} strokeWidth="0" style={{fill: textColor, fontFamily: 'sans-serif'}} textAnchor="middle">
          {abbr.substring(3)}
        </text>
      </g>
    )
  }

  const constructGeoJsx = (geographies, projection) => {

    return geographies.map(({ feature: geo, path = '' }) => {

      const key = geo.properties.iso + '-hex-group'

      if ('US-ND' === geo.properties.iso) {
        //debugger;
      }
      
      let styles = {
        fill: '#E6E6E6',
        cursor: 'default'
      }

      // Map the name from the geo data with the appropriate key for the processed data
      let geoKey = geo.properties.iso

      if ('US-PR' === geoKey) {
        return false;
      }

      // Manually add Washington D.C. in for Hex maps
      // if(geoKey === 'US-DC') {
      //   geoKey = 'District of Columbia'
      // } else {
      //   geoKey = supportedStates[geoKey] ? supportedStates[geoKey][0] : null;
      // }

      if(!geoKey) return

      const geoData = data[geoKey];

      let legendColors;

      // Once we receive data for this geographic item, setup variables.
      if (geoData !== undefined) {
        legendColors = applyLegendToRow(geoData);
      }
console.log("colors: ", legendColors)
      const tooltip = applyTooltipsToGeo(geo.properties.iso, legendColors[0]);

      // If a legend applies, return it with appropriate information.
      if (legendColors && legendColors[0] !== '#EBEBEB') {
        styles = {
          fill: legendColors[0],
          cursor: 'pointer',
          '&:hover': {
            // fill: legendColors[1],
            fontWeight: 600,
            // opacity:.9,
            stroke: 'red'
          },
          '&:active': {
            fill: legendColors[2],
          },
        };

        if(selected && selected !== geoKey) styles.opacity = 0.4 
        if(selected && selected === geoKey) styles.fill = legendColors[0]
debugger;
        return (
          <g
            key={key}
            className={selected === geoKey ? 'selected geo-group' : 'geo-group'}
            css={styles}
            onClick={() => setStateSelected(geoKey)}
            data-tip={tooltip}
            //data-html={true}
            
          >
            <path
              tabIndex={-1}
              className='single-geo'
              stroke={'#333'}
              // stroke={'#5a5547'}
              strokeWidth={(selected && selected === geoKey) ? 2 : 1}   
              d={path}
            />
            {geoLabel(geo, legendColors[0], projection)}
          </g>
        )
      }

      // Default return state, just geo with no additional information
      return (
        <g
        key={key}
          className="geo-group"
          css={styles}
        >
          <path
            tabIndex={-1}
            className='single-geo'
            stroke={'#FFF'}
            strokeWidth={5}
            d={path}
          />
          {geoLabel(geo, styles.fill, projection)}
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
      <svg viewBox="0 0 880 500">
        <Mercator data={unitedStatesHex} scale={650} translate={[1600, 775]}>
          {({ features, projection }) => constructGeoJsx(features, projection)}
        </Mercator>
      </svg>
    </>
  )
}

export default UsaMap
