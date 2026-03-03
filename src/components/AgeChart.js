import React, { useState, useEffect } from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import Utils from '../shared/Utils';
import { UtilityFunctions } from '../utility';
import { AccessibilityFunctions } from '../accessibility';
import DataTable508 from './DataTable508';
import { countCutoff } from '../constants.json';


const getAgeGroups = (data, currentDrug, currentDataSource, currentYear, currentDataType) => {

  var ageData = [];

  if (currentDataType == 'rate') {
    for(let i=0;i<Object.keys(data.age[currentDataSource][currentDrug][currentYear]['all']['rate']).length;i++) {
        ageData.push(Object.keys(data.age[currentDataSource][currentDrug][currentYear]['all']['rate'])[i]);
    }
  }
  else {
    for(let i=0;i<data.age[currentDataSource][currentDrug][currentYear]['all']['count'].length;i++) {
        ageData.push(data.age[currentDataSource][currentDrug][currentYear]['all']['count'][i].age);
    }
  }

  return ageData;
  
};

const getFilteredData = (data, ageGroups, currentDrug, currentDataSource, currentYear, currentDataType) => {
  
  var finalData = [];
  var drug_total = 0;

  for (let x=0;x<ageGroups.length;x++) {

    drug_total = 0;

    if (currentDataType == 'rate')
      drug_total = data.age[currentDataSource][currentDrug][currentYear]['all']['rate'][ageGroups[x]]
    else {
      for (let y=0;y<data.age[currentDataSource][currentDrug][currentYear]['all']['count'].length;y++) {
        if (data.age[currentDataSource][currentDrug][currentYear]['all']['count'][y].age == ageGroups[x])
        {
          drug_total = data.age[currentDataSource][currentDrug][currentYear]['all']['count'][y][ageGroups[x]];
          break;
        }
      }
    }
      
    
    var prefinalData = {};

    prefinalData['age'] = ageGroups[x];
    prefinalData['ageN'] = prefinalData['age'].replace('-','–');
    prefinalData['value'] = isNaN(drug_total) ? drug_total : (currentDataType == 'rate' ? String((drug_total)?.toFixed(1)) : String((drug_total)?.toFixed(0)));

    if (ageGroups[x] != 'Total' && ageGroups[x] != 'Missing')
      finalData.push(prefinalData);
  }

  return finalData;
};

const getMaxValue = (fdata) => {

    let vals = [];
    for (let x=0;x<Object.keys(fdata).length;x++) {
      if (Number(fdata[x].value) > 0)
        vals.push(Number(fdata[x].value));
    }
    
    return vals.length > 0 ? Math.max(...vals) : 0.84;
  }

function AgeChart(params) {

  const { data, width, height, el, currentDrug, drugOptions, currentTimeLine, currentDataSource, currentYear, currentMonth, currentDataType, accessible, widthReduction } = params;
  
  const isSmallViewport = width < 550 && !widthReduction;

  const [ animated, setAnimated ] = useState(false);

  const ageGroups = getAgeGroups(data, currentDrug, currentDataSource, currentYear, currentDataType)
  const filteredData = getFilteredData(data, ageGroups, currentDrug, currentDataSource, currentYear, currentDataType);

  const margin = {top: 10, bottom: 50, left: (currentDataType == 'rate' ? 50 : 100), right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 120;
  const adjustedWidth = width - margin.left - margin.right;
  const fontSize = 16;

  const xScale = scaleBand({
      domain: filteredData.map(d => d.ageN),
      range: [ 0, adjustedWidth ],
      padding: 0.35
    });

  const max = getMaxValue(filteredData) * 1.2;

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [ 0, max]
  });

  const halfBandwidth = xScale.bandwidth() / 2;

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().top - document.body.getBoundingClientRect().top){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);


  return width > 0 && 
      (
        <div id="age-chart">
          {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateAgeChartData(filteredData, currentDataType)}
          labelOverrides={{
            'rate': (currentDataType == 'rate' ? 'Rate per 100,000 persons' : 'Count'),
            'Sex': !isSmallViewport ? 'By Age (In years)' : 'By Age',
            '0–14': '<15'
          }}
          xAxisKey={'Sex'}
          transforms={{
            rate: num => UtilityFunctions.toFixed(num)
          }}
          height={'auto'}
          width={width}
          isSmallViewport={isSmallViewport}
          currentDataType={currentDataType}
        />
        </>        
      ) : (
      <Group>
        <svg width={width} height={height - 60}>
          <Group top={margin.top} left={margin.left}>
            (
              <>
                <AxisLeft
                  scale={yScale}
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'end',
                    transform: 'translate(-5, 5)'
                  })}
                  labelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'middle'
                  })}
                  labelOffset={60}
                  numTicks={5}
                />

                {filteredData.map(d => (
                  <Group key={`group-${d.ageN}`} className="animate-bars">
                    {!isNaN(d.value) && d.value >= 0 && (
                      <path
                        key={`cause-bar-${d.ageN}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        d={Utils.verticalBarPath(xScale(d.ageN), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), xScale.bandwidth() * .1)}
                        fill={drugOptions[currentDrug].color}
                        data-tip={`<strong>Age: </strong>${d.ageN}<br/><br/><strong>Overdoses: </strong>` + (currentDataType == 'rate' ? UtilityFunctions.formatRate(d.value, 1) : UtilityFunctions.formatCount(d.value, 0)) + '<br/><br/>'}
                      ></path>
                    )}
                    {isNaN(d.value) && (
                      <text
                        x={xScale(d.ageN) + halfBandwidth}
                        y={adjustedHeight - 10}
                        fill={drugOptions[currentDrug].color}
                        fontWeight='normal'
                        textAnchor="middle"
                        cursor="default"
                        data-tip={`<strong>Age Group: </strong>${d.ageN}<br/><br/><strong>Overdoses: </strong>` + d.value + '<br/><br/>'}
                      >{d.value?.includes('suppressed') ? '*' : (d.value?.includes('available') ? '†' : '')}</text>
                    )}
                    {!isNaN(d.value) && d.value >= 0 && (
                        <text
                          x={xScale(d.ageN) + halfBandwidth}
                          y={yScale(d.value) - 10}
                          fontWeight='normal'
                          textAnchor="middle"
                          fontSize={isSmallViewport ? fontSize * .8 : fontSize}
                          cursor="default"
                        >{(currentDataType == 'rate' ? UtilityFunctions.formatRate(d.value, 1) : UtilityFunctions.formatCount(d.value, 0))}</text>
                      )}
                  </Group>
                ))}

                <AxisBottom
                  top={adjustedHeight}
                  scale={xScale}
                  tickStroke="transparent"
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: (isSmallViewport ? 'start' : 'middle'),
                    verticalAnchor: (isSmallViewport ? 'middle' : ''),
                    angle: (isSmallViewport ? 90 : 0),
                  })}
                />
              </>
            )
            {currentDataType == 'rate' && <text x={adjustedWidth/2} y={height - (!isSmallViewport ? 110 : 90)} fontSize={fontSize * (isSmallViewport ? .8 : 1)} textAnchor={"middle"}>Rate per 100,000 persons<tspan baselineShift="super" fontSize="10">5</tspan> </text>}
            {currentDataType == 'count' && <text x={adjustedWidth/2} y={height - (!isSmallViewport ? 110 : 90)} fontSize={fontSize * (isSmallViewport ? .8 : 1)} textAnchor={"middle"}>Count</text>}
          </Group>
        </svg>
        </Group>
      )}
      </div>
    );
}

export default AgeChart;
