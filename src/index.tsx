import '../init';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import store from './store';
import EntryPoint from './entry';
import { getUserManager, setupUserSession } from 'authManager';
import { fetchRealms } from './shared/store/actions/auth';
import './styles';

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
