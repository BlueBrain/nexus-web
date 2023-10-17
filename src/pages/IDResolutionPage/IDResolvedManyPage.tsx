import { CSSProperties, useCallback, useState } from 'react';
import { Button, Collapse, Modal } from 'antd';
import { isEmpty } from 'lodash';
import { match } from 'ts-pattern';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import ReactJson from 'react-json-view';

import { RootState } from '../../shared/store/reducers';

const style = { marginTop: 80 };
export const modalStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexDirection: 'column',
} as CSSProperties;

export const calloutStyle = {
  margin: 10,
  width: '100%',
  border: '1px solid #c11b1b3b',
  padding: '4px',
  borderRadius: '4px',
  fontSize: 14,
  fontWeight: 'bold',
} as CSSProperties;

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: '100vh',
};

export const checkIsAuthenticated = (state: RootState) => {
  const oidc = state.oidc;
  const token = oidc && oidc.user && !!oidc.user.access_token;
  const isAuthenticated = Boolean(!isEmpty(oidc.user) && token);
  return isAuthenticated;
};

export const ResourceJSONPrettify = ({
  data,
  showHeader = false,
  header = '',
}: {
  data: any;
  header?: string;
  showHeader?: boolean;
}) => {
  return (
    <ReactJson
      collapsed
      name={showHeader ? header : undefined}
      src={data as object}
      enableClipboard={false}
      displayObjectSize={false}
      displayDataTypes={false}
      style={{ maxWidth: 'max-content' }}
    />
  );
};

const IDResolvedManyPage = () => {
  const nexus = useNexusContext();
  const navigate = useHistory().push;
  const apiEndpoint = useSelector(
    (state: RootState) => state.config.apiEndpoint
  );
  const { resourceId } = useParams<{ resourceId: string }>();
  const [expandedItem, setExpandedItem] = useState<string | string[]>();

  const checkAuthenticatedMemoized = useCallback(
    (state: RootState) => checkIsAuthenticated(state),
    []
  );
  const isAuthenticated = useSelector((state: RootState) =>
    checkAuthenticatedMemoized(state)
  );

  const { data, error, isLoading: resolving, isSuccess: resolved } = useQuery({
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
    queryKey: ['resolver', { apiEndpoint, resourceId }],
    queryFn: () =>
      nexus.httpGet({
        path: `${apiEndpoint}/resolve/${resourceId}`,
      }),
    onSuccess: data => console.log('@@dataResolved', data),
    onError: error => console.log('@@errorResolved', error),
  });

  const decodedId = decodeURIComponent(resourceId);

  const onChangeKey = (key: string | string[]) => setExpandedItem(key);
  const handleHomeRedirect = () => navigate(`/`);

  return match({ resolving, resolved, error })
    .with({ resolving: true }, () => {
      return <div style={style}>Resolving...</div>;
    })
    .with({ resolving: false, resolved: true }, () => {
      if (error) {
        return (
          <div style={containerStyle}>
            <strong style={style}>Temporary resoultion failed</strong>
            <ResourceJSONPrettify
              showHeader
              header={`Error/Resolved ID: ${decodedId}`}
              data={error}
            />
          </div>
        );
      }
      if (data._total === 0) {
        return (
          <div style={containerStyle}>
            <Modal
              open
              centered
              footer={null}
              closable={false}
              closeIcon={null}
            >
              <div style={modalStyle}>
                <p style={calloutStyle}>
                  No Resource(s) has been resolved with this ID
                </p>
                <Button
                  type="primary"
                  style={{ alignSelf: 'flex-end' }}
                  onClick={handleHomeRedirect}
                >
                  Return Home
                </Button>
              </div>
            </Modal>
          </div>
        );
      }
      if ('_results' in data && Boolean(data._total)) {
        return (
          <div style={containerStyle}>
            <Collapse onChange={onChangeKey} defaultActiveKey={expandedItem}>
              {data._results.map((resource: any, index: number) => (
                <Collapse.Panel header={resource} key={`${decodedId}-${index}`}>
                  <ResourceJSONPrettify data={data} />
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
        );
      }
      return (
        <div style={containerStyle}>
          <strong style={style}>Temporary resoultion page</strong>
          <ResourceJSONPrettify
            showHeader
            header={`Resolved ID: ${decodedId}`}
            data={data}
          />
        </div>
      );
    })
    .otherwise(() => <></>);
};

export default IDResolvedManyPage;
