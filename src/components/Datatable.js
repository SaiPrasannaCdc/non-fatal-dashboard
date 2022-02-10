import React, { useState } from 'react';

function Datatable({runtimeData,runtimeUSData,significanceColumn,jurisdictionColumn,percentageColumn,keyIndex,supportedStates,drugColor,Hexagon,applyLegendToRow}) {

  const [sortBy, setSortBy] = useState('jurisdiction');
  const [sortAscending, setSortAscending] = useState(false);

  const getPercentageColumn = (row) => {

    let displayVal = row[percentageColumn];
    if ('missing' === row[percentageColumn] || 'unfunded' === row[percentageColumn]) {
      displayVal = '.';
    } else if ('suppressed' === row[percentageColumn]) {
      displayVal = String.fromCharCode(8224);
    }

    return (
      <>
        {displayVal}
      </>
    );
  };

  const getSymbols = (row) => {
    let symbols = [];

    if ('unfunded' === row[percentageColumn]) {
      symbols.push('††');
    }

    if ('missing' === row[percentageColumn]) {
      symbols.push('¶');
    }

    if ('suppressed' === row[percentageColumn]) {
      symbols.push('**');
    }

    if ('US-KY' === row[keyIndex['geo']]) {
      symbols.push('§§');
    }

    return (
      <>{symbols.join(' ')}</>
    )
  };

  const sortTable = (column) => {
    setSortBy(column);
    if (sortBy === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortAscending(true);
    }
  };

  let runtimeSortedData = [...runtimeData];

  if ('percent' === sortBy) {
    runtimeSortedData = [...runtimeData].sort((a, b) => {
      let numA = parseInt(a[percentageColumn]);
      let numB = parseInt(b[percentageColumn]);

      if(isFinite(numA-numB)) {
        if (sortAscending) {
          return numA-numB; 
        } else {
          return numB-numA;
        }
      } else {
        return isFinite(numA) ? -1 : 1;
      }
      
    });
  } else if ('significance' === sortBy) {
    runtimeSortedData = [...runtimeData].sort((a,b) => {
      if (sortAscending) {
        return a[significanceColumn] > b[significanceColumn] ? 1 : -1;
      } else {
        return a[significanceColumn] > b[significanceColumn] ? -1 : 1;
      }
    });
  } else {
    runtimeSortedData = [...runtimeData].sort((a,b) => {
      if (sortAscending) {
        return a[jurisdictionColumn] > b[significanceColumn] ? 1 : -1;
      } else {
        return a[jurisdictionColumn] > b[significanceColumn] ? -1 : 1;
      }
    });
  }

  // set months and years for comparison wording
  const fromYear = runtimeUSData[15];
  const toYear   = runtimeUSData[17];

  const fromDate  = new Date( fromYear, runtimeUSData[16] - 1, 1);
  const fromMonth = fromDate.toLocaleString('default', { month: 'long' });

  const toDate  = new Date( toYear, runtimeUSData[18] - 1, 1);
  const toMonth = toDate.toLocaleString('default', { month: 'long' });

  return (
    <>
      <table id="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in Emergency Department Visits for Suspected All Drug Overdose, {toMonth} {toYear} compared to {fromMonth} {fromYear}, by OD2A-funded State</caption>
        <tr style={{backgroundColor: drugColor}}>
          <th scope="col" onClick={() => sortTable('jurisdiction')}>State</th>
          <th scope="col" onClick={() => sortTable('percent')}>Percentage Change</th>
          <th scope="col" onClick={() => sortTable('significance')}>Significance</th>
        </tr>
        <tr>
          <td>Overall</td>
          <td className={'Significant Increase' === runtimeUSData[significanceColumn] || 'Significant Decrease' === runtimeUSData[significanceColumn] ? 'is-significant' : ''}>{getPercentageColumn(runtimeUSData)}</td>
          <td>{runtimeUSData[significanceColumn]}</td>
        </tr>
        {runtimeSortedData.map((row) => {
          let stateName = supportedStates[row[keyIndex['geo']]][0];
          const stateColors = applyLegendToRow(row);

          return (
            <tr>
              <td>{stateName} {getSymbols(row)}</td>
              <td className={'Significant Increase' === row[significanceColumn] || 'Significant Decrease' === row[significanceColumn] ? 'is-significant' : ''}>
                <div className="datatable-hex-container">
                  <div className="datatable-hex">
                    <Hexagon fill={stateColors[0]} />
                  </div>
                  {getPercentageColumn(row)}
                </div>
              </td>
              <td>{row[significanceColumn]}</td>
            </tr>
          )
        })}
      </table>
    </>
  );
}

export default Datatable;