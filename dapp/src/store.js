import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import reducer from './reducers';
import saga from './sagas';
import createSagaMiddleware from 'redux-saga';
import { generateContractsInitialState } from 'drizzle';
import drizzleOptions from './drizzleOptions';

// Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const routingMiddleware = routerMiddleware(browserHistory);
const sagaMiddleware = createSagaMiddleware();

const initialState = {
  contracts: generateContractsInitialState(drizzleOptions)
};

const store = createStore(reducer, initialState, composeEnhancers(applyMiddleware(thunkMiddleware, routingMiddleware, sagaMiddleware)));

sagaMiddleware.run(saga);

export default store;
