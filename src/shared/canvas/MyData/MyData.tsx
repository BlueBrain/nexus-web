import * as React from 'react';
import * as moment from 'moment';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { isArray, isObject, isString } from 'lodash';
import {
  DATE_PATTERN,
  TDateType,
  TFilterOptions,
} from '../../molecules/MyDataHeader/MyDataHeader';
import { MyDataHeader, MyDataTable } from '../../molecules';
import { RootState } from '../../../shared/store/reducers';

const HomeMyData: React.FC<{}> = () => {
  const nexus = useNexusContext();
  const identities = useSelector(
    (state: RootState) => state.auth.identities?.data?.identities
  );
  const issuerUri = identities?.find(item => item['@type'] === 'User')?.['@id'];
  const [
    {
      dataType,
      dateField,
      query,
      dateType,
      date,
      offset,
      size,
      sort,
      locate,
      issuer,
    },
    setFilterOptions,
  ] = React.useReducer(
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
      size: 50,
      sort: ['-_createdAt', '@id'],
      locate: false,
      issuer: 'createdBy',
    }
  );
  const updateSort = (value: string[]) => {
    setFilterOptions({
      offset: 0,
      sort: value,
    });
  };
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
    queryKey: [
      'my-data-resources',
      { size, offset, query, locate, issuer, sort: JSON.stringify(sort) },
    ],
    queryFn: () =>
      nexus.Resource.list(undefined, undefined, {
        size,
        from: offset,
        [issuer]: issuerUri,
        ...(locate && query.trim().length
          ? {
              locate: query,
            }
          : query.trim().length
          ? {
              q: query,
            }
          : {}),
        ...(sort.length && !query.trim().length ? { sort } : {}),
        [dateField]: makeDatetimePattern({ dateType, date }),
        // after: offset,
        // type: dataType,
      }),
    retry: 2,
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
          locate,
          issuer,
        }}
      />
      <MyDataTable
        {...{
          resources,
          isLoading,
          offset,
          size,
          total,
          sort,
          updateSort,
          setFilterOptions,
          locate,
          issuer,
        }}
      />
    </div>
  );
};

export default HomeMyData;
