export const AccessibilityFunctions = {

    generateStateChartData : (data) => {

      let myData = {};

      for (var i=0;i<Object.keys(data).length;i++)
      {
        let obj = {};
        let jur = Object.keys(data)[i];
        obj['rate'] = data[jur].rate;
        myData[jur] = obj;
      }

      return myData;
  
    },  

    generateSexChartData : (data) => {

      let myData = {};

      for (var i=0;i<data.length;i++)
      {
        let obj = {};
        let age = data[i].age;
        obj['Female'] = data[i].F;
        obj['Male'] = data[i].M;
        myData[age] = obj;
      }

      return myData;
  
    },  

    generateMapData : (data, stateNames) => {

      let myData = {};

      for (var i=0;i<Object.keys(data).length;i++)
      {
        let obj = {};
        obj['county'] = data[Object.keys(data)[i]].county;
        obj['rate'] = data[Object.keys(data)[i]].rate;
        obj['count'] = data[Object.keys(data)[i]].count;
        let st = stateNames[data[Object.keys(data)[i]].state] + '_' + i.toString();
        myData[st] = obj;
      }

      return myData;
  
    },  

    generateLineChartData : (data, currentDrug, selDrugs, state, stateNames) => {

      let myData = {};
    
      if (state == 'US') {
        for (var i=0;i<Object.keys(data['US']).length;i++)
        {
          let obj = {};
          if (selDrugs.includes('alldrug'))
            obj['alldrug'] = data['US'][i].alldrug;

          if (selDrugs.includes('benzodiazepine'))
            obj['benzodiazepine'] = data['US'][i].benzodiazepine;

          if (selDrugs.includes('cocaine'))
            obj['cocaine'] = data['US'][i].cocaine;

          if (selDrugs.includes('fentanyl'))
            obj['fentanyl'] = data['US'][i].fentanyl;

          if (selDrugs.includes('heroin'))
            obj['heroin'] = data['US'][i].heroin;

          if (selDrugs.includes('methamphetamine'))
            obj['methamphetamine'] = data['US'][i].methamphetamine;

          if (selDrugs.includes('opioid'))
            obj['opioid'] = data['US'][i].opioid;

          if (selDrugs.includes('stimulant'))
            obj['stimulant'] = data['US'][i].stimulant;

          let monyr = data['US'][i].year;
          myData[monyr] = obj;
        }
      }
      else
      {
        for (var i=0;i<Object.keys(data['US']).length;i++)
        {
          let obj = {};
          if (currentDrug == 'alldrug') {
            obj['Overall'] = data['US'][i].alldrug;
            obj[stateNames[state]] = data[state][i].alldrug;
          }

          if (currentDrug == 'benzodiazepine') {
             obj['Overall'] = data['US'][i].benzodiazepine;
            obj[stateNames[state]] = data[state][i].benzodiazepine;
          }

          if (currentDrug == 'cocaine') {
            obj['Overall'] = data['US'][i].cocaine;
            obj[stateNames[state]] = data[state][i].cocaine;
          }

          if (currentDrug == 'fentanyl') {
             obj['Overall'] = data['US'][i].fentanyl;
            obj[stateNames[state]] = data[state][i].fentanyl;
          }

          if (currentDrug == 'heroin') {
             obj['Overall'] = data['US'][i].heroin;
            obj[stateNames[state]] = data[state][i].heroin;
          }

          if (currentDrug == 'methamphetamine') {
            obj['Overall'] = data['US'][i].methamphetamine;
            obj[stateNames[state]] = data[state][i].methamphetamine;
          }

          if (currentDrug == 'opioid') {
             obj['Overall'] = data['US'][i].opioid;
            obj[stateNames[state]] = data[state][i].opioid;
          }

          if (currentDrug == 'stimulant') {
             obj['Overall'] = data['US'][i].stimulant;
            obj[stateNames[state]] = data[state][i].stimulant;
          }

          let monyr = data['US'][i].year;
          myData[monyr] = obj;
        }
      }

      return myData;
  
    },  
  
}