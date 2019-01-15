import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { List } from '../../store/reducers/lists';
import Renameable from '../Renameable';
import { RootState } from '../../store/reducers';
import { Dropdown, Menu, Input, Icon, Button } from 'antd';
import ResourceList from '../Resources/ResourceList';
import FilterDropdown from './FilterDropdown';

const ListItemContainer: React.FunctionComponent<List> = ({
  name,
  paginationSettings,
  isFetching,
  data,
}) => {
  return (
    <div>
      <h3
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(0, 0, 0, 0.65',
        }}
      >
        <Renameable defaultValue={name} onChange={() => {}} size="small" />
        <Icon type="close" onClick={() => {}} />
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

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListItemContainer);
