import { Input, Select } from 'antd';
import React, { useState } from 'react';
import { DataExplorerConfiguration } from './DataExplorer';
import './styles.less';
import { Resource } from '@bbp/nexus-sdk';
import { normalizeString } from '../../utils/stringUtils';
import { clsx } from 'clsx';
import { BaseOptionType } from 'antd/lib/select';
import { DefaultOptionType } from 'antd/lib/cascader';
import {
  ALWAYS_DISPLAYED_COLUMNS,
  columnFromPath,
  isObject,
  isUserColumn,
  sortColumns,
} from './DataExplorerUtils';
import { ClearOutlined } from '@ant-design/icons';

interface Props {
  dataSource: Resource[];
  onPredicateChange: React.Dispatch<Partial<DataExplorerConfiguration>>;
}

export const PredicateSelector: React.FC<Props> = ({
  dataSource,
  onPredicateChange,
}: Props) => {
  const [path, setPath] = useState<string>(DEFAULT_OPTION);

  const [predicate, setPredicate] = useState<PredicateFilterOptions['value']>(
    DEFAULT_OPTION
  );
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const predicateFilterOptions: PredicateFilterOptions[] = [
    { value: DEFAULT_OPTION },
    { value: EXISTS },
    { value: DOES_NOT_EXIST },
    { value: CONTAINS },
    { value: DOES_NOT_CONTAIN },
  ];

  const predicateSelected = (
    path: string,
    predicate: PredicateFilterOptions['value'],
    searchTerm: string | null
  ) => {
    if (path === DEFAULT_OPTION || predicate === DEFAULT_OPTION) {
      onPredicateChange({ predicateFilter: null, selectedPath: null });
    }

    switch (predicate) {
      case EXISTS:
        onPredicateChange({
          predicateFilter: (resource: Resource) =>
            checkPathExistence(resource, path, 'exists'),
          selectedPath: path,
        });
        break;
      case DOES_NOT_EXIST:
        onPredicateChange({
          predicateFilter: (resource: Resource) =>
            checkPathExistence(resource, path, 'does-not-exist'),
          selectedPath: path,
        });
        break;
      case CONTAINS:
        if (searchTerm) {
          onPredicateChange({
            predicateFilter: (resource: Resource) =>
              doesResourceContain(resource, path, searchTerm, 'contains'),
            selectedPath: path,
          });
        } else {
          onPredicateChange({ predicateFilter: null, selectedPath: null });
        }
        break;
      case DOES_NOT_CONTAIN:
        if (searchTerm) {
          onPredicateChange({
            predicateFilter: (resource: Resource) =>
              doesResourceContain(
                resource,
                path,
                searchTerm,
                'does-not-contain'
              ),
            selectedPath: path,
          });
        } else {
          onPredicateChange({ predicateFilter: null, selectedPath: null });
        }

        break;
      default:
        onPredicateChange({ predicateFilter: null, selectedPath: null });
    }
  };

  const shouldShowValueInput =
    predicate === CONTAINS || predicate === DOES_NOT_CONTAIN;

  return (
    <div className="form-container">
      <span className="label">with </span>

      <Select
        options={pathOptions([...getAllPaths(dataSource)])}
        onSelect={pathLabel => {
          setPath(pathLabel);
          predicateSelected(pathLabel, predicate, searchTerm);
        }}
        optionLabelProp="label"
        aria-label="path-selector"
        style={{ width: 200 }}
        dropdownMatchSelectWidth={false}
        className="select-menu"
        popupClassName="search-menu"
      />

      <span className="label">= </span>

      <Select
        options={predicateFilterOptions}
        onSelect={(predicateLabel: PredicateFilterOptions['value']) => {
          setPredicate(predicateLabel);
          predicateSelected(path, predicateLabel, searchTerm);
        }}
        aria-label="predicate-selector"
        className={clsx('select-menu', shouldShowValueInput && 'greyed-out')}
        popupClassName="search-menu"
        allowClear={true}
        onClear={() => {
          setPredicate(DEFAULT_OPTION);
          predicateSelected(path, DEFAULT_OPTION, searchTerm);
        }}
      />

      {shouldShowValueInput && (
        <Input
          placeholder="type the value..."
          aria-label="predicate-value-input"
          bordered={false}
          className="predicate-value-input"
          allowClear={false}
          onChange={event => {
            setSearchTerm(event.target.value);
            predicateSelected(path, predicate, event.target.value);
          }}
        />
      )}
    </div>
  );
};

export const DEFAULT_OPTION = '-';
export const DOES_NOT_EXIST = 'Does not exist';
export const EXISTS = 'Exists';
export const CONTAINS = 'Contains';
export const DOES_NOT_CONTAIN = 'Does not contain';

export type PredicateFilterT =
  | typeof DOES_NOT_EXIST
  | typeof EXISTS
  | typeof CONTAINS
  | typeof DOES_NOT_CONTAIN
  | null;

type PredicateFilterOptions = {
  value: Exclude<PredicateFilterT, null> | typeof DEFAULT_OPTION;
};

// Creates <Option /> element for each path. Also adds a class of "first-metadata-path" for the first path generated for a metadata column.
export const pathOptions = (paths: string[]) => {
  let firstMetadataFound = false;
  const pathOptions: DefaultOptionType[] = [];

  paths.forEach(path => {
    const column = columnFromPath(path);
    const isFirstMetadataPath = !isUserColumn(column) && !firstMetadataFound;

    pathOptions.push({
      value: path,
      label: (
        <span
          className={isFirstMetadataPath ? 'first-metadata-path' : ''}
          title={path}
        >
          {path}
        </span>
      ),
    });

    if (isFirstMetadataPath) {
      firstMetadataFound = true;
    }
  });
  return pathOptions;
};

export const getAllPaths = (objects: { [key: string]: any }[]): string[] => {
  return Array.from(getPathsForResource(objects, '')).sort(sortColumns);
};

const getPathsForResource = (
  resource: { [key: string]: any } | { [key: string]: any }[],
  currentPath: string,
  paths: Set<string> = new Set()
) => {
  if (Array.isArray(resource)) {
    resource.forEach(res => getPathsForResource(res, currentPath, paths));
  } else if (typeof resource === 'object' && resource !== null) {
    const keys = Object.keys(resource);
    for (const key of keys) {
      const path = currentPath ? `${currentPath}.${key}` : `${key}`;
      paths.add(path);
      getPathsForResource(resource[key], path, paths);
    }
  }
  return paths;
};

export const checkPathExistence = (
  resource: { [key: string]: any },
  path: string,
  criteria: 'exists' | 'does-not-exist' = 'exists'
): boolean => {
  if (isObject(resource) && path in resource) {
    return criteria === 'exists' ? true : false;
  }

  const subpaths = path.split('.');

  for (const subpath of subpaths) {
    const valueAtSubpath = resource[subpath];
    const remainingPath = subpaths.slice(1);
    if (isObject(resource) && !(subpath in resource)) {
      return criteria === 'exists' ? false : true;
    }

    if (Array.isArray(valueAtSubpath)) {
      return valueAtSubpath.some(value =>
        checkPathExistence(value, remainingPath.join('.'), criteria)
      );
    }
    if (isObject(valueAtSubpath)) {
      return checkPathExistence(
        valueAtSubpath,
        remainingPath.join('.'),
        criteria
      );
    }
    break;
  }

  return criteria === 'exists' ? false : true;
};

/**
 * Returns true if `path` in resource matches the crtieria (ie contains or does not contain) for the given value.
 *
 * If resource is an array, then the return value is true if any one element in that array matches the criteria.
 */
export const doesResourceContain = (
  resource: { [key: string]: any },
  path: string,
  value: string,
  criteria: 'contains' | 'does-not-contain' = 'contains'
): boolean => {
  if (isPrimitiveValue(resource)) {
    return isSubstringOf(String(resource), value, criteria === 'contains');
  }

  const subpaths = path.split('.');

  for (const subpath of subpaths) {
    const valueAtSubpath = resource[subpath];
    const remainingPath = subpaths.slice(1);
    if (Array.isArray(valueAtSubpath)) {
      return valueAtSubpath.some(arrayElement => {
        return doesResourceContain(
          arrayElement,
          remainingPath.join('.'),
          value,
          criteria
        );
      });
    }
    if (isObject(valueAtSubpath)) {
      return doesResourceContain(
        valueAtSubpath,
        remainingPath.join('.'),
        value,
        criteria
      );
    }
    return isSubstringOf(
      String(valueAtSubpath),
      value,
      criteria === 'contains'
    );
  }
  return isSubstringOf(String(resource), value, criteria === 'contains');
};

const isSubstringOf = (
  text: string,
  maybeSubstring: string,
  shouldContain: boolean
) => {
  if (shouldContain) {
    return normalizeString(text).includes(normalizeString(maybeSubstring));
  }
  return !normalizeString(text).includes(normalizeString(maybeSubstring));
};

// Returns true if value is not an array, object, or function.
const isPrimitiveValue = (value: any) => {
  return !Array.isArray(value) && !isObject(value);
};
