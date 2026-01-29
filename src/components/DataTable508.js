import React, { useState, useEffect } from 'react';
import '../css/DataTable508.css';

function DataTable508(params) {

  const { data, rates, cutoffData, cutoffKey, highlight, xAxisKey, suffixes, transforms, caption, customBackground, extraClasses, years, extraCols, width, height, sortBy, isSmallViewport, colSpan, drugName, currentDataType } = params;

  const labelOverrides = params.labelOverrides || {};

  if (data === undefined || Object.keys(data).length == 0)
    return null;

  const isArray = Array.isArray(data);

  const keys = (isArray ? Object.keys(data[0]) : (!sortBy ? Object.keys(data).sort((a,b) => {
    if(a === 'Overall') return -1;
    if(b === 'Overall') return 1;
    return a < b ? -1 : 1;
  }) : Object.keys(data)));
  

  const capitalize = (key) => {
    return key.charAt(0).toUpperCase() + key.substring(1);
  };

  const getYearsArray = () => {

    let myArray = [];
    
    let yr = parseInt(years['yearFrom'].yearFrom);
    myArray.push(yr);
    while (yr < parseInt(years['yearTo'].yearTo))
    {
      yr = yr + 1;
      myArray.push(yr);
    }
    return myArray;
  };

  const getColSpanCnt = () => {
    let keysCnt = keys.filter(d => d != 'dummy' && !d.includes('extraCol')).length - 1;
    let yearCnt = getYearsArray().length;
    return keysCnt < yearCnt ? 1 : keysCnt/yearCnt;
  };

  const formatLabel = (key) => {

    if(!key) return 'Jurisdiction';

    let words = [];

    let start = 0;
    for(let i = 1; i < key.length; i++){
      if(key[i] === key[i].toUpperCase()){
        words.push(key.substring(start, i));
        start = i;
      }
    }

    words.push(key.substring(start));
    words = words.map(word => capitalize(word));

    return words.join('');
  };

  const cleanUp = (val) => {
    var ret = val;

    if (val == -1)
      ret = 'Data not available/not reported';

    if (val == -2)
      ret = 'Unfunded State';

    if (val == -3)
      ret = 'Data Suppressed';

    if (val == 9)
      ret = 'Data Suppressed§';

    if (val == -9)
      ret = 'Data not available';

    return isNaN(ret) ? ret : (ret + (currentDataType == 'percent' ? '%' : ''));
  }

  const cleanUpSVP = (val) => {
    var ret = val;

    if (val == -1)
      ret = '†';

    if (val == -2)
      ret = '**';

    if (val == -3 || val == 9)
      ret = '*';

    if (val == -9)
      ret = '—';

    if (!isNaN(ret))
      ret = ret + (currentDataType == 'percent' ? '%' : '')

    return ret;
  }

  return (
    <>
      <div style={{'width': width, 'height': height}} className={`table-container-MY${customBackground ? ' custom-background' : ' non-custom-background'} ${extraClasses} ${!isSmallViewport ? 'borderCollapse' : ''}`} tabIndex="0">
        <table>
          <caption>{caption}</caption>
          <thead>
          <tr>
              <th className={'keepSticky'} scope="col" rowspan="2">{labelOverrides[xAxisKey] || formatLabel(xAxisKey)}</th>
              {colSpan != null && <th key={'abcd'} scope="col" colspan={colSpan} className={'centerAlign'}>{(currentDataType == 'percent' ? 'Percent' : 'Rate') + ' of suspected nonfatal overdoses' + (drugName != null ? ' involving ' + drugName : '') + ' per 10,000 Total ED Visits'}</th>}
            </tr>
            <tr>
              {!isArray && data && [data].map((d, index) => 
                Object.keys(d[keys[0]]).map(rowKey => (
                  <th key={`th-${rowKey}`} scope="col" className={'rightAlign'}>{labelOverrides[rowKey] || formatLabel(rowKey)}{isSmallViewport ? <sup>‡</sup> : ''}</th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {!isArray && keys && keys.map((rowKey, rowIndex) => (
                <tr key={`tr-${rowKey}-${rowIndex}`} className={rowKey === highlight ? 'highlight' : ''}>
                  <th key={`th-${rowKey}-${rowIndex}`} scope="row">{labelOverrides[rowKey] || rowKey.split('_')[0]}</th>
                  {[data].map((d, i) => 
                    Object.keys(d[keys[0]]).map((colKey, colIndex) => (
                      <td key={`td-${d[rowKey][colKey]}-${rowIndex}-${colIndex}`}>{!isSmallViewport ? cleanUp(d[rowKey][colKey]) : cleanUpSVP(d[rowKey][colKey])}</td>
                    ))
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DataTable508;