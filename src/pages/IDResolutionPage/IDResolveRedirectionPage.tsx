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

  useEffect(() => {
    if (resourceId && apiEndpoint && isAuthenticated) {
      (async () => {
        fetch(`${apiEndpoint}/resolve/${resourceId}`, {
          headers: {
            Accept: 'text/html',
            Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
          },
        });
      })();
    }
  }, [apiEndpoint, resourceId, isAuthenticated]);

  if (!isAuthenticated) {
    navigate(`/login?destination=${redirectUri}`);
  }

  return null;
};

export default IDResolveRedirectionPage;
