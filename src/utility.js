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

  let usmax = usNums?.length > 0 ? Math.max(...usNums) : 0;
  let statemax = stateNums?.length > 0 ? Math.max(...stateNums) : 0;

  if (usmax < statemax)
    return statemax;
  else
    return usmax;
}
}