import '../init';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import store from './store';
import EntryPoint from './EntryPoint';

import '@fontsource/titillium-web';
import './global.scss';
import { getUserManager, setupUserSession } from 'useAuthProvider';

const root = document.getElementById('root')!;


async function prerun() {
    const userManager = getUserManager(store.getState());
    if (userManager) await setupUserSession(userManager);
}

async function run() {
    await prerun();
    return ReactDOM
        .createRoot(root)
        .render(
            <StrictMode>
                <Provider store={store}>
                    <EntryPoint />
                </Provider>
            </StrictMode>
        );
}

run();

