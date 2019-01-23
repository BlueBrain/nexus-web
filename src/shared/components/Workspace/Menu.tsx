import * as React from 'react';
import FileUpload from '../FileUpload';
import { Button, Drawer } from 'antd';
import { Project } from '@bbp/nexus-sdk';
import ResourceForm from '../Resources/ResourceForm';
import { Link } from 'react-router-dom';
import { RootState } from '../../store/reducers';
import { createList } from '../../store/actions/lists';
import { connect } from 'react-redux';

interface MenuProps {
  project?: Project | null;
  createList: (orgProjectFilterKey: string) => void;
  render: (
    toggleVisibility: () => void,
    visible: boolean
  ) => React.ReactElement<any>;
}

const Menu: React.FunctionComponent<MenuProps> = ({
  createList,
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
        <p>view resources from a project</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ResourceForm
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
          <Link to={`/${orgLabel}/${projectLabel}/graph/sparql`}>
            Sparql Query Editor
          </Link>
          <Link
            to={`/${orgLabel}/${projectLabel}/nxv:defaultElasticIndex/_search`}
          >
            ElasticSearch Query Editor
          </Link>
        </div>
        <div style={{ height: '200px', margin: '0.5em 0' }}>
          <FileUpload onFileUpload={async file => {}} />
        </div>
      </Drawer>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    project:
      state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    createList: (orgProjectFilterKey: string) =>
      dispatch(createList(orgProjectFilterKey)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
