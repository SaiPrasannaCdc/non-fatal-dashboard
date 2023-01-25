import React from 'react';

const getFilteredTimeData = (data, currentTimeframe, currentDataSource, currentState, currentYear) => {
  if(data.year[currentDataSource][currentState]){
    if(currentTimeframe === 'Monthly'){
      return Object.keys(data.year[currentDataSource][currentState]).map(month => {
        let d = data.year[currentDataSource][currentState][month].find(d => d.year === currentYear);
        if (d) {
          d.month = parseInt(month);
          return d;
        }
      }).filter(d => !!d && !isNaN(d.month));
    } else {
      return data.year[currentDataSource][currentState]['all'];
    }
  } else {
    return [];
  }
};

function Datatable({ params }) {

  const { data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonth, currentYear: currentYearUntyped } = params;
  const currentYear = parseInt(currentYearUntyped);
  const drugColor = drugOptions[currentDrug].color;

  const filteredStateData = data.state[currentDataSource][drugOptions[currentDrug].rateColumn][currentMonth].filter(d => d.state !== 'US');
  const stateYears = Object.keys(filteredStateData[0]).filter(item => item !== 'state');
  const stateYearMin = Math.min(...stateYears);
  const stateYearMax = Math.max(...stateYears);

  const filteredYearData = {
    [currentState]: getFilteredTimeData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if(currentState !== 'US') filteredYearData['US'] = getFilteredTimeData(data, currentTimeframe, currentDataSource, 'US', currentYear);


  const filteredSexData = data.sex[currentDataSource][currentDrug][currentYear][currentMonth];

  const filteredCountyData = data.county[currentYear];

  return (
    <>
      <table className="main-data-table">
        <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states and overall, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ${supportedYears[0]} - ${monthNames[currentMonth]} ${supportedYears[supportedYears.length - 1]}` : `${supportedYears[0]} - ${supportedYears[supportedYears.length - 1]}`}</caption>
        <thead>
          <tr style={{ backgroundColor: drugColor }}>
            <th scope="col"><button>State</button></th>
            <th scope="col"><button>{stateYearMin} Rate</button></th>
            <th scope="col"><button>{stateYearMax} Rate</button></th>
          </tr>
        </thead>
        <tbody>
          {filteredStateData.map((row) => {
            return (
              <tr key={`barbell-chart-row-${row.state}`}>
                <td>{row.state}</td>
                <td>{row[stateYearMin]}</td>
                <td>{row[stateYearMax]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <table className="main-data-table">
        <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {currentState !== 'US' ? stateNames[currentState] + ' and overall' : 'overall'}, {currentTimeframe === 'Monthly' ? `January ${currentYear} - December ${currentYear}` : `${supportedYears[0]} - ${supportedYears[supportedYears.length - 1]}`}</caption>
        <thead>
          <tr style={{ backgroundColor: drugColor }}>
            <th scope="col"><button>State</button></th>
            {filteredYearData['US'].map(row => <th key={`line-chart-header-${currentTimeframe === 'Monthly' ? monthNames[row.month] : row.year}`} scope="col"><button>{currentTimeframe === 'Monthly' ? monthNames[row.month] : row.year}</button></th>)}
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredYearData).map(state => {
            return <tr key={`line-chart-row-${state}`}><td>{stateNames[state]}</td>{filteredYearData[state].map((row) => {
              return (
                  <td key={`line-chart-col-${state}-${row[currentDrug]}`}>{row[currentDrug]}</td>
              )
            })}</tr>
          })}
        </tbody>
      </table>

      <table className="main-data-table">
        <caption>{currentTimeframe} count of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''} {currentYear}</caption>
        <thead>
          <tr style={{ backgroundColor: drugColor }}>
            <th scope="col"><button>Age</button></th>
            <th scope="col"><button>Male Overdoses</button></th>
            <th scope="col"><button>Female Overdoses</button></th>
          </tr>
        </thead>
        <tbody>
          {filteredSexData.map((row) => {
            return (
              <tr key={`bar-chart-row-${row.age}`}>
                <td>{row.age}</td>
                <td>{row.M}</td>
                <td>{row.F}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <table className="main-data-table">
        <caption>Annual rate of ED visits for nonfatal all drug overdoses per 100,000 persons, by county, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states, {currentYear}</caption>
        <thead>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>County</button></th>
          <th scope="col"><button>Rate</button></th>
        </tr>
        </thead>
        <tbody>
          {Object.keys(filteredCountyData).map((fips) => {
            return (
              <tr key={`county-map-row-${fips}`}>
                <td>{filteredCountyData[fips].county}</td>
                <td>{filteredCountyData[fips].rate}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  );
}

export default Datatable;