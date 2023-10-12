import { useState } from 'react';
import { Collapse } from 'antd';
import { isEmpty } from 'lodash';
import { match } from 'ts-pattern';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import ReactJson from 'react-json-view';

import { RootState } from '../../shared/store/reducers';

const style = { marginTop: 80 };
const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: '100vh',
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
    />
  );
};

const IDResolvedManyPage = () => {
  const nexus = useNexusContext();
  const oidc = useSelector((state: RootState) => state.oidc);

  const { apiEndpoint } = useSelector((state: RootState) => state.config);
  const { resourceId } = useParams<{ resourceId: string }>();
  const [expandedItem, setExpandedItem] = useState<string | string[]>();
  const token = oidc && oidc.user && !!oidc.user.access_token;
  const authenticated = !isEmpty(oidc.user);
  const isAuthenticated = authenticated && token;

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

  const onChangeKey = (key: string | string[]) => setExpandedItem(key);
  const decodedId = decodeURIComponent(resourceId);

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
        return <div style={containerStyle}>No result found</div>;
      } else if ('_results' in data && Boolean(data._total)) {
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
          <ResourceJSONPrettify showHeader data={data} />
        </div>
      );
    })
    .otherwise(() => <></>);
};

export default IDResolvedManyPage;
