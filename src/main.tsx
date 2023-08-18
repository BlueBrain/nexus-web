import '../init';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { createNexusClient } from '@bbp/nexus-sdk/es';
// @ts-ignore
import { NexusProvider } from '@bbp/react-nexus';
import { Link, Operation, Observable } from '@bbp/nexus-link';
import App from './shared/App';
import configureStore from './shared/store';
import { RootState } from './shared/store/reducers';
import { QueryClient, QueryClientProvider } from 'react-query';
import defaultState from './defaultState';



const preloadedState: RootState = typeof window !== 'undefined' &&
    (window as any).__PRELOADED_STATE__ || defaultState;
// nexus client middleware for setting token before request
const setToken: Link = (operation: Operation, forward?: Link) => {
    const token = localStorage.getItem('nexus__token');
    const nextOperation = token
        ? {
            ...operation,
            headers: {
                ...operation.headers,
                Authorization: `Bearer ${token}`,
            },
        }
        : operation;
    return forward ? forward(nextOperation) : new Observable();
};

// create Nexus instance
const nexus = createNexusClient({
    fetch,
    uri: preloadedState?.config?.apiEndpoint,
    links: [setToken],
});

// create react-query client
const queryClient = new QueryClient();

const rawBase: string = '/';
const base: string = rawBase.replace(/\/$/, '');
const history = createBrowserHistory({ basename: base });
const store = configureStore(history, { nexus }, window.__PRELOADED_STATE__);
console.log('@@ window.__PRELOADED_STATE__',  window.__PRELOADED_STATE__)
delete window.__PRELOADED_STATE__


ReactDOM.createRoot(
    document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {/* @ts-ignore */}
                <ConnectedRouter history={history}>
                    {/* @ts-ignore */}
                    <NexusProvider nexusClient={nexus}>
                        <App />
                    </NexusProvider>
                </ConnectedRouter>
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);