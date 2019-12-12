import * as React from 'react';
import { Input, Form, Tooltip, Icon } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ResourceList } from '@bbp/nexus-sdk';
import { FormComponentProps } from 'antd/es/form';

import DEFAULT_DASHBOARD_VIEW_QUERY from './DefaultDashboardViewQuery';
import SparqlQueryFormInput from '../ViewForm/SparqlQueryInput';

export type DashboardPayload = {
  description?: string;
  label?: string;
  dataQuery: string;
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
        {getFieldDecorator('viewQuery', {
          initialValue: dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY,
          rules: [
            {
              required: true,
            },
          ],
        })(<SparqlQueryFormInput />)}
      </Form.Item>
    </Form>
  );
};

// This wrapping of imperative handle is to provide the form
// to the parent if the parent decides to use Ref on this form
// for example, to validate from the parent
const WrappedForwardDashboardConfigEditorComponent = React.forwardRef<
  FormComponentProps,
  DashboardConfigEditorProps
>((props, ref) => {
  React.useImperativeHandle(ref, () => props);
  return <DashboardConfigEditorComponent {...props} ref={ref} />;
});

type WrappedDashboardConfigFormProps = DashboardConfigEditorProps & {
  wrappedComponentRef?: React.Ref<FormComponentProps<any>>;
};

export default Form.create<WrappedDashboardConfigFormProps>()(
  WrappedForwardDashboardConfigEditorComponent
);
