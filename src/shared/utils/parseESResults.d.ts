import { Resource } from '@bbp/nexus-sdk';
import { UseSearchResponse } from '../hooks/useSearchQuery';
import { ResultTableFields } from '../types/search';
export declare const rowRender: (value: string) => string | JSX.Element;
export declare function parseESResults(
  searchResponse: UseSearchResponse
): {
  key: string;
  '@context'?:
    | string
    | (
        | string
        | {
            [key: string]: any;
          }
      )[]
    | {
        [key: string]: any;
      }
    | undefined;
  '@type'?: string | string[] | undefined;
  '@id': string;
  _incoming: string;
  _outgoing: string;
  _self: string;
  _constrainedBy: string;
  _project: string;
  _rev: number;
  _deprecated: boolean;
  _createdAt: string;
  _createdBy: string;
  _updatedAt: string;
  _updatedBy: string;
}[];
export declare function addColumnsForES(
  field: ResultTableFields,
  sorter: (
    dataIndex: string
  ) => (
    a: {
      [key: string]: any;
    },
    b: {
      [key: string]: any;
    }
  ) => 1 | -1 | 0
): {
  sorter:
    | false
    | ((
        a: {
          [key: string]: any;
        },
        b: {
          [key: string]: any;
        }
      ) => 1 | -1 | 0);
  render: (text: string, resource: Resource) => any;
  title: string;
  dataIndex: string;
  sortable?: boolean | undefined;
  key: string;
  displayIndex: number;
};
