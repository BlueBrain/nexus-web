import { CalendarOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Dropdown, Input, Radio, RadioChangeEvent } from 'antd';
import { capitalize } from 'lodash';
import  moment from 'moment';
import { Fragment, useReducer, useRef, useState } from 'react';
import {
  DATE_PATTERN,
  TCurrentDate,
  TDateOptions,
  THeaderFilterProps,
} from '../../../canvas/MyData/types';
import DateSeparated from '../../../components/DateSeparatedInputs/DateSeparated';
import useClickOutside from '../../../hooks/useClickOutside';
import useMeasure from '../../../hooks/useMeasure';

type TDateSelectorProps = Pick<
  THeaderFilterProps,
  'dateField' | 'setFilterOptions'
>;
const DateSelector = ({ dateField, setFilterOptions }: TDateSelectorProps) => {
  const popoverRef = useRef(null);
  const nexus = useNexusContext();
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
  const [dateInputRef, { width: datePopWidth }] = useMeasure<
    HTMLInputElement
  >();

  const onDatePopoverVisibleChange = () =>
    setOpenDateFilterContainer(state => !state);
  const [dateFilterContainer, setOpenDateFilterContainer] = useState<boolean>(
    false
  );
  const updateDate = (type: TDateOptions, date: string) =>
    updateCurrentDates({
      [type]: date,
    });

  const onChangeDateType = (e: RadioChangeEvent) => {
    updateCurrentDates({
      dateFilterType: e.target.value,
      singleDate: '',
      dateStart: '',
      dateEnd: '',
    });
  };
  const notValidForm =
    !dateFilterType ||
    !dateField ||
    (dateFilterType === 'range' && (!dateStart || !dateEnd)) ||
    (dateFilterType === 'range' &&
      dateStart &&
      dateEnd &&
      moment(dateEnd).isBefore(dateStart, 'days')) ||
    (dateFilterType !== 'range' && !singleDate);
  const handleSubmitDates: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    setFilterOptions({
      dateFilterType,
      singleDate,
      dateStart,
      dateEnd,
    });
  };
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
  useClickOutside(popoverRef, onDatePopoverVisibleChange);
  return (
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
  );
};

export default DateSelector;
