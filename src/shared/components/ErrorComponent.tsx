import { Alert, Collapse } from 'antd';
import React from 'react';

interface ErrorComponentProps {
  message: string;
  details?: string;
}
const { Panel } = Collapse;

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
        >
          <Panel header={message} key={message}>
            <pre>{details}</pre>
          </Panel>
        </Collapse>
      ) : (
        <Alert message={message} type="error" style={{ margin: '20px' }} />
      )}
    </>
  );
};
