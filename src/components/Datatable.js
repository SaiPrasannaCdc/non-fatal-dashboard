import React, { useContext, useState } from 'react';

import Context from '../context';

function Datatable() {

  const { data, drugScreenOptions, currentDataSource, currentDrug, currentYear, currentMonth, currentState } = useContext(Context);

  const drugColor = drugScreenOptions[currentDrug].color;

  const filteredStateData = data.state[currentDataSource][drugScreenOptions[currentDrug].rateColumn][currentMonth].filter(d => d.state !== 'US');
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
          <th>State</th>
          <th>{stateYearMin} Rate</th>
          <th>{stateYearMax} Rate</th>
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
          <th>Year</th>
          {Object.keys(drugScreenOptions).map(drug => <th>{drugScreenOptions[drug].titleAll}</th>)}
        </tr>
        {filteredYearData.map((row) => {
          return (
            <tr>
              <td>{row.year}</td>
              {Object.keys(drugScreenOptions).map(drug => <th>{row[drug]}</th>)}
            </tr>
          )
        })}
      </table>

      <table className="main-data-table">
        <caption>CDC's Drug Overdose Surveillance and Epidemiology (DOSE) System: Percent Change in ED Visits for Suspected {currentDrug} Overdose by OD2A-funded State</caption>
        <tr style={{ backgroundColor: drugColor }}>
          <th>Age</th>
          <th>Male Overdoses</th>
          <th>Female Overdoses</th>
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
          <th>County</th>
          <th>Rate</th>
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