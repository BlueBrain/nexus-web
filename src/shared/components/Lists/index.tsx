import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';
import './Lists.less';
import { uuidv4 } from '../../utils';
import { List, ListsByProjectState } from '../../store/reducers/lists';
import ListItem from './ListItem';
import { createList, initializeProjectList } from '../../store/actions/lists';

interface ListProps {
  lists: ListsByProjectState;
  orgLabel: string;
  projectLabel: string;
  initialize: () => void;
  createList: () => void;
}

const ListsContainer: React.FunctionComponent<ListProps> = React.memo(
  ({ lists, createList, initialize, orgLabel, projectLabel }) => {
    const orgProjectFilterKey = orgLabel + projectLabel;
    const projectLists: List[] = lists[orgProjectFilterKey];

    React.useEffect(() => {
      if (!projectLists) {
        initialize();
      }
    });

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
        <div className="list -new" onClick={createList} key="make-new-list">
          <h2>Make a new list</h2>
          <p>{'view resources from project '}</p>
        </div>
      </ul>
    );
  }
);

const mapStateToProps = (state: RootState) => {
  return {
    lists: state.lists || {},
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListsContainer);
