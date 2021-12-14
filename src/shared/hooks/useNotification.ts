import * as React from 'react';
import { notification as antdNotification } from 'antd';

export type NotificationContextType = {
  error: (args: { message: string; description?: React.ReactNode }) => void;
  success: (args: { message: string; description?: React.ReactNode }) => void;
  info: (args: { message: string; description?: React.ReactNode }) => void;
  warning: (args: { message: string; description?: React.ReactNode }) => void;
};

export const NotificationContext = React.createContext<NotificationContextType>(
  {} as NotificationContextType
);

export type NexusError = {
  reason?: string;
  message?: string;
  [key: string]: any;
};

export const parseNexusError = (error: NexusError) => {
  return error.message || error.reason || 'An unknown error occurred';
};

/**
 * Custom hook providing convenient access to our context value
 * that keeps track of open notifications. Uses antd notification
 * api.
 *
 * Usage:
 *
 * import useNotification from '../../shared/hooks/useNotification';
 * const notification = useNotification();
 *
 * notification.info({message: 'Welcome!', description: 'What up you legend'});
 * notification.error({message: 'Darn, that didn''t work', description: 'Try again later maybe'});
 * notification.warning({message: 'Careful', description: 'Do you really want to do that?'});
 * notification.success({message: 'Congrats','You''ve only gone and done it!'});
 *
 */
export default function useNotification() {
  return React.useContext(NotificationContext);
}

declare type MessageType = 'success' | 'info' | 'error' | 'warning';
const errorDuration = 5;
const infoDuration = 3;
const warningDuration = 3;
const successDuration = 3;
export const distanceFromTopToDisplay = 110;

const messageDuration = (type: MessageType) => {
  switch (type) {
    case 'error':
      return errorDuration;
    case 'info':
      return infoDuration;
    case 'warning':
      return warningDuration;
    case 'success':
      return successDuration;
  }
};

interface NotificationDict {
  [key: string]: {
    type: MessageType;
    description?: React.ReactNode;
    number: number;
  };
}

export const getNotificationContextValue = () => {
  const [notifications, setNotifications] = React.useState<NotificationDict>(
    {}
  );

  React.useEffect(() => {
    Object.keys(notifications).forEach(message => {
      const notificationMessage = notifications[message];
      if (notificationMessage.number > 0) {
        /* Close any existing notifications. If already closed
         it won't have any effect */
        for (let i = 0; i < notificationMessage.number; i += 1) {
          antdNotification.close(`${message}_${i}`);
        }
      }
      /* Open new notifications. Will have no effect if already open */
      antdNotification[notificationMessage.type]({
        message,
        key: `${message}_${notificationMessage.number}`,
        description: notificationMessage.description,
        duration: messageDuration(notificationMessage.type),
        onClose: () => {
          setNotifications(notification => {
            const { [message]: _, ...withoutMessageState } = notifications;
            return withoutMessageState;
          });
        },
        top: distanceFromTopToDisplay,
      });
    });
  }, [notifications]);

  const notify = (
    type: MessageType,
    message: string,
    description?: React.ReactNode
  ) => {
    setNotifications(notifications => {
      const { ...notificationsToUpdate } = notifications;
      if (message in notifications) {
        notificationsToUpdate[message].number += 1;
      } else {
        notificationsToUpdate[message] = {
          type,
          description,
          number: 0,
        };
      }

      return notificationsToUpdate;
    });
  };

  const error = (args: { message: string; description?: React.ReactNode }) => {
    notify('error', args.message, args.description);
  };
  const success = (args: {
    message: string;
    description?: React.ReactNode;
  }) => {
    notify('success', args.message, args.description);
  };
  const info = (args: { message: string; description?: React.ReactNode }) => {
    notify('info', args.message, args.description);
  };
  const warning = (args: {
    message: string;
    description?: React.ReactNode;
  }) => {
    notify('warning', args.message, args.description);
  };

  return {
    error,
    success,
    warning,
    info,
  };
};
