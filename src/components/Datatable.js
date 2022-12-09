import React from 'react';

function Datatable({ params }) {

  const { data, monthNames, drugOptions, currentDataSource, currentDrug, currentState, currentTimeframe, currentMonthState, currentMonthSexAge, currentYear: currentYearUntyped, currentYearSexAge, currentYearCounty } = params;
  const currentYear = parseInt(currentYearUntyped);
  const drugColor = drugOptions[currentDrug].color;

  const filteredStateData = data.state[currentDataSource][drugOptions[currentDrug].rateColumn][currentMonthState].filter(d => d.state !== 'US');
  const stateYears = Object.keys(filteredStateData[0]).filter(item => item !== 'state');
  const stateYearMin = Math.min(...stateYears);
  const stateYearMax = Math.max(...stateYears);

  const filteredYearData = data.year[currentDataSource][currentState]['all'];

  const filteredMonthData = Object.keys(data.year[currentDataSource][currentState]).map(month => {
    let d = data.year[currentDataSource][currentState][month].find(d => d.year === currentYear);
    if (d) {
      d.month = parseInt(month);
      return d;
    }
  }).filter(d => !isNaN(d.month));

  const filteredSexData = data.sex[currentDataSource][currentDrug][currentYearSexAge][currentMonthSexAge];

  const filteredCountyData = data.county[currentYearCounty];

  return (
    <>
      <table className="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
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
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>Year</button></th>
          {Object.keys(drugOptions).map(drug => <th scope="col"><button>{drugOptions[drug].titleAll}</button></th>)}
        </tr>
        {filteredYearData.map((row) => {
          return (
            <tr>
              <td>{row.year}</td>
              {Object.keys(drugOptions).map(drug => <td>{row[drug]}</td>)}
            </tr>
          )
        })}
      </table>

      {currentTimeframe === 'Monthly' && <table className="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th scope="col"><button>Month</button></th>
          {Object.keys(drugOptions).map(drug => <th scope="col"><button>{drugOptions[drug].titleAll}</button></th>)}
        </tr>
        {filteredMonthData.map((row) => {
          return (
            <tr>
              <td>{monthNames[row.month]}</td>
              {Object.keys(drugOptions).map(drug => <td>{row[drug]}</td>)}
            </tr>
          )
        })}
      </table>}

      <table className="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
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
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
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