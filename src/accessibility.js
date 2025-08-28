import { UtilityFunctions } from './utility'

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
        let drugN = drug.replace('all','All Drugs').replace('benzodiazepine','Benzodiazepine').replace('cocaine','Cocaine').replace('heroin','Heroin').replace('fentanyl','Fentanyl').replace('methamphetamine','Methamphetamine').replace('opioids','All Opioids').replace('stimulants','All Stimulants');
        obj['rate'] = data[drug].rate;
        myData[drugN] = obj;
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

    generateLineChartData : (data, currentDrug, selDrugs, state, stateNames, showOverall, isSVP) => {

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

          let monyr = UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4);
          myData[monyr] = obj;
        }
      }
      else
      {
        for (var i=0;i<Object.keys(data['US']).length;i++)
        {
          var stateN = stateNames[state] + (isSVP ? '' : ''); //TODO

          let obj = {};
          if (currentDrug == 'all') {
            if (showOverall)
              obj['Overall'] = data['US'][i].all;

            obj[stateN] = data[state][i].all;
          }

          if (currentDrug == 'benzodiazepine') {
            if (showOverall)
                obj['Overall'] = data['US'][i].benzodiazepine;

            obj[stateN] = data[state][i].benzodiazepine;
          }

          if (currentDrug == 'cocaine') {
            if (showOverall)
              obj['Overall'] = data['US'][i].cocaine;

            obj[stateN] = data[state][i].cocaine;
          }

          if (currentDrug == 'fentanyl') {
            if (showOverall)
              obj['Overall'] = data['US'][i].fentanyl;

            obj[stateN] = data[state][i].fentanyl;
          }

          if (currentDrug == 'heroin') {
            if (showOverall)
              obj['Overall'] = data['US'][i].heroin;

            obj[stateN] = data[state][i].heroin;
          }

          if (currentDrug == 'methamphetamine') {
            if (showOverall)
              obj['Overall'] = data['US'][i].methamphetamine;

            obj[stateN] = data[state][i].methamphetamine;
          }

          if (currentDrug == 'opioids') {
            if (showOverall)
             obj['Overall'] = data['US'][i].opioids;

            obj[stateN] = data[state][i].opioids;
          }

          if (currentDrug == 'stimulants') {
            if (showOverall)
             obj['Overall'] = data['US'][i].stimulants;

            obj[stateN] = data[state][i].stimulants;
          }

          let monyr = UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4);
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
        let age = data[i].ageN;
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
        myData[data[i].ageN] = obj;
      }


      return myData;
  
    },  
}