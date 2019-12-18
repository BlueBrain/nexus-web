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

type Plugin = {
  key: string;
  title: string;
  description?: string;
  chosen: boolean;
};

export type DashboardConfigEditorProps = {
  ref?: React.Ref<FormComponentProps<any>>;
  form: WrappedFormUtils;
  dashboard?: DashboardPayload;
  availablePlugins?: Plugin[];
  onSubmit?(dashboard: DashboardPayload): void;
  viewList?: ResourceList<{}>;
  linkToSparqlQueryEditor?(dataQuery: string): React.ReactElement;
};

const DashboardConfigEditorComponent: React.FunctionComponent<
  DashboardConfigEditorProps
> = ({
  onSubmit,
  form,
  dashboard,
  availablePlugins,
  linkToSparqlQueryEditor,
}) => {
  const { description, label, dataQuery, plugins = [] } = dashboard || {};
  const { getFieldDecorator, getFieldsValue, validateFields } = form;
  const [selectedPlugins, setSelectedPlugins] = React.useState<string[]>(
    ["test"]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields(err => {
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

  const handlePluginsChange = (nextTargetKeys: string[]) => {
    setSelectedPlugins(nextTargetKeys);
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
            dataSource={availablePlugins}
            targetKeys={selectedPlugins}
            render={item => item.title}
            onChange={handlePluginsChange}
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
