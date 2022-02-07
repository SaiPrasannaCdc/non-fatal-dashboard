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

      if(!geoKey) return

      const geoData = data[geoKey];

      let legendColors;

      // Once we receive data for this geographic item, setup variables.
      if (geoData !== undefined) {
        legendColors = applyLegendToRow(geoData);
      }

      const tooltip = applyTooltipsToGeo(geo.properties.iso, legendColors[0]);

      // If a legend applies, return it with appropriate information.
      if (legendColors && legendColors[0] !== '#EBEBEB') {
        styles = {
          fill: legendColors[0],
          cursor: 'pointer',
          '&:hover': {
            fontWeight: 600,
            stroke: 'red'
          },
          '&:active': {
            fill: legendColors[2],
          },
        };

        if(selected && selected !== geoKey) styles.opacity = 0.4 
        if(selected && selected === geoKey) styles.fill = legendColors[0]


        const setClickAction = () => {
          if ( geoData[1] !== 'unfunded' ) {
            setStateSelected(geoKey)
          }
        }

        return (
          <g
            tabIndex={-1}
            key={key}
            className={selected === geoKey ? 'selected geo-group' : 'geo-group'}
            css={styles}
            onClick={() => setClickAction(geoKey) }
            data-tip={tooltip}
          >
            <path
              className='single-geo'
              stroke={'#333'}
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
      <svg viewBox="0 0 880 500" aria-describedby="main-data-table">
        <Mercator data={unitedStatesHex} scale={650} translate={[1600, 775]}>
          {({ features, projection }) => constructGeoJsx(features, projection)}
        </Mercator>
      </svg>
    </>
  )
}

export default UsaMap
