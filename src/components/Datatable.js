import React, { useMemo, useState} from 'react';

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

const getSortFunctionObject = (obj, prop, order) => {
  return (item1, item2) => {
    if(obj[item1][prop] === obj[item2][prop]) return 0;
    if(obj[item1][prop] === 'Data suppressed') return order === 'asc' ? -1 : 1;
    if(obj[item2][prop] === 'Data suppressed') return order === 'asc' ? 1 : -1;
    if(obj[item1][prop] < obj[item2][prop]) return order === 'asc' ? -1 : 1;
    return order === 'asc' ? 1 : -1;
  };
};

const getSortFunctionArray = (prop, order) => {
  return (item1, item2) => {
    if(item1[prop] === item2[prop]) return 0;
    if(item1[prop] < item2[prop]) return order === 'asc' ? -1 : 1;
    return order === 'asc' ? 1 : -1;
  };
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

  const [ stateSortBy, setStateSortBy ] = useState('state');
  const [ stateSortOrder, setStateSortOrder ] = useState('asc');
  const [ yearSortBy, setYearSortBy ] = useState('state');
  const [ yearSortOrder, setYearSortOrder ] = useState('asc');
  const [ sexSortBy, setSexSortBy ] = useState('state');
  const [ sexSortOrder, setSexSortOrder ] = useState('asc');
  const [ countySortBy, setCountySortBy ] = useState('state');
  const [ countySortOrder, setCountySortOrder ] = useState('asc');

  const headerClick = (prop, propSetter, order, orderSetter, header) => {
    if(prop === header){
      if(order === 'asc'){
        orderSetter('desc');
      } else {
        orderSetter('asc');
      }
    } else {
      propSetter(header);
      orderSetter('asc');
    }
  };

  const stateTable = useMemo(() => (
    <table className="main-data-table">
      <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states and overall, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ${supportedYears[0]} - ${monthNames[currentMonth]} ${supportedYears[supportedYears.length - 1]}` : `${supportedYears[0]} - ${supportedYears[supportedYears.length - 1]}`}</caption>
      <thead>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col" className={`${stateSortBy === 'state' ? 'sorting' : ''} ${stateSortOrder}`}>
            <button onClick={() => {headerClick(stateSortBy, setStateSortBy, stateSortOrder, setStateSortOrder, 'state')}}>
              State
            </button>
          </th>
          <th scope="col" className={`${stateSortBy === stateYearMin ? 'sorting' : ''} ${stateSortOrder}`}>
            <button onClick={() => {headerClick(stateSortBy, setStateSortBy, stateSortOrder, setStateSortOrder, stateYearMin)}}>
              {stateYearMin} Rate
            </button>
          </th>
          <th scope="col" className={`${stateSortBy === stateYearMax ? 'sorting' : ''} ${stateSortOrder}`}>
            <button onClick={() => {headerClick(stateSortBy, setStateSortBy, stateSortOrder, setStateSortOrder, stateYearMax)}}>
              {stateYearMax} Rate
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredStateData.sort(getSortFunctionArray(stateSortBy, stateSortOrder)).map((row) => {
          return (
            <tr key={`barbell-chart-row-${row.state}`}>
              <td>{stateNames[row.state]}</td>
              <td>{row[stateYearMin]}</td>
              <td>{row[stateYearMax]}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  ), [data, filteredStateData, stateYearMax, stateYearMin, drugColor, currentTimeframe,  dataSourceOptions, drugOptions, stateNames, supportedYears, currentDataSource, currentDrug, currentMonth]);

  const yearTable = useMemo(() => (
    <table className="main-data-table">
      <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {currentState !== 'US' ? stateNames[currentState] + ' and overall' : 'overall'}, {currentTimeframe === 'Monthly' ? `January ${currentYear} - December ${currentYear}` : `${supportedYears[0]} - ${supportedYears[supportedYears.length - 1]}`}</caption>
      <thead>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col">
            <button>
              State
            </button>
          </th>
          {filteredYearData['US'].map(row => 
            <th key={`line-chart-header-${currentTimeframe === 'Monthly' ? monthNames[row.month] : row.year}`} scope="col">
              <button>
                {currentTimeframe === 'Monthly' ? monthNames[row.month] : row.year}
              </button>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {Object.keys(filteredYearData).sort(getSortFunctionObject(filteredYearData, yearSortBy, yearSortOrder)).map(state => {
          return <tr key={`line-chart-row-${state}`}><td>{stateNames[state]}</td>{filteredYearData[state].map((row) => {
            return (
                <td key={`line-chart-col-${state}-${row[currentDrug]}`}>{row[currentDrug]}</td>
            )
          })}</tr>
        })}
      </tbody>
    </table>
  ), [filteredYearData, currentTimeframe, dataSourceOptions, drugOptions, stateNames, supportedYears, drugColor, monthNames, currentDataSource, currentDrug, currentState, currentYear, yearSortBy, yearSortOrder]);

  const countyTable = useMemo(() => (
    <table className="main-data-table">
      <caption>Annual rate of ED visits for nonfatal all drug overdoses per 100,000 persons, by county, {data ? Object.keys(data.supportedStates).length - 1 : 'n/a'} states, {currentYear}</caption>
      <thead>
      <tr style={{ backgroundColor: drugColor }}>
        <th scope="col" className={`${countySortBy === 'state' ? 'sorting' : ''} ${countySortOrder}`}>
          <button onClick={() => {headerClick(countySortBy, setCountySortBy, countySortOrder, setCountySortOrder, 'state')}}>
            State
          </button>
        </th>
        <th scope="col" className={`${countySortBy === 'county' ? 'sorting' : ''} ${countySortOrder}`}>
          <button onClick={() => {headerClick(countySortBy, setCountySortBy, countySortOrder, setCountySortOrder, 'county')}}>
            County
          </button>
        </th>
        <th scope="col" className={`${countySortBy === 'rate' ? 'sorting' : ''} ${countySortOrder}`}>
          <button onClick={() => {headerClick(countySortBy, setCountySortBy, countySortOrder, setCountySortOrder, 'rate')}}>
            Rate
          </button>
        </th>
      </tr>
      </thead>
      <tbody>
        {Object.keys(filteredCountyData).sort(getSortFunctionObject(filteredCountyData, countySortBy, countySortOrder)).map((fips) => {
          return (
            <tr key={`county-map-row-${fips}`}>
              <td>{stateNames[filteredCountyData[fips].state]}</td>
              <td>{filteredCountyData[fips].county}</td>
              <td>{filteredCountyData[fips].rate}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  ), [data, filteredCountyData, drugColor, stateNames, currentYear, countySortBy, countySortOrder]);

  return (
    <>
      {stateTable}

      {yearTable}

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

      {countyTable}
    </>
  );
}

export default Datatable;