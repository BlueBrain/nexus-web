import {
  LeftSquareFilled,
  FolderAddOutlined,
  EditOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Input, Modal } from 'antd';
import { without, intersection } from 'lodash';
import * as React from 'react';
import { getUsername } from '../../../shared/utils';
import FriendlyTimeAgo from '../FriendlyDate';
import './AnalysisPlugin.less';
import * as moment from 'moment';
import CategoryWidget from './CategoryWidget';
import TypeWidget from './TypeWidget';
import TypeEditWidget from './TypeEditWidget';
import CategoryEditWidget from './CategoryEditWidget';
import ReportAssets from './ReportAssets';

import NewReportForm from './NewReportForm';
import {
  editReport,
  changeAnalysisName,
  closeFileUploadDialog,
  initialize,
  changeAnalysisDescription,
  addReport,
  changeTools,
} from '../../slices/plugins/report';

const { Panel } = Collapse;

import {
  AnalysisPluginProps,
  SoftwareContribution,
} from '../../types/plugins/report';
import Tools from './Tools';
import ToolsEdit from './ToolsEdit';

const AnalysisPlugin = ({
  analysisResourceType,
  containerId,
  analysisReports,
  onSave,
  onDelete,
  FileUpload,
  imagePreviewScale,
  mode,
  selectedAnalysisReports,
  currentlyBeingEditedAnalysisReportDescription,
  currentlyBeingEditedAnalysisReportCategories,
  currentlyBeingEditedAnalysisReportTypes,
  currentlyBeingEditedAnalysisReportId,
  currentlyBeingEditedAnalysisReportName,
  currentlyBeingEditedAnalysisReportTools,
  selectedAssets,
  isUploadAssetDialogOpen,
  dispatch,
  onClickRelatedResource,
}: AnalysisPluginProps) => {
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
  const fileUploadModal = (
    <Modal
      visible={isUploadAssetDialogOpen}
      footer={false}
      onCancel={() => dispatch(closeFileUploadDialog())}
      className="file-upload-modal"
      destroyOnClose={true}
    >
      {FileUpload(currentlyBeingEditedAnalysisReportId)}
    </Modal>
  );

  return (
    <>
      {mode === 'create' && (
        <NewReportForm
          dispatch={dispatch}
          onSave={onSave}
          FileUpload={FileUpload}
          analysisReportId={
            currentlyBeingEditedAnalysisReportId
              ? currentlyBeingEditedAnalysisReportId
              : undefined
          }
          imagePreviewScale={imagePreviewScale}
        />
      )}
      {mode !== 'create' && (
        <div className="analysis">
          {analysisResourceType !== 'individual_report' && (
            <>
              <Button
                type="primary"
                className="addReportButton"
                title="Add Report"
                aria-label="Add Report"
                onClick={() => {
                  dispatch(addReport());
                }}
              >
                Add Report
                <FolderAddOutlined />
              </Button>
              <CategoryWidget
                dispatch={dispatch}
                mode={mode}
                selectedCategories={selectedCategories}
                selectCategory={selectCategory}
                analysisReports={analysisReports}
              />
              <TypeWidget
                dispatch={dispatch}
                mode={mode}
                selectedTypes={selectedTypes}
                selectType={selectType}
                analysisReports={analysisReports}
              />
            </>
          )}
          <>
            {fileUploadModal}
            {analysisReports
              .filter(a => {
                if (['edit', 'view'].includes(mode) && a.id !== undefined) {
                  if (
                    selectedCategories.length > 0 &&
                    a.categories !== undefined &&
                    intersection(selectedCategories, a.categories).length === 0
                  ) {
                    return false;
                  }
                  if (
                    selectedTypes.length > 0 &&
                    a.types !== undefined &&
                    intersection(selectedTypes, a.types).length === 0
                  ) {
                    return false;
                  }
                }
                return true;
              })
              .map((analysisReport, i) => (
                <Collapse
                  expandIconPosition="right"
                  key={i}
                  style={{ marginBottom: '40px', border: '2px solid #d9d9d9' }}
                >
                  <Panel
                    style={{ border: 0 }}
                    key={i}
                    header={
                      <>
                        {analysisReport.name}
                        {!!analysisReport.categories &&
                          analysisReport.categories.length > 0 && (
                            <span
                              className="cat"
                              style={{
                                fontWeight: 'bold',
                              }}
                            >
                              {analysisReport.categories.map((c, i) => (
                                <span
                                  key={i}
                                  style={{ backgroundColor: '#E6F7FF' }}
                                >
                                  {c}
                                </span>
                              ))}{' '}
                            </span>
                          )}
                        {!!analysisReport.types &&
                          analysisReport.types.length > 0 && (
                            <span className="types">
                              {analysisReport.types.map((t, i) => (
                                <span
                                  key={i}
                                  style={{
                                    backgroundColor: '#F5F5F5',
                                    borderColor: '#F5F5F5',
                                    outline: 'none',
                                  }}
                                >
                                  {t}
                                </span>
                              ))}{' '}
                            </span>
                          )}
                      </>
                    }
                  >
                    <h1
                      aria-label="Report Name"
                      style={{
                        display: 'flex',
                        ...(mode === 'view' && { marginBottom: '0.1em' }),
                      }}
                    >
                      {mode === 'edit' &&
                        'id' in analysisReport &&
                        currentlyBeingEditedAnalysisReportId ===
                          analysisReport.id && (
                          <>
                            <Input
                              type="text"
                              placeholder="Report Name"
                              aria-label="Report Name"
                              required={true}
                              value={currentlyBeingEditedAnalysisReportName}
                              onChange={e =>
                                dispatch(
                                  changeAnalysisName({ name: e.target.value })
                                )
                              }
                              style={{ maxWidth: '900px' }}
                            />
                            <div
                              className="actions"
                              style={{
                                marginLeft: 'auto',
                                marginRight: '20px',
                              }}
                            >
                              <Button
                                style={{ marginRight: '10px' }}
                                type="default"
                                aria-label="Cancel"
                                onClick={() =>
                                  dispatch(
                                    initialize({
                                      scale: imagePreviewScale,
                                      analysisReportId: analysisReport.id
                                        ? [analysisReport.id]
                                        : [],
                                    })
                                  )
                                }
                              >
                                Cancel
                              </Button>
                              <Button
                                type="primary"
                                aria-label="Save"
                                onClick={() => {
                                  currentlyBeingEditedAnalysisReportName &&
                                    onSave(
                                      currentlyBeingEditedAnalysisReportName,
                                      currentlyBeingEditedAnalysisReportDescription,
                                      analysisReport.id,
                                      currentlyBeingEditedAnalysisReportCategories,
                                      currentlyBeingEditedAnalysisReportTypes,
                                      currentlyBeingEditedAnalysisReportTools
                                    );
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </>
                        )}
                    </h1>
                    {mode === 'view' && (
                      <>
                        <div
                          className="report-header"
                          style={{ display: 'flex' }}
                        >
                          <section
                            aria-label="Analysis Metadata"
                            className="analysis-metadata"
                          >
                            <label>
                              Created{' '}
                              {analysisReport.createdAt && (
                                <FriendlyTimeAgo
                                  date={moment(analysisReport.createdAt)}
                                />
                              )}
                            </label>{' '}
                            <label>
                              by{' '}
                              <span>
                                {analysisReport.createdBy &&
                                  getUsername(analysisReport.createdBy)}
                              </span>
                            </label>
                          </section>
                          <section
                            className="report-actions"
                            style={{ marginLeft: 'auto', marginRight: 0 }}
                          >
                            <Button
                              type="default"
                              aria-label="editReport"
                              style={{ background: 'transparent' }}
                              icon={<EditOutlined />}
                              title="Edit report"
                              onClick={() =>
                                analysisReport.id &&
                                dispatch(
                                  editReport({
                                    analysisId: analysisReport.id,
                                    analaysisName: analysisReport.name,
                                    analysisDescription:
                                      analysisReport.description,
                                    categories: analysisReport.categories,
                                    types: analysisReport.types,
                                    tools: (analysisReport.contribution?.filter(
                                      c =>
                                        [c.agent]
                                          .flat()
                                          .find(a =>
                                            [a['@type']]
                                              .flat()
                                              .includes('Software')
                                          )
                                    ) as SoftwareContribution[])?.map(s => ({
                                      scriptPath: s.repository,
                                      description: s.description,
                                    })),
                                  })
                                )
                              }
                            ></Button>
                            {analysisResourceType === 'individual_report' &&
                              containerId && (
                                <>
                                  {' '}
                                  <Button
                                    type="default"
                                    onClick={() =>
                                      onClickRelatedResource(containerId)
                                    }
                                    style={{
                                      padding: '4px',
                                      maxWidth: '230px',
                                      overflow: 'hidden',
                                      background: 'transparent',
                                    }}
                                    aria-label="Go to parent resource"
                                  >
                                    Navigate to{' '}
                                    {analysisReport.containerName
                                      ? analysisReport.containerName
                                      : 'parent resource'}
                                    &nbsp;&#x2197;
                                  </Button>
                                </>
                              )}
                            {analysisResourceType !== 'individual_report' && (
                              <Button
                                type="default"
                                title="Open discussion on report resource"
                                aria-label="Open discussion on report resource"
                                icon={<MessageOutlined />}
                                style={{ background: 'transparent' }}
                                onClick={() =>
                                  analysisReport.id &&
                                  onClickRelatedResource(analysisReport.id)
                                }
                              ></Button>
                            )}
                          </section>
                        </div>
                      </>
                    )}
                    <p
                      aria-label="Report Description"
                      style={{
                        width: '100%',
                        marginRight: '50px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {(mode === 'view' ||
                        ('id' in analysisReport &&
                          currentlyBeingEditedAnalysisReportId !==
                            analysisReport.id)) &&
                        analysisReport.description}

                      {mode === 'edit' &&
                        'id' in analysisReport &&
                        currentlyBeingEditedAnalysisReportId ===
                          analysisReport.id && (
                          <Input.TextArea
                            placeholder="Report Description"
                            aria-label="Report Description"
                            value={
                              currentlyBeingEditedAnalysisReportDescription
                            }
                            rows={10}
                            style={{ maxWidth: '900px' }}
                            onChange={e =>
                              dispatch(
                                changeAnalysisDescription({
                                  description: e.currentTarget.value,
                                })
                              )
                            }
                          />
                        )}
                    </p>
                    {mode === 'edit' && (
                      <section>
                        <CategoryEditWidget
                          dispatch={dispatch}
                          currentlyBeingEditedAnalysisReportCategories={
                            currentlyBeingEditedAnalysisReportCategories
                          }
                        />
                        <TypeEditWidget
                          dispatch={dispatch}
                          currentlyBeingEditedAnalysisReportTypes={
                            currentlyBeingEditedAnalysisReportTypes
                          }
                        />
                      </section>
                    )}
                    {mode === 'edit' && (
                      <>
                        <h4
                          style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '136%',
                            color: '#bfbfbf',
                          }}
                        >
                          Tools
                        </h4>
                        <ToolsEdit
                          tools={
                            currentlyBeingEditedAnalysisReportTools !==
                            undefined
                              ? currentlyBeingEditedAnalysisReportTools
                              : []
                          }
                          onUpdateTools={tools =>
                            dispatch(changeTools({ tools }))
                          }
                        />
                      </>
                    )}
                    {mode === 'view' && (
                      <Tools
                        tools={(analysisReport.contribution?.filter(c =>
                          [c.agent]
                            .flat()
                            .find(a => [a['@type']].flat().includes('Software'))
                        ) as SoftwareContribution[])?.map(s => ({
                          scriptPath: s.repository,
                          description: s.description,
                        }))}
                      />
                    )}
                    <hr style={{ border: '1px solid #D9D9D9' }} />
                    <section className="actionsPanel" aria-label="actions">
                      {mode === 'view' && (
                        <>
                          <Button
                            type="default"
                            hidden={true}
                            onClick={() => console.log('download')}
                            icon={<LeftSquareFilled />}
                          >
                            Download
                          </Button>
                        </>
                      )}
                      {mode === 'edit' &&
                        selectedAssets &&
                        selectedAssets.length > 0 && (
                          <Button
                            type="primary"
                            danger
                            style={{ marginLeft: '20px' }}
                            aria-label="Delete"
                            onClick={() => {
                              onDelete();
                            }}
                          >
                            Delete
                          </Button>
                        )}
                    </section>
                    <ReportAssets
                      mode={mode}
                      imagePreviewScale={imagePreviewScale}
                      dispatch={dispatch}
                      analysisReport={analysisReport}
                      selectedAssets={selectedAssets}
                      currentlyBeingEditedAnalysisReportId={
                        currentlyBeingEditedAnalysisReportId
                          ? currentlyBeingEditedAnalysisReportId
                          : undefined
                      }
                    />
                  </Panel>
                </Collapse>
              ))}
          </>
        </div>
      )}
    </>
  );
};

export default AnalysisPlugin;
