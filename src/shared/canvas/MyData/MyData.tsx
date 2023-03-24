import React, { useReducer } from 'react';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { MyDataHeader, MyDataTable } from '../../molecules';
import { TFilterOptions } from '../../molecules/MyDataHeader/MyDataHeader';
import { TDataSource } from '../../molecules/MyDataTable/MyDataTabel';

import './MyData.less';

type Props = {}


const HomeMyData = (props: Props) => {
  const nexus = useNexusContext();
  const [{ dataType, query, dateType, date, offset, size }, setFilterOptions] = useReducer(
    (previous: TFilterOptions, newPartialState: Partial<TFilterOptions>) => ({
      ...previous,
      ...newPartialState
    }),
    {
      dateType: 'range',
      date: null,
      dataType: [],
      query: '',
      offset: 0,
      size: 10,
    }
  )
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['my-data-resources', { size, offset, query }],
    queryFn: () => nexus.Resource.list(undefined, undefined, {
      size,
      from: offset,
      q: query,
    })
  });
  // @ts-ignore
  const dataSource: TDataSource[] = resources?._results.map(resource => {
    return ({
      key: resource._self,
      name: resource['@id'],
      project: resource._project,
      description: "",
      type: resource['@type'],
      createdAt: resource._createdAt,
      updatedAt: resource._updatedAt,
    })
  });
  const total = resources?._total;
  console.table({ dataType, query, dateType, date, offset, size });
  return (
    <div className='home-mydata'>
      <MyDataHeader {... { dataType, query, dateType, date, total, setFilterOptions }} />
      <MyDataTable {... { dataSource, isLoading, offset, size, total, setFilterOptions }} />
    </div>
  )
}

export default HomeMyData