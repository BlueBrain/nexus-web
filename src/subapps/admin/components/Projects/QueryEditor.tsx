import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  DEFAULT_SPARQL_VIEW_ID,
} from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Tabs } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { useOrganisationsSubappContext } from '../..';
import useNotification from '../../../../shared/hooks/useNotification';
import ElasticSearchQueryView from '../../views/ElasticSearchQueryView';
import SparqlQueryView from '../../views/SparqlQueryView';
import './QueryEditor.scss';

const QueryEditor: FC<{
  orgLabel: string;
  projectLabel: string;
  onUpdate: () => void;
}> = ({ orgLabel, projectLabel }) => {
  const subApp = useOrganisationsSubappContext();
  const history = useHistory();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const nexus = useNexusContext();
  const notification = useNotification();
  const [activeKey, setActiveKey] = useState('sparql');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (match.params.viewId) {
      nexus.View.get(orgLabel, projectLabel, match.params.viewId)
        .then(result => {
          // show appropriate search tab
          if ([result['@type']].flat().includes('SparqlView')) {
            setActiveKey('sparql');
          } else {
            setActiveKey('elasticsearch');
          }
          setLoading(false);
        })
        .catch(error => {
          notification.error({
            message: 'Problem loading View',
            description: error.message,
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
      history.replace(
        `/${
          subApp.namespace
        }/${orgLabel}/${projectLabel}/query/${encodeURIComponent(
          DEFAULT_SPARQL_VIEW_ID
        )}`
      );
    }
  }, [orgLabel, projectLabel]);

  if (loading) {
    return null;
  }

  return (
    <div className="query-editor">
      <div className="query-editor__header">
        <h3>Query Browser</h3>
        <p>
          View resources in your project using pre-defined query-helper lists.
        </p>
      </div>
      <div className="project-menu__controls">
        <Tabs
          className="query-tabs"
          onChange={tab => {
            setActiveKey(tab);
            history.replace(
              `/${
                subApp.namespace
              }/${orgLabel}/${projectLabel}/query/${encodeURIComponent(
                tab === 'sparql'
                  ? DEFAULT_SPARQL_VIEW_ID
                  : DEFAULT_ELASTIC_SEARCH_VIEW_ID
              )}`
            );
          }}
          activeKey={activeKey}
          tabPosition="left"
          items={[
            {
              key: 'sparql',
              label: 'SPARQL',
              children: (
                <div>
                  <SparqlQueryView />
                </div>
              ),
            },
            {
              key: 'elasticsearch',
              label: 'Elasticsearch',
              children: (
                <div>
                  <ElasticSearchQueryView />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default QueryEditor;
