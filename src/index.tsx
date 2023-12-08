import '../init';
import './styles';

import { getUserManager, setupUserSession } from 'authManager';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import EntryPoint from './entry';
import { fetchRealms } from './shared/store/actions/auth';
import store from './store';

const root = document.getElementById('root')!;

async function prerun() {
  localStorage.removeItem('nexus__token');
  await store.dispatch<any>(fetchRealms());
  const userManager = getUserManager(store.getState());
  if (userManager) await setupUserSession(userManager);
}

async function run() {
  await prerun();
  return ReactDOM.createRoot(root).render(
    <StrictMode>
      <Provider store={store}>
        <EntryPoint />
      </Provider>
    </StrictMode>
  );
}

run();
