import * as React from 'react';
import { Input, Form, Tooltip, Icon, Transfer, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ResourceList } from '@bbp/nexus-sdk';
import { FormComponentProps } from 'antd/es/form';

import DEFAULT_DASHBOARD_VIEW_QUERY from './DefaultDashboardViewQuery';
import SparqlQueryFormInput from '../ViewForm/SparqlQueryInput';

export type DashboardPayload = {
  description?: string;
  label?: string;
  dataQuery: string;
  plugins?: string[];
};

export type DashboardConfigEditorProps = {
  ref?: React.Ref<FormComponentProps<any>>;
  form: WrappedFormUtils;
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
  viewList?: ResourceList<{}>;
  linkToSparqlQueryEditor?(dataQuery: string): React.ReactElement;
};

const DashboardConfigEditorComponent: React.FunctionComponent<
  DashboardConfigEditorProps
> = ({ onSubmit, form, dashboard, linkToSparqlQueryEditor }) => {
  const { description, label, dataQuery } = dashboard || {};
  const { getFieldDecorator, getFieldsValue, validateFields } = form;
  const [selectedPlugins, setSelectedPlugin] = React.useState<string[]>([
    'lol',
  ]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields(err => {
      console.log('asdasd');
      if (!err) {
        const { description, label, dataQuery } = getFieldsValue() as {
          description?: string;
          label: string;
          dataQuery: string;
        };
        onSubmit &&
          onSubmit({
            description,
            label,
            dataQuery,
            plugins: selectedPlugins,
          });
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="What do you want to call this dashboard?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('label', {
          initialValue: label,
          rules: [
            {
              required: true,
              message: 'Please input a label!',
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A short description of what's in the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('description', {
          initialValue: description,
          rules: [
            {
              required: false,
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Plugins{' '}
            <Tooltip title="Which plugins should Studio load when viewing a resource.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('plugins', {
          rules: [
            {
              required: false,
            },
          ],
        })(
          <Transfer
            dataSource={[
              {
                key: 'asdasd-asd0as-das-d-',
                title: 'content 1',
                description: 'description 1',
                chosen: true,
              },
              {
                key: 'asdasd-asd0as-das-d-2',
                title: 'content 2',
                description: 'description 12',
                chosen: false,
              },
            ]}
            targetKeys={['asdasd-asd0as-das-d-']}
            render={item => item.title}
          />
        )}
        }
      </Form.Item>
      <Form.Item
        label={
          <span>
            Sparql Query{' '}
            <Tooltip title="A query that will return the elements of the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>{' '}
            {linkToSparqlQueryEditor &&
              linkToSparqlQueryEditor(
                dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY
              )}
          </span>
        }
      >
        {getFieldDecorator('dataQuery', {
          initialValue: dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY,
          rules: [
            {
              required: true,
            },
          ],
        })(<SparqlQueryFormInput />)}
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Form.create<DashboardConfigEditorProps>()(
  DashboardConfigEditorComponent
);
