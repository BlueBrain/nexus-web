import * as React from 'react';
// @ts-ignore
import gtmParts from 'react-google-tag-manager';
import { notification, Button } from 'antd';
import useLocalStorage from '../hooks/useLocalStorage';

const enableTracking = (trackingCode: string) => {
  const gtm = gtmParts({
    id: trackingCode,
    dataLayerName: 'dataLayer',
    additionalEvents: {},
    previewVariables: false,
    scheme: 'https:',
  });

  return (
    <div>
      <div>{gtm.noScriptAsReact()}</div>
      <div id="react-google-tag-manager-gtm">{gtm.scriptAsReact()}</div>
    </div>
  );
};

const ConsentContainer: React.FunctionComponent<{
  trackingCode: string;
  consent?: {
    consentToTracking: boolean;
    hasSetPreferences: boolean;
  };
}> = ({ trackingCode, consent }) => {
  if (consent && consent.consentToTracking) {
    return enableTracking(trackingCode);
  }

  return null;
};

export default ConsentContainer;
