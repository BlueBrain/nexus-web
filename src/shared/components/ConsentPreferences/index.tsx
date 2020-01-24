import * as React from 'react';
import { Button } from 'antd';
import useLocalStorage from '../../hooks/useLocalStorage';

const ConsentPreferences: React.FunctionComponent<{
  consent?: {
    consentToTracking: boolean;
    hasSetPreferences: boolean;
  };
  onClickRemove?(): void;
}> = ({ consent, onClickRemove }) => {
  return (
    <Button
      onClick={onClickRemove}
      type="default"
      size="small"
      disabled={!consent || !consent.hasSetPreferences}
    >
      Remove tracking preferences
    </Button>
  );
};

export default ConsentPreferences;
