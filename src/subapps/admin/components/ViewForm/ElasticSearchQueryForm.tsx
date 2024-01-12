import { useEffect, useRef, useState } from 'react';
import { Form, Button, Card, List, Empty } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import ReactJson from 'react-json-view';
import { ElasticSearchViewQueryResponse } from '@bbp/nexus-sdk/es';
import * as codemirror from 'codemirror';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/javascript/javascript';

import './view-form.scss';

const FormItem = Form.Item;
const ListItem = List.Item;
/**
 * This is tricky because error can be KG error OR an ElasticSearch Error.
 *
 * In the case of ES, the reason message is nested within an error object
 */
type NexusESError = {
  reason?: string;
  error?: {
    reason?: string;
  };
};

// TODO this needs to be broken into Input, Result, and Form components.
const ElasticSearchQueryForm: React.FunctionComponent<{
  query: object;
  response: ElasticSearchViewQueryResponse<any> | null;
  busy: boolean;
  error: NexusESError | null;
  from: number;
  size: number;
  onPaginationChange: (page: number) => void;
  onQueryChange: (query: object) => void;
  onChangePageSize: (size: number) => void;
}> = ({
  query,
  response,
  busy,
  error,
  from,
  size,
  onPaginationChange,
  onQueryChange,
  onChangePageSize,
}): JSX.Element => {
  const [initialQuery, setInitialQuery] = useState('');
  const [valid, setValid] = useState(true);
  const [value, setValue] = useState<string>();
  const [pageSize, setPageSize] = useState<number>(size);
  const editor = useRef<codemirror.Editor>();
  const wrapper = useRef(null);

  useEffect(() => {
    // only on first render!
    const formattedInitialQuery = JSON.stringify(query, null, 2);
    setInitialQuery(formattedInitialQuery);
  }, []);

  const data =
    response && response.hits.hits.map(result => result._source || []);
  const total =
    (response && response.hits.total && response.hits.total.value) || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);

  const handleChange = (_: any, __: any, value: string) => {
    try {
      JSON.parse(value);
      setValue(value);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  const changePageSize = (_: number, size: number) => {
    setPageSize(size);
    onChangePageSize(size);
  };

  return (
    <div className="view-form">
      <Form
        onFinish={() => {
          value && onQueryChange(JSON.parse(value));
        }}
        layout="vertical"
      >
        <>
          <div className="control-panel">
            <div>
              <div className={`feedback ${valid ? '_positive' : '_negative'}`}>
                {valid ? (
                  <CheckCircleOutlined />
                ) : (
                  <ExclamationCircleOutlined />
                )}{' '}
                {valid ? 'Valid JSON' : 'Invalid JSON'}
              </div>
            </div>
          </div>
          <CodeMirror
            value={initialQuery}
            options={{
              mode: { name: 'javascript', json: true },
              theme: 'base16-light',
              placeholder: 'Enter a valid ElasticSearch query',
              viewportMargin: Infinity,
            }}
            onChange={handleChange}
            editorDidMount={editorElement => {
              (editor as React.MutableRefObject<codemirror.Editor>).current = editorElement;
            }}
            editorWillUnmount={() => {
              const editorWrapper = (editor as React.MutableRefObject<
                CodeMirror.Editor
              >).current.getWrapperElement();
              if (editor) editorWrapper.remove();
              if (wrapper.current) {
                (wrapper.current as { hydrated: boolean }).hydrated = false;
              }
            }}
          />
        </>
        <FormItem>
          <Button type="primary" htmlType="submit" disabled={!valid}>
            Execute ElasticSearch query
          </Button>
        </FormItem>
      </Form>
      <Card bordered className="results">
        {error && (
          <Empty
            description={`An error occurred: ${error.reason ||
              (error.error && error.error.reason)}`}
          />
        )}
        {!error && (
          <List
            bordered
            size="small"
            className="elasticsearch-results"
            itemLayout="vertical"
            loading={busy}
            header={
              <p className="result">{`Found ${total} result${
                total > 1 ? 's' : ''
              }`}</p>
            }
            dataSource={data || []}
            pagination={{
              total,
              current,
              pageSize,
              onChange: onPaginationChange,
              position: 'both',
              showSizeChanger: true,
              onShowSizeChange: changePageSize,
            }}
            renderItem={(result?: object) => (
              <ListItem>
                {(result && (
                  <ReactJson
                    src={result}
                    name={null}
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                  />
                )) ||
                  ''}
              </ListItem>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ElasticSearchQueryForm;
