import { Button, Checkbox } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import FriendlyTimeAgo from '../FriendlyDate';
import { getUsername } from '../../../shared/utils';
import moment from 'moment';

import { selectAsset, openFileUploadDialog } from '../../slices/plugins/report';

import { ReportAssetProps } from '../../types/plugins/report';

const ReportAssets = ({
  dispatch,
  mode,
  analysisReport,
  selectedAssets,
  imagePreviewScale,
  currentlyBeingEditedAnalysisReportId,
}: ReportAssetProps) => {
  return (
    <section aria-label="Report Assets" className="assets">
      {((mode === 'create' && analysisReport.id === undefined) ||
        (mode === 'edit' &&
          'id' in analysisReport &&
          currentlyBeingEditedAnalysisReportId === analysisReport.id)) && (
        <div style={{ display: 'flex', width: '100%' }}>
          <Button
            type="link"
            style={{ marginLeft: 'auto', marginBottom: '10px' }}
            onClick={() => dispatch(openFileUploadDialog())}
          >
            Add Files to Report
          </Button>
        </div>
      )}
      <ul
        style={{
          gridTemplateColumns: `repeat(${10 - imagePreviewScale / 10}, 1fr)`,
          gridAutoRows: `minmax(100px, auto)`,
        }}
      >
        {analysisReport.assets.map((asset, i) => {
          const minThumbnailSize = 100;
          return (
            <li
              key={asset.id}
              className="asset-container"
              aria-label={asset.name !== '' ? asset.name : asset.filename}
            >
              <div
                aria-label="Report File"
                className={`asset ${
                  selectedAssets &&
                  selectedAssets.findIndex(v => v === asset.id) > -1
                    ? 'selected'
                    : ''
                }`}
                style={{
                  height:
                    (minThumbnailSize +
                      imagePreviewScale * (imagePreviewScale / 30)) /
                    1.6,
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
                    dispatch(selectAsset({ assetId: asset.id }));
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
                        dispatch(selectAsset({ assetId: asset.id }));
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
