import * as React from 'react';
// @ts-ignore
import gtmParts from 'react-google-tag-manager';
import { Modal } from 'antd';

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

interface ConsentPreferences {
  consentToTracking: boolean;
  hasSetPreferences: boolean;
}

const ConsentContainer: React.FunctionComponent<{
  trackingCode: string;
  consent?: ConsentPreferences;
  updateConsent?(consent: ConsentPreferences): void;
}> = ({ trackingCode, consent, updateConsent }) => {
  const onClickAllow = () => {
    updateConsent &&
      updateConsent({
        consentToTracking: true,
        hasSetPreferences: true,
      });
  };

  const onClickDontAllow = () => {
    updateConsent &&
      updateConsent({
        consentToTracking: false,
        hasSetPreferences: true,
      });
  };

  if (!consent || !consent.hasSetPreferences) {
    return (
      <Modal
        title="Send data & statistics to the developers?"
        visible={true}
        onOk={onClickAllow}
        onCancel={onClickDontAllow}
        okText="Allow"
        cancelText="Don't allow"
      >
        <p>
          Send data to the developers in order to improve Nexus Web by tracking
          your activity?
        </p>
      </Modal>
    );
  }

  if (consent && consent.consentToTracking) {
    return enableTracking(trackingCode);
  }

  return null;
};

export default ConsentContainer;
