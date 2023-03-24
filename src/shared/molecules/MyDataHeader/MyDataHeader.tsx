import React, { Fragment, useRef, useState } from 'react';
import { Input, Radio, DatePicker, RadioChangeEvent, DatePickerProps, Tag, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import { RangePickerProps } from 'antd/lib/date-picker';
import { TagProps } from 'antd/lib/tag';
import InputMask, { Props as inputprops} from 'react-input-mask';
import useClickOutside from '../../../shared/hooks/useClickOutside';
import './styles.less';

type TDateType = 'before' | 'after' | 'range';
export type TFilterOptions = {
    dateType: TDateType;
    dataType: string[];
    query: string;
    date: string | string[] | null;
    offset: number,
    size: number,
    total?: number,
}
type THeaderProps = Omit<TFilterOptions, 'size' | 'offset'> & {
    setFilterOptions: React.Dispatch<Partial<TFilterOptions>>,
}

type TitleProps = {
    text: string;
    label: string;
    total?: number;
}
type THeaderFilterProps = Omit<THeaderProps, 'total'>;

const Title = ({ text, label, total }: TitleProps) => {
    return (
        <div className='my-data-table-header-title'>
            <span> {text}</span>
            <span>{total} {label}</span>
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


const Filters = ({ dataType, query, dateType, date, setFilterOptions }: THeaderFilterProps) => {
    const popoverRef = useRef(null);
    const [dateFilterContainer, setOpenDateFilterContainer] = useState<boolean>(false);
    const onChangeDateType = (e: RadioChangeEvent) => setFilterOptions({ dateType: e.target.value });
    const onDatePopoverVisibleChange = () => setOpenDateFilterContainer((state) => !state);
    const onChangeDate = ( _: DatePickerProps['value'] | RangePickerProps['value'], dateString: string[] | string, ) => setFilterOptions({ date: dateString });
    const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setFilterOptions({ query: event.target.value});

    const DatePickerContainer = (
        <div className='my-data-date-picker-container'>
            <Radio.Group size='small' onChange={onChangeDateType} value={dateType}>
                <Radio value='before'>Before</Radio>
                <Radio value='after'>After</Radio>
                <Radio value='range'>Range</Radio>
            </Radio.Group>
            <div className='date-picker-content'>
                {dateType === 'range' && <RangePicker showTime allowClear bordered={false} className='my-data-date-picker-range' onChange={onChangeDate} />}
                {dateType !== 'range' && <DatePicker showTime allowClear bordered={false} className='my-data-date-picker-input' onChange={onChangeDate} /> }
            </div>
        </div>
    );
    const selectedDate = dateType === 'range' && isArray(dateType) ? `${date?.[0]} - ${date?.[1]}` : (date as string);
    const countTypes = 5550;
    
    useClickOutside(popoverRef, () => {
        onDatePopoverVisibleChange();
    });
    return (
        <div className='my-data-table-header-actions'>
            <div className='my-data-date-container'>
                <Input
                    placeholder="Date"
                    className='my-data-date-picker'
                    value={selectedDate}
                    prefix={<CalendarOutlined />}
                    onClick={() => setOpenDateFilterContainer((state) => !state)}
                />
                {dateFilterContainer && <div ref={popoverRef} className='my-data-date-popover'>
                    {DatePickerContainer}
                </div>}
            </div>
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
                value={query}
                onChange={handleQueryChange}
            />
        </div>
    )
}


export default function MyDataHeader({ dataType, query, dateType, date, total, setFilterOptions }: THeaderProps) {
    return (
        <div className='my-data-table-header'>
            <Title text='My data' label='dataset' total={total} />
            <Filters {... { dataType, query, dateType, date, setFilterOptions }} />
        </div>
    )
}