import React from 'react';

function Datatable({params}) {

  const { data, drugOptions, currentDataSource, currentDrug, currentYear, currentMonth, currentState } = params;

  const drugColor = drugOptions[currentDrug].color;

  const filteredStateData = data.state[currentDataSource][drugOptions[currentDrug].rateColumn][currentMonth].filter(d => d.state !== 'US');
  const stateYears = Object.keys(filteredStateData[0]).filter(item => item !== 'state');
  const stateYearMin = Math.min(...stateYears);
  const stateYearMax = Math.max(...stateYears);

  const filteredYearData = data.year[currentDataSource][currentState][currentMonth];

  const filteredSexData = data.sex[currentDataSource][currentDrug][currentYear][currentMonth];

  const filteredCountyData = data.county[currentYear];

  return (
    <>
      <table className="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th><button>State</button></th>
          <th><button>{stateYearMin} Rate</button></th>
          <th><button>{stateYearMax} Rate</button></th>
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
          <th><button>Year</button></th>
          {Object.keys(drugOptions).map(drug => <th><button>{drugOptions[drug].titleAll}</button></th>)}
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

      <table className="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th><button>Age</button></th>
          <th><button>Male Overdoses</button></th>
          <th><button>Female Overdoses</button></th>
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
          <th><button>County</button></th>
          <th><button>Rate</button></th>
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