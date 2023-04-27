import React, { useReducer } from 'react';
import * as moment from 'moment';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { isArray, isObject, isString, omit } from 'lodash';
import {
  DATE_PATTERN,
  TDateType,
  TFilterOptions,
} from '../../molecules/MyDataHeader/MyDataHeader';
import { MyDataHeader, MyDataTable } from '../../molecules';

import './styles.less';

type Props = {};

const HomeMyData = (props: Props) => {
  const nexus = useNexusContext();
  const [
    { dataType, dateField, query, dateType, date, offset, size },
    setFilterOptions,
  ] = useReducer(
    (previous: TFilterOptions, newPartialState: Partial<TFilterOptions>) => ({
      ...previous,
      ...newPartialState,
    }),
    {
      dateType: 'before',
      dateField: 'createdAt',
      date: undefined,
      dataType: [],
      query: '',
      offset: 0,
      size: 10,
    }
  );
  const makeDatetimePattern = ({
    dateType,
    date,
  }: {
    dateType: TDateType;
    date?: string | string[];
  }) => {
    switch (dateType) {
      case 'after': {
        if (isString(date) && date && moment(date, DATE_PATTERN).isValid()) {
          return `${moment(date, DATE_PATTERN).format()}..*`;
        }
        return undefined;
      }
      case 'before': {
        if (isString(date) && date && moment(date, 'DD/MM/YYYY').isValid()) {
          return `*..${moment(date, DATE_PATTERN).format()}`;
        }
        return undefined;
      }
      case 'range': {
        if (
          isArray(date) &&
          date &&
          moment(date?.[0], DATE_PATTERN).isValid() &&
          moment(date?.[1], DATE_PATTERN).isValid()
        ) {
          return `${moment(date?.[0], DATE_PATTERN).format()}..${moment(
            date?.[1],
            'DD/MM/YYYY'
          ).format()}`;
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const { data: resources, isLoading } = useQuery({
    queryKey: ['my-data-resources', { size, offset, query }],
    queryFn: () =>
      nexus.Resource.list(undefined, undefined, {
        size,
        from: offset,
        q: query,
        [dateField]: makeDatetimePattern({ dateType, date }),
        // type: dataType,
      }),
    retry: false,
    onError: error => {
      notification.error({
        message: 'Error loading data from the server',
        description: isString(error) ? (
          error
        ) : isObject(error) ? (
          <div>
            <strong>{(error as any)['@type']}</strong>
            <div>{(error as any)['details']}</div>
          </div>
        ) : (
          ''
        ),
      });
    },
  });
  const total = resources?._total;
  return (
    <div className="home-mydata">
      <MyDataHeader
        {...{
          dataType,
          dateField,
          query,
          dateType,
          date,
          total,
          setFilterOptions,
        }}
      />
      <MyDataTable
        {...{ resources, isLoading, offset, size, total, setFilterOptions }}
      />
    </div>
  );
};

export default HomeMyData;
