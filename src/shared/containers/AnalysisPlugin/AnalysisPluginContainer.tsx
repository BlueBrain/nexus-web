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
SELECT ?analysis_report_id ?analysis_report_name ?analysis_report_description ?asset_content_url ?asset_encoding_format ?asset_name ?self
WHERE {
  BIND(<{resourceId}> as ?container_resource_id) .
  BIND(<{resourceId}> as ?self) .
  ?container_resource_id        ^prov:wasDerivedFrom       ?analysis_report_id .
  ?analysis_report_id    nsg:name            ?analysis_report_name .
  ?analysis_report_id    s:description       ?analysis_report_description .
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

  const { data: analysisData } = useQuery(['analysis', resourceId], async () =>
    fetchAnalysisData(viewSelfId, analysisSparqlQuery)
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

  const analysisDataWithImages = React.useMemo(() => {
    return analysisData?.map(a => {
      return {
        ...a,
        assets: a.assets
          .concat(
            unsavedAssets.filter(unsaved => unsaved.analysisReportId === a.id)
          )
          .map(m => {
            const img = imageData?.find(img => img.contentUrl === m.filePath);
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
  }, [analysisData, imageData, unsavedAssets]);

  const mutateAnalysis = useMutation(
    async (data: { id: string; name: string; description: string }) => {
      const resource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(data.id)
      )) as Resource;

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

      const distribution = [resource['distribution']].flat(); // TODO: use appropriate cprefix depending on context
      distribution.push(...unsavedAssetsToAddToDistribution);
      resource['distribution'] = distribution;

      return nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(data.id),
        resource['_rev'],
        { ...resource, name: data.name, 'schema:description': data.description }
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['analysis']);
        queryClient.invalidateQueries(['analysesImages']);
        setUnsavedAssets([]);
      },
    }
  );

  const onFileUploaded = (file: NexusFile, analysisReportId: string) => {
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

  const FileUploadComponent = (analysisReportId: string) => {
    return (
      <FileUploadContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onFileUploaded={file => onFileUploaded(file, analysisReportId)}
      />
    );
  };

  return (
    <>
      {analysisDataWithImages && (
        <AnalysisPlugin
          FileUpload={FileUploadComponent}
          analysisReports={analysisDataWithImages}
          onCancel={() => {}}
          onSave={(id: string, name: string, description: string) => {
            mutateAnalysis.mutate({ id, name, description });
          }}
        />
      )}
    </>
  );
};

export default AnalysisPluginContainer;
