import * as React from 'react';
import { Button, Checkbox } from 'antd';
import { without, flatten, map, uniq, intersection } from 'lodash';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import FriendlyTimeAgo from '../FriendlyDate';
import { getUsername } from '../../../shared/utils';
import * as moment from 'moment';

import {
  ActionType,
  AnalysesAction,
} from '../../../shared/containers/AnalysisPlugin/AnalysisPluginContainer';

import { AnalysisReport } from '../../../shared/components/AnalysisPlugin/AnalysisPlugin';

type ReportAssetProps = {
  analysisReport: AnalysisReport;
  mode: 'view' | 'edit' | 'create';
  selectedAssets?: string[];
  imagePreviewScale: number;
  currentlyBeingEditedAnalysisReportId?: string;
  dispatch: (action: AnalysesAction) => void;
};

const ReportAssets = ({
  dispatch,
  mode,
  analysisReport,
    selectedAssets,
  imagePreviewScale,
  currentlyBeingEditedAnalysisReportId,
}: ReportAssetProps) => {
  return (
    <section aria-label="Analysis Assets" className="assets">
      {((mode === 'create' && analysisReport.id === undefined) ||
        (mode === 'edit' &&
          'id' in analysisReport &&
          currentlyBeingEditedAnalysisReportId === analysisReport.id)) && (
        <div style={{ display: 'flex', width: '100%' }}>
          <Button
            type="link"
            style={{ marginLeft: 'auto', marginBottom: '10px' }}
            onClick={() =>
              dispatch({ type: ActionType.OPEN_FILE_UPLOAD_DIALOG })
            }
          >
            Add Files to Analysis
          </Button>
        </div>
      )}
      <ul>
        {analysisReport.assets.map((asset, i) => {
          const minThumbnailSize = 100;
          return (
            <li
              key={asset.id}
              className="asset-container"
              aria-label={asset.name !== '' ? asset.name : asset.filename}
            >
              <div
                aria-label="Analysis File"
                className={`asset ${
                  selectedAssets &&
                  selectedAssets.findIndex(v => v === asset.id) > -1
                    ? 'selected'
                    : ''
                }`}
                style={{
                  height:
                    minThumbnailSize +
                    imagePreviewScale * (imagePreviewScale / 30),
                  width:
                    minThumbnailSize +
                    imagePreviewScale * (imagePreviewScale / 30),
                }}
                onClick={() => {
                  if (
                    mode === 'edit' &&
                    'id' in analysisReport &&
                    currentlyBeingEditedAnalysisReportId === analysisReport.id
                  ) {
                    dispatch({
                      type: ActionType.SELECT_ASSET,
                      payload: { assetId: asset.id },
                    });
                  }
                }}
              >
                {asset.preview({
                  mode: mode === 'create' ? 'edit' : mode,
                })}
                {mode === 'edit' &&
                  'id' in analysisReport &&
                  currentlyBeingEditedAnalysisReportId ===
                    analysisReport.id && (
                    <Checkbox
                      checked={
                        selectedAssets &&
                        selectedAssets.some(v => v === asset.id)
                      }
                      className="selectedCheckbox"
                      onClick={e => {
                        e.stopPropagation();
                      }}
                      onChange={e => {
                        dispatch({
                          type: ActionType.SELECT_ASSET,
                          payload: { assetId: asset.id },
                        });
                      }}
                    ></Checkbox>
                  )}
              </div>
              <div
                aria-label="Asset Details"
                className="asset-details"
                style={{
                  width:
                    minThumbnailSize +
                    imagePreviewScale * (imagePreviewScale / 30),
                }}
              >
                <label
                  className="asset-details__name"
                  title={asset.name !== '' ? asset.name : asset.filename}
                >
                  {asset.name ? asset.name : asset.filename}
                </label>
                <div>
                  <label className="asset-details__last-updated-by">
                    <UserOutlined />
                    &nbsp;
                    {asset.lastUpdatedBy && getUsername(asset.lastUpdatedBy)}
                  </label>
                  <label
                    className="asset-details__last-updated"
                    aria-label="Last Updated"
                  >
                    <CalendarOutlined />
                    &nbsp;
                    <FriendlyTimeAgo date={moment(asset.lastUpdated)} />
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ReportAssets;
