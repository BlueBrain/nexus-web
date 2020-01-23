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

const trackingConsentNotification = (onClose: (accepted: boolean) => void) => {
  const key = `tracking-consent-notification`;
  const btn = (
    <div>
      <Button
        size="small"
        onClick={() => {
          notification.close(key);
          onClose(false);
        }}
      >
        Don't Allow
      </Button>{' '}
      <Button
        type="primary"
        size="small"
        onClick={() => {
          notification.close(key);
          onClose(true);
        }}
      >
        Allow
      </Button>
    </div>
  );

  notification.open({
    btn,
    key,
    onClose: () => {
      // If the user dismisses the notification, assume they don't want tracking enabled.
      onClose(false);
    },
    message: 'Send data & statistics to the developers?',
    description: `
      Send data to the developers in order to improve Nexus Web by tracking your activity.
    `,
    duration: null, // don't auto-close
  });
};

const ConsentContainer: React.FunctionComponent<{
  trackingCode: string;
}> = ({ trackingCode }) => {
  const [consent, setConsent] = useLocalStorage<{
    consentToTracking: boolean;
    hasSetPreferences: boolean;
  }>('consentToTracking');

  if (!consent || !consent.hasSetPreferences) {
    trackingConsentNotification(allow => {
      setConsent({
        consentToTracking: allow,
        hasSetPreferences: true,
      });
    });
  }

  if (consent && consent.consentToTracking) {
    return enableTracking(trackingCode);
  }

  return null;
};

export default ConsentContainer;
