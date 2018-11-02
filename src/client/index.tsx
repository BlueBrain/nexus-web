import React = require('react');
import ReactDOM = require('react-dom');
import { BrowserRouter } from 'react-router-dom';
import App from '../shared/App';

const rawBase: string = (window as any)['__BASE__'] || '/';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');

const renderApp = () => ReactDOM.hydrate(
  <BrowserRouter basename={base}>
    <App />
  </BrowserRouter>,
  document.getElementById('app'),
);

if (module.hot) {
  console.log('It\'s hot!');
  module.hot.accept('../shared/App', () => {
    const NextApp: React.StatelessComponent<{}> = require('../shared/App').default;
    ReactDOM.hydrate(
      <BrowserRouter basename={base}>
        <NextApp />
      </BrowserRouter>,
      document.getElementById('app'),
    );
  });
}

renderApp();
