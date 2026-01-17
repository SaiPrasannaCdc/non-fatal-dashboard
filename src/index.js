import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App dataUrl={document.querySelector('#non-fatal-container').attributes['data-url']?.value} ethnDataUrl={document.querySelector('#non-fatal-container').attributes['ethn-data-url']?.value} accessible={document.querySelector('#non-fatal-container').attributes['data-accessible']?.value == 'false'} />
  </React.StrictMode>,
  document.querySelector('#non-fatal-container')
);
