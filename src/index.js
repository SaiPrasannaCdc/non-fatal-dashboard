import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.querySelector('#non-fatal-container');
const root = createRoot(container);

root.render(<App dataUrl={container.attributes['data-url']?.value} accessible={container.attributes['data-accessible']?.value == 'true'} />);
