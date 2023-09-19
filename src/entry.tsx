import { useRef } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NexusProvider } from '@bbp/react-nexus';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './shared/hooks/useNotification';
import { nexus, history } from './store';
import App from './shared/App';

function EntryPoint() {
  const queryClient = useRef(new QueryClient());
  const notificationData: NotificationContextType = getNotificationContextValue();

  return (
    <NotificationContext.Provider value={notificationData}>
      <QueryClientProvider client={queryClient.current}>
        <ConnectedRouter history={history}>
          {/* @ts-ignore */}
          <NexusProvider nexusClient={nexus}>
            <App />
          </NexusProvider>
        </ConnectedRouter>
      </QueryClientProvider>
    </NotificationContext.Provider>
  );
}

export default EntryPoint;
