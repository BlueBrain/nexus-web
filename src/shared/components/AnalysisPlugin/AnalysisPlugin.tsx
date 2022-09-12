import {
  LeftSquareFilled,
  UpOutlined,
  FolderAddOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { Button, Collapse, Input, Modal } from 'antd'
import { without, intersection } from 'lodash'
import * as React from 'react'
import { getUsername } from '../../../shared/utils'
import FriendlyTimeAgo from '../FriendlyDate'
import './AnalysisPlugin.less'
import * as moment from 'moment'
import CategoryWidget from './CategoryWidget'
import TypeWidget from './TypeWidget'
import TypeEditWidget from './TypeEditWidget'
import CategoryEditWidget from './CategoryEditWidget'
import ReportAssets from './ReportAssets'

import NewReportForm from './NewReportForm'
import {
  editReport,
  changeAnalysisName,
  closeFileUploadDialog,
  changeScale,
  initialize,
  changeAnalysisDescription,
  addReport,
} from '../../slices/plugins/report'
g
const { Panel } = Collapse

import { AnalysisPluginProps } from '../../types/plugins/report'

const CATEGORIES = {
  circuit: [
    'Anatomical',
    'Connectivity',
    'Volumetric',
    'Morphometric',
    'Synapse',
  ],
  simulation: ['Spiking', 'Soma voltage', 'LFP', 'VSD', 'Plasticity'],
}
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
  selectedAssets,
  isUploadAssetDialogOpen,
  dispatch,
  onClickRelatedResource,
}: AnalysisPluginProps) => {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  )
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])

  const handleOpenPanel = () => {
    setOpenPanel(analysisReports.length)
  }

  const selectCategory = (value: string) => {
    !selectedCategories.includes(value)
      ? setSelectedCategories([...selectedCategories, value])
      : setSelectedCategories(without(selectedCategories, value))
  }
  const selectType = (value: string) => {
    !selectedTypes.includes(value)
      ? setSelectedTypes([...selectedTypes, value])
      : setSelectedTypes(without(selectedTypes, value))
  }
  const fileUploadModal = (
    <Modal
      visible={isUploadAssetDialogOpen}
      footer={false}
      onCancel={() => dispatch(closeFileUploadDialog())}
      className='file-upload-modal'
      destroyOnClose={true}
    >
      {FileUpload(currentlyBeingEditedAnalysisReportId)}
    </Modal>
  )

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
        <div className='analysis'>
          {analysisResourceType !== 'individual_report' && (
            <>
              <Button
                type='primary'
                className='addReportButton'
                title='Add Analysis Report'
                aria-label='Add Analysis Report'
                onClick={() => {
                  dispatch(addReport())
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
            {analysisResourceType === 'individual_report' && containerId && (
              <>
                {' '}
                <Button
                  type='link'
                  onClick={() => onClickRelatedResource(containerId)}
                  style={{ padding: 0 }}
                  aria-label='Go to parent resource'
                >
                  <UpOutlined /> Go to parent resource
                </Button>
              </>
            )}

            {fileUploadModal}
            {analysisReports
              .filter(a => {
                if (['edit', 'view'].includes(mode) && a.id !== undefined) {
                  if (
                    selectedCategories.length > 0 &&
                    a.categories !== undefined &&
                    intersection(selectedCategories, a.categories).length === 0
                  ) {
                    return false
                  }
                  if (
                    selectedTypes.length > 0 &&
                    a.types !== undefined &&
                    intersection(selectedTypes, a.types).length === 0
                  ) {
                    return false
                  }
                }
                return true
              })
              .map((analysisReport, i) => (
                <Collapse
                  expandIconPosition='right'
                  key={i}
                  style={{ marginBottom: '40px' }}
                >
                  <Panel
                    key={i}
                    header={
                      <>
                        {analysisReport.name}
                        {!!analysisReport.categories &&
                          analysisReport.categories.length > 0 && (
                            <span className='cat'>
                              {analysisReport.categories.map((c, i) => (
                                <span key={i}>{c}</span>
                              ))}{' '}
                            </span>
                          )}
                        {!!analysisReport.types &&
                          analysisReport.types.length > 0 && (
                            <span className='types'>
                              {analysisReport.types.map((t, i) => (
                                <span key={i}>{t}</span>
                              ))}{' '}
                            </span>
                          )}
                      </>
                    }
                  >
                    <h1
                      aria-label='Analysis Name'
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
                              type='text'
                              placeholder='Analysis Name'
                              aria-label='Analysis Name'
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
                              className='actions'
                              style={{
                                marginLeft: 'auto',
                                marginRight: '20px',
                              }}
                            >
                              <Button
                                style={{ marginRight: '10px' }}
                                type='default'
                                aria-label='Cancel'
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
                                type='primary'
                                aria-label='Save'
                                onClick={() => {
                                  currentlyBeingEditedAnalysisReportName &&
                                    onSave(
                                      currentlyBeingEditedAnalysisReportName,
                                      currentlyBeingEditedAnalysisReportDescription,
                                      analysisReport.id,
                                      currentlyBeingEditedAnalysisReportCategories,
                                      currentlyBeingEditedAnalysisReportTypes
                                    )
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
                        <section
                          aria-label='Analysis Metadata'
                          className='analysis-metadata'
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
                      </>
                    )}
                    <p
                      aria-label='Analysis Description'
                      style={{ width: '100%', marginRight: '50px' }}
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
                            placeholder='Analysis Description'
                            aria-label='Analysis Description'
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
                    <hr style={{ border: '1px solid #D9D9D9' }} />
                    <section className='actionsPanel' aria-label='actions'>
                      {mode === 'view' && (
                        <>
                          <Button
                            type='default'
                            aria-label='editReport'
                            icon={<EditOutlined />}
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
                                })
                              )
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            type='default'
                            hidden={true}
                            onClick={() => console.log('download')}
                            icon={<LeftSquareFilled />}
                          >
                            Download
                          </Button>
                          <Button
                            type='default'
                            aria-label='goToResource'
                            icon={<LinkOutlined />}
                            hidden={
                              analysisResourceType === 'individual_report'
                            }
                            onClick={() =>
                              analysisReport.id &&
                              onClickRelatedResource(analysisReport.id)
                            }
                          >
                            Go to resource
                          </Button>
                        </>
                      )}
                      {mode === 'edit' &&
                        selectedAssets &&
                        selectedAssets.length > 0 && (
                          <Button
                            type='primary'
                            danger
                            style={{ marginLeft: '20px' }}
                            aria-label='Delete'
                            onClick={() => {
                              onDelete()
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
  )
}

export default AnalysisPlugin
