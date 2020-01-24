import * as React from 'react';
import { Button } from 'antd';
import useLocalStorage from '../../hooks/useLocalStorage';

const ConsentPreferences: React.FunctionComponent<{}> = () => {
  const [consent, setConsent] = useLocalStorage<{
    consentToTracking: boolean;
    hasSetPreferences: boolean;
  }>('consentToTracking');

  const onClickRemove = () => {
    setConsent(undefined);
  };

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
