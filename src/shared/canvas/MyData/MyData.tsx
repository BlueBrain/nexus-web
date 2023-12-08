import './styles.scss';

import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { get, isObject, isString } from 'lodash';
import * as React from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

import { MyDataHeader, MyDataTable } from '../../molecules';
import { RootState } from '../../store/reducers';
import { TFilterOptions } from './types';
import { makeDatetimePattern } from './utils';

const HomeMyData: React.FC<{}> = () => {
  const nexus = useNexusContext();
  const identities = useSelector((state: RootState) => state.auth.identities?.data?.identities);
  const issuerUri = identities?.find((item) => item['@type'] === 'User')?.['@id'];
  const [
    {
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
      types,
      typeOperator,
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
      query: '',
      offset: 0,
      size: 50,
      sort: ['-_createdAt', '@id'],
      locate: false,
      issuer: 'createdBy',
      types: [],
      typeOperator: 'OR',
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
  const resourceTypes = types?.map((item) => get(item, 'value'));
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
        typeOperator,
        types: resourceTypes,
      },
    ],
    retry: false,
    queryFn: () =>
      nexus.Resource.list(undefined, undefined, {
        size,
        typeOperator,
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
        // @ts-ignore
        type: resourceTypes,
      }),
    onError: (error) => {
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
    <div className="my-data-view view-container">
      <MyDataHeader
        {...{
          types,
          dateField,
          query,
          dateFilterRange,
          total,
          locate,
          issuer,
          setFilterOptions,
          typeOperator,
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
