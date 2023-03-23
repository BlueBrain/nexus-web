import React, { Fragment, useReducer, useState } from 'react';
import { Input, Popover, Radio, DatePicker, RadioChangeEvent, DatePickerProps, Tag, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import { RangePickerProps } from 'antd/lib/date-picker';
import { TagProps } from 'antd/lib/tag';

import './MyDataHeader.less';


type Props = {}
type TitleProps = {
    text: string;
    label: string;
    count: number;
}
type TDateType = 'before' | 'after' | 'range';
type TFilter = {
    dateType: TDateType;
    dataType: string[];
    query: string;
    date: string | string[] | null;
}

const Title = ({ text, label, count }: TitleProps) => {
    return (
        <div className='my-data-table-header-title'>
            <span> {text}</span>
            <span>{count} {label}</span>
        </div>
    )
}
const { RangePicker } = DatePicker;
const tagRender = (props: TagProps) => {
    // @ts-ignore
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag
            color={value}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
        >
            {label}
        </Tag>
    );
};
const options = [{ value: 'gold' }, { value: 'lime' }, { value: 'green' }, { value: 'cyan' }];

const Filters = () => {
    const [{ dataType, query, dateType, date }, setFilterOptions ] = useReducer(
        (data: TFilter, partialData: Partial<TFilter>) => ({
            ...data,
            ...partialData   
        }),
        { 
            dateType: 'range',
            date: null,
            dataType: [],
            query: '',
        }
    )
    const onChangeDateType = (e: RadioChangeEvent) => setFilterOptions({dateType: e.target.value });
    const onChangeDate = (
        _: DatePickerProps['value'] | RangePickerProps['value'],
        dateString: string[] | string,
    ) => setFilterOptions({ date: dateString });

    const DatePickerContainer = (
        <div className='my-data-date-picker-container'>
            <Radio.Group onChange={onChangeDateType} value={dateType}>
                <Radio value='before'>Before</Radio>
                <Radio value='after'>After</Radio>
                <Radio value='range'>Range</Radio>
            </Radio.Group>
            <div className='date-picker-content'>
                {dateType === 'range' && <RangePicker showTime allowClear bordered={false} className='my-data-date-picker-range' onChange={onChangeDate} />}
                {dateType !== 'range' && <DatePicker showTime allowClear bordered={false} className='my-data-date-picker-input' onChange={onChangeDate} />}
            </div>
        </div>
    );
    const selectedDate = dateType === 'range' && isArray(dateType) ? `${date?.[0]} - ${date?.[1]}` : (date as string);
    const countTypes = 5550;
    return (
        <div className='my-data-table-header-actions'>
            <Popover
                content={DatePickerContainer}
                trigger="click"
                placement='bottomLeft'
                overlayClassName='my-data-date-popover'
                arrowContent={null}
            >
                <Input
                    placeholder="Date"
                    className='my-data-date-picker'
                    value={selectedDate}
                    prefix={<CalendarOutlined />}
                />
            </Popover>
            <Select
                mode="multiple"
                showArrow
                tagRender={tagRender}
                defaultValue={['gold', 'cyan']}
                style={{ width: '100%' }}
                options={options}
                showSearch={false}
                className='my-data-type-filter'
                dropdownClassName='my-data-type-filter-popover'
                placeholder="Type"
                dropdownRender={(menu) => <Fragment>
                    <div className='my-data-type-filter-search-container' >
                        <Input.Search
                            className='my-data-type-filter-search'
                            placeholder="Search for type"
                        />
                        <div className='count'>{countTypes} types total</div>
                    </div>
                    {menu}
                </Fragment>}
            />
            <Input.Search
                className='my-data-search'
                placeholder="Search dataset"
                bordered={false}
            />
        </div>
    )
}


export default function MyDataHeader({ }: Props) {
    return (
        <div className='my-data-table-header'>
            <Title
                text='My data'
                label='dataset'
                count={404}
            />
            <Filters />
        </div>
    )
}