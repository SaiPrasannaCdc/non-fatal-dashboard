export const UtilityFunctions = {

  getSeriesColor : (currentDrug, key) => {

    var seriesColor;
  
    switch (currentDrug) {
      case 'alldrug':
        seriesColor = (key === 'US') ? 'rgb(56, 71, 102)' : 'lightblue';
        break;
      case 'opioid':
        seriesColor = (key === 'US') ? 'rgb(0, 12, 119)' : 'lightblue';
        break;
      case 'heroin':
        seriesColor = (key === 'US') ? 'rgb(12, 111, 150)' : 'lightblue';
        break;
      case 'stimulant':
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
        case 'alldrug':
          seriesColor = 'rgb(56, 71, 102)';
          break;
        case 'opioid':
          seriesColor = 'rgb(0, 12, 119)';
          break;
        case 'heroin':
          seriesColor = 'rgb(12, 111, 150)';
          break;
        case 'stimulant':
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
        case 'alldrug':
          seriesColor = (key !== 'US') ? 'rgb(56, 71, 102)' : 'rgb(56, 71, 102, 0.65)';
          break;
        case 'opioid':
          seriesColor = (key !== 'US') ? 'rgb(0, 12, 119)' : 'rgb(0, 12, 119, 0.65)';
          break;
        case 'heroin':
          seriesColor = (key !== 'US') ? 'rgb(12, 111, 150)' : 'rgb(12, 111, 150, 0.65)';
          break;
        case 'stimulant':
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

 calculateYScaleDomain: (filteredData, currentDrug, selectedDrugs, currentState)=> {

    var usNums = [];
    var stateNums = [];

    if (selectedDrugs?.length == 0 || currentState != 'US') {
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

  calculateMax: (filteredData)=> {

    var nums = [];

    for (var rec in filteredData)
        nums.push(filteredData[rec].rate)
    
    const numsFinal = nums?.filter(i => !isNaN(i));
    let max = numsFinal?.length > 0 ? Math.max(...numsFinal) : 0;

    return max;
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
  
  buildMonthNumbersPeriod: (filteredData) => {
  
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

  toFixed: (num, places = 1) => {
    if (num !== undefined) {
      if (num.toFixed) {
        return num.toFixed(places);
      }
      if (!isNaN(parseFloat(num))) {
        return parseFloat(num).toFixed(places)
      }
    }
    return num;
  },

  isStateInSupportedStates: (supportedJuris, ds, yr, mon, tframe, state) => {
    let monMain = tframe != 'Monthly' ? '00' : String(mon).padStart(2, '0');
    let key = ds + '_' + yr + monMain;

    let strStates = supportedJuris[key]?.split(',');
    return strStates.includes(state);
  },

}