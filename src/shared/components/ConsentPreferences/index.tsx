import * as React from 'react';
import { Button } from 'antd';
import { ConsentType } from '../../layouts/MainLayout';

const ConsentPreferences: React.FunctionComponent<{
  consent?: ConsentType;
  onClickRemove?(): void;
}> = ({ consent, onClickRemove }) => {
  if (!consent || !consent.hasSetPreferences) {
    return null;
  }

  return (
    <Button onClick={onClickRemove} type="default" size="small">
      Reset tracking preferences
    </Button>
  );
};

export default ConsentPreferences;
