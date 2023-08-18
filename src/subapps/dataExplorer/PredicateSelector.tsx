import { UndoOutlined } from '@ant-design/icons';
import { Resource } from '@bbp/nexus-sdk/es';
import { Button, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/es/form';
import { DefaultOptionType } from 'antd/lib/cascader';
import React, { useMemo, useRef } from 'react';
import { normalizeString } from '../../utils/stringUtils';
import { DataExplorerConfiguration } from './DataExplorer';
import {
  columnFromPath,
  isObject,
  isUserColumn,
  sortColumns,
} from './DataExplorerUtils';
import { TColumn } from './ColumnsSelector';
import './styles.scss';

interface Props {
  columns: TColumn[];
  dataSource: Resource[];
  onPredicateChange: React.Dispatch<Partial<DataExplorerConfiguration>>;
  onResetCallback: (column: string, checked: boolean) => void;
}

export const PredicateSelector: React.FC<Props> = ({
  columns,
  dataSource,
  onPredicateChange,
  onResetCallback,
}: Props) => {
  const formRef = useRef<FormInstance>(null);
  const pathRef = useRef<{ path: string; selected: boolean }>({
    path: '',
    selected: false,
  });
  const predicateFilterOptions: PredicateFilterOptions[] = [
    { value: EXISTS },
    { value: DOES_NOT_EXIST },
    { value: CONTAINS },
    { value: DOES_NOT_CONTAIN },
  ];

  const allPathOptions = useMemo(
    () => pathOptions([...getAllPaths(dataSource)]),
    [dataSource]
  );

  const predicateSelected = (
    path: string,
    predicate: PredicateFilterOptions['value'] | null,
    searchTerm: string | null
  ) => {
    if (!path || !predicate) {
      onPredicateChange({ predicate: null, selectedPath: null });
    }

    switch (predicate) {
      case EXISTS:
        onPredicateChange({
          predicate: (resource: Resource) =>
            checkPathExistence(resource, path, 'exists'),
          selectedPath: path,
        });
        break;
      case DOES_NOT_EXIST:
        onPredicateChange({
          predicate: (resource: Resource) =>
            checkPathExistence(resource, path, 'does-not-exist'),
          selectedPath: path,
        });
        break;
      case CONTAINS:
        if (searchTerm) {
          onPredicateChange({
            predicate: (resource: Resource) =>
              doesResourceContain(resource, path, searchTerm, 'contains'),
            selectedPath: path,
          });
        } else {
          onPredicateChange({ predicate: null, selectedPath: null });
        }
        break;
      case DOES_NOT_CONTAIN:
        if (searchTerm) {
          onPredicateChange({
            predicate: (resource: Resource) =>
              doesResourceContain(
                resource,
                path,
                searchTerm,
                'does-not-contain'
              ),
            selectedPath: path,
          });
        } else {
          onPredicateChange({ predicate: null, selectedPath: null });
        }
        break;
      default: {
        onPredicateChange({ predicate: null, selectedPath: null });
        break;
      }
    }
  };

  const getFormFieldValue = (fieldName: string) => {
    return formRef.current?.getFieldValue(fieldName) ?? '';
  };

  const setFormField = (fieldName: string, fieldValue: string) => {
    if (formRef.current) {
      formRef.current.setFieldValue(fieldName, fieldValue);
    }
  };

  const onReset = () => {
    onResetCallback(pathRef.current.path, pathRef.current.selected);
    const form = formRef.current;
    if (form) {
      form.resetFields();
    }
    pathRef.current = { path: '', selected: false };
    onPredicateChange({ predicate: null, selectedPath: null });
  };

  const shouldShowValueInput =
    getFormFieldValue(PREDICATE_FIELD) === CONTAINS ||
    getFormFieldValue(PREDICATE_FIELD) === DOES_NOT_CONTAIN;

  return (
    <Form ref={formRef} name="predicate-selection" className="form-container">
      <span className="label">with </span>

      <Form.Item name="path" noStyle>
        <Select
          options={allPathOptions}
          showSearch={true}
          onSelect={pathLabel => {
            setFormField(PATH_FIELD, pathLabel);
            predicateSelected(
              pathLabel,
              getFormFieldValue(PREDICATE_FIELD),
              getFormFieldValue(SEARCH_TERM_FIELD)
            );
          }}
          allowClear={true}
          onClear={() => {
            onReset();
          }}
          virtual={true}
          className="select-menu"
          popupClassName="search-menu"
          optionLabelProp="label"
          aria-label="path-selector"
          style={{ width: 200, minWidth: 'max-content' }}
          dropdownMatchSelectWidth={false} // This ensures that the items in the dropdown list are always fully legible (ie they are not truncated) just because the input of select is too short.
        />
      </Form.Item>

      {getFormFieldValue(PATH_FIELD) && (
        <>
          <span className="label">= </span>
          <Form.Item name="predicate" noStyle>
            <Select
              options={predicateFilterOptions}
              onSelect={(predicateLabel: PredicateFilterOptions['value']) => {
                setFormField(PREDICATE_FIELD, predicateLabel);
                setFormField(SEARCH_TERM_FIELD, '');
                pathRef.current = {
                  path: getFormFieldValue(PATH_FIELD),
                  selected:
                    columns.find(
                      column => column.value === getFormFieldValue(PATH_FIELD)
                    )?.selected ?? false,
                };
                predicateSelected(
                  getFormFieldValue(PATH_FIELD),
                  predicateLabel,
                  ''
                );
              }}
              aria-label="predicate-selector"
              className="select-menu reduced-width"
              popupClassName="search-menu"
              autoFocus={true}
              allowClear={true}
              onClear={() => {
                predicateSelected(getFormFieldValue(PATH_FIELD), null, '');
              }}
            />
          </Form.Item>
        </>
      )}

      {shouldShowValueInput && (
        <Form.Item name="searchTerm" noStyle>
          <Input
            placeholder="Search for..."
            aria-label="predicate-value-input"
            className="predicate-value-input"
            allowClear={false}
            autoFocus={true}
            onChange={event => {
              const term = event.target.value;
              setFormField(SEARCH_TERM_FIELD, term);
              predicateSelected(
                getFormFieldValue(PATH_FIELD),
                getFormFieldValue(PREDICATE_FIELD),
                term
              );
            }}
          />
        </Form.Item>
      )}

      <Button
        onClick={onReset}
        disabled={!getFormFieldValue(PATH_FIELD)}
        type="text"
        className="text-button"
      >
        Reset predicate <UndoOutlined />
      </Button>
    </Form>
  );
};

export const DOES_NOT_EXIST = 'Does not exist';
export const EXISTS = 'Exists';
export const CONTAINS = 'Contains';
export const DOES_NOT_CONTAIN = 'Does not contain';

const PATH_FIELD = 'path';
const PREDICATE_FIELD = 'predicate';
const SEARCH_TERM_FIELD = 'searchTerm';

export type PredicateFilterT =
  | typeof DOES_NOT_EXIST
  | typeof EXISTS
  | typeof CONTAINS
  | typeof DOES_NOT_CONTAIN
  | null;

type PredicateFilterOptions = {
  value: Exclude<PredicateFilterT, null>;
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
