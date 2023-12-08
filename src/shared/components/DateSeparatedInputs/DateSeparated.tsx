import './styles.scss';

import { clsx } from 'clsx';
import moment from 'moment';
import React, { useEffect, useReducer, useRef } from 'react';

import { DATE_PATTERN } from '../../canvas/MyData/types';
import useDateTimeInputs from './useDateTimeInputs';

type TDate = {
  day: string;
  month: string;
  year: string;
};
type Props = {
  value?: string;
  name: string;
  updateUpperDate(value: string): void;
};

const isValidYearLength = (value: string) => value.length === 4;
const isValidYearStart = (value: string) => Number(value) > 2014;
const makeDate = (value?: string) => {
  const newValue =
    !value || !moment(value).isValid()
      ? {
          day: '',
          month: '',
          year: '',
        }
      : moment(value).isValid()
      ? {
          day: moment(value)
            .get('D')
            .toString(),
          month: (moment(value).get('month') + 1).toString(),
          year: moment(value)
            .get('year')
            .toString(),
        }
      : {
          day: '',
          month: '',
          year: '',
        };

  return newValue;
};

const DateSeparated = ({ name, value, updateUpperDate }: Props) => {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const [{ day, month, year }, updateValue] = useReducer(
    (previous: TDate, next: Partial<TDate>) => ({
      ...previous,
      ...next,
    }),
    {
      day: '',
      month: '',
      year: '',
    }
  );

  const dayError = !!day && Number(day) > 31;
  const monthError = !!month && Number(month) > 12;
  const yearError =
    !!year &&
    (Number(year) > new Date().getFullYear() ||
      !isValidYearStart(year) ||
      !isValidYearLength(year));
  const allError =
    (!!day && !!month && !!year && !moment(`${day}/${month}/${year}`, 'DD/MM/YYYY').isValid()) ||
    (dayError && monthError && yearError);

  useEffect(() => {
    const date = makeDate(value);
    updateValue({ ...date });
  }, [value]);

  useEffect(() => {
    if (
      !!day &&
      !!month &&
      !!year &&
      isValidYearLength(year) &&
      isValidYearLength(year) &&
      moment(`${day}/${month}/${year}`, 'DD/MM/YYYY').isValid()
    ) {
      updateUpperDate(
        moment(`${day}/${month}/${year}`, DATE_PATTERN)
          .utc()
          .format()
      );
    }
  }, [day, month, year]);

  useDateTimeInputs({ dayRef, monthRef, yearRef });

  return (
    <fieldset name={name} role="group" className="seperated-input-container">
      <input
        className={clsx('seperated-input', (dayError || allError) && 'error')}
        ref={dayRef}
        value={day}
        onChange={(e) => updateValue({ day: e.target.value })}
        type="text"
        maxLength={2}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Day"
      />
      <input
        className={clsx('seperated-input', (monthError || allError) && 'error')}
        ref={monthRef}
        value={month}
        onChange={(e) => updateValue({ month: e.target.value })}
        type="text"
        maxLength={2}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Month"
      />
      <input
        className={clsx('seperated-input', (yearError || allError) && 'error')}
        ref={yearRef}
        value={year}
        onChange={(e) => updateValue({ year: e.target.value })}
        type="text"
        maxLength={4}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Year"
      />
    </fieldset>
  );
};

export default DateSeparated;
