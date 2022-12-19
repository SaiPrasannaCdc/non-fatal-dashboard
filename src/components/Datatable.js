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

  const { data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonthState, currentMonthSexAge, currentYear: currentYearUntyped, currentYearSexAge, currentYearCounty } = params;
  const currentYear = parseInt(currentYearUntyped);
  const drugColor = drugOptions[currentDrug].color;

  const filteredStateData = data.state[currentDataSource][drugOptions[currentDrug].rateColumn][currentMonthState].filter(d => d.state !== 'US');
  const stateYears = Object.keys(filteredStateData[0]).filter(item => item !== 'state');
  const stateYearMin = Math.min(...stateYears);
  const stateYearMax = Math.max(...stateYears);

  const filteredYearData = {
    [currentState]: getFilteredTimeData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if(currentState !== 'US') filteredYearData['US'] = getFilteredTimeData(data, currentTimeframe, currentDataSource, 'US', currentYear);


  const filteredSexData = data.sex[currentDataSource][currentDrug][currentYearSexAge][currentMonthSexAge];

  const filteredCountyData = data.county[currentYearCounty];

  return (
    <>
      <table className="main-data-table">
        <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 population, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states and overall, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonthState]} ${supportedYears[0]} - ${monthNames[currentMonthState]} ${supportedYears[supportedYears.length - 1]}` : `${supportedYears[0]} - ${supportedYears[supportedYears.length - 1]}`}</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>State</button></th>
          <th scope="col"><button>{stateYearMin} Rate</button></th>
          <th scope="col"><button>{stateYearMax} Rate</button></th>
        </tr>
        {filteredStateData.map((row) => {
          return (
            <tr>
              <td>{row.state}</td>
              <td>{row[stateYearMin]}</td>
              <td>{row[stateYearMax]}</td>
            </tr>
          )
        })}
      </table>

      <table className="main-data-table">
        <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 population, {currentState !== 'US' ? stateNames[currentState] + ' and overall' : 'overall'}, {currentTimeframe === 'Monthly' ? `January ${currentYear} - December ${currentYear}` : `${supportedYears[0]} - ${supportedYears[supportedYears.length - 1]}`}</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>State</button></th>
          {filteredYearData['US'].map(row => <th scope="col"><button>{currentTimeframe === 'Monthly' ? monthNames[row.month] : row.year}</button></th>)}
        </tr>
        {Object.keys(filteredYearData).map(state => {
          return <tr><td>{stateNames[state]}</td>{filteredYearData[state].map((row) => {
            return (
                <td>{row[currentDrug]}</td>
            )
          })}</tr>
        })}
      </table>

      <table className="main-data-table">
        <caption>{currentTimeframe} count of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonthSexAge]} ` : ''} {currentYearSexAge}</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>Age</button></th>
          <th scope="col"><button>Male Overdoses</button></th>
          <th scope="col"><button>Female Overdoses</button></th>
        </tr>
        {filteredSexData.map((row) => {
          return (
            <tr>
              <td>{row.age}</td>
              <td>{row.M}</td>
              <td>{row.F}</td>
            </tr>
          )
        })}
      </table>

      <table className="main-data-table">
        <caption>Annual rate of ED visits for nonfatal all drug overdoses per 100,000 population, by county, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states, {currentYearCounty}</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>County</button></th>
          <th scope="col"><button>Rate</button></th>
        </tr>
        {Object.keys(filteredCountyData).map((fips) => {
          return (
            <tr>
              <td>{filteredCountyData[fips].county}</td>
              <td>{filteredCountyData[fips].rate}</td>
            </tr>
          )
        })}
      </table>
    </>
  );
}

export default Datatable;