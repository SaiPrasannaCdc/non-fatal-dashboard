export const UtilityFunctions = {

  getSeriesColor : (currentDrug, key) => {

    var seriesColor;
  
    switch (currentDrug) {
      case 'alldrug':
        seriesColor = (key === 'US') ? 'rgb(43, 45, 115)' : 'lightblue';
        break;
      case 'opioid':
        seriesColor = (key === 'US') ? 'rgb(74, 40, 102)' : 'lightblue';
        break;
      case 'heroin':
        seriesColor = (key === 'US') ? 'rgb(53, 53, 53)' : 'lightblue';
        break;
      case 'stimulant':
        seriesColor = (key === 'US') ? 'rgb(36, 87, 78)' : 'lightblue';
        break;
      }
  
      return seriesColor;
  },

 calculateYScaleDomain: (filteredData, currentDrug, currentState)=> {

    var usNums = [];
    var stateNums = [];

    for (var rec in filteredData["US"])
      usNums.push(filteredData["US"][rec][currentDrug])

    if (currentState != 'US') {
      for (var rec in filteredData[currentState])
        stateNums.push(filteredData[currentState][rec][currentDrug])
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

}