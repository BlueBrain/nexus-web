import { RightOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import {
  TDateField,
  THandleMenuSelect,
  THeaderFilterProps,
} from 'shared/canvas/MyData/types';

type TDateFieldSelectorProps = Pick<
  THeaderFilterProps,
  'dateField' | 'setFilterOptions'
>;

const dateFieldName = {
  createdAt: 'Creation Date',
  updatedAt: 'Update Date',
};

const DateFieldSelector = ({
  dateField,
  setFilterOptions,
}: TDateFieldSelectorProps) => {
  const handleDateFieldChange: THandleMenuSelect = ({ key }) =>
    setFilterOptions({ dateField: key as TDateField });

  const DateFieldMenu = (
    <Menu
      onClick={handleDateFieldChange}
      defaultSelectedKeys={['']}
      selectedKeys={dateField ? [dateField] : undefined}
      className="my-data-date-type-popover"
    >
      <Menu.Item key="createdAt">{dateFieldName.createdAt}</Menu.Item>
      <Menu.Item key="updatedAt">{dateFieldName.updatedAt}</Menu.Item>
    </Menu>
  );
  return (
    <Dropdown
      className="date-field-selector"
      placement="bottomLeft"
      trigger={['click']}
      overlay={DateFieldMenu}
    >
      <Button
        type="link"
        style={{ textAlign: 'left', padding: '4px 0px', color: '#333' }}
      >
        {dateFieldName[dateField]}
        <RightOutlined style={{ fontSize: 8, verticalAlign: 'middle' }} />
      </Button>
    </Dropdown>
  );
};

export default DateFieldSelector;
