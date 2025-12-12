import ChangeIndicator from './ChangeIndicator';

function QuickStat(params) {

  const { colorScale, defaultValueIfEmpty, value, text, label, timeframe } = params;

  return (

                        <div className="stats-section first">
                          <div id="stats-section-icon" className="" >
                            <ChangeIndicator
                              width={85}
                              height={80}
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

  );
}

export default QuickStat;