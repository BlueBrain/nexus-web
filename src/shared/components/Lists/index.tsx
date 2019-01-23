import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';
import './Lists.less';
import { uuidv4 } from '../../utils';
import { List, ListsByProjectState } from '../../store/reducers/lists';
import ListItem from './ListItem';
import { createList, initializeProjectList } from '../../store/actions/lists';
import { Empty } from 'antd';
import { Project } from '@bbp/nexus-sdk';

interface ListProps {
  lists: ListsByProjectState;
  orgLabel: string;
  projectLabel: string;
  project: Project | null | undefined;
  initialize: () => void;
}

const ListsContainer: React.FunctionComponent<ListProps> = ({
  lists,
  initialize,
  orgLabel,
  projectLabel,
  project,
}) => {
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
      {!(projectLists || []).length && (
        <div style={{ opacity: 1, width: '50%', marginTop: '5%' }}>
          <Empty description>No lists</Empty>
        </div>
      )}
    </ul>
  );
};

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
