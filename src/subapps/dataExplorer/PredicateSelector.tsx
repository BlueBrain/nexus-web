import { UndoOutlined } from '@ant-design/icons';
import { Resource } from '@bbp/nexus-sdk';
import { Button, Form, Input, Select, Tooltip } from 'antd';
import { FormInstance } from 'antd/es/form';
import { DefaultOptionType } from 'antd/lib/cascader';
import React, { useEffect, useRef } from 'react';
import { TType } from 'shared/molecules/TypeSelector/types';
import { normalizeString } from '../../utils/stringUtils';
import { TColumn } from './ColumnsSelector';
import { DataExplorerConfiguration } from './DataExplorer';
import {
  PropertyPath,
  columnFromPath,
  isObject,
  isUserColumn,
  sortColumns,
  useGraphAnalyticsPath,
} from './DataExplorerUtils';

import './styles.scss';

interface Props {
  columns: TColumn[];
  onPredicateChange: React.Dispatch<Partial<DataExplorerConfiguration>>;
  onResetCallback: (column: string, checked: boolean) => void;
  org: string;
  project: string;
  types: TType[] | undefined;
}

export const PredicateSelector: React.FC<Props> = ({
  columns,
  onPredicateChange,
  onResetCallback,
  org,
  project,
  types,
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

  const { data: paths, isLoading: arePathsLoading } = useGraphAnalyticsPath(
    org,
    project,
    types?.map(t => t.value) ?? []
  );

  // NOTE: Right now, the `EXISTS` and `DOES_NOT_EXIST` predicates run on the backend and update the `backendPredicateQuery` parameter.
  // `CONTAINS` and `DOES_NOT_CONTAIN` predicates on the other hand, only run on frontend and update `frontendPredicate` parameter.
  // When we implement running all the predicates on backend, we should discard `frontendPredicate` parameter completely.
  const predicateSelected = (
    path: DefaultOptionType,
    predicate: PredicateFilterOptions['value'] | null,
    searchTerm: string | null
  ) => {
    if (!path || !predicate) {
      onPredicateChange({
        frontendPredicate: null,
        selectedPath: null,
        backendPredicateQuery: null,
      });
    }

    switch (predicate) {
      case EXISTS: {
        onPredicateChange({
          backendPredicateQuery: getPredicateQuery(
            predicate,
            types![0].value,
            path.value as string
          ),
          frontendPredicate: null,
          selectedPath: path.key,
        });
        break;
      }
      case DOES_NOT_EXIST: {
        onPredicateChange({
          backendPredicateQuery: getPredicateQuery(
            predicate,
            types![0].value,
            path.value as string
          ),
          frontendPredicate: null,
          selectedPath: path.key,
        });
        break;
      }
      case CONTAINS:
        if (searchTerm) {
          onPredicateChange({
            frontendPredicate: (resource: Resource) =>
              doesResourceContain(resource, path.key, searchTerm, 'contains'),
            selectedPath: path.key,
          });
        } else {
          onPredicateChange({
            frontendPredicate: null,
            selectedPath: null,
            backendPredicateQuery: null,
          });
        }
        break;
      case DOES_NOT_CONTAIN:
        if (searchTerm) {
          onPredicateChange({
            frontendPredicate: (resource: Resource) =>
              doesResourceContain(
                resource,
                path.key,
                searchTerm,
                'does-not-contain'
              ),
            selectedPath: path.key,
          });
        } else {
          onPredicateChange({
            frontendPredicate: null,
            selectedPath: null,
            backendPredicateQuery: null,
          });
        }
        break;
      default: {
        onPredicateChange({
          frontendPredicate: null,
          selectedPath: null,
          backendPredicateQuery: null,
        });
        break;
      }
    }
  };

  const getFormFieldValue = (fieldName: string) => {
    return formRef.current?.getFieldValue(fieldName) ?? '';
  };

  const setFormField = (
    fieldName: string,
    fieldValue: string | DefaultOptionType
  ) => {
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
    onPredicateChange({
      frontendPredicate: null,
      backendPredicateQuery: null,
      selectedPath: null,
    });
  };

  useEffect(() => {
    onReset();
  }, [types]);

  const shouldShowValueInput =
    getFormFieldValue(PREDICATE_FIELD) === CONTAINS ||
    getFormFieldValue(PREDICATE_FIELD) === DOES_NOT_CONTAIN;

  const disablePredicateSelection = types?.length !== 1;
  const isFrontendPredicateSelected =
    getFormFieldValue(PREDICATE_FIELD) === CONTAINS ||
    getFormFieldValue(PREDICATE_FIELD) === DOES_NOT_CONTAIN;

  return (
    <Form ref={formRef} name="predicate-selection" className="form-container">
      <span className="label">with </span>

      <Form.Item name="path" noStyle>
        <Tooltip
          title={
            disablePredicateSelection
              ? 'Please select (only 1) type to enable predicate selection.'
              : null
          }
          placement="top"
        >
          <Select
            options={pathOptions(paths ?? [])}
            showSearch={true}
            labelInValue
            onSelect={(pathLabel: DefaultOptionType) => {
              setFormField(PATH_FIELD, pathLabel);
              predicateSelected(
                pathLabel,
                getFormFieldValue(PREDICATE_FIELD),
                getFormFieldValue(SEARCH_TERM_FIELD)
              );
            }}
            disabled={disablePredicateSelection}
            loading={arePathsLoading}
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
        </Tooltip>
      </Form.Item>

      {getFormFieldValue(PATH_FIELD) && (
        <>
          <span className="label">= </span>
          <div className="flex">
            <Form.Item name="predicate" noStyle>
              <Select
                options={predicateFilterOptions}
                onSelect={(predicateLabel: PredicateFilterOptions['value']) => {
                  setFormField(PREDICATE_FIELD, predicateLabel);
                  setFormField(SEARCH_TERM_FIELD, '');
                  const selectedPath = getFormFieldValue(PATH_FIELD);
                  pathRef.current = {
                    path: selectedPath.key,
                    selected:
                      columns.find(column => column.value === selectedPath)
                        ?.selected ?? false,
                  };

                  predicateSelected(selectedPath, predicateLabel, '');
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
            {isFrontendPredicateSelected && (
              <span className="predicate-warning">
                {FRONTEND_PREDICATE_WARNING}
              </span>
            )}
          </div>
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

export const FRONTEND_PREDICATE_WARNING =
  'This predicate will only run on the resources loaded in the current page.';

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

const getPredicateQuery = (
  predicateVerb: typeof EXISTS | typeof DOES_NOT_EXIST,
  type: string,
  path: string
) => {
  if (predicateVerb === EXISTS) {
    return {
      query: {
        bool: {
          filter: [
            {
              terms: {
                '@type': [type],
              },
            },
            {
              term: {
                _deprecated: false,
              },
            },
            {
              nested: {
                path: 'properties',
                query: {
                  term: { 'properties.path': path },
                },
              },
            },
          ],
        },
      },
    };
  }
  if (predicateVerb === DOES_NOT_EXIST) {
    return {
      query: {
        bool: {
          filter: [
            {
              terms: {
                '@type': [type],
              },
            },
            {
              term: {
                _deprecated: false,
              },
            },
            {
              bool: {
                must_not: {
                  nested: {
                    path: 'properties',
                    query: {
                      term: { 'properties.path': path },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    };
  }

  return null;
};

// Creates <Option /> element for each path. Also adds a class of "first-metadata-path" for the first path generated for a metadata column.
const pathOptions = (paths: PropertyPath[]) => {
  let firstMetadataFound = false;
  const pathOptions: DefaultOptionType[] = [];

  paths.forEach(path => {
    const column = columnFromPath(path.label);
    const isFirstMetadataPath = !isUserColumn(column) && !firstMetadataFound;

    pathOptions.push({
      key: path.label,
      value: path.value,
      label: (
        <span
          className={isFirstMetadataPath ? 'first-metadata-path' : ''}
          title={path.label}
        >
          {path.label}
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
