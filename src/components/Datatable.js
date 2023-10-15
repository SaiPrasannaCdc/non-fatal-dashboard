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

const monthNamesShort = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

function Datatable({ params }) {

  const { data, stateNames, monthNames, supportedYears, dataSourceOptions, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonth, currentYear: currentYearUntyped, currentDataType, currentYearCompare, currentYearGroup } = params;
  const supportedYearsLatest = supportedYears[supportedYears.length - 1];
  const currentYear = parseInt(currentYearUntyped);
  const drugColor = drugOptions[currentDrug].color;

  const filteredStateData = data.state[currentDataSource][drugOptions[currentDrug].rateColumn][currentTimeframe === 'Monthly' ? currentMonth : 'all'].filter(d => d.state !== 'US');
  const stateYearMin = Math.min(...[currentYear, currentYearCompare]);
  const stateYearMax = Math.max(...[currentYear, currentYearCompare]);

  const filteredYearData = {
    [currentState]: getFilteredTimeData(data, currentTimeframe, currentDataSource, currentState, currentYear)
  }

  if(currentState !== 'US') filteredYearData['US'] = getFilteredTimeData(data, currentTimeframe, currentDataSource, 'US', currentYear);

  const filteredSexData = data.sex[currentDataSource][currentDrug][currentYear][currentTimeframe === 'Monthly' ? currentMonth : 'all'][currentDataType];

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
    <div className="main-data-table-container">
      <table className="main-data-table">
        <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, by state and overall<sup>†</sup>, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ${Math.min(currentYear, currentYearCompare)} compared to ${monthNames[currentMonth]} ${Math.max(currentYear, currentYearCompare)}` : `${Math.min(currentYear, currentYearCompare)} compared to ${Math.max(currentYear, currentYearCompare)}`}{(currentYear === 2021 || currentYearCompare === 2021) && <sup>¶</sup>}</caption>
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
                <td>{row[stateYearMin] || 'Data not available/not reported†'}</td>
                <td>{row[stateYearMax] || 'Data not available/not reported†'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  ), [data, filteredStateData, stateYearMax, stateYearMin, drugColor, currentTimeframe,  dataSourceOptions, drugOptions, stateNames, supportedYears, currentDataSource, currentDrug, currentMonth]);

  const yearTable = useMemo(() => (
    <div className="main-data-table-container">
      <table className="main-data-table">
        <caption>{currentTimeframe} rate of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses per 100,000 persons, {currentState !== 'US' ? `${stateNames[currentState]} and overall` : 'overall'}<sup>†</sup>, {currentTimeframe === 'Monthly' ? <>January {currentYear}&#8211;December {currentYear}</> : <>{supportedYears[0]}&#8211;{supportedYearsLatest}</>}{(currentYear === 2021 || currentTimeframe === 'Annual') && <sup>¶</sup>}</caption>
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
                  {currentTimeframe === 'Monthly' ? monthNamesShort[row.month] : row.year}
                </button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredYearData).map(state => {
            return <tr key={`line-chart-row-${state}`}><td>{stateNames[state]}</td>{filteredYearData['US'].map((usRow, i) => {
              const row = state === 'US' ? usRow : filteredYearData[state].find(row => row[currentTimeframe === 'Monthly' ? 'month' : 'year'] === usRow[currentTimeframe === 'Monthly' ? 'month' : 'year']) || {}
              return (
                  <td key={`line-chart-col-${state}-${i}`}>{row[currentDrug] || 'Data not available/not reported†'}</td>
              )
            })}</tr>
          })}
        </tbody>
      </table>
    </div>
  ), [filteredYearData, currentTimeframe, dataSourceOptions, drugOptions, stateNames, supportedYears, drugColor, monthNames, currentDataSource, currentDrug, currentState, currentYear]);

  const sexTable = useMemo(() => (
    <div className="main-data-table-container">
      <table className="main-data-table">
        <caption>{currentTimeframe} {currentDataType} of {dataSourceOptions[currentDataSource]['titleLongest']} for nonfatal {drugOptions[currentDrug]['titleSingular'].toLowerCase()} overdoses{currentDataType === 'rate' ? ' per 100,000 persons' : ''}, overall<sup>†</sup>, {currentTimeframe === 'Monthly' ? `${monthNames[currentMonth]} ` : ''} {currentYear}{currentYear === 2021 && <sup>¶</sup>}</caption>
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
    </div>
  ), [data, filteredSexData, currentTimeframe, dataSourceOptions, drugOptions, monthNames, drugColor, currentDataSource, currentDrug, currentMonth, currentYear, sexSortBy, sexSortOrder]);

  const countyTable = useMemo(() => currentDataSource === 'ED' ? (
    <div className="main-data-table-container">
      <table className="main-data-table">
        <caption>{currentYearGroup === 'one' ? 'Annual r' : 'R'}ate of emergency department (ED) visits for nonfatal all drug overdoses per 100,000 {currentYearGroup === 'all' ? 'person-years' : 'persons'}, by county{currentState === 'US' ? <sup>†</sup> : ', '}{currentState === 'US' ? '' : stateNames[currentState]}, {currentYearGroup === 'all' ? <>{supportedYears[0]}&#8211;{supportedYearsLatest}</> : currentYear}{(currentYearGroup === 'all' || currentYear === 2021) && <sup>¶</sup>}
          <br/><br/><small style={{fontWeight: 'normal'}}><i>The county-level heat map is only available for the rate (annual and 5-year) of ED visits for nonfatal all drug overdoses due to substantial suppression that would result if other comparisons were made.</i></small>
        </caption>
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
    </div>
  ) : <></>, [data, filteredCountyData, drugColor, stateNames, currentDataSource, currentState, currentYear, currentYearGroup, countySortBy, countySortOrder]);

  return (
    <>
      {stateTable}
      <br/>
      {yearTable}
      <br/>
      {sexTable}
      <br/>
      {countyTable}
    </>
  );
}

export default Datatable;