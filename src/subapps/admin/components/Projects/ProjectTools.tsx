import * as React from 'react';
import { AccessControl } from '@bbp/react-nexus';
import { Link } from 'react-router-dom';
import { Divider } from 'antd';

import FileUploadContainer from '../../../../shared/containers/FileUploadContainer';
import ResourceFormContainer from '../../../../shared/containers/ResourceFormContainer';

import './ProjectTools.less';
import { useAdminSubappContext } from '../..';

const ProjectTools: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
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
          />
        </AccessControl>
        <Link
          to={`/${subApp.namespace}/${orgLabel}/${projectLabel}/graph/sparql`}
        >
          Sparql Query Editor
        </Link>
        <Link
          to={`/${subApp.namespace}/${orgLabel}/${projectLabel}/documents/_search`}
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
