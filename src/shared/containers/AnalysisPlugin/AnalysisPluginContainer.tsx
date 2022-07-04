import { NexusClient, NexusFile, Resource, SparqlView } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import AnalysisPlugin, {
  AnalysisReport,
  Asset,
} from '../../components/AnalysisPlugin/AnalysisPlugin';
import { sparqlQueryExecutor } from '../../utils/querySparqlView';
import { Image } from 'antd';
import FileUploadContainer from '../FileUploadContainer';
import { FileImageOutlined } from '@ant-design/icons';

export const DEFAULT_ANALYSIS_DATA_SPARQL_QUERY = `PREFIX s:<http://schema.org/>
PREFIX prov:<http://www.w3.org/ns/prov#>
PREFIX nsg:<https://neuroshapes.org/>
PREFIX nxv:<https://bluebrain.github.io/nexus/vocabulary/>
SELECT ?analysis_report_id ?analysis_report_name ?analysis_report_description ?created_by ?created_at ?asset_content_url ?asset_encoding_format ?asset_name ?self
WHERE {
  BIND(<{resourceId}> as ?container_resource_id) .
  BIND(<{resourceId}> as ?self) .
  ?container_resource_id        ^prov:wasDerivedFrom       ?analysis_report_id .
  ?analysis_report_id    nsg:name            ?analysis_report_name .
  ?analysis_report_id    s:description       ?analysis_report_description .
  ?analysis_report_id nxv:createdBy ?created_by .
  ?analysis_report_id nxv:createdAt ?created_at .
  OPTIONAL {
      ?analysis_report_id    nsg:distribution    ?distribution .
      OPTIONAL {
        ?distribution nsg:name            ?asset_name .
        ?distribution nsg:contentUrl      ?asset_content_url .
        ?distribution nsg:encodingFormat  ?asset_encoding_format .
      }
  }
}
LIMIT 1000`;

async function fetchImageObjectUrl(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  imageResourceId: string,
  encodingFormat: string
) {
  const rawData = await nexus.File.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(imageResourceId),
    {
      as: 'blob',
    }
  );
  const blob = new Blob([rawData as string], {
    type: encodingFormat,
  });
  return URL.createObjectURL(blob);
}

type AnalysisPluginContainerProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
};

export enum ActionType {
  RESCALE = 'rescale',
  EDIT_ANALYSIS_REPORT = 'edit_analysis_report',
  INITIALIZE = 'initialize',
  SELECT_ASSET = 'select_asset',
  CHANGE_SELECTED_ANALYSIS_REPORTS = 'change_selected_analysis_reports',
  CHANGE_ANALYSIS_NAME = 'change_analysis_name',
  CHANGE_ANALYSIS_DESCRIPTION = 'change_analysis_description',
  OPEN_FILE_UPLOAD_DIALOG = 'open_file_upload_dialog',
  CLOSE_FILE_UPLOAD_DIALOG = 'close_file_upload_dialog',
  ADD_ANALYSIS_REPORT = 'add_analysis_report',
  SET_SELECTED_REPORT_ON_FIRST_LOAD = 'set_selected_report_on_first_load',
}

export type AnalysesAction =
  | { type: ActionType.RESCALE; payload: number }
  | {
      type: ActionType.SET_SELECTED_REPORT_ON_FIRST_LOAD;
      payload?: { analysisReportId: string };
    }
  | {
      type: ActionType.EDIT_ANALYSIS_REPORT;
      payload: {
        analysisId: string;
        analaysisName: string;
        analysisDescription?: string;
      };
    }
  | {
      type: ActionType.INITIALIZE;
      payload: { scale: number; analysisReportId?: string[] };
    }
  | { type: ActionType.SELECT_ASSET; payload: { assetId: string } }
  | {
      type: ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS;
      payload: { analysisReportIds: string[] };
    }
  | { type: ActionType.CHANGE_ANALYSIS_NAME; payload: { name: string } }
  | {
      type: ActionType.CHANGE_ANALYSIS_DESCRIPTION;
      payload: { description: string };
    }
  | { type: ActionType.OPEN_FILE_UPLOAD_DIALOG }
  | { type: ActionType.CLOSE_FILE_UPLOAD_DIALOG }
  | { type: ActionType.ADD_ANALYSIS_REPORT };

const AnalysisPluginContainer = ({
  orgLabel,
  projectLabel,
  resourceId,
}: AnalysisPluginContainerProps) => {
  const nexus = useNexusContext();
  const queryClient = useQueryClient();

  const [unsavedAssets, setUnsavedAssets] = React.useState<Asset[]>([]);

  const apiEndpoint = useSelector(
    (state: RootState) => state.config.apiEndpoint
  );

  const viewSelfId = `${apiEndpoint}/nexus/v1/views/${orgLabel}/${projectLabel}/graph`;

  const { analysisPluginSparqlDataQuery } = useSelector(
    (state: RootState) => state.config
  );

  const analysisSparqlQuery = analysisPluginSparqlDataQuery.replaceAll(
    '{resourceId}',
    resourceId
  );

  type AnalysisAssetSparqlQueryRowResult = {
    id: string;
    key: string;
    analysis_report_id: string;
    analysis_report_name: string;
    analysis_report_description: string;
    created_by: string;
    created_at: string;
    asset_name: string;
    asset_content_url: string;
    asset_encoding_format: string;
    self: {
      type: string;
      value: string;
    };
  };

  const fetchAnalysisData = async (
    viewSelfId: string,
    analysisQuery: string
  ) => {
    const analysisReports: AnalysisReport[] = [];
    const result = await sparqlQueryExecutor(
      nexus,
      analysisQuery,
      {
        _self: viewSelfId,
      } as SparqlView,
      false
    );

    const analysisData = result.items.reduce((analysisReports, current) => {
      const currentRow = current as AnalysisAssetSparqlQueryRowResult;

      /* add new entry if report not in array yet */
      if (
        !analysisReports.some(r => r.id === currentRow['analysis_report_id'])
      ) {
        analysisReports.push({
          id: currentRow['analysis_report_id'],
          description: currentRow['analysis_report_description'],
          name: currentRow['analysis_report_name'],
          createdBy: currentRow['created_by'],
          createdAt: currentRow['created_at'],
          assets: [],
        });
      }

      const report = analysisReports.find(
        r => r.id === currentRow['analysis_report_id']
      );
      const reportIx = analysisReports.findIndex(
        r => r.id === currentRow['analysis_report_id']
      );

      if (currentRow.asset_content_url !== undefined) {
        report?.assets.push({
          analysisReportId: currentRow.analysis_report_id,
          saved: true,
          id: currentRow.asset_content_url,
          name: currentRow.asset_name,
          filePath: currentRow.asset_content_url,
          encodingFormat: currentRow.asset_encoding_format,

          preview: ({ mode }) => {
            return <Image preview={mode === 'view'} />;
          },
        });
      }

      if (report) {
        analysisReports[reportIx] = report;
      }

      return analysisReports;
    }, analysisReports);

    return analysisData;
  };

  const { data: analysisData } = useQuery(
    ['analysis', resourceId],
    async () => fetchAnalysisData(viewSelfId, analysisSparqlQuery),
    {
      onSuccess: data => {
        if (!hasInitializedSelectedReports) {
          dispatch({
            type: ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS,
            payload: {
              analysisReportIds:
                data.length > 0 && data[0].id ? [data[0].id] : [],
            },
          });
        }
      },
    }
  );

  const fetchImages = async () => {
    const imageSourceInitial: Promise<{
      id: string;
      src: string;
      contentUrl: string;
    }>[] = [];
    if (!analysisData) {
      return [];
    }

    const imageSources = Promise.all(
      analysisData.reduce((prev, current) => {
        const assets = current.assets.concat(unsavedAssets).map(async asset => {
          const imageId = asset.filePath.substring(
            asset.filePath.lastIndexOf('/') + 1
          );
          const src = await fetchImageObjectUrl(
            nexus,
            orgLabel,
            projectLabel,
            imageId,
            asset.encodingFormat
          );
          return { src, id: asset.id, contentUrl: asset.filePath };
        });
        return [...prev, ...assets];
      }, imageSourceInitial)
    );

    return imageSources;
  };

  const { data: imageData } = useQuery(
    [
      'analysesImages',
      {
        unsavedAssetsLength: unsavedAssets.length,
        analysisDataLength: analysisData?.length,
        analysisAssets: analysisData?.map(a => a.assets.map(m => m.id)).flat(),
      },
    ],
    fetchImages,
    {
      enabled: analysisData !== undefined && analysisData.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  const mutateAnalysis = useMutation(
    async (data: { id?: string; name: string; description?: string }) => {
      const unsavedAssetsToAddToDistribution = unsavedAssets.map(a => {
        return {
          '@type': 'DataDownload',
          contentUrl: a.filePath,
          encodingFormat: a.encodingFormat,
          contentSize: a.contentSize,
          digest: a.digest,
          name: a.name,
        };
      });

      if (data.id) {
        const resource = (await nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(data.id)
        )) as Resource;

        const distribution = [resource['distribution']].flat(); // TODO: use appropriate cprefix depending on context
        distribution.push(...unsavedAssetsToAddToDistribution);
        resource['distribution'] = distribution;

        return nexus.Resource.update(
          orgLabel,
          projectLabel,
          encodeURIComponent(data.id),
          resource['_rev'],
          {
            ...resource,
            name: data.name,
            'schema:description': data.description,
          }
        );
      }

      // Create new Analysis Report
      return nexus.Resource.create(orgLabel, projectLabel, {
        '@context': [
          {
            '@vocab': 'https://neuroshapes.org/',
            nsg: 'https://neuroshapes.org/',
            nxv: 'https://bluebrain.github.io/nexus/vocabulary/',
            prov: 'http://www.w3.org/ns/prov#',
            schema: 'http://schema.org/',
          },
        ],
        '@type': 'AnalysisReport',
        name: data.name,
        'schema:description': data.description,
        distribution: unsavedAssetsToAddToDistribution,
        'prov:wasDerivedFrom': [{ '@id': resourceId }],
      });
    },
    {
      onSuccess: resource => {
        setUnsavedAssets([]);
        Promise.all([
          queryClient.invalidateQueries(['analysis']),
          queryClient.invalidateQueries(['analysesImages']),
        ]).then(() => {
          dispatch({
            type: ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS,
            payload: { analysisReportIds: [resource['@id']] },
          });
        });
      },
    }
  );

  const onFileUploaded = (file: NexusFile, analysisReportId?: string) => {
    const newlyUploadedAsset: Asset = {
      analysisReportId,
      saved: false,
      id: file['@id'],
      name: file._filename,
      encodingFormat: file._mediaType,
      contentSize: {
        unitCode: 'bytes',
        value: file._bytes,
      },
      digest: {
        algorithm: file._digest._algorithm,
        value: file._digest._value,
      },
      filePath: file['@id'],
      preview: () => {
        return <Image placeholder={<FileImageOutlined />} preview={false} />;
      },
    };
    setUnsavedAssets(assets => [...assets, newlyUploadedAsset]);
  };

  const DEFAULT_SCALE = 50;

  type AnalysesState = {
    imagePreviewScale: number;
    mode: 'view' | 'edit' | 'create';
    selectedAnalysisReports?: string[];
    currentlyBeingEditedAnalysisReportId?: string;
    currentlyBeingEditingAnalysisReportName?: string;
    currentlyBeingEditedAnalysisReportDescription?: string;
    selectedAssets?: string[];
    isUploadAssetDialogOpen?: boolean;
    hasInitializedSelectedReports: boolean;
  };

  const initState = ({
    mode,
    imagePreviewScale: scale,
    hasInitializedSelectedReports,
    selectedAnalysisReports,
  }: AnalysesState): AnalysesState => {
    return {
      mode,
      hasInitializedSelectedReports,
      imagePreviewScale: scale,
      selectedAnalysisReports,
    };
  };

  const analysisUIReducer = (
    state: AnalysesState,
    action: AnalysesAction
  ): AnalysesState => {
    switch (action.type) {
      case ActionType.RESCALE:
        return { ...state, imagePreviewScale: action.payload };
      case ActionType.EDIT_ANALYSIS_REPORT:
        return {
          ...state,
          mode: 'edit',
          selectedAnalysisReports: [action.payload.analysisId],
          currentlyBeingEditedAnalysisReportId: action.payload.analysisId,
          currentlyBeingEditingAnalysisReportName: action.payload.analaysisName,
          currentlyBeingEditedAnalysisReportDescription:
            action.payload.analysisDescription,
        };
      case ActionType.ADD_ANALYSIS_REPORT:
        return {
          ...state,
          mode: 'create',
          currentlyBeingEditingAnalysisReportName: '',
          currentlyBeingEditedAnalysisReportDescription: '',
        };
      case ActionType.SELECT_ASSET:
        state.selectedAssets = state.selectedAssets ? state.selectedAssets : [];
        const selectedId = state.selectedAssets?.findIndex(
          a => a === action.payload.assetId
        );

        if (
          state.selectedAssets &&
          selectedId !== undefined &&
          selectedId > -1
        ) {
          const selectedCopy = [...state.selectedAssets];
          selectedCopy.splice(selectedId, 1);
          return {
            ...state,
            selectedAssets: selectedCopy,
          };
        }
        return {
          ...state,
          selectedAssets: [...state.selectedAssets, action.payload.assetId],
        };
      case ActionType.SET_SELECTED_REPORT_ON_FIRST_LOAD:
        return {
          ...state,
          selectedAnalysisReports: action.payload
            ? [action.payload.analysisReportId]
            : [],
          hasInitializedSelectedReports: true,
        };
      case ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS:
        return {
          ...state,
          mode: 'view',
          selectedAnalysisReports: action.payload.analysisReportIds,
        };
      case ActionType.INITIALIZE:
        return initState({
          mode: 'view',
          hasInitializedSelectedReports: true,
          selectedAnalysisReports: action.payload.analysisReportId,
          imagePreviewScale: action.payload.scale,
        });
      case ActionType.CHANGE_ANALYSIS_NAME:
        return {
          ...state,
          currentlyBeingEditingAnalysisReportName: action.payload.name,
        };
      case ActionType.CHANGE_ANALYSIS_DESCRIPTION:
        return {
          ...state,
          currentlyBeingEditedAnalysisReportDescription:
            action.payload.description,
        };
      case ActionType.OPEN_FILE_UPLOAD_DIALOG:
        return {
          ...state,
          isUploadAssetDialogOpen: true,
        };
      case ActionType.CLOSE_FILE_UPLOAD_DIALOG:
        return {
          ...state,
          isUploadAssetDialogOpen: false,
        };
      default:
        throw new Error();
    }
  };

  const [
    {
      imagePreviewScale,
      mode,
      currentlyBeingEditedAnalysisReportId,
      selectedAssets,
      selectedAnalysisReports,
      currentlyBeingEditingAnalysisReportName,
      currentlyBeingEditedAnalysisReportDescription,
      isUploadAssetDialogOpen,
      hasInitializedSelectedReports,
    },
    dispatch,
  ] = React.useReducer(
    analysisUIReducer,
    {
      imagePreviewScale: DEFAULT_SCALE,
      mode: 'view',
      hasInitializedSelectedReports: true,
      selectedAnalysisReports: [],
    },
    initState
  );

  const analysisDataWithImages = React.useMemo(() => {
    const newAnalysisReports: AnalysisReport[] =
      mode === 'create'
        ? [
            {
              name: '',
              description: '',
              createdBy: '',
              createdAt: '',
              assets: [],
            },
          ]
        : [];
    const savedAndUnsavedAnalysisReports = analysisData
      ? analysisData.concat(newAnalysisReports)
      : newAnalysisReports;
    return savedAndUnsavedAnalysisReports.map(a => {
      return {
        ...a,
        assets: a.assets.concat(unsavedAssets).map(m => {
          const img = imageData?.find(img => img.contentUrl === m.filePath);
          console.log('mapping', img, m);
          return {
            ...m,
            preview: ({ mode }: { mode: string }) => {
              return (
                <>
                  <Image src={img?.src} preview={mode === 'view'} />
                </>
              );
            },
          };
        }),
      };
    });
  }, [analysisData, imageData, unsavedAssets, mode]);

  const FileUploadComponent = (analysisReportId?: string) => (
    <FileUploadContainer
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      onFileUploaded={file => onFileUploaded(file, analysisReportId)}
    />
  );

  return (
    <>
      {analysisDataWithImages && (
        <AnalysisPlugin
          FileUpload={FileUploadComponent}
          analysisReports={analysisDataWithImages}
          onCancel={() => {}}
          onSave={(name: string, description?: string, id?: string) => {
            mutateAnalysis.mutate({ name, description, id });
          }}
          imagePreviewScale={imagePreviewScale}
          mode={mode}
          currentlyBeingEditedAnalysisReportDescription={
            currentlyBeingEditedAnalysisReportDescription
          }
          currentlyBeingEditedAnalysisReportId={
            currentlyBeingEditedAnalysisReportId
          }
          currentlyBeingEditingAnalysisReportName={
            currentlyBeingEditingAnalysisReportName
          }
          selectedAssets={selectedAssets}
          selectedAnalysisReports={selectedAnalysisReports}
          isUploadAssetDialogOpen={isUploadAssetDialogOpen}
          dispatch={(action: AnalysesAction) => {
            dispatch(action);
          }}
        />
      )}
    </>
  );
};

export default AnalysisPluginContainer;
