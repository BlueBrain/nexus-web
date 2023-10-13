import { CSSProperties, useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Modal } from 'antd';

import { RootState } from '../../shared/store/reducers';
import {
  modalStyle,
  calloutStyle,
  checkIsAuthenticated,
  ResourceJSONPrettify,
} from './IDResolvedManyPage';

const IDResolveRedirectionPage = () => {
  const nexus = useNexusContext();
  const navigate = useHistory().push;
  const { apiEndpoint, basePath } = useSelector((state: RootState) => ({
    apiEndpoint: state.config.apiEndpoint,
    basePath: state.config.basePath,
  }));
  const { resourceId } = useParams<{ resourceId: string }>();

  const checkAuthenticatedMemoized = useCallback(
    (state: RootState) => checkIsAuthenticated(state),
    []
  );
  const isAuthenticated = useSelector((state: RootState) =>
    checkAuthenticatedMemoized(state)
  );

  // we should encode it again due oidc returning the url not encoded
  const redirectUri = `${basePath}/resolve/${encodeURIComponent(resourceId)}`;

  const { error, isError } = useQuery({
    enabled: isAuthenticated,
    queryKey: ['resource-id-resolver', { apiEndpoint, resourceId }],
    queryFn: () =>
      nexus.httpGet({
        path: `${apiEndpoint}/resolve/${resourceId}`,
        headers: { Accept: 'text/html' },
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
  const handleHomeRedirect = () => navigate(`/`);

  if (isError) {
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
            <>
              <p style={calloutStyle}>
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
              <p style={calloutStyle}>
                The redirection feature is in beta version, We have taken note
                of this error and are working on improving the feature.
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
      </Modal>
    );
  }

  if (!isAuthenticated) {
    navigate(`/login?destination=${redirectUri}`);
  }

  return null;
};

export default IDResolveRedirectionPage;
