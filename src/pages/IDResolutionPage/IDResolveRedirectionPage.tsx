import { CSSProperties } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Modal } from 'antd';
import { isEmpty } from 'lodash';

import { RootState } from '../../shared/store/reducers';
import { ResourceJSONPrettify } from './IDResolvedManyPage';

const modalStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexDirection: 'column',
} as CSSProperties;

const calloutStyle = {
  margin: 10,
  width: '100%',
  border: '1px solid #c11b1b3b',
  padding: '4px',
  borderRadius: '4px',
  fontSize: 14,
  fontWeight: 'bold',
} as CSSProperties;

const IDResolveRedirectionPage = () => {
  const nexus = useNexusContext();
  const oidc = useSelector((state: RootState) => state.oidc);

  const { push: navigate } = useHistory();
  const { apiEndpoint } = useSelector((state: RootState) => state.config);
  const { resourceId } = useParams<{ resourceId: string }>();

  const token = oidc && oidc.user && !!oidc.user.access_token;
  const authenticated = !isEmpty(oidc.user);
  const isAuthenticated = authenticated && token;

  // we should encode it again due oidc returning the url not encoded
  const redirectUri = `/resolve/${encodeURIComponent(resourceId)}`;

  const { error, isError, isLoading } = useQuery({
    enabled: isAuthenticated,
    queryKey: ['resource-id-resolver', { apiEndpoint, resourceId }],
    queryFn: () =>
      nexus.httpGet({
        path: `${apiEndpoint}/resolve/${resourceId}`,
        // headers: { Accept: 'text/html' }
      }),
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: data => console.log('@@dataResolution', data),
    onError: error => console.log('@@errorResolution', error),
  });

  const handleReconnection = () => {
    localStorage.removeItem('nexus__state');
    navigate(`/login?destination=${redirectUri}`);
  };

  if (!isLoading && isError) {
    return (
      <Modal open centered footer={null} closable={false} closeIcon={null}>
        <div style={modalStyle}>
          <h2 style={{ fontWeight: 'bold' }}>Error when resolving ID</h2>
          <ResourceJSONPrettify
            showHeader
            data={error}
            header={`Resolved ID: ${decodeURIComponent(resourceId)}`}
          />
          {(error as any)['@type'] === 'AuthorizationFailed' ? (
            <p style={calloutStyle}>
              Do you want to proceed for logout for new realm authentication
            </p>
          ) : (
            <p style={calloutStyle}>
              The redirection performance is suboptimal; further investigation
              is required, Please check again
            </p>
          )}
          {(error as any)['@type'] === 'AuthorizationFailed' && (
            <Button
              type="primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={handleReconnection}
            >
              Reconnect
            </Button>
          )}
        </div>
      </Modal>
    );
  }

  if (!isAuthenticated) {
    navigate(`/login?destination=${redirectUri}`);
  }

  return null;
};

export default IDResolveRedirectionPage;
