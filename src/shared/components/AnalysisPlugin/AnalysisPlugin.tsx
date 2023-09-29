import {
  LeftSquareFilled,
  FolderAddOutlined,
  EditOutlined,
  MessageOutlined,
  CalendarOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Input, Modal } from 'antd';
import { without, intersection, uniq, flatten, map } from 'lodash';
import * as React from 'react';
import { getUsername } from '../../../shared/utils';
import FriendlyTimeAgo from '../FriendlyDate';
import './AnalysisPlugin.scss';
import moment from 'moment';
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

import {
  AnalysisPluginProps,
  SoftwareContribution,
} from '../../types/plugins/report';
import Tools from './Tools';
import ToolsEdit from './ToolsEdit';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';

const AnalysisPlugin = ({
  analysisResourceType,
  containerId,
  containerResourceTypes,
  analysisReports,
  onSave,
  onDelete,
  FileUpload,
  imagePreviewScale,
  mode,
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
  const defaultactivekey =
    analysisResourceType === 'individual_report' ? '0' : -1;

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
      open={isUploadAssetDialogOpen}
      footer={false}
      onCancel={() => dispatch(closeFileUploadDialog())}
      className="file-upload-modal"
      destroyOnClose={true}
    >
      {FileUpload(currentlyBeingEditedAnalysisReportId)}
    </Modal>
  );
  const {
    analysisPluginTypes: allReportTypes,
    analysisPluginCategories: allReportCategories,
  } = useSelector((state: RootState) => state.config);

  const availableReportTypes = (intersection(
    uniq(flatten(map(analysisReports, 'types'))),
    allReportTypes.map(({ label }) => label)
  ) as string[]).map(l => {
    const typeDescription = allReportTypes.find(t => t.label === l)
      ?.description as string;
    return { label: l, description: typeDescription };
  });

  const categoriesDefinedForContainerTypes = intersection(
    Object.keys(allReportCategories),
    containerResourceTypes
  );

  const allReportCategoriesMatchingContainerType =
    categoriesDefinedForContainerTypes.length > 0
      ? allReportCategories[categoriesDefinedForContainerTypes[0]]
      : [];

  const availableReportCategories = (intersection(
    uniq(flatten(map(analysisReports, 'categories'))),
    allReportCategoriesMatchingContainerType.map(({ label }) => label)
  ) as string[]).map(l => {
    const categoryDescription = allReportCategoriesMatchingContainerType.find(
      c => c.label === l
    )?.description as string;
    return { label: l, description: categoryDescription };
  });

  return (
    <>
      {mode === 'create' && (
        <NewReportForm
          categories={allReportCategoriesMatchingContainerType}
          types={allReportTypes}
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
                className="add-button add-report-button"
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
                allCategories={allReportCategoriesMatchingContainerType}
                availableCategories={availableReportCategories}
                mode={mode}
                selectedCategories={selectedCategories}
                toggleSelectCategory={selectCategory}
              />

              <TypeWidget
                allTypes={allReportTypes}
                availableTypes={availableReportTypes}
                mode={mode}
                selectedTypes={selectedTypes}
                toggleSelectType={selectType}
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
                    intersection(selectedCategories, a.categories).length !==
                      selectedCategories.length
                  ) {
                    return false;
                  }
                  if (
                    selectedTypes.length > 0 &&
                    a.types !== undefined &&
                    intersection(selectedTypes, a.types).length !==
                      selectedTypes.length
                  ) {
                    return false;
                  }
                }
                return true;
              })
              .map((analysisReport, i) => (
                <Collapse
                  defaultActiveKey={defaultactivekey}
                  expandIconPosition="right"
                  key={i}
                  style={{
                    marginBottom: '40px',
                    border: '2px solid #d9d9d9',
                  }}
                  items={[
                    {
                      key: i,
                      label: (
                        <>
                          {analysisReport.name}
                          {!!analysisReport.categories &&
                            analysisReport.categories.length > 0 && (
                              <span
                                className="cat"
                                style={{
                                  fontWeight: 500,
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
                      ),
                      children: (
                        <>
                          {mode === 'edit' &&
                            'id' in analysisReport &&
                            currentlyBeingEditedAnalysisReportId ===
                              analysisReport.id && (
                              <div style={{ display: 'flex' }}>
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
                              </div>
                            )}
                          {mode === 'edit' &&
                            'id' in analysisReport &&
                            currentlyBeingEditedAnalysisReportId ===
                              analysisReport.id && (
                              <>
                                <h4
                                  style={{
                                    marginTop: '10px',
                                    color: '#003a8c',
                                  }}
                                >
                                  Name
                                </h4>
                                <Input
                                  type="text"
                                  placeholder="Report Name"
                                  aria-label="Report Name"
                                  required={true}
                                  value={currentlyBeingEditedAnalysisReportName}
                                  onChange={e =>
                                    dispatch(
                                      changeAnalysisName({
                                        name: e.target.value,
                                      })
                                    )
                                  }
                                  style={{ maxWidth: '900px' }}
                                />
                              </>
                            )}
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
                                  <span className="created">
                                    <CalendarOutlined />{' '}
                                    <span style={{ fontWeight: 'bold' }}>
                                      {analysisReport.createdBy &&
                                        getUsername(analysisReport.createdBy)}
                                    </span>
                                    <label>
                                      {' '}
                                      {analysisReport.createdAt && (
                                        <FriendlyTimeAgo
                                          date={moment(
                                            analysisReport.createdAt
                                          )}
                                        />
                                      )}
                                    </label>
                                  </span>
                                  <span
                                    className="updated"
                                    style={{ marginLeft: '8px' }}
                                  >
                                    <span>
                                      <SyncOutlined />{' '}
                                      <span style={{ fontWeight: 'bold' }}>
                                        {analysisReport.updatedBy &&
                                          getUsername(analysisReport.updatedBy)}
                                      </span>
                                      <label>
                                        {' '}
                                        {analysisReport.updatedAt && (
                                          <FriendlyTimeAgo
                                            date={moment(
                                              analysisReport.updatedAt
                                            )}
                                          />
                                        )}
                                      </label>
                                    </span>
                                  </span>
                                </section>
                                <section
                                  className="report-actions"
                                  style={{ marginLeft: 'auto', marginRight: 0 }}
                                >
                                  <Button
                                    type="default"
                                    aria-label="Edit Report"
                                    style={{
                                      background: 'transparent',
                                    }}
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
                                          ) as SoftwareContribution[])?.map(
                                            s => ({
                                              scriptPath: s.repository,
                                              description: s.description,
                                            })
                                          ),
                                        })
                                      )
                                    }
                                  ></Button>
                                  {analysisResourceType ===
                                    'individual_report' &&
                                    containerId && (
                                      <>
                                        {' '}
                                        <Button
                                          type="default"
                                          onClick={() =>
                                            onClickRelatedResource(containerId)
                                          }
                                          style={{
                                            padding: '1',
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
                                  {analysisResourceType !==
                                    'individual_report' && (
                                    <Button
                                      type="default"
                                      title="Open discussion on report resource"
                                      aria-label="Open discussion on report resource"
                                      icon={<MessageOutlined />}
                                      style={{
                                        maxWidth: '230px',
                                        overflow: 'hidden',
                                        background: 'transparent',
                                      }}
                                      onClick={() =>
                                        analysisReport.id &&
                                        onClickRelatedResource(
                                          analysisReport.id
                                        )
                                      }
                                    ></Button>
                                  )}
                                </section>
                              </div>
                            </>
                          )}

                          {(mode === 'view' ||
                            ('id' in analysisReport &&
                              currentlyBeingEditedAnalysisReportId !==
                                analysisReport.id)) &&
                            analysisReport.description !== undefined &&
                            analysisReport.description !== '' && (
                              <>
                                <hr
                                  style={{
                                    border: 0,
                                    borderTop: '1px solid #D9D9D9',
                                  }}
                                />
                                <p
                                  aria-label="Report Description"
                                  style={{
                                    width: '100%',
                                    marginRight: '50px',
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {analysisReport.description}
                                </p>
                                <hr
                                  style={{
                                    border: 0,
                                    borderTop: '1px solid #D9D9D9',
                                  }}
                                />
                              </>
                            )}

                          {mode === 'edit' &&
                            'id' in analysisReport &&
                            currentlyBeingEditedAnalysisReportId ===
                              analysisReport.id && (
                              <>
                                <h4
                                  style={{
                                    marginTop: '10px',
                                    color: '#003a8c',
                                  }}
                                >
                                  Description
                                </h4>
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
                              </>
                            )}

                          {mode === 'edit' && (
                            <section>
                              <CategoryEditWidget
                                allCategories={
                                  allReportCategoriesMatchingContainerType
                                }
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
                                  color: '#003a8c',
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
                                  .find(a =>
                                    [a['@type']].flat().includes('Software')
                                  )
                              ) as SoftwareContribution[])?.map(s => ({
                                scriptPath: s.repository,
                                description: s.description,
                              }))}
                              onAddTool={() => {
                                analysisReport.id &&
                                  dispatch(
                                    editReport({
                                      analysisId: analysisReport.id,
                                      analaysisName: analysisReport.name,
                                      analysisDescription:
                                        analysisReport.description,
                                      categories: analysisReport.categories,
                                      types: analysisReport.types,
                                      tools: [
                                        { scriptPath: '', description: '' },
                                      ],
                                    })
                                  );
                              }}
                            />
                          )}
                          <section
                            className="actionsPanel"
                            aria-label="actions"
                          >
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
                          <div style={{ color: '#888888' }}>
                            Total: {analysisReport.assets.length} assets
                          </div>
                          <br />
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
                        </>
                      ),
                    },
                  ]}
                />
              ))}
          </>
        </div>
      )}
    </>
  );
};

export default AnalysisPlugin;
