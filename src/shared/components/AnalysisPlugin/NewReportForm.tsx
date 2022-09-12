import * as React from 'react';
import { Form, Button, Input, Select, Typography, Tooltip } from 'antd';
import './NewReportForm.less';
import CategoryWidget from './CategoryWidget';
import TypeWidget from './TypeWidget';
import { without } from 'lodash';
import { NewReportFormProps } from '../../types/plugins/report';
import { initialize, saveReport } from '../../slices/plugins/report';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const NewReportForm = ({
  analysisReportId,
  dispatch,
  onSave,
  FileUpload,
  imagePreviewScale,
}: NewReportFormProps) => {
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
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
    onSave(
      data.name,
      data.description,
      data.id,
      data.categories,
      data.types,
      reportGeneration
    );
  };
  return (
    <Form layout={'vertical'} onFinish={onFinish} className="new-report-form">
      <Form.Item label="1. Report Name" name="name">
        <Input
          placeholder="type name here"
          type="text"
          aria-label="Analysis Name"
        />
      </Form.Item>
      <Form.Item label="2. Report Description" name="description">
        <TextArea rows={10} aria-label="Analysis Description" />
      </Form.Item>
      <Form.Item label="3. Categories" aria-label="Analysis Categories">
        <CategoryWidget
          dispatch={dispatch}
          mode={'create'}
          selectedCategories={selectedCategories}
          selectCategory={selectCategory}
        />
      </Form.Item>
      <Form.Item label="4. Types" aria-label="Analysis Types">
        <TypeWidget
          dispatch={dispatch}
          mode={'create'}
          selectedTypes={selectedTypes}
          selectType={selectType}
        />
      </Form.Item>
      <Form.Item label="5. Add Assets">
        <p className="smallInfo">
          the title and the asset description can be edited later while browing
          throuhg the analysis
        </p>
        <div style={{ margin: '10px 0' }}>
          <Text strong>Source</Text>
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
      <Form.Item label="6. Report Generation">
        <p className="smallInfo">
          Include links to scripts that were used to generate the contents of
          the report
        </p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {reportGeneration.map((g, ix) => (
            <li key={ix} style={{ margin: 0, padding: 0 }}>
              <div>
                <label>
                  Script Location{' '}
                  <Tooltip title="URL to the location of your script ideally pointing to a specific revision">
                    <InfoCircleOutlined />
                  </Tooltip>
                  <Input
                    placeholder="http://github.com/..."
                    type="text"
                    aria-label="Script location"
                    value={g.scriptPath}
                    onChange={v =>
                      setReportGeneration(
                        reportGeneration.map((r, ix2) => {
                          if (ix === ix2) {
                            return { ...r, scriptPath: v.target.value };
                          }
                          return r;
                        })
                      )
                    }
                  />
                </label>
              </div>

              <div style={{ marginTop: '10px' }}>
                <label>
                  How did you run the script?{' '}
                  <Tooltip title="Any specific guidance for how the script was run">
                    <InfoCircleOutlined />
                  </Tooltip>
                  <TextArea
                    rows={4}
                    aria-label="Analysis Description"
                    value={g.description}
                    onChange={v =>
                      setReportGeneration(
                        reportGeneration.map((r, ix2) => {
                          if (ix === ix2) {
                            return {
                              ...r,
                              description: v.target.value,
                            };
                          }
                          return r;
                        })
                      )
                    }
                  />
                </label>
              </div>
              <div style={{ width: '100%', display: 'flex' }}>
                <Button
                  onClick={e => {
                    e.preventDefault();
                    setReportGeneration(reports =>
                      reports.filter((r, ix2) => ix !== ix2)
                    );
                  }}
                  style={{ margin: '4px 0 0 auto' }}
                >
                  Remove Tool
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button
          aria-label="Add tool"
          type="primary"
          htmlType="submit"
          className="add-button"
          size="middle"
          onClick={e => {
            e.preventDefault();
            setReportGeneration(g => [
              ...g,
              { scriptPath: '', description: '' },
            ]);
          }}
        >
          Add
        </Button>
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
