import ChangeIndicator from './ChangeIndicator';

function QuickStat(params) {

  const { colorScale, defaultValueIfEmpty, value, text, label, timeframe } = params;

  return (
    <div className="stats-sections-container grid-item">
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
                      </div>
  );
}

export default QuickStat;