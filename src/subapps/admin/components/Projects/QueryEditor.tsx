import * as React from 'react';
import SparqlQueryView from '../../views/SparqlQueryView';
import ElasticSearchQueryView from '../../views/ElasticSearchQueryView';
import { Tabs } from 'antd';

const QueryEditor: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onUpdate: () => void;
}> = ({ orgLabel, projectLabel, onUpdate }) => {
  const { TabPane } = Tabs;
  return (
    <div className="query-editor">
      <h3>Query Browser</h3>
      <p>
        View resources in your project using pre-defined query-helper lists.
      </p>
      <div className="project-menu__controls">
        <Tabs defaultActiveKey="browse" tabPosition="left">
          <TabPane tab="SparQL" key="browse">
            <div style={{ flexGrow: 1 }}>
              <SparqlQueryView />
            </div>
          </TabPane>
          <TabPane tab="ElasticSearch" key="query">
            <div style={{ flexGrow: 1 }}>
              <ElasticSearchQueryView />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default QueryEditor;
