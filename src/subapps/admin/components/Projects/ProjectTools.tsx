import * as React from 'react';
import { AccessControl } from '@bbp/react-nexus';
import { Link } from 'react-router-dom';
import { Divider } from 'antd';
import {
  DEFAULT_SPARQL_VIEW_ID,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
} from '@bbp/nexus-sdk';

import FileUploadContainer from '../../../../shared/containers/FileUploadContainer';
import ResourceFormContainer from '../../../../shared/containers/ResourceFormContainer';

import './ProjectTools.less';
import { useAdminSubappContext } from '../..';

const ProjectTools: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onUpdate: () => void;
}> = ({ orgLabel, projectLabel, onUpdate }) => {
  const subApp = useAdminSubappContext();
  return (
    <div className="project-tools">
      <h3>Project Tools</h3>
      <p>
        View resources in your project using pre-defined query-helper lists.
      </p>
      <div className="project-menu__controls">
        <AccessControl
          path={`/${orgLabel}/${projectLabel}`}
          permissions={['resources/write']}
        >
          <ResourceFormContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            onResourceCreated={onUpdate}
          />
        </AccessControl>
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
        <Link
          to={`/${subApp.namespace}/${orgLabel}/${projectLabel}/_settings/acls`}
        >
          View Project's permissions
        </Link>
      </div>
      <AccessControl
        path={`/${orgLabel}/${projectLabel}`}
        permissions={['files/write']}
      >
        <Divider />
        <FileUploadContainer projectLabel={projectLabel} orgLabel={orgLabel} />
      </AccessControl>
    </div>
  );
};

export default ProjectTools;
