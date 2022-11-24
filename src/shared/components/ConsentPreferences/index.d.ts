import * as React from 'react';
import { ConsentType } from '../../layouts/FusionMainLayout';
declare const ConsentPreferences: React.FunctionComponent<{
  consent?: ConsentType;
  onClickRemove?(): void;
}>;
export default ConsentPreferences;
