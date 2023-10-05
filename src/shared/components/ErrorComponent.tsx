import { Alert, Collapse } from 'antd';
import React from 'react';

interface ErrorComponentProps {
  message: string;
  details?: string;
}

export const ErrorComponent = ({ message, details }: ErrorComponentProps) => {
  return (
    <>
      {details ? (
        <Collapse
          style={{
            background: '#fff2f0',
            borderColor: '#ffccc7',
            margin: '20px',
          }}
          items={[
            {
              key: message,
              label: message,
              children: <pre>{details}</pre>,
            },
          ]}
        />
      ) : (
        <Alert message={message} type="error" style={{ margin: '20px' }} />
      )}
    </>
  );
};
