import ChangeIndicator from './ChangeIndicator';

function QuickStat(params) {

  const { colorScale,defaultValueIfEmpty, value, text, label } = params;

  return (
    <div className="stats-sections-container col-12 col-sm-6 col-md-4 grid-item">
                        <div className="stats-section first">
                          <div id="stats-section-icon" className="stats-section-icon" >
                            <ChangeIndicator
                              width={110}
                              height={100}
                              colorScale={colorScale}
                              defaultValueIfEmpty={defaultValueIfEmpty}
                              percentValue={value}
                              label={label}
                              defaultLabelIfEmpty={'All'}
                            ></ChangeIndicator>
                          </div>
                          <span className="stats-text">
                            { text }
                          </span>
                        </div>
                        <div className='stats-note'>
                          Hover on a circle on the Line chart to view statistics for the selected year compared to the previous year for a specific drug .
                        </div>
                      </div>
  );
}

export default QuickStat;