import { notification } from 'antd';

export type NexusError = {
  reason?: string;
  message?: string;
  [key: string]: any;
};

export const displayError = (error: NexusError, message: string) => {
  notification.error({
    message,
    description: error.message || error.reason || 'An unknown error occurred',
    duration: 5,
  });
};

export const successNotification = (message: string) => {
  notification.success({
    message,
    duration: 5,
  });
};
