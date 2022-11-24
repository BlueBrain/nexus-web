import * as React from 'react';
import { ConsentType } from '../layouts/FusionMainLayout';
declare global {
  interface Window {
    [key: string]: any;
  }
}
declare const ConsentContainer: React.FunctionComponent<{
  consent?: ConsentType;
  updateConsent?(consent: ConsentType): void;
}>;
export default ConsentContainer;
