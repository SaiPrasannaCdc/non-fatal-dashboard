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

    generateBarChartData : (data) => {
   
      let myData = {};

       for (var i=0;i<Object.keys(data).length;i++)
      {
        let obj = {};
        let drug = Object.keys(data)[i];
        obj['rate'] = data[drug].rate;
        myData[drug] = obj;
      }

      return myData;
  
    },  

    generateMapData : (data, stateNames) => {

      let myData = {};

      for (var i=0;i<Object.keys(data).length;i++)
      {
        let obj = {};
        obj['rate'] = data[Object.keys(data)[i]];
        let st = stateNames[Object.keys(data)[i]];
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
          if (selDrugs.includes('all'))
            obj['all'] = data['US'][i].all;

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

          if (selDrugs.includes('opioids'))
            obj['opioids'] = data['US'][i].opioids;

          if (selDrugs.includes('stimulants'))
            obj['stimulants'] = data['US'][i].stimulants;

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
            obj['Overall'] = data['US'][i].all;
            obj[stateNames[state]] = data[state][i].all;
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

          if (currentDrug == 'opioids') {
             obj['Overall'] = data['US'][i].opioids;
            obj[stateNames[state]] = data[state][i].opioids;
          }

          if (currentDrug == 'stimulants') {
             obj['Overall'] = data['US'][i].stimulants;
            obj[stateNames[state]] = data[state][i].stimulants;
          }

          let monyr = data['US'][i].year;
          myData[monyr] = obj;
        }
      }

      return myData;
  
    },  
 
    generateSexAgeChartData : (data) => {
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

    generateSexChartData : (data) => {
      let myData = {};

      for (var i=0;i<data.length;i++)
      {
        let obj = {};
        obj['rate'] = data[i].value;
        myData[data[i].sex] = obj;
      }

      return myData;
  
    },  

    generateAgeChartData : (data) => {
      let myData = {};

      for (var i=0;i<data.length;i++)
      {
        let obj = {};
        obj['rate'] = data[i].value;
        myData[data[i].age] = obj;
      }


      return myData;
  
    },  
}