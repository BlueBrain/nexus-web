import { Button } from 'antd';
import * as React from 'react';

import { ConsentType } from '../../layouts/FusionMainLayout';

const ConsentPreferences: React.FunctionComponent<{
  consent?: ConsentType;
  onClickRemove?(): void;
}> = ({ consent, onClickRemove }) => {
  if (!consent || !consent.hasSetPreferences) {
    return null;
  }

  return (
    <div>
      <Button onClick={onClickRemove} type="default" size="small">
        Reset tracking preferences
      </Button>
    </div>
  );
};

export default ConsentPreferences;
