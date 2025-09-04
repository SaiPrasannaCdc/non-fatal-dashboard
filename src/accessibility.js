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

    generateMapData : (data, stateNames, stateName) => {

      let myData = {};

      if (stateName == 'US') {
        for (var i=0;i<Object.keys(data).length;i++)
        {
          let obj = {};
          obj['county'] = data[Object.keys(data)[i]].county;
          obj['rate'] = data[Object.keys(data)[i]].rate;
          obj['count'] = data[Object.keys(data)[i]].count;
          let st = stateNames[data[Object.keys(data)[i]].state] + '_' + i.toString();
          myData[st] = obj;
        }
      }
      else
      {
        for (var i=0;i<Object.keys(data).length;i++)
        {
          let obj = {};
          obj['county'] = data[Object.keys(data)[i]].county;
          obj['rate'] = data[Object.keys(data)[i]].rate;
          obj['count'] = data[Object.keys(data)[i]].count;
          let st = stateNames[data[Object.keys(data)[i]].state] + '_' + i.toString();
          if (data[Object.keys(data)[i]].state == stateName)
            myData[st] = obj;
        }
      }

      return myData;
  
    },  

    generateLineChartData : (data, currentDrug, selDrugs, state, stateNames, currentTimeframe) => {

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

          let monyr = currentTimeframe == 'Monthly' ? (UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4)) : data['US'][i].year;
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
             obj[stateNames[state]] = '';
            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) {
                obj[stateNames[state]] = data[state][j].alldrug;
              }
            }
          }

          if (currentDrug == 'benzodiazepine') {
            obj['Overall'] = data['US'][i].benzodiazepine;
            obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].benzodiazepine;
                }
              }
          }

          if (currentDrug == 'cocaine') {
            obj['Overall'] = data['US'][i].cocaine;
             obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].cocaine;
                }
              }
          }

          if (currentDrug == 'fentanyl') {
             obj['Overall'] = data['US'][i].fentanyl;
              obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].fentanyl;
                }
              }
          }

          if (currentDrug == 'heroin') {
             obj['Overall'] = data['US'][i].heroin;
              obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].heroin;
                }
              }
          }

          if (currentDrug == 'methamphetamine') {
            obj['Overall'] = data['US'][i].methamphetamine;
            obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].methamphetamine;
                }
              }
          }

          if (currentDrug == 'opioid') {
             obj['Overall'] = data['US'][i].opioid;
              obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].opioid;
                }
              }
          }

          if (currentDrug == 'stimulant') {
             obj['Overall'] = data['US'][i].stimulant;
              obj[stateNames[state]] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj[stateNames[state]] = data[state][j].stimulant;
                }
              }
          }

          let monyr = currentTimeframe == 'Monthly' ? (UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4)) : data['US'][i].year;
          myData[monyr] = obj;
        }
      }
            
      return myData;
  
    },  
  
}