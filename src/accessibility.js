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

      return cnt;
    },

    getCountYearly : (drug, yr, st, data) => {

      var cnt;
      for (var i=0;i<Object.keys(data).length;i++) {
        if (data[i].year == yr && data[i].drug == drug) {
          cnt = data[i].count;
          break;
        }
      }

      return cnt;
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

      return cnt;
    },

    getCountYearlyNonUS : (drug, yr, st, data, currentDataSource) => {
      debugger;
      var cnt;
        for (var i=0;i<Object.keys(data[currentDataSource][drug]['all']).length;i++) {
          if (data[currentDataSource][drug]['all'][i]['state'] == st) {
            cnt = data[currentDataSource][drug]['all'][i][yr];
            break;
          }
        }

        return cnt;
    },

    generateLineChartData : (stateData, data, currentDataSource, countsDataYearly, countsDataMonthly, currentDrug, selDrugs, state, stateNames, currentTimeframe, showPercent, showCount, changePrecValues) => {

      let myData = {};
    
      if (state == 'US') {
        for (var i=0;i<Object.keys(data['US']).length;i++)
        {
          let obj = {};
          if (selDrugs.includes('alldrug')) {
            obj['alldrug'] = data['US'][i].alldrug;

            if (showPercent)
              obj['alldrug_pct'] = AccessibilityFunctions.getPercChange('alldrug', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['alldrug_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('alldrug', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('alldrug', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('benzodiazepine')) {
            obj['benzodiazepine'] = data['US'][i].benzodiazepine;

            if (showPercent)
              obj['benzodiazepine_pct'] = AccessibilityFunctions.getPercChange('benzodiazepine', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['benzodiazepine_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('benzodiazepine', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('benzodiazepine', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('cocaine')) {
            obj['cocaine'] = data['US'][i].cocaine;

            if (showPercent)
              obj['cocaine_pct'] = AccessibilityFunctions.getPercChange('cocaine', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['cocaine_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('cocaine', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('cocaine', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('fentanyl')) {
            obj['fentanyl'] = data['US'][i].fentanyl;

            if (showPercent)
              obj['fentanyl_pct'] = AccessibilityFunctions.getPercChange('fentanyl', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['fentanyl_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('fentanyl', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('fentanyl', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('heroin')) {
            obj['heroin'] = data['US'][i].heroin;

            if (showPercent)
              obj['heroin_pct'] = AccessibilityFunctions.getPercChange('heroin', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['heroin_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('heroin', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('heroin', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('methamphetamine')) {
            obj['methamphetamine'] = data['US'][i].methamphetamine;

            if (showPercent)
              obj['methamphetamine_pct'] = AccessibilityFunctions.getPercChange('methamphetamine', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['methamphetamine_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('methamphetamine', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('methamphetamine', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('opioid')) {
            obj['opioid'] = data['US'][i].opioid;

            if (showPercent)
              obj['opioid_pct'] = AccessibilityFunctions.getPercChange('opioid', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['opioid_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('opioid', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('opioid', data['US'][i].year, state, countsDataYearly);
          }

          if (selDrugs.includes('stimulant')) {
            obj['stimulant'] = data['US'][i].stimulant;

            if (showPercent)
              obj['stimulant_pct'] = AccessibilityFunctions.getPercChange('stimulant', data['US'][i].year, state, changePrecValues);

            if (showCount)
              obj['stimulant_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthly('stimulant', data['US'][i].year, state, countsDataMonthly) : AccessibilityFunctions.getCountYearly('stimulant', data['US'][i].year, state, countsDataYearly);
          }

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

            if (showPercent)
              obj['Overall_pct'] = data['US'][i].alldrug;

            if (showCount)
              obj['Overall_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthlyNonUS('alldrug', data['US'][i].year, state, stateData, currentDataSource) : AccessibilityFunctions.getCountYearlyNonUS('alldrug', data['US'][i].year, state, stateData, currentDataSource);

            obj['state'] = '';
            for (var j=0;j<Object.keys(data[state]).length;j++)
            {
              if (data['US'][i].year == data[state][j].year) {
                obj['state'] = data[state][j].alldrug;

                if (showPercent)
                  obj['state_pct'] = data[state][j].alldrug;

                if (showCount)
                  obj['state_cnt'] = currentTimeframe == 'Monthly' ? AccessibilityFunctions.getCountMonthlyNonUS('alldrug', data['US'][i].year, state, stateData) : AccessibilityFunctions.getCountYearlyNonUS('alldrug', data['US'][i].year, state, stateData);
              }
            }
          }

          if (currentDrug == 'benzodiazepine') {
            obj['Overall'] = data['US'][i].benzodiazepine;

            if (showPercent)
              obj['Overall_pct'] = data['US'][i].benzodiazepine;

            obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].benzodiazepine;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].benzodiazepine;
                }
              }
          }

          if (currentDrug == 'cocaine') {
            obj['Overall'] = data['US'][i].cocaine;
            if (showPercent)
              obj['Overall_pct'] = data['US'][i].cocaine;

            obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].cocaine;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].cocaine;
                }
              }
          }

          if (currentDrug == 'fentanyl') {
              obj['Overall'] = data['US'][i].fentanyl;
              if (showPercent)
                obj['Overall_pct'] = data['US'][i].fentanyl;

              obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].fentanyl;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].fentanyl;
                }
              }
          }

          if (currentDrug == 'heroin') {
              obj['Overall'] = data['US'][i].heroin;
              if (showPercent)
                obj['Overall_pct'] = data['US'][i].heroin;

              obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].heroin;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].heroin;
                }
              }
          }

          if (currentDrug == 'methamphetamine') {
            obj['Overall'] = data['US'][i].methamphetamine;
            if (showPercent)
                obj['Overall_pct'] = data['US'][i].methamphetamine;

            obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].methamphetamine;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].methamphetamine;
                }
              }
          }

          if (currentDrug == 'opioid') {
             obj['Overall'] = data['US'][i].opioid;
             if (showPercent)
                obj['Overall_pct'] = data['US'][i].opioid;

              obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].opioid;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].opioid;
                }
              }
          }

          if (currentDrug == 'stimulant') {
             obj['Overall'] = data['US'][i].stimulant;
             if (showPercent)
                obj['Overall_pct'] = data['US'][i].stimulant;

              obj['state'] = '';
              for (var j=0;j<Object.keys(data[state]).length;j++)
              {
                if (data['US'][i].year == data[state][j].year) {
                  obj['state'] = data[state][j].stimulant;
                  if (showPercent)
                    obj['state_pct'] = data[state][j].stimulant;
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