import * as React from 'react';
import { Route, StaticContext } from 'react-router';

interface StatusProps {
  code: number;
}

const Status: React.FunctionComponent<StatusProps> = ({ code, children }) => {
  return (
    <Route
      render={({ staticContext }) => {
        if (staticContext) {
          (staticContext as { status?: number }).status = code;
        }
        return children;
      }}
    />
  );
};

export default Status;
