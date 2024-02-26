import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ElasticSearchViewQueryResponse } from '@bbp/nexus-sdk/es';
import { Button, Card, Empty, Form, List } from 'antd';
import * as codemirror from 'codemirror';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/javascript/javascript';
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import ReactJson from 'react-json-view';

import './view-form.scss';

const FormItem = Form.Item;
const ListItem = List.Item;
// Can be KG error or an ElasticSearch Error
// In the case of ES, the reason message is nested within an error object
export type NexusESError = {
  reason?: string;
  error?: {
    reason?: string;
  };
};

const ElasticSearchQueryForm: FC<{
  query: object;
  response?: ElasticSearchViewQueryResponse<any> | null;
  busy: boolean;
  error: NexusESError | null;
  from: number;
  size: number;
  onPaginationChange: (page: number) => void;
  onQueryChange: (query: object) => void;
  onChangePageSize: (size: number) => void;
}> = ({
  busy,
  from,
  size,
  query,
  error,
  response,
  onQueryChange,
  onChangePageSize,
  onPaginationChange,
}): JSX.Element => {
  const [_initialQuery, setInitialQuery] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [valid, setValid] = useState(true);
  const [pageSize, setPageSize] = useState<number>(size);

  const wrapper = useRef(null);
  const editor = useRef<codemirror.Editor>();

  const data =
    response && response.hits.hits.map(result => result._source || []);
  const total =
    (response && response.hits.total && response.hits.total.value) || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);

  useEffect(() => {
    const formattedInitialQuery = JSON.stringify(query, null, 2);
    setEditorValue(formattedInitialQuery);
  }, [query]);

  useEffect(() => {
    const formattedInitialQuery = JSON.stringify(query, null, 2);
    setInitialQuery(formattedInitialQuery);
  }, []);

  const handleChange = (_: any, __: any, value: string) => {
    setEditorValue(value);
    try {
      JSON.parse(value);
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
          editorValue && onQueryChange(JSON.parse(editorValue));
        }}
        layout="vertical"
      >
        <>
          <div className="control-panel">
            <div className={`feedback ${valid ? '_positive' : '_negative'}`}>
              {valid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}{' '}
              {valid ? 'Valid JSON' : 'Invalid JSON'}
            </div>
            <FormItem>
              <Button type="primary" htmlType="submit" disabled={!valid}>
                Execute ElasticSearch query
              </Button>
            </FormItem>
          </div>
          <CodeMirror
            autoCursor={false}
            value={editorValue}
            options={{
              mode: { name: 'javascript', json: true },
              theme: 'base16-light',
              placeholder: 'Enter a valid ElasticSearch query',
              viewportMargin: Infinity,
            }}
            onChange={handleChange}
            editorDidMount={editorElement => {
              (editor as MutableRefObject<
                codemirror.Editor
              >).current = editorElement;
            }}
            editorWillUnmount={() => {
              const editorWrapper = (editor as MutableRefObject<
                CodeMirror.Editor
              >).current.getWrapperElement();
              if (editor) editorWrapper.remove();
              if (wrapper.current) {
                (wrapper.current as { hydrated: boolean }).hydrated = false;
              }
            }}
          />
        </>
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
              position: 'bottom',
              showSizeChanger: true,
              onShowSizeChange: changePageSize,
            }}
            renderItem={(result?: object) => (
              <ListItem>
                {(result && (
                  <ReactJson
                    src={result}
                    collapsed
                    name={null}
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    style={{ width: '100%' }}
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
