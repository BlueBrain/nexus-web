import { FC, useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { useHistory, useRouteMatch } from 'react-router';
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
    const viewId = match.params.viewId;

    const fetchAndSetActiveViewKey = async () => {
      if (!viewId) {
        return;
      }
      setLoading(true);
      try {
        const view = await nexus.View.get(orgLabel, projectLabel, viewId);
        // Show appropriate search tab
        if ([view['@type']].flat().includes('SparqlView')) {
          setActiveKey('sparql');
        } else {
          setActiveKey('elasticsearch');
        }
      } catch (error) {
        notification.error({
          message: 'Problem loading View',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetActiveViewKey();
  }, [match.params.viewId, nexus.View, notification, orgLabel, projectLabel]);

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
            // Only trigger navigation if the active tab has changed.
            if (tab !== activeKey) {
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
            }
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
