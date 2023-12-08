import { Resource } from '@bbp/nexus-sdk/es';
import { Tooltip } from 'antd';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { FilterConfigByColumnFn } from 'shared/hooks/useAccessDataForTable';
import { match } from 'ts-pattern';

import TypesIconList from '../components/Types/TypesIcon';
import { UseSearchResponse } from '../hooks/useSearchQuery';
import { RootState } from '../store/reducers';
import { ResultTableFields } from '../types/search';
import { deltaUrlToFusionUrl, getResourceLabel, isURL, parseJsonMaybe } from '.';
import { convertMarkdownHandlebarStringWithData } from './markdownTemplate';
import { parseURL } from './nexusParse';

export const rowRender = (value: string, basePath: string) => {
  // const basePath =
  //   useSelector((state: RootState) => state.config.basePath) || '';
  if (isURL(value)) {
    const sanitizedURL = deltaUrlToFusionUrl(value, basePath);
    return (
      <a href={sanitizedURL} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
    );
  }
  return value;
};

export function parseESResults(searchResponse: UseSearchResponse) {
  return (searchResponse.data?.hits.hits || []).map(({ _source }) => {
    const { _original_source = {}, ...everythingElse } = _source;

    const resource = {
      ...(parseJsonMaybe(_original_source) || {}),
      ...everythingElse,
    };

    return {
      ...resource,
      key: _source._self,
    };
  });
}

export function addColumnsForES(
  field: ResultTableFields,
  sorter: (
    dataIndex: string
  ) => (a: { [key: string]: any }, b: { [key: string]: any }) => 1 | -1 | 0,
  filterConfig: FilterConfigByColumnFn,
  basePath: string
): {
  sorter: false | ((a: { [key: string]: any }, b: { [key: string]: any }) => 1 | -1 | 0);
  render: (text: string, resource: Resource) => any;
  title: string;
  dataIndex: string;
  sortable?: boolean | undefined;
  key: string;
  displayIndex: number;
} {
  return match(field.key)
    .with('label', () => ({
      ...field,
      sorter: !!field.sortable && sorter('label'),
      ...(field.filterable && filterConfig(field)),
      render: (text: string, resource: Resource) => {
        return getResourceLabel(resource);
      },
    }))
    .with('description', () => ({
      ...field,
      sorter: !!field.sortable && sorter('description'),
      ...(field.filterable && filterConfig(field)),
      render: (text: string, resource: Resource) =>
        convertMarkdownHandlebarStringWithData(resource.description || '', resource),
    }))
    .with('project', () => ({
      ...field,
      sorter: !!field.sortable && sorter('project'),
      ...(field.filterable && filterConfig(field)),
      render: (text: string, resource: Resource) => {
        const { org, project } = parseURL(resource._self);
        return `${org} | ${project}`;
      },
    }))
    .with('schema', () => ({
      ...field,
      sorter: !!field.sortable && sorter('schema'),
      ...(field.filterable && filterConfig(field)),
      render: (text: string, resource: Resource) => {
        return <Tooltip title={resource._constrainedBy}>{text.split('/').reverse()[0]}</Tooltip>;
      },
    }))
    .with('@type', () => ({
      ...field,
      sorter: !!field.sortable && sorter('@type'),
      ...(field.filterable && filterConfig(field)),
      render: (text: string, resource: Resource) => {
        const typeList =
          !!resource['@type'] &&
          (Array.isArray(resource['@type']) ? (
            <TypesIconList type={resource['@type']} />
          ) : (
            <TypesIconList type={[resource['@type']]} />
          ));
        return typeList;
      },
    }))
    .otherwise(() => ({
      ...field,
      sorter: !!field.sortable && sorter(field.key),
      ...(field.filterable && filterConfig(field)),
      render: (text: string, resource: Resource) => {
        if (text) {
          try {
            const x = JSON.parse(text);
            return <pre>{JSON.stringify(x, null, 2)}</pre>;
          } catch {
            return rowRender(text.toString(), basePath);
          }
        }
        return '';
      },
    }));
}
