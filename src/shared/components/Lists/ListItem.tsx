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
import { queryResources } from '../../store/actions/queryResource';

interface ListItemContainerProps {
  list: List;
  listIndex: number;
  orgProjectFilterKey: string;
  updateList: (listIndex: number, list: List) => void;
  deleteList: (listIndex: number) => void;
  queryResources: (paginationSettings: PaginationSettings, query: any) => void;
}

const DEFAULT_RESOURCE_PAGINATION_SIZE = 20;

const DEFAULT_PAGINATION_SETTINGS = {
  from: 0,
  size: DEFAULT_RESOURCE_PAGINATION_SIZE,
};

const ListItemContainer: React.FunctionComponent<
  ListItemContainerProps
> = React.memo(
  ({ list, listIndex, updateList, deleteList, queryResources }) => {
    React.useEffect(
      () => {
        const {
          request: { isFetching, data, error },
        } = list;
        console.log('Im updating', { data });
        const paginationSettings = data
          ? data.paginationSettings
          : DEFAULT_PAGINATION_SETTINGS;
        if (!data && !isFetching) {
          // Or when query changes
          queryResources(paginationSettings, {});
        }
      },
      [list.query]
    );
    const {
      name,
      request: { isFetching, data, error },
      query,
    } = list;

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
          <Renameable
            defaultValue={name}
            onChange={handleUpdate}
            size="small"
          />
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
          <Button
            icon="export"
            onClick={() => {}}
            style={{ marginRight: '2px' }}
          />
          <Button icon="code" onClick={() => {}} />
        </div>
        <div>
          {data && (
            <ResourceList
              loading={isFetching}
              paginationSettings={data.paginationSettings}
              paginationChange={() => {}}
              resources={data.resources}
            />
          )}
        </div>
      </div>
    );
  }
);

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (
  dispatch: any,
  { orgProjectFilterKey, orgLabel, projectLabel, listIndex }: any
) => ({
  updateList: (listIndex: number, list: List) =>
    dispatch(updateList(orgProjectFilterKey, listIndex, list)),
  deleteList: (listIndex: number) =>
    dispatch(deleteList(orgProjectFilterKey, listIndex)),
  queryResources: (paginationSettings: PaginationSettings, query: any) =>
    dispatch(
      queryResources(
        listIndex,
        orgProjectFilterKey,
        orgLabel,
        projectLabel,
        paginationSettings,
        query
      )
    ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListItemContainer);
