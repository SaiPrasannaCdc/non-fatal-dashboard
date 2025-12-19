import '../css/DataTable508.css';

function DataTable508(params) {

  const { data, rates, cutoffData, cutoffKey, highlight, xAxisKey, suffixes, transforms, caption, customBackground, extraClasses, years, extraCols, width, colSpan, colSpan2, isSmallViewport, hdr, supScript, noSort } = params;

  if (data == null || data === undefined || Object.keys(data).length == 0)
    return;

  const labelOverrides = params.labelOverrides || {};

  const isArray = Array.isArray(data);

  const keys = (isArray ? Object.keys(data[0]) : noSort ? Object.keys(data) : Object.keys(data).sort((a,b) => {
    if(a === 'Overall') return -1;
    if(b === 'Overall') return 1;
    return a < b ? -1 : 1;
  }));

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

  const cleanUpTBD = (val) => {
    var ret = val;

    if (String(val).indexOf('Data suppressed') >= 0)
      ret = 'Data suppressed';

    if (String(val).indexOf('Data not available') >= 0)
      ret = 'Data not available/not reported';

    return ret;
  }

  const cleanUp = (val, yr) => {

    var ret = val;

    if (String(val) != 'PH' && String(val).indexOf('Data suppressed') >= 0)
      ret = '*';

    if (String(val) != 'PH' && String(val).indexOf('Data not available') >= 0)
      ret = String(yr).includes('2024') ? '§' : '†';

    if (String(val) == 'PH')
      ret = '†';

    if (val === undefined)
      ret = String(yr).includes('2024') ? '§' : '†';

    return ret;
  }

  return (
    <>
      <div style={{'width': width}} className={`table-container-MY${customBackground ? ' custom-background' : ' non-custom-background'} ${extraClasses}`} tabIndex="0">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th className={'keepSticky'} scope="col" rowspan="2">{labelOverrides[xAxisKey] || formatLabel(xAxisKey)}</th>
              {colSpan != null && <th key={'abcd'} scope="col" colspan={colSpan} className={'centerAlign'}>{hdr != null ? hdr : 'Rate per 100,000 persons'}{hdr == null ? <sup>5</sup> : ''}</th>}
              {colSpan2 != null && <th key={'abcde'} scope="col" colspan={colSpan2} className={'centerAlign'}>{hdr != null ? hdr : 'Count'}</th>}
            </tr>
            <tr>
              {!isArray && [data].map((d, index) => 
                Object.keys(d[keys[0]]).map(rowKey => (
                  <th key={`th-${rowKey}`} scope="col" className={'rightAlign'}>{labelOverrides[rowKey] || formatLabel(rowKey)}{labelOverrides[rowKey]?.endsWith('visits per 100,000 persons') ? <sup>5</sup> : (supScript !=  null ? <sup>{supScript}</sup> : '')}</th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {!isArray && keys.map((rowKey, rowIndex) => (
                <tr key={`tr-${rowKey}-${rowIndex}`} className={rowKey === highlight ? 'highlight' : ''}>
                  <th key={`th-${rowKey}-${rowIndex}`} scope="row">{labelOverrides[rowKey] || rowKey.split('_')[0]}</th>
                  {[data].map((d, i) => 
                    Object.keys(d[keys[0]]).map((colKey, colIndex) => (
                      <td key={`td-${d[rowKey][colKey]}-${rowIndex}-${colIndex}`}>{cleanUp(d[rowKey][colKey], rowKey)}</td>
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