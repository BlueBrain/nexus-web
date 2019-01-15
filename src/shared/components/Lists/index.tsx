import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';
import './Lists.less';
import { getProp, uuidv4 } from '../../utils';
import { List } from '../../store/reducers/lists';
import ListItem from './ListItem';
import { createList } from '../../store/actions/lists';
import * as md5 from 'md5';

interface ListProps {
  lists: List[];
  createList: () => void;
}

const ListsContainer: React.FunctionComponent<ListProps> = ({
  lists,
  createList,
}) => {
  const transitions = lists.map(list => ({
    props: { opacity: 1, width: '300px' },
    item: list,
    // we need a unique key for react to update the correct element,
    // but the list may have similar content
    // so it's difficult to manually build a unique string
    key: uuidv4(),
  }));

  return (
    <ul className="list-board">
      {transitions.map(
        ({ key, item, props: { ...style } }, listIndex: number) => {
          return (
            <li className="list" key={key} style={style}>
              <ListItem list={item} listIndex={listIndex} />
            </li>
          );
        }
      )}
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
