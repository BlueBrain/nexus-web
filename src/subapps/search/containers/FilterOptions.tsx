import { Form, Select, Checkbox, Button, Row, Input } from 'antd';
import * as bodybuilder from 'bodybuilder';
import { labelOf } from '../../../shared/utils';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import { RuleObject } from 'antd/lib/form';

type ConfigField =
  | {
      name: string;
      label: string;
      array: boolean;
      fields: { name: string; format: string }[];
      format?: undefined;
    }
  | {
      name: string;
      label: string;
      format: string;
      array: boolean;
      fields?: undefined;
    };

export const extractFieldName = (filterKeyword: string) =>
  filterKeyword.replace('.label.keyword', '').replace('.keyword', '');

const FilterOptions: React.FC<{
  field: ConfigField;
  onFinish: (values: any) => void;
  nexusClient: NexusClient;
  filter?: FilterState;
}> = ({ filter, field, onFinish, nexusClient }) => {
  const [result, setResult] = React.useState<
    {
      key: string;
      doc_count: string;
    }[]
  >([]);
  const [suggestions, setSuggestions] = React.useState<
    {
      key: string;
      doc_count: string;
    }[]
  >([]);

  const [form] = Form.useForm();

  const createKeyWord = (field: ConfigField) => {
    if (field.fields) {
      return `${field.name}.label.keyword`;
    }

    return `${field.name}.keyword`;
  };
  const filterKeyWord = createKeyWord(field);

  React.useEffect(() => {
    !filter && form.resetFields();
  });

  React.useEffect(() => {
    const body = bodybuilder();

    const filterSuggestions = body
      .aggregation('terms', filterKeyWord, 'suggestions')
      .build();
    nexusClient.Search.query(filterSuggestions).then((filterResult: any) => {
      setSuggestions(
        filterResult.aggregations['suggestions'].buckets.map(
          (suggest: any) => ({
            key: suggest.key,
            doc_count: suggest.doc_count,
          })
        )
      );
    });
  }, [field]);

  const filterValues = React.useMemo(() => {
    const filterableValues = result.length > 0 ? result : suggestions;
    return filterableValues.map(({ key, doc_count }) => (
      <Row key={key}>
        <Checkbox value={`${key}`} style={{ width: '300px' }}>
          {`${field.label === 'Types' ? labelOf(key) : key}`}({doc_count})
        </Checkbox>
      </Row>
    ));
  }, [suggestions, result]);

  const validateFilterSelected = (
    rule: RuleObject,
    value: string[],
    callback: (error?: string) => void
  ) => {
    if (!value || value.length === 0) {
      return callback('At least one value to filter on must be selected');
    }

    return callback();
  };

  return (
    <Form
      form={form}
      onFinish={(values: any) => {
        onFinish({ ...values, filterTerm: filterKeyWord });
      }}
      style={{ width: '100%' }}
      validateTrigger={['onSubmit']}
    >
      <Form.Item
        label="Operator"
        name="filterType"
        rules={[{ required: true }]}
      >
        <Select dropdownStyle={{ zIndex: 1100 }}>
          <Select.Option value="allof">is all Of (AND)</Select.Option>
          <Select.Option value="anyof">is any Of (OR)</Select.Option>
          <Select.Option value="noneof">is none Of (NOT)</Select.Option>
        </Select>
      </Form.Item>
      <Input.Search
        onChange={event => {
          const val = event.target.value;
          if (val && val.length > 0) {
            const filteredSuggestions = suggestions.filter(
              x => x.key.indexOf(val) > -1
            );
            setResult(filteredSuggestions);
          } else {
            setResult(suggestions);
          }
        }}
      ></Input.Search>
      <Form.Item name="filters" rules={[{ validator: validateFilterSelected }]}>
        <Checkbox.Group style={{ width: '300px' }}>
          {filterValues}
        </Checkbox.Group>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Apply
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FilterOptions;
