import React, {Fragment} from 'react';

export const covidPeriod = ['202003', '202004', '202005', '202006', '202007', '202008'];
export const covidPeriodAnnual = ['202003', '202004', '202005', '202006', '202007', '202008', '202009', '202010', '202011', '202012', '202101', '202102', '202103', '202104', '202105', '202106', '202107'];

export const UtilityFunctions = {

  calculateMinMax: (data, drug, flag)=> {

    var nums = [];
    var drugName = '';

    switch (drug) {
      case 'all':
        drugName = "all"
        break;
      case 'benzodiazepine':
        drugName = "benzo"
        break;
      case 'opioids':
        drugName = "opioid"
        break;
      case 'fentanyl':
        drugName = "fentanyl"
        break;
      case 'heroin':
        drugName = "heroin"
        break;
      case 'stimulants':
        drugName = "stimulant"
        break;
      case 'cocaine':
        drugName = "cocaine"
        break;
      case 'methamphetamine':
        drugName = "methamphetamine"
        break;
    }

    if (data !== undefined && data != null) {
      for (var idx in data) {
        if (data[idx] !== undefined && data[idx] != null) {
          var cnt = Object.keys(data[idx]).length;
          for (var i=0; i < cnt; i++)
          {
            var str = drugName + 'PercentageChange';
            if (Object.keys(data[idx])[i] === str)
              nums.push(data[idx][str])
          }
        }
      }
    }
    
    const numsFinal = nums?.filter(i => !isNaN(i));
    let min = numsFinal?.length > 0 ? Math.min(...numsFinal) : 0;
    let max = numsFinal?.length > 0 ? Math.max(...numsFinal) : 0;

    if (flag === 'min')
      return min;
    
    if (flag === 'max')
      return max;

  },

  generateYYMMArray: (startYear, startMonth, endYear, endMonth) => {

    const result = [];
    for (let year = startYear; year <= endYear; year++) {
      const start = (year === startYear) ? startMonth : 1;
      const end = (year === endYear) ? endMonth : 12;
      for (let month = start; month <= end; month++) {
        const monthString = month < 10 ? `0${month}` : `${month}`;
        result.push(`${year}${monthString}`);
      }
    }
    return result;
  },

  calculateMax: (filteredData)=> {

    var nums = [];

    for (var rec in filteredData)
        nums.push(filteredData[rec].rate)
    
    const numsFinal = nums?.filter(i => !isNaN(i));
    let max = numsFinal?.length > 0 ? Math.max(...numsFinal) : 0;

    return max;
  },

 calculateYScaleDomain: (filteredData, currentDrug, selectedDrugs, currentState, showOverall)=> {

    var usNums = [];
    var stateNums = [];

    if (selectedDrugs?.length == 0 || (currentState != 'US' && showOverall)) {
      for (var rec in filteredData["US"])
        usNums.push(filteredData["US"][rec][currentDrug])

      if (currentState != 'US') {
        for (var rec in filteredData[currentState])
          stateNums.push(filteredData[currentState][rec][currentDrug])
      }
    }
    else
    {
      for (var idx in selectedDrugs) {
        for (var rec in filteredData["US"])
          usNums.push(filteredData["US"][rec][selectedDrugs[idx]])
      }
      for (var idx in selectedDrugs) {
        if (currentState != 'US') {
          for (var rec in filteredData[currentState])
            stateNums.push(filteredData[currentState][rec][selectedDrugs[idx]])
        }
      }
    }

    const usNumsFinal = usNums?.filter(i => !isNaN(i));
    const stateNumsFinal = stateNums?.filter(i => !isNaN(i));

    let usmax = usNumsFinal?.length > 0 ? Math.max(...usNumsFinal) : 0;
    let statemax = stateNumsFinal?.length > 0 ? Math.max(...stateNumsFinal) : 0;

    if (usmax < statemax)
      return statemax;
    else
      return usmax;
  }, 

  buildMonthNamesShortPeriod: (lookupPeriodStartYear, currentYear) => {

    var monthNamesShortPeriod = {}
    var mon = '';
    var cnt = 1;
  
    for (var yr = parseInt(lookupPeriodStartYear); yr <= parseInt(currentYear); yr++) {
      for (var i = 0; i < 12; i++) {
        switch (i) {
          case 0:
            mon = "Jan";
            break;
          case 1:
            mon = "Feb";
            break;
          case 2:
            mon = "Mar";
            break;
          case 3:
            mon = "Apr";
            break;
          case 4:
            mon = "May";
            break;
          case 5:
            mon = "Jun";
            break;
          case 6:
            mon = "Jul";
            break;
          case 7:
            mon = "Aug";
            break;
          case 8:
            mon = "Sep";
            break;
          case 9:
            mon = "Oct";
            break;
          case 10:
            mon = "Nov";
            break;
          case 11:
            mon = "Dec";
        }
        monthNamesShortPeriod[cnt] = mon + '-' + yr.toString().substring(2);
        cnt++
      }
    }
    return monthNamesShortPeriod;
  },
  
  buildMonthNumbersPeriodTBD: (filteredData) => {
  
    var monthNamesShortPeriod = {}
    var mon = '';
    var cnt = 1;
  
    for (var i = 0; i < filteredData.length; i++) {
      if (filteredData[i].year.length == 6) {
        switch (String(filteredData[i].year).substring(4)) {
          case '01':
            mon = String(filteredData[i].year).substring(0,4);
            break;
          default:
            mon = String(filteredData[i].year).substring(4)
            break;
        }
        monthNamesShortPeriod[cnt] = mon;
        cnt++
      }
      else
      {
        monthNamesShortPeriod[cnt] = filteredData[i].year;
        cnt++
      }
    }
  
    return monthNamesShortPeriod;
  },

    buildMonthNumbersPeriod: (filteredData) => {
  
    var monthNamesShortPeriod = {}
    var cnt = 1;
  
    for (var i = 0; i < filteredData.length; i++) {
        monthNamesShortPeriod[cnt] = filteredData[i].year;
        cnt++
    }
  
    return monthNamesShortPeriod;
  },
  
  
  buildMonthNamesPeriod: (filteredData) => {
  
    var monthNamesPeriod = {}
    var monFull = '';
    var cnt = 1;
  
    for (var i = 0; i < filteredData.length; i++) {
      if (filteredData[i].year.length == 6) {
          switch (String(filteredData[i].year).substring(4)) {
            case '01':
              monFull = "January"
              break;
            case '02':
              monFull = "February"
              break;
            case '03':
              monFull = "March"
              break;
            case '04':
              monFull = "April"
              break;
            case '05':
              monFull = "May"
              break;
            case '06':
              monFull = "June"
              break;
            case '07':
              monFull = "July"
              break;
            case '08':
              monFull = "August"
              break;
            case '09':
              monFull = "September"
              break;
            case '10':
              monFull = "October"
              break;
            case '11':
              monFull = "November"
              break;
            case '12':
              monFull = "December"
          }
          monthNamesPeriod[cnt] = monFull + ' ' + String(filteredData[i].year).substring(0, 4);
          cnt++
        }
      }
      return monthNamesPeriod;
  },

  getPrevMonYear : (yrmon) => {

      let yr = Number(yrmon.substring(0,4));
      let mon = String(Number(yrmon.substring(4)));
      let prevmon = '';
      let prevYr = yr;

      switch (mon) {
        case '1':
          prevmon = "December";
          prevYr = yr - 1;
          break;
        case '2':
          prevmon = "January"
          break;
        case '3':
          prevmon = "February"
          break;
        case '4':
          prevmon = "March"
          break;
        case '5':
          prevmon = "April"
          break;
        case '6':
          prevmon = "May"
          break;
        case '7':
          prevmon = "June"
          break;
        case '8':
          prevmon = "July"
          break;
        case '9':
          prevmon = "August"
          break;
        case '10':
          prevmon = "September"
          break;
        case '11':
          prevmon = "October"
          break;
        case '12':
          prevmon = "November";
          break;
      }

      return prevmon + ', ' + prevYr;

  },
  
  getMonthName : (month)=> {
  
      var monFull = '';
  
      switch (month) {
        case '1':
          monFull = "January"
          break;
        case '2':
          monFull = "February"
          break;
        case '3':
          monFull = "March"
          break;
        case '4':
          monFull = "April"
          break;
        case '5':
          monFull = "May"
          break;
        case '6':
          monFull = "June"
          break;
        case '7':
          monFull = "July"
          break;
        case '8':
          monFull = "August"
          break;
        case '9':
          monFull = "September"
          break;
        case '10':
          monFull = "October"
          break;
        case '11':
          monFull = "November"
          break;
        case '12':
          monFull = "December"
      }
  
      return monFull;
  },
  
  getMonthNumber : (month)=> {
  
      var monNum = 0;
  
      switch (month) {
        case 'January':
          monNum = 1;
          break;
        case 'February':
          monNum = 2;
          break;
        case 'March':
          monNum = 3;
          break;
        case 'April':
          monNum = 4;
          break;
        case 'May':
          monNum = 5;
          break;
        case 'June':
          monNum = 6;
          break;
        case 'July':
          monNum = 7;
          break;
        case 'August':
          monNum = 8;
          break;
        case 'September':
          monNum = 9;
          break;
        case 'October':
          monNum = 10;
          break;
        case 'November':
          monNum = 11;
          break;
        case 'December':
          monNum = 12;
      }
  
      return monNum;
  },

  areValidSelections: (lookupPeriodStartYear, lookupPeriodStartMonth, lookupPeriodEndYear, lookupPeriodEndMonth) => {
  
      var lsmStr = String(lookupPeriodStartYear) + (lookupPeriodStartMonth?.length == 1 ? String(lookupPeriodStartMonth).padStart(2, '0') :  String(lookupPeriodStartMonth));
      var lsm =  parseInt(lsmStr)
  
      var lemStr = String(lookupPeriodEndYear) + (lookupPeriodEndMonth?.length == 1 ? String(lookupPeriodEndMonth).padStart(2, '0') :  String(lookupPeriodEndMonth));
      var lem =  parseInt(lemStr)
      
      if (lsm < lem)
        return true
      else
        return false;
  },

  getAllIndexes(arr, val) {
      
      var indexes = [], i;
      for(i = 1; i <= Object.keys(arr).length; i++)
          if (arr[i]?.length === val)
              indexes.push(i);
      return indexes;
  },

  getSeriesColor : (currentDrug, key) => {

    var seriesColor;
       
    switch (currentDrug) {
      case 'all':
        seriesColor = (key === 'US') ? 'rgb(56, 71, 102)' : 'lightblue';
        break;
      case 'opioids':
        seriesColor = (key === 'US') ? 'rgb(0, 12, 119)' : 'lightblue';
        break;
      case 'heroin':
        seriesColor = (key === 'US') ? 'rgb(12, 111, 150)' : 'lightblue';
        break;
      case 'stimulants':
        seriesColor = (key === 'US') ? 'rgb(65, 27, 109)' : 'lightblue';
        break;
      case 'benzodiazepine':
        seriesColor = (key === 'US') ? 'rgb(184, 58, 94)' : 'lightblue';
        break;
      case 'fentanyl':
        seriesColor = (key === 'US') ? 'rgb(41, 72, 145)' : 'lightblue';
        break;
      case 'cocaine':
        seriesColor = (key === 'US') ? 'rgb(103, 26, 170)' : 'lightblue';
        break;
      case 'methamphetamine':
        seriesColor = (key === 'US') ? 'rgb(163, 120, 232)' : 'lightblue';
        break;
      }
  
      return seriesColor;
  },

  getSeriesColorLine : (currentDrug, key, showOverall) => {

    var seriesColor;
  
    if (!showOverall) {
      
      switch (currentDrug) {
        case 'all':
          seriesColor = 'rgb(56, 71, 102)';
          break;
        case 'opioids':
          seriesColor = 'rgb(0, 12, 119)';
          break;
        case 'heroin':
          seriesColor = 'rgb(12, 111, 150)';
          break;
        case 'stimulants':
          seriesColor = 'rgb(65, 27, 109)';
          break;
        case 'benzodiazepine':
          seriesColor = 'rgb(184, 58, 94)';
          break;
        case 'fentanyl':
          seriesColor = 'rgb(41, 72, 145)';
          break;
        case 'cocaine':
          seriesColor = 'rgb(103, 26, 170)';
          break;
        case 'methamphetamine':
          seriesColor = 'rgb(163, 120, 232)';
          break;
        }
    
        return seriesColor;
    }
    else
    {
      switch (currentDrug) {
        case 'all':
          seriesColor = (key !== 'US') ? 'rgb(56, 71, 102)' : 'rgb(56, 71, 102, 0.65)';
          break;
        case 'opioids':
          seriesColor = (key !== 'US') ? 'rgb(0, 12, 119)' : 'rgb(0, 12, 119, 0.65)';
          break;
        case 'heroin':
          seriesColor = (key !== 'US') ? 'rgb(12, 111, 150)' : 'rgb(12, 111, 150, 0.65)';
          break;
        case 'stimulants':
          seriesColor = (key !== 'US') ? 'rgb(65, 27, 109)' : 'rgb(65, 27, 109, 0.65)';
          break;
        case 'benzodiazepine':
          seriesColor = (key !== 'US') ? 'rgb(184, 58, 94)' : 'rgb(184, 58, 94, 0.65)';
          break;
        case 'fentanyl':
          seriesColor = (key !== 'US') ? 'rgb(41, 72, 145)' : 'rgb(41, 72, 145, 0.65)';
          break;
        case 'cocaine':
          seriesColor = (key !== 'US') ? 'rgb(103, 26, 170)' : 'rgb(103, 26, 170, 0.65)';
          break;
        case 'methamphetamine':
          seriesColor = (key !== 'US') ? 'rgb(163, 120, 232)' : 'rgb(163, 120, 232, 0.65)';
          break;
        }
      
          return seriesColor;
        }
  },

  getSeriesColorStart : (currentDrug, key) => {

    var seriesColor;
  
    switch (currentDrug) {
      case 'all':
        seriesColor = (key === 'US') ? 'rgb(173, 190, 203)' : 'lightblue';
        break;
      case 'opioids':
        seriesColor = (key === 'US') ? 'rgb(153, 158, 201)' : 'lightblue';
        break;
      case 'heroin':
        seriesColor = (key === 'US') ? 'rgb(158, 197, 213)' : 'lightblue';
        break;
      case 'stimulants':
        seriesColor = (key === 'US') ? 'rgb(179, 164, 197)' : 'lightblue';
        break;
      case 'benzodiazepine':
        seriesColor = (key === 'US') ? 'rgb(227, 176, 191)' : 'lightblue';
        break;
      case 'fentanyl':
        seriesColor = (key === 'US') ? 'rgb(169, 182, 211)' : 'lightblue';
        break;
      case 'cocaine':
        seriesColor = (key === 'US') ? 'rgb(194, 163, 221)' : 'lightblue';
        break;
      case 'methamphetamine':
        seriesColor = (key === 'US') ? 'rgb(218, 201, 246)' : 'lightblue';
        break;
      }
  
      return seriesColor;
  },

  convertValue : (val) => {
    if (val == 8888) //data not available
      return -1;
    else if (val == 7777) //unfunded
      return -2;
   else if (val == 9999) //data supressed
      return -3;
  else
      return val;
  },

  convertValueLine: (val, yrmon) => {
    if (val == 8888) //data not available
      return -1;
    else if (val == 7777) //unfunded
      return -2;
   else if (val == 9999) //data supressed
   {
     if (UtilityFunctions.isCovidPeriod(yrmon))
      return 9;
     else
      return -3;
   }
  else
      return val;
  },

  deleteStateKeys : (obj) => {
    for (let key in obj) {
      if (obj[key].rate == -2) {
        delete obj[key];
      }
    }
    return obj;
  },

  getPeriod : (currentYear, currentMonth) => {
    const monthNames = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December', 'all': 'All Months' };

    let d = new Date(currentYear + '/' + currentMonth + '/' + '01');
    d.setMonth(d.getMonth() - 11);
    return d.toLocaleString('default', { month: 'long' }) + ' ' + d.getFullYear() + ' – ' + monthNames[Number(currentMonth)] + ' ' + currentYear; 
  },

  getPeriodM : (currentYear, currentMonth) => {
    const monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec', 'all': 'All Months' };

    let d = new Date(currentYear + '/' + currentMonth + '/' + '01');
    d.setMonth(d.getMonth() - 11);
    return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear() + ' – ' + monthNames[Number(currentMonth)] + ' ' + currentYear; 
  },

  isCovidPeriod : (yearmon) => {
    return covidPeriod.includes(yearmon);
  },

  isCovidPeriodLine : (timeFrame, yearmon) => {
    if (timeFrame == 'Monthly')
      return covidPeriod.includes(yearmon);
    else
      return covidPeriodAnnual.includes(yearmon);
  },

  isCovidPeriodAnnual : (yearmon) => {
    return covidPeriodAnnual.includes(yearmon);
  },

  isCovidPeriodGrayBox : (currentTimeLine, currentYear, currentMonth) => {
    return ((currentTimeLine == 'Monthly' && UtilityFunctions.isCovidPeriod(currentYear + String(currentMonth).padStart(2, '0'))) ||
      (currentTimeLine == 'Annual' && UtilityFunctions.isCovidPeriodAnnual(currentYear + String(currentMonth).padStart(2, '0'))));
  },

  doesEndWithCovidPeriod : (timeFrame, data, st) => {
    var cnt = data[st].length;
    if (timeFrame == 'Monthly')
      return covidPeriod.includes(data[st][cnt - 1]['year']);
    else
      return covidPeriodAnnual.includes(data[st][cnt - 1]['year']);
  },

  containsCovidPeriod : (timeFrame, stYr, stMon, endYr, endMon)  => {
    var monthsArray = UtilityFunctions.generateYYMMArray(Number(stYr), Number(stMon), Number(endYr), Number(endMon));
    var ret = false;
    for(let j=0;j<monthsArray.length;j++) {
      if (timeFrame == 'Monthly') {
        if (UtilityFunctions.isCovidPeriod(monthsArray[j]))
          ret = true;
      }
      else {
        if (UtilityFunctions.isCovidPeriodAnnual(monthsArray[j]))
          ret = true;
      }
    }
    return ret;
  },

  isCovidPeriodNoLine : (timeFrame, nextPoint, curPoint) => {

    if (timeFrame == 'Monthly') {
      if (UtilityFunctions.isCovidPeriod(nextPoint))
        return true;

      if (UtilityFunctions.isCovidPeriod(curPoint))
        return true;
    }
    else
    {
      if (UtilityFunctions.isCovidPeriodAnnual(nextPoint))
      return true;

    if (UtilityFunctions.isCovidPeriodAnnual(curPoint))
      return true;
    }
  },

  getCovidPeriodIndex : (timeFrame, yr) => {
    if (timeFrame == 'Monthly')
      return covidPeriod.indexOf(yr);
    else
      return covidPeriodAnnual.indexOf(yr);
  },

  allDataIsSupressed : (fdata) => {
  
      var ret = true;
      for (var x=0;x<fdata.length;x++)
      {
        if (fdata[x].value > 0) {
          ret = false;
          break;
        }
      }
      return ret;
  },

  allDataIsSupressedSA : (fdata) => {
  
      var ret = true;
      for (var x=0;x<fdata.length;x++)
      {
        if (fdata[x].F > 0 || fdata[x].M > 0) {
          ret = false;
          break;
        }
      }
      return ret;
  },

  dataIsSupressedEthn : (fdata) => {
    var ret = false;
    if (fdata == 9999)
        ret = true;
    
    return ret;
  },

  allDataIsSupressedMap : (fdata) => {

      var ret = true;
      for (var x=0;x<Object.keys(fdata).length;x++)
      {
        if (fdata[Object.keys(fdata)[x]] > 0) {
          ret = false;
          break;
        }
      }
      return ret;
  },

  getObjectWithCommonKeys : (obj1, obj2) => {
    const commonKeys = Object.keys(obj1).filter(key => Object.keys(obj2).includes(key));
    const result = {};

    for (const key of commonKeys) {
      result[key] = obj1[key]; 
    }

    return result;
  },

  lastPointIsNaN : (fdata, cdrug) => {
    if (fdata[fdata.length - 1][cdrug] > 0)
      return false;
    else
      return true;
  }, 

  lastValidPointY : (fdata, cdrug) => {
    var ret = fdata[fdata.length-1][cdrug];
    for (var x=fdata.length-1;x>0;x--)
    {
      if (fdata[x][cdrug] > 0) {
        ret = fdata[x][cdrug];
        break;
      }
    }
    return ret;
  },

  lastValidPointX : (fdata, cdrug) => {
    var ret = fdata.length-1;
    for (var x=fdata.length-1;x>0;x--)
    {
      if (fdata[x][cdrug] > 0) {
        ret = x;
        break;
      }
    }
    return ret;
  },

  enoughYdiff : (fdata, cdrug, yMax) => {
    var ret = fdata.length-1;
    for (var x=fdata.length-1;x>0;x--)
    {
      if (fdata[x][cdrug] > 0) {
        ret = fdata[x][cdrug];
        break;
      }
    }
    return (ret != fdata.length-1 && ret/yMax > 0.3) ? true : false;
  },
  
  getCovidGrayBox : (hgt, wid, forTitle) => {
    return (
      <Fragment>
        <>
        <div style={{ height: hgt - 100, width: wid, textAlign: 'left', display: 'flex', alignItems: 'center', backgroundColor: '#E7E7E7', fontWeight: 'bold', borderRadius: '30px'}}><p style={{ textAlign: 'left', fontWeight: 'bold', padding: '20px'}}><strong>{forTitle}</strong>Grayed out figure represents the COVID-19 pandemic and is distinct from data suppression for other reasons.</p></div>
        </>
        </Fragment>
        )
  },

  getNoDataGrayBoxForEthn : (hgt, wid, forTitle) => {
    return (
      <Fragment>
        <>
        <div style={{ height: hgt + 40, width: wid, textAlign: 'left', display: 'flex', alignItems: 'center', backgroundColor: '#E7E7E7', fontWeight: 'bold', borderRadius: '30px'}}><p style={{ textAlign: 'left', fontWeight: 'bold', padding: '20px'}}><strong>{forTitle}</strong>Grayed out figure represents time periods where race/ethnicity data missingness is greater than 10% and is distinct from data suppression for other reasons. </p></div>
        </>
        </Fragment>
        )
       
  },

  getAnnualNoDataGrayBoxForEthn : (hgt, wid, forTitle) => {
    return (
      <Fragment>
        <>
        <div style={{ height: hgt + 40, width: wid, textAlign: 'left', display: 'flex', alignItems: 'center', backgroundColor: '#E7E7E7', fontWeight: 'bold', borderRadius: '30px'}}><p style={{ textAlign: 'left', fontWeight: 'bold', padding: '20px'}}><strong>{forTitle}</strong>For annual rates, data are available starting with the 12-month period ending in December 2023. Race/ethnicity data prior to 2023 are not shown due to race/ethnicity missingness greater than 10%.</p></div>
        </>
        </Fragment>
        )
       
  },

  isBold : (element) => {
    const computedStyle = window.getComputedStyle(element);
    const fontWeight = computedStyle.fontWeight;

    if (fontWeight === 'bold' || parseInt(fontWeight, 10) >= 700) {
      return true;
    }
    return false;
  },
}