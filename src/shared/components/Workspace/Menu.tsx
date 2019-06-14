import * as React from 'react';
import { Button, Divider } from 'antd';
import { Project, Resource, NexusFile } from '@bbp/nexus-sdk';
import ResourceForm from '../Resources/ResourceForm';
import { Link } from 'react-router-dom';
import { CreateResourcePayload } from '@bbp/nexus-sdk/lib/Resource/types';
import SideMenu from './SideMenu';
import FileUploader from '../FileUpload';

interface MenuProps {
  project?: Project | null;
  createList: (orgProjectFilterKey: string) => void;
  onFileUpload: (file: File) => void;
  createResource: (
    schemaId: string,
    payload: CreateResourcePayload
  ) => Promise<Resource>;
  render: (
    toggleVisibility: () => void,
    visible: boolean
  ) => React.ReactElement<any>;
}

// TODO: refactor: remove `Link` from deps and use props instead.
const Menu: React.FunctionComponent<MenuProps> = ({
  createList,
  createResource,
  project,
  render,
  onFileUpload,
}) => {
  const [visible, setVisible] = React.useState(true);
  if (!project) {
    return null;
  }
  const orgLabel = project.orgLabel;
  const projectLabel = project.label;
  const orgProjectFilterKey = orgLabel + projectLabel;
  const toggleVisibility = () => {
    setVisible(!visible);
  };
  const renderable = render(toggleVisibility, visible);
  return (
    <>
      {renderable}
      <SideMenu
        visible={visible}
        title="Resources"
        onClose={() => setVisible(false)}
      >
        <p>
          View resources in your project using pre-defined query-helper lists.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ResourceForm
            createResource={createResource}
            project={project}
            render={(updateFormVisible: () => void) => {
              return (
                <Button
                  style={{ margin: '0.5em 0' }}
                  type="primary"
                  onClick={updateFormVisible}
                  icon="plus-square"
                >
                  Create Resource
                </Button>
              );
            }}
          />
          <Button
            style={{ margin: '0.5em 0' }}
            onClick={() => createList(orgProjectFilterKey)}
            icon="plus-square"
          >
            New Query
          </Button>
          <Divider />
          <Link
            to={`/${orgLabel}/${projectLabel}/nxv:defaultSparqlIndex/sparql`}
          >
            Sparql Query Editor
          </Link>
          <Link
            to={`/${orgLabel}/${projectLabel}/nxv:defaultElasticSearchIndex/_search`}
          >
            ElasticSearch Query Editor
          </Link>
          <Link to={`/${orgLabel}/${projectLabel}/_settings/acls`}>
            View Project's permissions
          </Link>
        </div>
        <Divider />
        <FileUploader onFileUpload={onFileUpload} project={project} />
      </SideMenu>
    </>
  );
};

export default Menu;
