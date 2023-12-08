import './NewReportForm.scss';

import { Button, Form, Input, Select, Typography } from 'antd';
import { without } from 'lodash';
import * as React from 'react';

import { initialize, saveReport } from '../../slices/plugins/report';
import { NewReportFormProps } from '../../types/plugins/report';
import CategoryWidget from './CategoryWidget';
import ToolsEdit from './ToolsEdit';
import TypeWidget from './TypeWidget';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const NewReportForm = ({
  analysisReportId,
  dispatch,
  onSave,
  FileUpload,
  imagePreviewScale,
  categories,
  types,
}: NewReportFormProps) => {
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);

  const selectCategory = (value: string) => {
    !selectedCategories.includes(value)
      ? setSelectedCategories([...selectedCategories, value])
      : setSelectedCategories(without(selectedCategories, value));
  };
  const selectType = (value: string) => {
    !selectedTypes.includes(value)
      ? setSelectedTypes([...selectedTypes, value])
      : setSelectedTypes(without(selectedTypes, value));
  };

  const [reportGeneration, setReportGeneration] = React.useState([
    { scriptPath: '', description: '' },
  ]);

  const onFinish = (data: any) => {
    data.categories = selectedCategories;
    data.types = selectedTypes;

    dispatch(saveReport(data));
    onSave(data.name, data.description, data.id, data.categories, data.types, reportGeneration);
  };

  return (
    <Form layout={'vertical'} onFinish={onFinish} className="new-report-form">
      <Form.Item label="1. Report Name" name="name">
        <Input placeholder="type name here" type="text" aria-label="Report Name" />
      </Form.Item>
      <Form.Item label="2. Report Description" name="description">
        <TextArea rows={10} aria-label="Report Description" />
      </Form.Item>
      <Form.Item label="3. Categories" aria-label="Analysis Categories">
        <CategoryWidget
          allCategories={categories}
          mode={'create'}
          selectedCategories={selectedCategories}
          toggleSelectCategory={selectCategory}
        />
      </Form.Item>
      <Form.Item label="4. Types" aria-label="Analysis Types">
        <TypeWidget
          allTypes={types}
          mode={'create'}
          selectedTypes={selectedTypes}
          toggleSelectType={selectType}
        />
      </Form.Item>
      <Form.Item label="5. Add Assets">
        <p className="smallInfo">
          the title and the asset description can be edited later while browing throuhg the analysis
        </p>
        <div style={{ margin: '10px 0' }}>
          <Text strong>Target Storage</Text>
          <Select
            style={{ display: 'inline-block', margin: '0 10px', width: '20em' }}
            showSearch
            placeholder="Select storage"
            defaultValue={['default']}
          >
            <Option value="default">Default</Option>
          </Select>
        </div>
        {FileUpload()}
      </Form.Item>
      <Form.Item label="6. Tools">
        <ToolsEdit tools={reportGeneration} onUpdateTools={(tools) => setReportGeneration(tools)} />
      </Form.Item>
      <Form.Item className="action-buttons">
        <span className="action-buttons">
          <Button
            style={{ marginRight: '10px' }}
            type="default"
            aria-label="Cancel"
            className="cancel-button"
            onClick={() =>
              dispatch(
                initialize({
                  scale: imagePreviewScale,
                  analysisReportId: analysisReportId ? [analysisReportId] : [],
                })
              )
            }
          >
            Cancel
          </Button>
          <Button
            aria-label="Save"
            type="primary"
            htmlType="submit"
            className="save-button"
            size="large"
          >
            Save
          </Button>
        </span>
      </Form.Item>
    </Form>
  );
};

export default NewReportForm;
