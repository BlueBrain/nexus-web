import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { Button, Modal } from 'antd';

import { RootState } from '../../shared/store/reducers';
import {
  modalStyle,
  calloutStyle,
  checkIsAuthenticated,
  ResourceJSONPrettify,
} from './IDResolvedManyPage';

const IDResolveRedirectionPage = () => {
  const navigate = useHistory().push;
  const { apiEndpoint, basePath } = useSelector((state: RootState) => ({
    apiEndpoint: state.config.apiEndpoint,
    basePath: state.config.basePath,
  }));
  const [{ error, isError }, setResolutionError] = useState({
    isError: false,
    error: null,
  });
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

  const ACInstance = new AbortController();
  useEffect(() => {
    if (resourceId && apiEndpoint) {
      (async () => {
        fetch(`${apiEndpoint}/resolve/${resourceId}`, {
          headers: {
            Accept: 'text/html',
            Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
          },
          redirect: 'manual',
          signal: ACInstance.signal,
        })
          .then(res => {
            window.location.replace(res.url);
          })
          .catch(error => {
            setResolutionError({ error, isError: true });
            ACInstance.abort();
          });
      })();
    }
    return () => ACInstance.abort();
  }, [apiEndpoint, resourceId]);

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
