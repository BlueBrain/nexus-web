import { ConnectedRouter } from 'connected-react-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NexusProvider } from '@bbp/react-nexus';
import { nexus, history } from './store';
import App from './shared/App';
import { useRef } from 'react';



function EntryPoint() {
    const queryClient = useRef(new QueryClient());
    return (
        <QueryClientProvider client={queryClient.current}>
            <ConnectedRouter history={history}>
                {/* @ts-ignore */}
                <NexusProvider nexusClient={nexus}>
                    <App />
                </NexusProvider>
            </ConnectedRouter>
        </QueryClientProvider>
    )
}

export default EntryPoint;