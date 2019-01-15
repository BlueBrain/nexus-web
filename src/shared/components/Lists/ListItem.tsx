import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { List } from '../../store/reducers/lists';
import Renameable from '../Renameable';
import { RootState } from '../../store/reducers';
import { Dropdown, Menu, Input, Icon, Button } from 'antd';
import ResourceList from '../Resources/ResourceList';
import FilterDropdown from './FilterDropdown';
import { updateList, deleteList } from '../../store/actions/lists';

interface ListItemContainerProps {
  list: List;
  listIndex: number;
  orgProjectFilterKey: string;
  updateList: (listIndex: number, list: List) => void;
  deleteList: (listIndex: number) => void;
}

const ListItemContainer: React.FunctionComponent<ListItemContainerProps> = ({
  list,
  listIndex,
  updateList,
  deleteList,
}) => {
  const { name, paginationSettings, isFetching, data } = list;

  const handleUpdate = (value: string) => {
    updateList(listIndex, { ...list, name: value });
  };

  const handleDelete = () => {
    deleteList(listIndex);
  };

  return (
    <div>
      <h3
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(0, 0, 0, 0.65',
        }}
      >
        <Renameable defaultValue={name} onChange={handleUpdate} size="small" />
        <Icon type="close" className="close-button" onClick={handleDelete} />
      </h3>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Input
          style={{ marginRight: '2px' }}
          addonAfter={
            <Dropdown overlay={<FilterDropdown />} placement="bottomCenter">
              <a className="ant-dropdown-link">
                <Icon type="filter" onClick={() => {}} />
              </a>
            </Dropdown>
          }
          placeholder="Enter text query..."
        />
        <Button icon="code" onClick={() => {}} />
      </div>
      <div>
        {data && (
          <ResourceList
            loading={isFetching}
            paginationSettings={paginationSettings}
            paginationChange={() => {}}
            resources={data}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (dispatch: any, { orgProjectFilterKey }: any) => ({
  updateList: (listIndex: number, list: List) =>
    dispatch(updateList(orgProjectFilterKey, listIndex, list)),
  deleteList: (listIndex: number) =>
    dispatch(deleteList(orgProjectFilterKey, listIndex)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListItemContainer);
