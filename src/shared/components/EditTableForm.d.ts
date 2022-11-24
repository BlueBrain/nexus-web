import * as React from 'react';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-light.css';
import './EditTableForm.less';
import {
  TableResource,
  UnsavedTableResource,
} from '../containers/DataTableContainer';
/**
 * isEmptyInput function - checks if a given input empty
 * @param {string}
 * @returns {boolean}
 */
export declare const isEmptyInput: (value: string) => boolean;
export declare type Projection =
  | {
      '@id':
        | string
        | (string & ['SparqlView', 'View'])
        | (string & ['AggregatedElasticSearchView', 'View'])
        | (string & ['AggregatedSparqlView', 'View'])
        | undefined;
      '@type':
        | string
        | string[]
        | ((string | string[] | undefined) & ['ElasticSearchView', 'View'])
        | ((string | string[] | undefined) & ['CompositeView', 'Beta', 'View'])
        | undefined;
    }
  | undefined;
declare const EditTableForm: React.FC<{
  onSave: (data: TableResource | UnsavedTableResource) => void;
  onClose: () => void;
  table?: TableResource;
  busy: boolean;
  orgLabel: string;
  projectLabel: string;
  formName?: string;
  options?: {
    disableDelete: boolean;
  };
}>;
export default EditTableForm;
