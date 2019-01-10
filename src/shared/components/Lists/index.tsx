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

const ListsContainer: React.FunctionComponent<ListProps> = ({
  orgLabel,
  projectLabel,
}) => {
  return (
    <ul className="list-board">
      <li className="list">
        <h2>
          <Renameable defaultValue={'Some List'} onChange={() => {}} />
        </h2>
      </li>
      <li className="list">
        <h2>Some List</h2>
      </li>
      <li className="list">
        <h2>Some List</h2>
      </li>
      <li className="list">
        <h2>Some List</h2>
      </li>
      <li className="list -new">
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
