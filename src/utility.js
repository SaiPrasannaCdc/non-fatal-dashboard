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
  }

}