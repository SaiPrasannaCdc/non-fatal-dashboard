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

const getFilteredData = (data, currentDrug, currentDataSource, currentYear, currentDataType) => {

  var finalData = [];
  var male_total = 0;
  var female_total = 0;

  if (currentDataType == 'rate') {
    male_total = data.sex[currentDataSource][currentDrug][currentYear]['all']['rate']['M'];
    female_total = data.sex[currentDataSource][currentDrug][currentYear]['all']['rate']['F']
  }
  else {
    for (let y=0;y<data.sex[currentDataSource][currentDrug][currentYear]['all']['count'].length;y++) {
        if (data.sex[currentDataSource][currentDrug][currentYear]['all']['count'][y].sex == 'F')
          female_total = data.sex[currentDataSource][currentDrug][currentYear]['all']['count'][y]['F'];

        if (data.sex[currentDataSource][currentDrug][currentYear]['all']['count'][y].sex == 'M')
          male_total = data.sex[currentDataSource][currentDrug][currentYear]['all']['count'][y]['M'];
      }
  }

  var maleData = {};
  var femaleData = {};

  femaleData['sex'] = 'Female';
  femaleData['value'] = isNaN(female_total) ? female_total : String(Number(female_total)?.toFixed(1)); 
  finalData.push(femaleData);

  maleData['sex'] = 'Male';
  maleData['value'] = isNaN(male_total) ? male_total : String(Number(male_total)?.toFixed(1)); 
  finalData.push(maleData);
  
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

function SexChart(params) {

  const { data, width, height, el, currentDrug, drugOptions, currentTimeLine, currentDataSource, currentYear, currentMonth, currentDataType, accessible, widthReduction } = params;

  const isSmallViewport = width < 550 && !widthReduction;
  
  const [ animated, setAnimated ] = useState(false);

  const filteredData = getFilteredData(data, currentDrug, currentDataSource, currentYear, currentDataType);

  const margin = {top: 10, bottom: 50, left: (currentDataType == 'rate' ? 50 : 100), right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 120;
  const adjustedWidth = width - margin.left - margin.right;
  const fontSize = 16;

  
  const xScale = scaleBand({
    domain: filteredData.map(d => d.sex),
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
        <div id="sex-chart">
          {accessible ? (
        <>
        <DataTable508
          data={AccessibilityFunctions.generateSexChartData(filteredData, currentDataType)}
          labelOverrides={{
            'rate': (currentDataType == 'rate' ? 'Rate per 100,000 persons' : 'Count'),
            'Sex': 'By Sex'
          }}
          xAxisKey={'Sex'}
          transforms={{
            rate: num => (UtilityFunctions.toFixed(num) + (currentDataType == 'rate' ? '' : '%'))
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
                />

                {filteredData.map(d => (
                  <Group key={`group-${d.sex}`} className="animate-bars">
                    {!isNaN(d.value) && d.value >= 0 && (
                      <path
                        key={`cause-bar-${d.sex}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        opacity={d.sex == 'Male' ? 0.4 : 1.0}
                        d={Utils.verticalBarPath(xScale(d.sex), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), xScale.bandwidth() * .1)}
                        fill={drugOptions[currentDrug].color}
                        data-tip={`<strong>Sex: </strong>${d.sex}<br/><br/><strong>Overdoses: </strong>` + (currentDataType == 'rate' ? UtilityFunctions.formatRate(d.value, 1) : UtilityFunctions.formatCount(d.value, 0)) + '<br/><br/>'}
                      ></path>
                    )}
                    {isNaN(d.value) && (
                      <text
                        x={xScale(d.sex) + halfBandwidth}
                        y={adjustedHeight - 10}
                        fontWeight='normal'
                        textAnchor="middle"
                        cursor="default"
                        data-tip={`<strong>Sex: </strong>${d.sex}<br/><br/><strong>Overdoses: </strong>` + d.value + '<br/><br/>'}
                      >*</text>
                    )}
                    {!isNaN(d.value) && d.value >= 0 && (
                        <text
                          x={xScale(d.sex) + halfBandwidth}
                          y={yScale(d.value) - 10}
                          fontWeight='normal'
                          textAnchor="middle"
                          cursor="default"
                          fontSize={isSmallViewport ? fontSize * .8 : fontSize}
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
                    textAnchor: 'middle',
                    transform: 'translate(0, 10)'
                  })}
                />
              </>
            )
            {currentDataType == 'rate' && <text x={adjustedWidth/2} y={height - 110} fontSize={fontSize * (isSmallViewport ? .8 : 1)} textAnchor={"middle"}>Rate per 100,000 persons<tspan baselineShift="super" fontSize="10">5</tspan> </text>}
            {currentDataType == 'count' && <text x={adjustedWidth/2} y={height - 110} fontSize={fontSize * (isSmallViewport ? .8 : 1)} textAnchor={"middle"}>Count</text>}
          </Group>
        </svg>
      </Group>
      )}
      </div>
    );
}

export default SexChart;
