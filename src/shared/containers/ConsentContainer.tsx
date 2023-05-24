import * as React from 'react';
import { Modal } from 'antd';
import { ConsentType } from '../layouts/FusionMainLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

declare global {
  interface Window {
    [key: string]: any;
  }
}

const DATA_LAYER = 'dataLayer';

const ConsentContainer: React.FunctionComponent<{
  consent?: ConsentType;
  updateConsent?(consent: ConsentType): void;
}> = ({ consent, updateConsent }) => {
  const gtmCode = useSelector((state: RootState) => state.config.gtmCode);
  const [trackingEnabled, setTrackingEnabled] = React.useState<boolean>(false);

  const enableTracking = (trackingCode: string) => {
    window[DATA_LAYER] = window[DATA_LAYER] || [];
    window[`ga-disable-${trackingCode}-1`] = false;
    window[DATA_LAYER].push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    const gTagNode = document.createElement('div');
    gTagNode.id = 'gTagNode';
    document.head.prepend(gTagNode);
    const j = document.createElement('script');
    const dl = DATA_LAYER !== 'dataLayer' ? `&l=${DATA_LAYER}` : '';
    j.async = true;
    j.src = `https://www.googletagmanager.com/gtm.js?id=${trackingCode}${dl}`;
    gTagNode.prepend(j);

    setTrackingEnabled(true);
  };

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
    location.reload();
  };

  if (!gtmCode) {
    return null;
  }

  if (!consent || !consent.hasSetPreferences) {
    return (
      <Modal
        open={true}
        onOk={onClickAllow}
        onCancel={onClickDontAllow}
        okText="Allow"
        cancelText="Don't allow"
      >
        <h4>Send anonymous data & statistics to the developers?</h4>
      </Modal>
    );
  }

  if (consent && consent.consentToTracking && !trackingEnabled) {
    enableTracking(gtmCode);
  }

  return null;
};

export default ConsentContainer;
