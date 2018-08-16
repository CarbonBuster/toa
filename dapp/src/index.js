import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { DrizzleProvider } from 'drizzle-react';

// Layouts
import App from './App';
import NewContainer from './components/layouts/new/NewContainer';
import SwapsContainer from './components/layouts/swaps/SwapsContainer';
import SwapContainer from './components/layouts/swap/SwapContainer';
import { LoadingContainer } from 'drizzle-react-components';

import store from './store';
import drizzleOptions from './drizzleOptions';

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <DrizzleProvider options={drizzleOptions} store={store}>
    <LoadingContainer>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={SwapsContainer} />
          <Route path="/new" component={NewContainer}/>
          <Route path="/:chain/:id" component={SwapContainer}/>
        </Route>        
      </Router>
    </LoadingContainer>
  </DrizzleProvider>,
  document.getElementById('root')
);
