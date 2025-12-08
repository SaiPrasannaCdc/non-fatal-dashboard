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

    generateMapData : (data, stateNames, stateName) => {

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
    
          return perc.toFixed(2);
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

    generateLineChartData : (stateData, data, currentDataSource, countsDataYearly, countsDataMonthly, currentDrug, selDrugs, state, stateNames, currentTimeframe, showPercent, showCount, showOverall, changePrecValues) => {

      let myData = {};
      if (state == 'US') {
        for (var i=0;i<Object.keys(data['US']).length;i++)
        {
          let obj = {};

          if (selDrugs.includes('alldrug')) {
            obj['alldrug'] = data['US'][i].alldrug;

            if (showPercent)
              obj['alldrug_pct'] = AccessibilityFunctions.getPercChange('alldrug', data['US'][i].year, state, changePrecValues);

          }

          if (selDrugs.includes('benzodiazepine')) {
            obj['benzodiazepine'] = data['US'][i].benzodiazepine;

            if (showPercent)
              obj['benzodiazepine_pct'] = AccessibilityFunctions.getPercChange('benzodiazepine', data['US'][i].year, state, changePrecValues);

          }

          if (selDrugs.includes('cocaine')) {
            obj['cocaine'] = data['US'][i].cocaine;

            if (showPercent)
              obj['cocaine_pct'] = AccessibilityFunctions.getPercChange('cocaine', data['US'][i].year, state, changePrecValues);

          }

          if (selDrugs.includes('fentanyl')) {
            obj['fentanyl'] = data['US'][i].fentanyl;

            if (showPercent)
              obj['fentanyl_pct'] = AccessibilityFunctions.getPercChange('fentanyl', data['US'][i].year, state, changePrecValues);
          }

          if (selDrugs.includes('heroin')) {
            obj['heroin'] = data['US'][i].heroin;

            if (showPercent)
              obj['heroin_pct'] = AccessibilityFunctions.getPercChange('heroin', data['US'][i].year, state, changePrecValues);

          }

          if (selDrugs.includes('methamphetamine')) {
            obj['methamphetamine'] = data['US'][i].methamphetamine;

            if (showPercent)
              obj['methamphetamine_pct'] = AccessibilityFunctions.getPercChange('methamphetamine', data['US'][i].year, state, changePrecValues);

          }

          if (selDrugs.includes('opioid')) {
            obj['opioid'] = data['US'][i].opioid;

            if (showPercent)
              obj['opioid_pct'] = AccessibilityFunctions.getPercChange('opioid', data['US'][i].year, state, changePrecValues);

          }

          if (selDrugs.includes('stimulant')) {
            obj['stimulant'] = data['US'][i].stimulant;

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
        for (var i=0;i<Object.keys(data['US']).length;i++)
        {
          let obj = {};

          if (currentDrug == 'alldrug') {
            if (showOverall)
              obj['Overall'] = data['US'][i].alldrug;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].alldrug;
            }
          }

          if (currentDrug == 'benzodiazepine') {
            if (showOverall)
              obj['Overall'] = data['US'][i].benzodiazepine;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].benzodiazepine;
            }
          }

          if (currentDrug == 'cocaine') {
            if (showOverall)
              obj['Overall'] = data['US'][i].cocaine;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].cocaine;
            }
          }

          if (currentDrug == 'fentanyl') {
            if (showOverall)
              obj['Overall'] = data['US'][i].fentanyl;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].fentanyl;
            }
          }

          if (currentDrug == 'heroin') {
            if (showOverall)
              obj['Overall'] = data['US'][i].heroin;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].heroin;
            }
          }

          if (currentDrug == 'methamphetamine') {
            if (showOverall)
              obj['Overall'] = data['US'][i].methamphetamine;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].methamphetamine;
            }
          }

          if (currentDrug == 'opioid') {
            if (showOverall)
              obj['Overall'] = data['US'][i].opioid;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].opioid;
            }
          }

          if (currentDrug == 'stimulant') {
            if (showOverall)
              obj['Overall'] = data['US'][i].stimulant;

            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) 
                obj['state'] = data[state][j].stimulant;
            }
          }

          if (showPercent)
            if (showOverall)
              obj['Overall_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, 'US', changePrecValues);

          if (showPercent)
            obj['state_pct'] = AccessibilityFunctions.getPercChange(currentDrug, data['US'][i].year, state, changePrecValues);

          if (showCount) {
              if (showOverall)
              obj['Overall_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly(currentDrug, data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly(currentDrug, data['US'][i].year, state, countsDataYearly);
            
              obj['state_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthlyNonUS(currentDrug, data['US'][i].year, state, stateData, currentDataSource) : AccessibilityFunctions.getCountYearlyNonUS(currentDrug, data['US'][i].year, state, stateData, currentDataSource);
          }

          let monyr = currentTimeframe == 'Monthly' ? (UtilityFunctions.getMonthName(String(Number(data['US'][i].year.substring(4)))) + ' ' + data['US'][i].year.substring(0,4)) : data['US'][i].year;
          myData[monyr] = obj;
        }
      }

      return myData;
  
    },  
}