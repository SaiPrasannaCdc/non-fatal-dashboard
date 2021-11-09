import React from 'react';

function Datatable({runtimeData,runtimeUSData,significanceColumn,percentageColumn,keyIndex,supportedStates,drugColor,Hexagon,applyLegendToRow}) {

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
    let returnSymbols = '';

    if ('unfunded' === row[percentageColumn]) {
      returnSymbols = String.fromCharCode(167) + String.fromCharCode(167);
    }

    return (
      <>&nbsp;{returnSymbols}</>
    )
  };

  return (
    <>
      <table id="main-data-table">
        <tr style={{backgroundColor: drugColor}}>
          <th>Jurisdiction</th>
          <th>Percentage Change</th>
          <th>Significance</th>
        </tr>
        <tr>
          <td>Overall</td>
          <td className={'Significant Increase' === runtimeUSData[significanceColumn] || 'Significant Decrease' === runtimeUSData[significanceColumn] ? 'is-significant' : ''}>{getPercentageColumn(runtimeUSData)}</td>
          <td>{runtimeUSData[significanceColumn]}</td>
        </tr>
        <tr className="state-header" style={{backgroundColor: '#f5f5f5'}}>
          <th>State</th>
          <th></th>
          <th></th>
        </tr>
        {runtimeData.map((row) => {
          let stateName = supportedStates[row[keyIndex['geo']]][0];
          const stateColors = applyLegendToRow(row);

          return (
            <tr>
              <td>{stateName}{getSymbols(row)}</td>
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