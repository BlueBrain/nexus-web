import * as React from 'react';
import * as moment from 'moment';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { isObject, isString } from 'lodash';

import { MyDataHeader, MyDataTable } from '../../molecules';
import { RootState } from '../../store/reducers';
import { TDateFilterType, TFilterOptions } from './types';
import './styles.less';

const makeDatetimePattern = ({
  dateFilterType,
  singleDate,
  dateStart,
  dateEnd,
}: {
  dateFilterType?: TDateFilterType;
  singleDate?: string;
  dateStart?: string;
  dateEnd?: string;
}) => {
  switch (dateFilterType) {
    case 'after': {
      if (!!singleDate && moment(singleDate).isValid()) {
        return `${singleDate}..*`;
      }
      return undefined;
    }
    case 'before': {
      if (!!singleDate && moment(singleDate).isValid()) {
        return `*..${singleDate}`;
      }
      return undefined;
    }
    case 'range': {
      if (
        !!dateStart &&
        !!dateEnd &&
        moment(dateStart).isValid() &&
        moment(dateEnd).isValid() &&
        moment(dateStart).isBefore(moment(dateEnd), 'days')
      ) {
        return `${dateStart}..${dateEnd}`;
      }
      return undefined;
    }
    default:
      return undefined;
  }
};
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
      dateFilterType,
      singleDate,
      dateStart,
      dateEnd,
      offset,
      size,
      sort,
      locate,
      issuer,
    },
    setFilterOptions,
  ] = React.useReducer(
    (previous: TFilterOptions, next: Partial<TFilterOptions>) => ({
      ...previous,
      ...next,
    }),
    {
      dateFilterType: undefined,
      dateField: 'createdAt',
      singleDate: undefined,
      dateStart: undefined,
      dateEnd: undefined,
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

  const dateFilterRange = React.useMemo(
    () =>
      makeDatetimePattern({
        dateFilterType,
        singleDate,
        dateStart,
        dateEnd,
      }),
    [dateFilterType, singleDate, dateStart, dateEnd]
  );
  const date =
    dateField && dateFilterRange && dateFilterType
      ? `${dateField}-${dateFilterType}-${dateFilterRange}`
      : undefined;
  const order = sort.join('-');
  const { data: resources, isLoading } = useQuery({
    queryKey: [
      'my-data-resources',
      {
        size,
        offset,
        query,
        locate,
        issuer,
        date,
        order,
      },
    ],
    retry: false,
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
        ...(!!sort.length && !query.trim().length ? { sort } : {}),
        ...(!!dateField && !!dateFilterRange
          ? {
              [dateField]: dateFilterRange,
            }
          : {}),
        // type: dataType,
      }),
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
          dateFilterRange,
          total,
          locate,
          issuer,
          setFilterOptions,
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
          locate,
          issuer,
          setFilterOptions,
          query,
        }}
      />
    </div>
  );
};

export default HomeMyData;
