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
    if(!item1[prop]) return order === 'asc' ? -1 : 1;
    if(!item2[prop]) return order === 'asc' ? 1 : -1;
    if(item1[prop] < item2[prop]) return order === 'asc' ? -1 : 1;
    return order === 'asc' ? 1 : -1;
  };
};

function Datatable({ params }) {

  const { data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonth, currentYear: currentYearUntyped, currentDataType, currentYearCompare } = params;
  const supportedYearsLatest = supportedYears[supportedYears.length - 1];
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

  const filteredSexData = data.sex[currentDataSource][currentDrug][currentYear][currentMonth][currentDataType];

  const filteredCountyData = data.county[currentYear];

  const [ stateSortBy, setStateSortBy ] = useState('state');
  const [ stateSortOrder, setStateSortOrder ] = useState('asc');
  const [ sexSortBy, setSexSortBy ] = useState('age');
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
      <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, by state and overall†, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ${Math.min(currentYear, currentYearCompare)} compared to ${monthNames[currentMonth]} ${Math.max(currentYear, currentYearCompare)}` : `${Math.min(currentYear, currentYearCompare)} compared to ${Math.max(currentYear, currentYearCompare)}`}</caption>
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
      <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {currentState !== 'US' ? `${stateNames[currentState]} and overall†` : 'overall†'}, {currentTimeframe === 'Monthly' ? `January ${currentYear} - December ${currentYear}` : `${supportedYears[0]} - ${supportedYearsLatest}`}</caption>
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
        {Object.keys(filteredYearData).map(state => {
          return <tr key={`line-chart-row-${state}`}><td>{stateNames[state]}</td>{filteredYearData[state].map((row) => {
            return (
                <td key={`line-chart-col-${state}-${row[currentDrug]}`}>{row[currentDrug]}</td>
            )
          })}</tr>
        })}
      </tbody>
    </table>
  ), [filteredYearData, currentTimeframe, dataSourceOptions, drugOptions, stateNames, supportedYears, drugColor, monthNames, currentDataSource, currentDrug, currentState, currentYear]);

  const sexTable = useMemo(() => (
    <table className="main-data-table">
      <caption>{currentTimeframe} {currentDataType} of {dataSourceOptions[currentDataSource]['titleLowerCase']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses{currentDataType === 'rate' ? ' per 100,000 persons' : ''}, overall†, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''} {currentYear}</caption>
      <thead>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col" className={`${sexSortBy === 'age' ? 'sorting' : ''} ${sexSortOrder}`}>
            <button onClick={() => {headerClick(sexSortBy, setSexSortBy, sexSortOrder, setSexSortOrder, 'age')}}>
              Age
            </button>
          </th>
          <th scope="col" className={`${sexSortBy === 'M' ? 'sorting' : ''} ${sexSortOrder}`}>
            <button onClick={() => {headerClick(sexSortBy, setSexSortBy, sexSortOrder, setSexSortOrder, 'M')}}>
              Male Overdoses
            </button>
          </th>
          <th scope="col" className={`${sexSortBy === 'F' ? 'sorting' : ''} ${sexSortOrder}`}>
            <button onClick={() => {headerClick(sexSortBy, setSexSortBy, sexSortOrder, setSexSortOrder, 'F')}}>
              Female Overdoses
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredSexData.sort(getSortFunctionArray(sexSortBy, sexSortOrder)).map((row) => {
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
  ), [data, filteredSexData, currentTimeframe, dataSourceOptions, drugOptions, monthNames, drugColor, currentDataSource, currentDrug, currentMonth, currentYear, sexSortBy, sexSortOrder]);

  const countyTable = useMemo(() => (
    <table className="main-data-table">
      <caption>Annual rate of ED visits for nonfatal all drug overdoses per 100,000 persons, by county, {currentState === 'US' ? stateNames[currentState].toLowerCase() : stateNames[currentState]}, {currentYear}</caption>
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

      {sexTable}

      {countyTable}
    </>
  );
}

export default Datatable;