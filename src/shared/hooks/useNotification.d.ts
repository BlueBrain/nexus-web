import * as React from 'react';
export declare type NotificationContextType = {
  error: (args: { message: string; description?: React.ReactNode }) => void;
  success: (args: { message: string; description?: React.ReactNode }) => void;
  info: (args: { message: string; description?: React.ReactNode }) => void;
  warning: (args: { message: string; description?: React.ReactNode }) => void;
};
export declare const NotificationContext: React.Context<NotificationContextType>;
export declare type NexusError = {
  reason?: string;
  message?: string;
  [key: string]: any;
};
export declare const parseNexusError: (error: NexusError) => string;
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
export default function useNotification(): NotificationContextType;
export declare const distanceFromTopToDisplay = 110;
export declare const getNotificationContextValue: () => {
  error: (args: { message: string; description?: React.ReactNode }) => void;
  success: (args: { message: string; description?: React.ReactNode }) => void;
  warning: (args: { message: string; description?: React.ReactNode }) => void;
  info: (args: { message: string; description?: React.ReactNode }) => void;
};
