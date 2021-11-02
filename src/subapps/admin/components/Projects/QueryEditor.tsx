import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_SPARQL_VIEW_ID,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
} from '@bbp/nexus-sdk';

import { useAdminSubappContext } from '../..';

const QueryEditor: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onUpdate: () => void;
}> = ({ orgLabel, projectLabel, onUpdate }) => {
  const subApp = useAdminSubappContext();
  return (
    <div className="query-editor">
      <h3>Project Tools</h3>
      <p>
        View resources in your project using pre-defined query-helper lists.
      </p>
      <div className="project-menu__controls">
        <Link
          to={`/${
            subApp.namespace
          }/${orgLabel}/${projectLabel}/${encodeURIComponent(
            DEFAULT_SPARQL_VIEW_ID
          )}/sparql`}
        >
          Sparql Query Editor
        </Link>
        <Link
          to={`/${
            subApp.namespace
          }/${orgLabel}/${projectLabel}/${encodeURIComponent(
            DEFAULT_ELASTIC_SEARCH_VIEW_ID
          )}/_search`}
        >
          ElasticSearch Query Editor
        </Link>
      </div>
    </div>
  );
};

export default QueryEditor;
