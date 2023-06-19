import React, { Fragment, useReducer, useRef, useState } from 'react';
import {
  Input,
  Radio,
  Tag,
  RadioChangeEvent,
  Dropdown,
  Button,
  Menu,
  Checkbox,
  InputRef,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CalendarOutlined, RightOutlined } from '@ant-design/icons';
import { TagProps } from 'antd/lib/tag';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { capitalize, isString, startCase, pull as removeItem } from 'lodash';
import { NexusClient } from '@bbp/nexus-sdk';
import * as moment from 'moment';
import * as pluralize from 'pluralize';
import {
  TDateField,
  THandleMenuSelect,
  THeaderFilterProps,
  TDateOptions,
  THeaderProps,
  TTitleProps,
  TTypeDateItem,
  TCurrentDate,
  DATE_PATTERN,
} from '../../../shared/canvas/MyData/types';
import useClickOutside from '../../../shared/hooks/useClickOutside';
import useMeasure from '../../../shared/hooks/useMeasure';
import DateSeparated from '../../components/DateSeparatedInputs/DateSeparated';
import './styles.less';

const Title = ({ text, label, total }: TTitleProps) => {
  return (
    <div className="my-data-table-header-title">
      <span> {text}</span>
      <span>
        {total} {label}
      </span>
    </div>
  );
};
const tagRender = (props: TagProps) => {
  // @ts-ignore
  const { label } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={false}
      style={{ marginRight: 3, background: 'none' }}
    >
      {label}
    </Tag>
  );
};
const fetchGlobalSearchTypes = async (nexus: NexusClient) => {
  const data = await nexus.Search.query({
    query: {
      match_all: {},
    },
    aggs: {
      suggestions: {
        terms: {
          field: '@type.keyword',
          size: 1000,
        },
      },
      '(missing)': {
        missing: {
          field: '@type.keyword',
        },
      },
    },
  });
  return data.aggregations.suggestions.buckets;
};
const dateFieldName = {
  createdAt: 'Creation Date',
  updatedAt: 'Update Date',
};
const Filters = ({
  dataType,
  dateField,
  query,
  setFilterOptions,
  locate,
  issuer,
  isAcrossProjects,
}: THeaderFilterProps) => {
  const popoverRef = useRef(null);
  const nexus = useNexusContext();
  const [dateFilterContainer, setOpenDateFilterContainer] = useState<boolean>(
    false
  );
  const [
    { dateEnd, dateFilterType, singleDate, dateStart },
    updateCurrentDates,
  ] = useReducer(
    (previous: TCurrentDate, next: Partial<TCurrentDate>) => ({
      ...previous,
      ...next,
    }),
    {
      singleDate: undefined,
      dateEnd: undefined,
      dateStart: undefined,
      dateFilterType: undefined,
    }
  );
  const onChangeDateType = (e: RadioChangeEvent) => {
    updateCurrentDates({
      dateFilterType: e.target.value,
      singleDate: '',
      dateStart: '',
      dateEnd: '',
    });
  };
  const handleSubmitDates: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    console.log('@@form', {
      dateFilterType,
      singleDate,
      dateStart,
      dateEnd,
    });
    setFilterOptions({
      dateFilterType,
      singleDate,
      dateStart,
      dateEnd,
    });
  };
  const onIssuerChange = (e: RadioChangeEvent) =>
    setFilterOptions({ issuer: e.target.value });
  const onSearchLocateChange = (e: CheckboxChangeEvent) =>
    setFilterOptions({ locate: e.target.checked });
  const onSearchAcrossProjectsChange = (e: CheckboxChangeEvent) =>
    setFilterOptions({ isAcrossProjects: e.target.checked });
  const onDatePopoverVisibleChange = () =>
    setOpenDateFilterContainer(state => !state);
  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = event =>
    setFilterOptions({ query: event.target.value });
  const handleDateFieldChange: THandleMenuSelect = ({ key }) =>
    setFilterOptions({ dateField: key as TDateField });
  const updateDate = (type: TDateOptions, date: string) =>
    updateCurrentDates({
      [type]: date,
    });

  const notValidForm =
    !dateFilterType ||
    !dateField ||
    (dateFilterType === 'range' && (!dateStart || !dateEnd)) ||
    (dateFilterType === 'range' &&
      dateStart &&
      dateEnd &&
      moment(dateEnd).isBefore(dateStart, 'days')) ||
    (dateFilterType !== 'range' && !singleDate);

  const DatePickerContainer = (
    <Fragment>
      <form className="my-data-date-content" onSubmit={handleSubmitDates}>
        <Radio.Group
          name="dateFilterType"
          size="small"
          onChange={onChangeDateType}
          value={dateFilterType}
          className="date-type-selector"
        >
          <Radio className="radio-filter" value="before">
            Before
          </Radio>
          <Radio className="radio-filter" value="after">
            After
          </Radio>
          <Radio className="radio-filter" value="range">
            Range
          </Radio>
        </Radio.Group>
        {dateFilterType === 'range' ? (
          <Fragment>
            <span className="range-born">From</span>
            <DateSeparated
              name="dateStart"
              value={dateStart}
              updateUpperDate={value => {
                if (
                  dateEnd &&
                  moment(dateEnd).isValid() &&
                  moment(dateEnd).isBefore(dateStart, 'days')
                ) {
                  return updateCurrentDates({
                    dateStart: dateEnd,
                    dateEnd: value,
                  });
                }
                return updateDate('dateStart', value);
              }}
            />
            <span className="range-born">To</span>
            <DateSeparated
              name="dateStart"
              value={dateEnd}
              updateUpperDate={value => {
                if (
                  dateStart &&
                  moment(dateStart).isValid() &&
                  moment(dateStart).isAfter(dateEnd, 'days')
                ) {
                  return updateCurrentDates({
                    dateStart: value,
                    dateEnd: dateStart,
                  });
                }
                return updateDate('dateEnd', value);
              }}
            />
          </Fragment>
        ) : (
          <DateSeparated
            name="singleDate"
            value={singleDate}
            updateUpperDate={value => updateDate('singleDate', value)}
          />
        )}
        <Button
          type="ghost"
          htmlType="submit"
          disabled={notValidForm}
          style={{ alignSelf: 'flex-end', margin: '10px 0 0' }}
        >
          Apply
        </Button>
      </form>
    </Fragment>
  );
  const selectedDate =
    dateFilterType === 'range' && dateStart !== '' && dateEnd !== ''
      ? `${moment(dateStart).format(DATE_PATTERN)}  →  ${moment(dateEnd).format(
          DATE_PATTERN
        )}`
      : singleDate
      ? `${capitalize(dateFilterType)} ${moment(singleDate).format(
          DATE_PATTERN
        )}`
      : undefined;

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
  const { data: buckets, status: typesStatus } = useQuery({
    queryKey: ['global-search-types'],
    queryFn: () => fetchGlobalSearchTypes(nexus),
  });

  const typesDataSources: TTypeDateItem[] =
    typesStatus === 'success' &&
    buckets &&
    buckets.map((bucket: any) => {
      return {
        key: bucket.key,
        label: bucket.key.split('/').pop(),
        value: bucket.key,
      };
    });
  const handleOnCheckType = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    type: TTypeDateItem
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setFilterOptions({
      dataType: dataType?.includes(type.key)
        ? removeItem(dataType, type.key)
        : dataType
        ? [...dataType, type.key]
        : [type.key],
    });
  };
  const [typeInputRef, { width }] = useMeasure();
  const [dateInputRef, { width: datePopWidth }] = useMeasure<
    HTMLInputElement
  >();
  useClickOutside(popoverRef, onDatePopoverVisibleChange);
  return (
    <div className="my-data-table-header-actions">
      <Radio.Group
        defaultValue={isAcrossProjects ? undefined : 'createdBy'}
        value={isAcrossProjects ? undefined : issuer}
        onChange={onIssuerChange}
      >
        <Radio className="radio-filter" value="createdBy">
          Created by me
        </Radio>
        <Radio className="radio-filter" value="updatedBy">
          Last updated by me
        </Radio>
      </Radio.Group>
      <Dropdown
        placement="bottomLeft"
        trigger={['click']}
        overlay={DateFieldMenu}
      >
        <Button
          type="link"
          style={{ textAlign: 'left', padding: '4px 0px', color: '#333' }}
        >
          {dateField ? dateFieldName[dateField] : 'Date Field'}
          <RightOutlined style={{ fontSize: 8, verticalAlign: 'middle' }} />
        </Button>
      </Dropdown>
      <Dropdown
        placement="bottomLeft"
        trigger={['click']}
        overlay={
          <Fragment>
            {dateFilterContainer && (
              <div ref={popoverRef} className="my-data-date-popover">
                {DatePickerContainer}
              </div>
            )}
          </Fragment>
        }
        overlayStyle={{ width: datePopWidth }}
      >
        <Input
          allowClear
          // @ts-ignore
          ref={dateInputRef}
          placeholder="Date"
          className="my-data-date-picker"
          value={selectedDate}
          prefix={<CalendarOutlined />}
          onClick={() => setOpenDateFilterContainer(state => !state)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.type === 'click') {
              updateCurrentDates({
                dateFilterType: undefined,
                singleDate: undefined,
                dateStart: undefined,
                dateEnd: undefined,
              });
              setFilterOptions({
                dateFilterType: undefined,
                singleDate: undefined,
                dateStart: undefined,
                dateEnd: undefined,
              });
            }
          }}
        />
      </Dropdown>
      {/* <Dropdown
        placement="bottomLeft"
        trigger={['click']}
        overlayStyle={{ width }}
        overlay={
          <div className="my-data-type-filter-overlay">
            <div className="my-data-type-filter-search-container">
              <Input.Search
                className="my-data-type-filter-search"
                placeholder="Search for type"
              />
              <div className="count">{typesDataSources.length} types total</div>
            </div>
            <div className="my-data-type-filter-content">
              {typesDataSources &&
                typesDataSources.map((tp: TType) => {
                  return (
                    <Row justify="space-between" align="top" key={tp.key}>
                      <Col span={20}> {startCase(tp.label)} </Col>
                      <Col
                        span={4}
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox
                          onClick={e => handleOnCheckType(e, tp)}
                          checked={dataType.includes(tp.key)}
                        />
                      </Col>
                    </Row>
                  );
                })}
            </div>
          </div>
        }
      >
        <Input
          // @ts-ignore
          ref={typeInputRef}
          placeholder="Type"
          className="my-data-type-picker"
          value={dataType.map(item => startCase(item.split('/').pop()))}
        />
      </Dropdown> */}
      <div className="search-container">
        <Input.Search
          allowClear
          className="my-data-search"
          placeholder="Search dataset"
          bordered={false}
          value={query}
          onChange={handleQueryChange}
          style={{ marginLeft: 'auto' }}
        />
        <div className="filter-options">
          <Checkbox checked={locate} onChange={onSearchLocateChange}>
            <span className="locate-text">By resource id or self</span>
          </Checkbox>
          <Checkbox
            checked={isAcrossProjects}
            onChange={onSearchAcrossProjectsChange}
          >
            <span className="spread-text">Across Projects</span>
          </Checkbox>
        </div>
      </div>
    </div>
  );
};

const MyDataHeader: React.FC<THeaderProps> = ({
  total,
  dataType,
  dateField,
  query,
  setFilterOptions,
  locate,
  issuer,
  isAcrossProjects,
}) => {
  return (
    <div className="my-data-table-header">
      <Title
        text="My data"
        label={pluralize('Dataset', Number(total))}
        total={new Intl.NumberFormat('de-CH', {
          maximumSignificantDigits: 3,
        }).format(Number(total))}
      />
      <Filters
        {...{
          dataType,
          dateField,
          query,
          locate,
          setFilterOptions,
          issuer,
          isAcrossProjects,
        }}
      />
    </div>
  );
};

export default MyDataHeader;
