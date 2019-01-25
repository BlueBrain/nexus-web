import * as React from 'react';
import FileUpload from '../FileUpload';
import { Button, Drawer, Divider } from 'antd';
import { Project, Resource } from '@bbp/nexus-sdk';
import ResourceForm from '../Resources/ResourceForm';
import { Link } from 'react-router-dom';
import { CreateResourcePayload } from '@bbp/nexus-sdk/lib/Resource/types';
interface MenuProps {
  project?: Project | null;
  createList: (orgProjectFilterKey: string) => void;
  createResource: (
    schemaId: string,
    payload: CreateResourcePayload
  ) => Promise<Resource>;
  render: (
    toggleVisibility: () => void,
    visible: boolean
  ) => React.ReactElement<any>;
}

const Menu: React.FunctionComponent<MenuProps> = ({
  createList,
  createResource,
  project,
  render,
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
      <Drawer
        mask={false}
        visible={visible}
        title="Resources"
        height={60}
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
          <Link to={`/${orgLabel}/${projectLabel}/graph/sparql`}>
            Sparql Query Editor
          </Link>
          <Link
            to={`/${orgLabel}/${projectLabel}/nxv:defaultElasticSearchIndex/_search`}
          >
            ElasticSearch Query Editor
          </Link>
        </div>
        <Divider />
        {/* <div style={{ height: '200px' }}>
          <FileUpload
            onFileUpload={async file => {
              // project.postFile()
              console.log({ file });
            }}
          />
        </div> */}
      </Drawer>
    </>
  );
};

export default Menu;
