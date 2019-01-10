import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';
import Renameable from '../Renameable';
import {
  fetchResources,
  fetchSchemas,
  selectSchema,
} from '../../store/actions/nexus';
import FlipCard from '../Animations/FlipCard';
import { AutoComplete, Input, Icon, Button } from 'antd';
import './Lists.less';

interface ListProps {
  orgLabel: string;
  projectLabel: string;
}

const DEFAULT_LIST = {
  name: 'Default List',
};

const ListsContainer: React.FunctionComponent<ListProps> = ({
  orgLabel,
  projectLabel,
}) => {
  const [lists, set] = React.useState([DEFAULT_LIST]);
  const addNewList = function() {
    const newList = { name: 'New List' };
    set(lists.concat(newList));
  };

  const removeList = function(listIndex: number) {
    if (listIndex > 0) {
      const newList = lists.splice(listIndex, 1);
      set(newList);
    } else {
      set([]);
    }
  };

  return (
    <ul className="list-board">
      {lists.map((list, listIndex) => {
        const { name } = list;
        return (
          <li className="list">
            <Button icon="close" onClick={() => removeList(listIndex)} />
            <h2>
              <Renameable defaultValue={name} onChange={() => {}} />
            </h2>
            <div>Some stuff....</div>
          </li>
        );
      })}
      <li className="list -new" onClick={addNewList}>
        <h2>Make a new list</h2>
        <p>{'view resources from project '}</p>
      </li>
    </ul>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (dispatch: any) => ({
  fetchResources: (
    org: string,
    project: string,
    resourcePaginationSettings: PaginationSettings
  ) => dispatch(fetchResources(org, project, resourcePaginationSettings)),
  fetchSchemas: (org: string, project: string) =>
    dispatch(fetchSchemas(org, project)),
  selectSchema: (value: string) => dispatch(selectSchema(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListsContainer);
