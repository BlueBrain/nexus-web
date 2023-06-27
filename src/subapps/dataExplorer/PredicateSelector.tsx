import { Select } from 'antd';
import React from 'react';
import { DataExplorerConfiguration, isObject } from './DataExplorer';
import './styles.less';
import { Resource } from '@bbp/nexus-sdk';

interface Props {
  dataSource: Resource[];
  onPredicateChange: React.Dispatch<Partial<DataExplorerConfiguration>>;
}

export const PredicateSelector: React.FC<Props> = ({
  dataSource,
  onPredicateChange,
}: Props) => {
  const pathOptions = [
    { value: DEFAULT_OPTION },
    ...getAllPaths(dataSource).map(path => ({ value: path })),
  ];
  const predicateOptions = [
    { value: DEFAULT_OPTION },
    { value: 'Empty value' },
  ];

  return (
    <div className="form-container">
      <span className="label">with </span>

      <Select
        options={pathOptions}
        onSelect={pathLabel => {
          onPredicateChange({
            predicatePath: pathLabel === DEFAULT_OPTION ? null : pathLabel,
          });
        }}
        aria-label="path-selector"
        style={{ width: 200 }}
        className="select-menu"
        popupClassName="search-menu"
      />
      <span className="label">= </span>
      <Select
        options={predicateOptions}
        onSelect={(predicateLabel: string) => {
          onPredicateChange({
            predicateFilter:
              predicateLabel === DEFAULT_OPTION ? null : predicateLabel,
          });
        }}
        aria-label="predicate-selector"
        style={{ width: 200 }}
        className="select-menu"
        popupClassName="search-menu"
        allowClear={true}
        onClear={() => onPredicateChange({ predicateFilter: null })}
      />
    </div>
  );
};

export const DEFAULT_OPTION = '-';

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
