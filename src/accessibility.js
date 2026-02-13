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
        obj['Female'] = isNaN(data[i].F) ? data[i].F : Number(data[i].F).toLocaleString('en-US');
        obj['Male'] = isNaN(data[i].M) ? data[i].M : Number(data[i].M).toLocaleString('en-US');
        myData[age] = obj;
      }

      return myData;
  
    },  

    generateMapData : (data, stateNames, stateName, filteredDataCY) => {

      let myData = {};

      if (stateName == 'US') {
        for (var i=0;i<Object.keys(data).length;i++)
        {
          let obj = {};
          obj['county'] = data[Object.keys(data)[i]].county;
          obj['rate'] = data[Object.keys(data)[i]].rate;
          obj['count'] = isNaN(data[Object.keys(data)[i]].count) ? data[Object.keys(data)[i]].count : Number(data[Object.keys(data)[i]].count).toLocaleString('en-US');
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
          obj['count'] = isNaN(data[Object.keys(data)[i]].count) ? data[Object.keys(data)[i]].count : Number(data[Object.keys(data)[i]].count).toLocaleString('en-US');
          let st = stateNames[data[Object.keys(data)[i]].state] + '_' + i.toString();
          if (data[Object.keys(data)[i]].state == stateName)
            myData[st] = obj;
        }

        if (Object.keys(myData).length == 0)
        {
          for (var i=0;i<Object.keys(filteredDataCY).length;i++)
          {
            let obj = {};
            obj['county'] = filteredDataCY[Object.keys(filteredDataCY)[i]].county;
            obj['rate'] = 'PH';
            obj['count'] = 'PH';
            let st = stateNames[filteredDataCY[Object.keys(filteredDataCY)[i]].state] + '_' + i.toString();
            if (filteredDataCY[Object.keys(filteredDataCY)[i]].state == stateName)
              myData[st] = obj;
          }
        }
      }

      return myData;
      },  

    getPercChange : (drug, yr, st, changePrecValues) => {

        var rec;
        var perc = 0;
        var diff;
    
        for (var i=0; i<changePrecValues?.length; i++) {
          if (changePrecValues[i].yr == yr && changePrecValues[i].drug == drug && changePrecValues[i].state == st) {
            rec = changePrecValues[i];
            break
          }
        }
    
        if (rec != null && !isNaN(rec.valPrev)) {
          if (rec.value != rec.valPrev) {
              diff =  rec.value - rec.valPrev;
              perc = ((diff / rec.valPrev) * 100)
          }
    
          return !isNaN(perc) ? perc.toFixed(1) : '';
        }
        return '';
    },

    getCountMonthly : (drug, yr, st, data) => {

      var cnt;
      for (var i=0;i<Object.keys(data).length;i++) {
        if (data[i].year == yr.substring(0,4) && data[i].month == String(Number(yr.substring(4))) && data[i].drug == drug) {
          cnt = data[i].count;
          break;
        }
      }

      return isNaN(cnt) ? cnt : Number(cnt).toLocaleString('en-US');
    },

    getCountYearly : (drug, yr, st, data) => {
      var cnt;
      for (var i=0;i<Object.keys(data).length;i++) {
        if (data[i].year == yr && data[i].drug == drug) {
          cnt = data[i].count;
          break;
        }
      }

      return isNaN(cnt) ? cnt : Number(cnt).toLocaleString('en-US');
    },

    getCountMonthlyNonUS : (drug, yr, st, data, currentDataSource) => {
      var cnt;
      for (var i=0;i<Object.keys(data[currentDataSource][drug][String(Number(yr.substring(4)))]).length;i++) {
            if (data[currentDataSource][drug][String(Number(yr.substring(4)))][i]['state'] == st)
            {
              cnt = data[currentDataSource][drug][String(Number(yr.substring(4)))][i][yr.substring(0,4)];
              break;
            }
          }

      return isNaN(cnt) ? cnt : Number(cnt).toLocaleString('en-US');
    },

    getCountYearlyNonUS : (drug, yr, st, data, currentDataSource) => {
      var cnt;
        for (var i=0;i<Object.keys(data[currentDataSource][drug]['all']).length;i++) {
          if (data[currentDataSource][drug]['all'][i]['state'] == st) {
            cnt = data[currentDataSource][drug]['all'][i][yr];
            break;
          }
        }

        return isNaN(cnt) ? cnt : Number(cnt).toLocaleString('en-US');
    },

    generateLineChartData : (stateData, data, currentDataSource, countsDataYearly, countsDataMonthly, countsDataYearlyUS, countsDataMonthlyUS, currentDrug, selDrugs, state, stateNames, currentTimeframe, showCompare, showOverall, showPercent, showCount, compareState, changePrecValues) => {

      let myData = {};
      if (!showOverall) { 
        if (!showCompare)  
        { 
          for (var i=0;i<Object.keys(data['US']).length;i++)
          {
            let obj = {};

            if (selDrugs.includes('alldrug')) {
              obj['alldrug'] = data[state][i].alldrug;

              if (showPercent)
                obj['alldrug_pct'] = AccessibilityFunctions.getPercChange('alldrug', data['US'][i].year, state, changePrecValues);

            }

            if (selDrugs.includes('benzodiazepine')) {
              obj['benzodiazepine'] = data[state][i].benzodiazepine;

              if (showPercent)
                obj['benzodiazepine_pct'] = AccessibilityFunctions.getPercChange('benzodiazepine', data['US'][i].year, state, changePrecValues);

            }

            if (selDrugs.includes('cocaine')) {
              obj['cocaine'] = data[state][i].cocaine;

              if (showPercent)
                obj['cocaine_pct'] = AccessibilityFunctions.getPercChange('cocaine', data['US'][i].year, state, changePrecValues);

            }

            if (selDrugs.includes('fentanyl')) {
              obj['fentanyl'] = data[state][i].fentanyl;

              if (showPercent)
                obj['fentanyl_pct'] = AccessibilityFunctions.getPercChange('fentanyl', data['US'][i].year, state, changePrecValues);
            }

            if (selDrugs.includes('heroin')) {
              obj['heroin'] = data[state][i].heroin;

              if (showPercent)
                obj['heroin_pct'] = AccessibilityFunctions.getPercChange('heroin', data['US'][i].year, state, changePrecValues);

            }

            if (selDrugs.includes('methamphetamine')) {
              obj['methamphetamine'] = data[state][i].methamphetamine;

              if (showPercent)
                obj['methamphetamine_pct'] = AccessibilityFunctions.getPercChange('methamphetamine', data['US'][i].year, state, changePrecValues);

            }

            if (selDrugs.includes('opioid')) {
              obj['opioid'] = data[state][i].opioid;

              if (showPercent)
                obj['opioid_pct'] = AccessibilityFunctions.getPercChange('opioid', data['US'][i].year, state, changePrecValues);

            }

            if (selDrugs.includes('stimulant')) {
              obj['stimulant'] = data[state][i].stimulant;

              if (showPercent)
                obj['stimulant_pct'] = AccessibilityFunctions.getPercChange('stimulant', data['US'][i].year, state, changePrecValues);

            }

            if (showCount && selDrugs.includes('alldrug'))
                obj['alldrug_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('alldrug', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('alldrug', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('benzodiazepine'))
                obj['benzodiazepine_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('benzodiazepine', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('benzodiazepine', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('cocaine'))
                obj['cocaine_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('cocaine', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('cocaine', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('fentanyl'))
                obj['fentanyl_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('fentanyl', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('fentanyl', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('heroin'))
                obj['heroin_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('heroin', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('heroin', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('methamphetamine'))
                obj['methamphetamine_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('methamphetamine', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('methamphetamine', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('opioid'))
                obj['opioid_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('opioid', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('opioid', data['US'][i].year, state, countsDataYearly);
            
              if (showCount && selDrugs.includes('stimulant'))
                obj['stimulant_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('stimulant', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('stimulant', data['US'][i].year, state, countsDataYearly);

              let monyr = currentTimeframe == 'Monthly' ? (UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4)) : data['US'][i].year;

              myData[monyr] = obj;
          }
        }
        else
        {

          for (var i=0;i<Object.keys(data[compareState]).length;i++)
          {
            let obj = {};

            if (currentDrug == 'alldrug') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].alldrug;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);
                
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].alldrug;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'benzodiazepine') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].benzodiazepine;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);
                
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].benzodiazepine;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'cocaine') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].cocaine;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);
                
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].cocaine;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'fentanyl') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].fentanyl;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);
                
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].fentanyl;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'heroin') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].heroin;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);
                
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].heroin;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'methamphetamine') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].methamphetamine;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);
                
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].methamphetamine;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'opioid') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].opioid;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);

              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].opioid;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'stimulant') {
              if (showCompare)
                obj['Overall'] = data[compareState][i].stimulant;

              if (showPercent)
                if (showCompare)
                  obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, compareState, changePrecValues);

              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].stimulant;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (showCount) {
                if (showCompare)
                obj['Overall_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly(currentDrug, data['US'][i].year, compareState, countsDataMonthly) : AccessibilityFunctions.getCountYearly(currentDrug, data['US'][i].year, compareState, countsDataYearly);
              
                obj['state_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthlyNonUS(currentDrug, data['US'][i].year, state, stateData, currentDataSource) : AccessibilityFunctions.getCountYearlyNonUS(currentDrug, data['US'][i].year, state, stateData, currentDataSource);
            }

            let monyr = currentTimeframe == 'Monthly' ? (UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4)) : data['US'][i].year;
            myData[monyr] = obj;
          }
        }
      }
      else
      {
          for (var i=0;i<Object.keys(data['US']).length;i++)
          {
            let obj = {};

            if (currentDrug == 'alldrug') {
              if (showOverall)
                obj['Overall'] = data['US'][i].alldrug;

              if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].alldrug;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'benzodiazepine') {
              if (showOverall)
                obj['Overall'] = data['US'][i].benzodiazepine;

              if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].benzodiazepine;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'cocaine') {
              if (showOverall)
                obj['Overall'] = data['US'][i].cocaine;

              if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].cocaine;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'fentanyl') {
              if (showOverall)
                obj['Overall'] = data['US'][i].fentanyl;

              if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].fentanyl;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'heroin') {
              if (showOverall)
                obj['Overall'] = data['US'][i].heroin;

              if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].heroin;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'methamphetamine') {
              if (showOverall)
                obj['Overall'] = data['US'][i].methamphetamine;

            if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
            for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].methamphetamine;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'opioid') {
              if (showOverall)
                obj['Overall'] = data['US'][i].opioid;

            if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);
              
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].opioid;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (currentDrug == 'stimulant') {
              if (showOverall)
                obj['Overall'] = data['US'][i].stimulant;

            if (showPercent)
                obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);

              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) 
                  obj['state'] = data[state][j].stimulant;
              }

              if (showPercent)
                obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);
            }

            if (showCount) {
                if (showOverall)
                obj['Overall_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly(currentDrug, data['US'][i].year, 'US', countsDataMonthlyUS) : AccessibilityFunctions.getCountYearly(currentDrug, data['US'][i].year, 'US', countsDataYearlyUS);
              
                obj['state_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthlyNonUS(currentDrug, data['US'][i].year, state, stateData, currentDataSource) : AccessibilityFunctions.getCountYearlyNonUS(currentDrug, data['US'][i].year, state, stateData, currentDataSource);
            }

            let monyr = currentTimeframe == 'Monthly' ? (UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4)) : data['US'][i].year;
            myData[monyr] = obj;
          }
    }

    return myData;
  
    },
    
    generateEthnChartData : (data) => {
      let myData = {};

      const sortedArray = Object.values(data).sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });

      for (var i=0;i<sortedArray.length;i++)
      {
        let obj = {};
        let ethn = sortedArray[i].ethnN;
        obj['val'] = isNaN(sortedArray[i].rate) ? sortedArray[i].rate : Number(sortedArray[i].rate).toLocaleString('en-US');
        myData[ethn] = obj;
      }

      return myData;
  
    },  
}