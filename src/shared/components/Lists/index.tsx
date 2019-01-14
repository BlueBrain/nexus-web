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
import { Dropdown, Menu, Input, Icon, Button } from 'antd';
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
    const newList = lists.filter((value, index) => index !== listIndex);
    set(newList);
  };

  const transitions = lists.map((list, listIndex) => ({
    props: { opacity: 1, width: '300px' },
    item: list,
    key: `list-${listIndex}`,
  }));

  const stuff = transitions.map(
    ({ key, item, props: { ...style } }, listIndex: number) => {
      const { name } = item;

      const menu = (
        <Menu>
          <Menu.Item>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.alipay.com/"
            >
              1st menu item
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.taobao.com/"
            >
              2nd menu item
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.tmall.com/"
            >
              3rd menu item
            </a>
          </Menu.Item>
        </Menu>
      );

      return (
        <li className="list" key={key} style={style}>
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
                onChange={() => {}}
                size="small"
              />
              <Icon type="close" onClick={() => removeList(listIndex)} />
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
                  <Dropdown overlay={menu}>
                    <a className="ant-dropdown-link">
                      <Icon type="filter" onClick={() => {}} />
                    </a>
                  </Dropdown>
                }
                placeholder="Enter text query..."
              />
              <Button icon="code" onClick={() => {}} />
            </div>
            <div>Some stuff....</div>
          </div>
        </li>
      );
    }
  );
  return (
    <ul className="list-board">
      {stuff}
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
