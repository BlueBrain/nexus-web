import * as React from 'react';
import gtmParts from 'react-google-tag-manager';
import { Modal } from 'antd';
import { ConsentType } from '../layouts/MainLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

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
  consent?: ConsentType;
  updateConsent?(consent: ConsentType): void;
}> = ({ consent, updateConsent }) => {
  const gtmCode = useSelector((state: RootState) => state.config.gtmCode);

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

  if (!gtmCode) {
    return null;
  }

  if (!consent || !consent.hasSetPreferences) {
    return (
      <Modal
        visible={true}
        onOk={onClickAllow}
        onCancel={onClickDontAllow}
        okText="Allow"
        cancelText="Don't allow"
      >
        <h4>Send anonymous data & statistics to the developers?</h4>
      </Modal>
    );
  }

  if (consent && consent.consentToTracking) {
    return enableTracking(gtmCode);
  }

  return null;
};

export default ConsentContainer;
