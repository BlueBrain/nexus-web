import { NexusProvider } from '@bbp/react-nexus';
import { ConnectedRouter } from 'connected-react-router';
import React, { useRef } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import App from './shared/App';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './shared/hooks/useNotification';
import { history, nexus } from './store';

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
