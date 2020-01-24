import * as React from 'react';
import { Button } from 'antd';
import { ConsentType } from '../../layouts/MainLayout';

const ConsentPreferences: React.FunctionComponent<{
  consent?: ConsentType;
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
