import { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { useHistory, useRouteMatch } from 'react-router';
import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  DEFAULT_SPARQL_VIEW_ID,
} from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import SparqlQueryView from '../../views/SparqlQueryView';
import ElasticSearchQueryView from '../../views/ElasticSearchQueryView';
import useNotification from '../../../../shared/hooks/useNotification';
import { useOrganisationsSubappContext } from '../..';
import './QueryEditor.scss';

const QueryEditor: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onUpdate: () => void;
}> = ({ orgLabel, projectLabel }) => {
  const subapp = useOrganisationsSubappContext();
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
          subapp.namespace
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
                subapp.namespace
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
