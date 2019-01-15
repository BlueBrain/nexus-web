import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';
import './Lists.less';
import { getProp } from '../../utils';
import { List } from '../../store/reducers/lists';
import ListItem from './ListItem';
import { createList } from '../../store/actions/lists';

interface ListProps {
  lists: List[];
  createList: () => void;
}

const ListsContainer: React.FunctionComponent<ListProps> = ({
  lists,
  createList,
}) => {
  const transitions = lists.map((list, listIndex) => ({
    props: { opacity: 1, width: '300px' },
    item: list,
    key: `list-${listIndex}`,
  }));

  const stuff = transitions.map(
    ({ key, item, props: { ...style } }, listIndex: number) => {
      return (
        <li className="list" key={key} style={style}>
          <ListItem {...item} />
        </li>
      );
    }
  );
  return (
    <ul className="list-board">
      {stuff}
      <li className="list -new" onClick={createList}>
        <h2>Make a new list</h2>
        <p>{'view resources from project '}</p>
      </li>
    </ul>
  );
};

const mapStateToProps = (state: RootState) => ({
  lists: getProp(state, 'lists', []),
});

const mapDispatchToProps = (dispatch: any) => ({
  createList: () => dispatch(createList()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListsContainer);
