import './styles.scss';

import moment from 'moment';
import React, { forwardRef, useEffect, useReducer,useRef } from 'react';

type TDInput = {
  id: string;
  min: number;
  max: number;
  placeholder: string;
  pattern: string;
  value: string;
  minLength: number;
  maxLength: number;
  onChange: React.Dispatch<Partial<TDateObject>>;
  onKeyDown?(e: React.KeyboardEvent<HTMLInputElement>): void;
};
type TDateObject = {
  day: string;
  month: string;
  year: string;
  isValid?: boolean;
  date?: string;
};
type Ref = HTMLInputElement;
const DInput = forwardRef<Ref, TDInput>(
  (
    {
      id,
      min,
      max,
      placeholder,
      pattern,
      value,
      minLength,
      maxLength,
      onChange,
      onKeyDown,
    },
    ref
  ) => {
    return (
      <input
        {...{
          id,
          ref,
          min,
          max,
          minLength,
          maxLength,
          placeholder,
          pattern,
          value,
          onKeyDown,
        }}
        onChange={e => {
          onChange({ [id]: e.target.value });
        }}
        type="number"
        className="date-seperated_input"
      />
    );
  }
);
type TSeparatedInput = {
  defaultValue?: string;
  setDefaultValue: React.Dispatch<any>;
};
const Input = ({ defaultValue, setDefaultValue }: TSeparatedInput) => {
  const dayRef = useRef<Ref>(null);
  const monthRef = useRef<Ref>(null);
  const yearRef = useRef<Ref>(null);
  const [{ day, month, year, date, isValid }, updateValue] = useReducer(
    (previous: TDateObject, next: Partial<TDateObject>) => ({
      ...previous,
      ...next,
    }),
    {
      day: moment(defaultValue, 'DD/MM/YYYY').isValid()
        ? defaultValue!.split('/')?.[0]
        : '',
      month: moment(defaultValue, 'DD/MM/YYYY').isValid()
        ? defaultValue!.split('/')?.[1]
        : '',
      year: moment(defaultValue, 'DD/MM/YYYY').isValid()
        ? defaultValue!.split('/')?.[2]
        : '',
      isValid: moment(defaultValue, 'DD/MM/YYYY').isValid() ? true : undefined,
      date: moment(defaultValue, 'DD/MM/YYYY').isValid()
        ? moment(defaultValue).format('DD/MM/YYYY')
        : '',
    }
  );
  useEffect(() => {
    if (dayRef.current) {
      if (day.length === 2 && day.length <= 31) {
        monthRef.current?.focus();
      }
    }
  }, [day, dayRef.current, monthRef.current]);
  useEffect(() => {
    if (monthRef.current) {
      if (month.length === 2 && month.length <= 12) {
        yearRef.current?.focus();
      }
    }
  }, [month, monthRef.current, yearRef.current]);
  const handleYearBackslash: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '') {
      monthRef.current?.focus();
    }
  };
  const handleMonthBackslash: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '') {
      dayRef.current?.focus();
    }
  };
  useEffect(() => {
    updateValue({
      isValid: moment(`${year}-${Number(month) - 1}-${day}`).isValid(),
      date: moment(`${year}-${month}-${day}`).toISOString(),
    });
  }, [day, month, year]);
  useEffect(() => {
    if (isValid) {
      setDefaultValue({ date });
    }
  }, [isValid, date]);
  return (
    <div className="date-seperated">
      <form className="date-seperated_container">
        <DInput
          id="day"
          ref={dayRef}
          min={1}
          max={31}
          minLength={1}
          maxLength={2}
          pattern="\d{2}"
          value={day}
          placeholder="Day"
          onChange={updateValue}
        />
        <DInput
          id="month"
          ref={monthRef}
          min={1}
          max={12}
          minLength={1}
          maxLength={2}
          pattern="\d{2}"
          value={month}
          placeholder="Month"
          onChange={updateValue}
          onKeyDown={handleMonthBackslash}
        />
        <DInput
          id="year"
          ref={yearRef}
          min={2000}
          max={new Date().getFullYear()}
          pattern="\d{4}"
          minLength={1}
          maxLength={4}
          value={year}
          placeholder="Year"
          onChange={updateValue}
          onKeyDown={handleYearBackslash}
        />
      </form>
      <div className="date-seperated_validation">
        {day && month && year
          ? isValid
            ? 'valid date'
            : 'not valid date'
          : ''}
        <div>{date}</div>
      </div>
    </div>
  );
};

export default Input;
