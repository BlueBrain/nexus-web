import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router';
import { Collapse, Tag } from 'antd';
import { isMatching, __ as P } from 'ts-pattern';
import { useQuery } from 'react-query';
import { isEmpty } from 'lodash';
import { Resource } from '@bbp/nexus-sdk';
import { LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { RootState } from '../../shared/store/reducers';
import { getOrgAndProjectFromResource } from '../../shared/utils';
import ResponseViewer from '../../shared/components/IDResolution/ResponseViewer';
import ResolutionError from '../../shared/components/IDResolution/ErrorResolution';

import './styles.less';

const checkIsAuthenticated = (state: RootState) => {
  const oidc = state.oidc;
  const token = oidc && oidc.user && !!oidc.user.access_token;
  const isAuthenticated = Boolean(!isEmpty(oidc.user) && token);
  return isAuthenticated;
};

const isMultipleResults = isMatching({
  _total: P.number,
  _results: [{ _project: P.string, '@id': P.string }],
});

const isSingleResult = isMatching({
  '@id': P.string,
  _project: P.string,
});

const isErrorResult = isMatching({
  reason: P.string,
});

const IDResolveRedirectionPage = () => {
  const navigate = useHistory().push;
  const { apiEndpoint, basePath } = useSelector((state: RootState) => ({
    apiEndpoint: state.config.apiEndpoint,
    basePath: state.config.basePath,
  }));
  const [expandedItem, setExpandedItem] = useState<string | string[]>(
    'resolved-resource-0'
  );
  const { resourceId } = useParams<{ resourceId: string }>();
  const decodedId = decodeURIComponent(resourceId);

  const checkAuthenticatedMemoized = useCallback(
    (state: RootState) => checkIsAuthenticated(state),
    []
  );
  const isAuthenticated = useSelector((state: RootState) =>
    checkAuthenticatedMemoized(state)
  );

  // we should encode it again due oidc returning the url not encoded
  const redirectUri = `${basePath}/resolve/${encodeURIComponent(resourceId)}`;
  const onChangeKey = (key: string | string[]) => setExpandedItem(key);

  const { data, error, isError: failed, isLoading: resolving } = useQuery({
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
    queryKey: ['resolve-resource', { resourceId, apiEndpoint }],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiEndpoint}/resolve/${resourceId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
          },
        });
        return await response.json();
      } catch (error) {
        return error;
      }
    },
  });

  if (!isAuthenticated) {
    navigate(`/login?destination=${redirectUri}`);
  } else if (resolving) {
    return (
      <div className="id-resolution-container">
        <div className="id-resolution-resolving">
          <LoadingOutlined />
          <div>Resolving...</div>
        </div>
      </div>
    );
  } else if (failed || isErrorResult(data)) {
    return (
      <div className="container">
        <ResolutionError
          redirectUri={redirectUri}
          resourceId={resourceId}
          error={failed ? error : data}
        />
      </div>
    );
  } else if (isSingleResult(data)) {
    const { orgLabel, projectLabel } = getOrgAndProjectFromResource(
      data as Resource
    )!;
    return (
      <Redirect to={`/${orgLabel}/${projectLabel}/resources/${resourceId}`} />
    );
  } else if (isMultipleResults(data)) {
    return (
      <div className="id-resolution-container">
        <div className="id-resolution-wrapper">
          <h2 className="id-resolution-title">ID Resolution</h2>
          <Collapse
            className="id-resolution-collapse"
            onChange={onChangeKey}
            defaultActiveKey={expandedItem}
          >
            {((data as any)._results as Resource[]).map(
              (resource: any, index: number) => {
                const { orgLabel, projectLabel } = getOrgAndProjectFromResource(
                  resource
                )!;
                const path = `${orgLabel}/${projectLabel}`;
                const url = `/${path}/resources/${resourceId}`;
                return (
                  <Collapse.Panel
                    key={`resolved-resource-${index}`}
                    header={
                      <div className="id-resolution-collapse-header">
                        <div className="title">
                          <Tag
                            color="#f2f2f2"
                            style={{ color: '#0050b3' }}
                            title={path}
                          >
                            {path}
                          </Tag>
                          <span>{decodedId}</span>
                        </div>
                        <Link to={url} className="link">
                          Open Resource
                        </Link>
                      </div>
                    }
                  >
                    <ResponseViewer
                      showHeader
                      header={`${path}/${decodedId}`}
                      data={resource}
                    />
                  </Collapse.Panel>
                );
              }
            )}
          </Collapse>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResponseViewer data={data ?? error} />
    </div>
  );
};

export default IDResolveRedirectionPage;
