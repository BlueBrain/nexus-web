import React, { Fragment, useMemo, useRef, useState } from 'react';
import { Input, Radio, Tag, Select, RadioChangeEvent, Dropdown, Button, Menu, MenuProps, Row, Col, Checkbox } from 'antd';
// import { MenuProps } from 'antd/es/select';
import { CalendarOutlined, RightOutlined } from '@ant-design/icons';
import { TagProps } from 'antd/lib/tag';
import { useIMask } from 'react-imask';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { capitalize, isString } from 'lodash';
import * as moment from 'moment';
import { startCase, pull as removeItem } from 'lodash';
import { NexusClient } from '@bbp/nexus-sdk';
import IMask from 'imask';
import useClickOutside from '../../../shared/hooks/useClickOutside';
import useMeasure from '../../../shared/hooks/useMeasure';
import './styles.less';

type TDateField = 'createdAt' | 'updatedAt';
export type TDateType = 'before' | 'after' | 'range';
export type TFilterOptions = {
    dateType: TDateType;
    dateField: TDateField;
    dataType: string[];
    query: string;
    date?: string | string[];
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
    total?: string;
}
type THeaderFilterProps = Omit<THeaderProps, 'total'>;
type THandleMenuSelect = MenuProps['onClick'];
type TType = {
    key: string;
    value: string;
    label: string;
}
export const DATE_PATTERN = 'DD/MM/YYYY';
const Title = ({ text, label, total }: TitleProps) => {
    return (
        <div className='my-data-table-header-title'>
            <span> {text}</span>
            <span>{total} {label}</span>
        </div>
    )
}
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
        "query": {
            "match_all": {}
        },
        "aggs": {
            "suggestions": {
                "terms": {
                    "field": "@type.keyword",
                    "size": 1000
                }
            },
            "(missing)": {
                "missing": {
                    "field": "@type.keyword"
                }
            }
        }
    });
    return data.aggregations.suggestions.buckets;
}
const dateFieldName = {
    createdAt: 'Creation Date',
    updatedAt: 'Update Date'
}
const Filters = ({ dataType, dateField, query, dateType, date, setFilterOptions }: THeaderFilterProps) => {
    const popoverRef = useRef(null);
    const nexus = useNexusContext();
    const [dateFilterContainer, setOpenDateFilterContainer] = useState<boolean>(false);
    const onChangeDateType = (e: RadioChangeEvent) => setFilterOptions({
        dateType: e.target.value,
        date: "",
    });
    const onDatePopoverVisibleChange = () => setOpenDateFilterContainer((state) => !state);
    const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setFilterOptions({ query: event.target.value });
    const handleDateFieldChange: THandleMenuSelect = ({ key }) => setFilterOptions({ dateField: key as TDateField });
    const [opts] = useState(() => ({
        mask: Date,
        pattern: DATE_PATTERN,
        format: (date: Date) => moment(date).format(DATE_PATTERN),
        parse: (str: string) => moment(str, DATE_PATTERN),
        autofix: true,
        lazy: false,
        overwrite: true,
        min: new Date(2000, 0, 1),
        max: new Date(),
        unmask: true,
        blocks: {
            YYYY: {
                mask: IMask.MaskedRange,
                from: 2000,
                to: (new Date().getFullYear()) + 1,
            },
            MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12
            },
            DD: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 31
            },
        }
    }));
    const [rangeError, setRangeError] = useState('');
    const { ref } = useIMask({ ...opts }, { onComplete: (date) => setFilterOptions({ date }), });
    const {
        ref: rangeRefStart,
        value: rangeStartDate,
    } = useIMask({ ...opts }, { onComplete: (value) => setFilterOptions({ date: [value, date?.[1] ?? ""] }) });
    const {
        ref: rangeRefEnd,
    } = useIMask({ ...opts }, {
        onComplete: (value) => {
            if (moment(rangeStartDate, DATE_PATTERN).isBefore(moment(value, DATE_PATTERN))) {
                setFilterOptions({ date: [date?.[0] ?? "", value] })
                setRangeError("");
            } else {
                setRangeError("Error in range");
            }
        }
    });
    const DatePickerContainer = (
        <Fragment>
            <Radio.Group defaultValue='before' size='small' onChange={onChangeDateType} value={dateType}>
                <Radio value='before'>Before</Radio>
                <Radio value='after'>After</Radio>
                <Radio value='range'>Range</Radio>
            </Radio.Group>
            <div className='my-data-date-content'>
                {dateType === 'range' && (
                    <Fragment>
                        <div className='my-data-date-range'>
                            <input
                                ref={rangeRefStart}
                                className='my-data-date-input'
                                defaultValue={dateType === 'range' && !!date?.[0] ? date[0] : undefined}
                            />
                            <input
                                ref={rangeRefEnd}
                                className='my-data-date-input'
                                defaultValue={dateType === 'range' && !!date?.[1] ? date[1] : undefined}
                                onBlur={() => setOpenDateFilterContainer(() => false)}
                            />
                        </div>
                        <p>{rangeError}</p>
                    </Fragment>
                )}
                {dateType !== 'range' && <input
                    ref={ref}
                    defaultValue={(dateType === 'before' || dateType === 'after') && date && isString(date) ? date : undefined}
                    className='my-data-date-input'
                    onBlur={() => setOpenDateFilterContainer(() => false)}
                />}
            </div>
        </Fragment>
    );
    const selectedDate = (dateType === 'range' && date !== "") ?
        `${date?.[0]}  →  ${date?.[1]}` : moment(date, DATE_PATTERN).isValid() ?
            `${capitalize(dateType)} ${date as string}` : undefined;
    const DateFieldMenu = (
        <Menu onClick={handleDateFieldChange} defaultSelectedKeys={[dateField]} selectedKeys={[dateField]} className='my-data-date-type-popover'>
            <Menu.Item key='createdAt'>{dateFieldName.createdAt}</Menu.Item>
            <Menu.Item key='updatedAt'>{dateFieldName.updatedAt}</Menu.Item>
        </Menu>
    )
    const { data: buckets, status: typesStatus, error: errorTypes } = useQuery({
        queryKey: ['global-search-types'],
        queryFn: () => fetchGlobalSearchTypes(nexus),
    });
    // @ts-ignore
    const typesDataSources: TType[] = typesStatus === 'success' && buckets && buckets.map(bucket => {
        return ({
            key: bucket.key,
            label: bucket.key.split('/').pop(),
            value: bucket.key,
        })
    });
    const handleOnCheckType = (e: React.MouseEvent<HTMLElement, MouseEvent> , type: TType) => {
        e.preventDefault();
        e.stopPropagation();
        setFilterOptions({
            dataType: dataType.includes(type.key) ? removeItem(dataType, type.key) :
                            [...dataType, type.key]
        })
    }
    const [typeInputRef, { width }] = useMeasure();
    const [dateInputRef, { width: datePopWidth }] = useMeasure();
    useClickOutside(popoverRef, onDatePopoverVisibleChange);
    return (
        <div className='my-data-table-header-actions'>
            <Dropdown placement='bottomLeft' trigger={['click']} overlay={DateFieldMenu}>
                <Button type='link' style={{ textAlign: 'left', padding: '4px 0px', color: '#333' }}>
                    {dateFieldName[dateField]}
                    <RightOutlined style={{ fontSize: 8 }} />
                </Button>
            </Dropdown>
            <Dropdown
                placement='bottomLeft'
                trigger={['click']}
                overlay={(
                    <Fragment>
                        {dateFilterContainer && <div
                            ref={popoverRef}
                            className='my-data-date-popover'
                        >
                            {DatePickerContainer}
                        </div>}
                    </Fragment>
                )}
                overlayStyle={{ width: datePopWidth }}
            >
                <Input
                    // @ts-ignore
                    ref={dateInputRef}
                    placeholder="Date"
                    className='my-data-date-picker'
                    value={selectedDate}
                    prefix={<CalendarOutlined />}
                    onClick={() => setOpenDateFilterContainer((state) => !state)}
                />
            </Dropdown>
            <Dropdown
                placement='bottomLeft'
                trigger={['click']}
                overlayStyle={{ width }}
                overlay={<div className='my-data-type-filter-overlay'>
                    <div className='my-data-type-filter-search-container' >
                        <Input.Search
                            className='my-data-type-filter-search'
                            placeholder="Search for type"
                        />
                        <div className='count'>{typesDataSources.length} types total</div>
                    </div>
                    <div className='my-data-type-filter-content'>
                        {typesDataSources && typesDataSources.map((tp: TType) => {
                            return <Row justify="space-between" align="top" key={tp.key}>
                                <Col span={20}> {startCase(tp.label)} </Col>
                                <Col 
                                    span={4} 
                                    style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
                                > 
                                    <Checkbox 
                                        onClick={(e) => handleOnCheckType(e, tp)} 
                                        checked={dataType.includes(tp.key)} 
                                    /> 
                                </Col>
                            </Row>
                        })}
                    </div>
                </div>}
            >
                <Input
                    //@ts-ignore
                    ref={typeInputRef}
                    placeholder='Type'
                    className='my-data-type-picker'
                    value={dataType.map(item => startCase(item.split('/').pop()))}
                />
            </Dropdown>
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


export default function MyDataHeader({ dataType, dateField, query, dateType, date, total, setFilterOptions }: THeaderProps) {
    return (
        <div className='my-data-table-header'>
            <Title text='My data' label='Dataset' total={new Intl.NumberFormat('de-CH', { maximumSignificantDigits: 3 }).format(Number(total))} />
            <Filters {... { dataType, dateField, query, dateType, date, setFilterOptions }} />
        </div>
    )
}