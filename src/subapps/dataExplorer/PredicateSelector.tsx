import { Input, Select } from 'antd';
import React, { useState } from 'react';
import { DataExplorerConfiguration, isObject } from './DataExplorer';
import './styles.less';
import { Resource } from '@bbp/nexus-sdk';
import { normalizeString } from '../../utils/stringUtils';
import { clsx } from 'clsx';

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

  const pathOptions = [
    { value: DEFAULT_OPTION },
    ...getAllPaths(dataSource).map(path => ({ value: path })),
  ];
  const predicateFilterOptions: PredicateFilterOptions[] = [
    { value: DEFAULT_OPTION },
    { value: EXISTS },
    { value: DOES_NOT_EXIST },
    { value: CONTAINS },
  ];

  const predicateSelected = (
    path: string,
    predicate: PredicateFilterOptions['value'],
    searchTerm: string | null
  ) => {
    if (path === DEFAULT_OPTION || predicate === DEFAULT_OPTION) {
      onPredicateChange({ predicateFilter: null });
    }

    switch (predicate) {
      case EXISTS:
        onPredicateChange({
          predicateFilter: (resource: Resource) =>
            checkPathExistence(resource, path, 'exists'),
        });
        break;
      case DOES_NOT_EXIST:
        onPredicateChange({
          predicateFilter: (resource: Resource) =>
            checkPathExistence(resource, path, 'does-not-exist'),
        });
        break;
      case CONTAINS:
        if (searchTerm) {
          onPredicateChange({
            predicateFilter: (resource: Resource) =>
              doesResourceContain(resource, path, searchTerm),
          });
        }
        break;
      default:
        onPredicateChange({ predicateFilter: null });
    }
  };

  return (
    <div className="form-container">
      <span className="label">with </span>

      <Select
        options={pathOptions}
        onSelect={pathLabel => {
          setPath(pathLabel);
          predicateSelected(pathLabel, predicate, searchTerm);
        }}
        aria-label="path-selector"
        style={{ width: 200 }}
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
        className={clsx('select-menu', path === CONTAINS && 'greyed-out')}
        popupClassName="search-menu"
        allowClear={true}
        onClear={() => {
          setPredicate(DEFAULT_OPTION);
          predicateSelected(path, DEFAULT_OPTION, searchTerm);
        }}
      />

      {predicate === CONTAINS && (
        <Input
          placeholder="type the value..."
          aria-label="predicate-value-input"
          bordered={false}
          className="predicate-value-input"
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

export type PredicateFilterT =
  | typeof DOES_NOT_EXIST
  | typeof EXISTS
  | typeof CONTAINS
  | null;

type PredicateFilterOptions = {
  value: Exclude<PredicateFilterT, null> | typeof DEFAULT_OPTION;
};

export const pathOptions = (paths: string[]) => [
  { value: DEFAULT_OPTION },
  paths.map(path => ({ value: path })),
];

const UNDERSCORE = '_';

export const getAllPaths = (objects: { [key: string]: any }[]): string[] => {
  return Array.from(getPathsForResource(objects, '')).sort(
    (a: string, b: string) => {
      // Sorts paths alphabetically. Additionally all paths starting with an underscore are sorted at the end of the list (because they represent metadata).
      if (a.startsWith(UNDERSCORE) && b.startsWith(UNDERSCORE)) {
        return a.localeCompare(b);
      }
      if (a.startsWith(UNDERSCORE)) {
        return 1;
      }
      if (b.startsWith(UNDERSCORE)) {
        return -1;
      }
      return a.localeCompare(b);
    }
  );
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
  if (path in resource) {
    return criteria === 'exists' ? true : false;
  }

  const subpaths = path.split('.');

  for (const subpath of subpaths) {
    const valueAtSubpath = resource[subpath];
    const remainingPath = subpaths.slice(1);
    if (!(subpath in resource)) {
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

export const isPathMissing = (
  resource: { [key: string]: any },
  path: string
): boolean => {
  if (path in resource && path !== '') {
    return false;
  }

  const subpaths = path.split('.');

  for (const subpath of subpaths) {
    if (!(subpath in resource)) {
      return true;
    }
    const valueAtSubpath = resource[subpath];
    const remainingPath = subpaths.slice(1);
    if (Array.isArray(valueAtSubpath)) {
      return valueAtSubpath.some(value =>
        isPathMissing(value, remainingPath.join('.'))
      );
    }
    if (isObject(valueAtSubpath)) {
      return isPathMissing(valueAtSubpath, remainingPath.join('.'));
    }
  }
  return true;
};

export const doesResourceContain = (
  resource: { [key: string]: any },
  path: string,
  value: string
): boolean => {
  if (!Array.isArray(resource) && !isObject(resource)) {
    return isSubstringOf(String(resource), value);
  }

  const subpaths = path.split('.');

  for (const subpath of subpaths) {
    const valueAtSubpath = resource[subpath];
    const remainingPath = subpaths.slice(1);
    if (Array.isArray(valueAtSubpath)) {
      return valueAtSubpath.some(arrayElement =>
        doesResourceContain(arrayElement, remainingPath.join('.'), value)
      );
    }
    if (isObject(valueAtSubpath)) {
      return doesResourceContain(
        valueAtSubpath,
        remainingPath.join('.'),
        value
      );
    }
    return isSubstringOf(String(valueAtSubpath), value);
  }
  return isSubstringOf(String(resource), value);
};

const isSubstringOf = (text: string, maybeSubstring: string) => {
  return normalizeString(text).includes(normalizeString(maybeSubstring));
};
