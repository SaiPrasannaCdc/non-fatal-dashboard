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
  
  calculateMax: (filteredData)=> {

    var nums = [];

    for (var rec in filteredData)
        nums.push(filteredData[rec].rate)
    
    const numsFinal = nums?.filter(i => !isNaN(i));
    let max = numsFinal?.length > 0 ? Math.max(...numsFinal) : 0;

    return max;
  },

}