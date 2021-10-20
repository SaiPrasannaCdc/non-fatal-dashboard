import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App dataUrl={document.querySelector('#non-fatal-container').attributes['data-url']?.value}/>
  </React.StrictMode>,
  document.querySelector('#non-fatal-container')
);
