import { useHistory } from 'react-router';
import { Button } from 'antd';

import ResponseViewer from './ResponseViewer';
import '../../../pages/IDResolutionPage/styles.less';

type Props = {
  redirectUri: string;
  resourceId: string;
  error: any;
};

const ResolutionError = ({ error, resourceId, redirectUri }: Props) => {
  const navigate = useHistory().push;
  const handleHomeRedirect = () => navigate(`/`);
  const handleReconnection = () => {
    localStorage.removeItem('nexus__state');
    navigate(`/login?destination=${redirectUri}`);
  };

  return (
    <div className="id-resolution-container">
      <div className="id-resolution-wrapper error">
        <h2 style={{ fontWeight: 'bold' }}>Error when resolving ID</h2>
        <ResponseViewer
          showHeader
          data={error}
          header={`Resolved ID: ${decodeURIComponent(resourceId)}`}
        />
        {(error as any)['@type'] === 'AuthorizationFailed' ? (
          <>
            <p className="callout">
              Do you want to proceed for logout for new realm authentication
            </p>
            <Button
              type="primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={handleReconnection}
            >
              Reconnect
            </Button>
          </>
        ) : (
          <>
            <p className="callout">
              The redirection feature is in beta version, We have taken note of
              this error and are working on improving the feature.
            </p>
            <Button
              type="primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={handleHomeRedirect}
            >
              Return Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResolutionError;
