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
  const { data, applyLegendToRow, setStateSelected, selected, applyTooltipsToGeo, supportedStates, getSignificanceForGeo } = useContext(Context);
  
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
          },
          '&:active': {
            fill: legendColors[2],
          },
        };

        if(selected && selected !== geoKey) styles.opacity = 0.9
        if(selected && selected === geoKey) styles.fill = legendColors[0]
        if(selected && selected === geoKey) styles.stroke = '#fff'


        const setClickAction = () => {
          if ( geoData[1] !== 'unfunded' ) {
            setStateSelected(geoKey)
          }
        }

        return (
            <a key={key} xlinkHref={ ( geoData[1] === 'unfunded' ) ? '#!' : '#stateInfo' } role='button' aria-pressed="false">
              <g
                id={selected === geoKey ? 'selected_state' : key }
                tabIndex={-1}
                className={selected === geoKey ? 'selected geo-group' : 'geo-group'}
                css={styles}
                onClick={() => setClickAction(geoKey) }
                data-tip={tooltip}
              >
                <path
                  className='single-geo'
                  stroke={'#333'}
                  strokeWidth={(selected && selected === geoKey) ? 6 : 1}
                  d={path}
                  fill= { (getSignificanceForGeo(geo.properties.iso) == 'Data Suppressed') ? 'url(#pattern_KJD3DK2)' : ''}
                />
                {geoLabel(geo, legendColors[0], projection)}
              </g>
            </a>
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
        <defs>
          <pattern id="pattern_KJD3DK2" patternUnits="userSpaceOnUse" width="9.5" height="9.5" patternTransform="rotate(45)">
            <line x1="0" y="0" x2="0" y2="9.5" stroke="#0C0824" style={{ strokeWidth: 2 }} />
          </pattern>
        </defs>
        <Mercator data={unitedStatesHex} scale={705} translate={[1705, 825]}>
          {({ features, projection }) => constructGeoJsx(features, projection)}
        </Mercator>
        <use id="selected_state_clone" xlinkHref="#selected_state" />
      </svg>
    </>
  )
}

export default UsaMap
