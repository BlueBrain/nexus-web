import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';
import './Lists.less';
import { uuidv4 } from '../../utils';
import { List, ListsByProjectState } from '../../store/reducers/lists';
import ListItem from './ListItem';
import { createList, initializeProjectList } from '../../store/actions/lists';
import FileUpload from '../FileUpload';
import { Button } from 'antd';
import { Project } from '@bbp/nexus-sdk';

interface ListProps {
  lists: ListsByProjectState;
  orgLabel: string;
  projectLabel: string;
  project: Project | null | undefined;
  initialize: () => void;
  createList: () => void;
}

const ListsContainer: React.FunctionComponent<ListProps> = React.memo(
  ({ lists, createList, initialize, orgLabel, projectLabel, project }) => {
    const orgProjectFilterKey = orgLabel + projectLabel;
    const projectLists: List[] = lists[orgProjectFilterKey];

    React.useEffect(() => {
      if (!projectLists) {
        initialize();
      }
    });

    if (!project) {
      return null;
    }

    return (
      <ul className="list-board">
        {(projectLists || []).map((list, listIndex: number) => {
          return (
            <li
              className="list"
              key={uuidv4()}
              style={{ opacity: 1, width: '300px' }}
            >
              <ListItem
                list={list}
                listIndex={listIndex}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                orgProjectFilterKey={orgProjectFilterKey}
              />
            </li>
          );
        })}
        <div
          className="side-panel"
          key="make-new-list"
          style={{ width: '240px', padding: '0 1em' }}
        >
          <h2>Resources</h2>
          <p>view resources from a project</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              style={{ margin: '0.5em 0' }}
              type="primary"
              onClick={() => {}}
              icon="plus-square"
            >
              Create Resource
            </Button>
            <Button
              style={{ margin: '0.5em 0' }}
              onClick={createList}
              icon="plus-square"
            >
              New List
            </Button>
          </div>
          <div style={{ height: '200px', margin: '0.5em 0' }}>
            <FileUpload
              onFileUpload={async file => {
                const project = await Project.get(orgLabel, projectLabel);
                console.log({ file });
                const response = await project.postFile(file);
                console.log({ response });
              }}
            />
          </div>
        </div>
      </ul>
    );
  }
);

const mapStateToProps = (state: RootState) => {
  return {
    lists: state.lists || {},
    project:
      state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data,
  };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  const orgProjectFilterKey = ownProps.orgLabel + ownProps.projectLabel;
  return {
    createList: () => dispatch(createList(orgProjectFilterKey)),
    initialize: () =>
      dispatch(initializeProjectList(ownProps.orgLabel, ownProps.projectLabel)),
  };
};

// TODO: move this at view level
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListsContainer);
