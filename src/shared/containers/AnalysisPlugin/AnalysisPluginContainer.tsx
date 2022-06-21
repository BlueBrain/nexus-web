import { NexusClient, NexusFile, Resource, SparqlView } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import AnalysisPlugin, {
  AnalysisReport,
} from '../../components/AnalysisPlugin/AnalysisPlugin';
import { sparqlQueryExecutor } from '../../utils/querySparqlView';
import { Image } from 'antd';
import FileUploadContainer from '../FileUploadContainer';

async function fetchImageObjectUrl(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  imageResourceId: string
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
    type: 'image/png', // TODO: get this properly
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

  const [unsavedAssets, setUnsavedAssets] = useState<
    {
      saved: boolean;
      id: string;
      name: string;
      filePath: string; // expect this is an image for now
      preview: ({
        scale,
      }: {
        scale: number;
        mode: 'edit' | 'view';
      }) => React.ReactElement;
    }[]
  >([]);

  // TODO: fetch view to get self url
  // const DEFAULT_VIEW_ID =
  //   'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex';
  const DEFAULT_VIEW_SELF_ID =
    'https://dev.nise.bbp.epfl.ch/nexus/v1/views/bbp-users/nicholas/graph';

  const ANALYSIS_QUERY = `
    PREFIX s:<http://schema.org/>
    PREFIX prov:<http://www.w3.org/ns/prov#>
    PREFIX nsg:<https://neuroshapes.org/>
    PREFIX nxv:<https://bluebrain.github.io/nexus/vocabulary/>
    SELECT ?analysis_report_id ?analysis_report_name ?analysis_report_description ?asset_content_url ?asset_encoding_format ?asset_name ?self
    WHERE {
      BIND(<${resourceId}> as ?start) .
      BIND(<${resourceId}> as ?self) .
      OPTIONAL {
          ?container_resource_id        nsg:generated       ?analysis_report_id .
          OPTIONAL {
            ?analysis_report_id    nsg:name            ?analysis_report_name .  
            ?analysis_report_id    s:description       ?analysis_report_description .
          }
          ?analysis_report_id    nsg:distribution    ?distribution .
          OPTIONAL {
            ?distribution nsg:name            ?asset_name .
            ?distribution nsg:contentUrl      ?asset_content_url .
            ?distribution nsg:encodingFormat  ?asset_encoding_format .
          }
      }
    }
    LIMIT 100
  `;

  const fetchAnalysisData = async () => {
    const analysisReports: AnalysisReport[] = [];
    const result = await sparqlQueryExecutor(
      nexus,
      ANALYSIS_QUERY,
      {
        _self: DEFAULT_VIEW_SELF_ID,
      } as SparqlView,
      false
    );
    type AnalysisAssetSparqlQueryRowResult = {
      id: string;
      key: string;
      self: {
        type: string;
        value: string;
      };
      analysis_report_id: string;
      analysis_report_name: string;
      analysis_report_description: string;
      asset_name: string;
      asset_content_url: string;
      asset_encoding_format: string;
    };

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

      report?.assets.push({
        saved: true,
        id: currentRow.asset_content_url,
        name: currentRow.asset_name,
        filePath: currentRow.asset_content_url,
        preview: ({ mode }) => {
          return <Image preview={mode === 'view'} />;
        },
      });
      if (report) {
        analysisReports[reportIx] = report;
      }

      return analysisReports;
    }, analysisReports);

    return analysisData;
  };

  const { data: analysisData, status: analysisDataStatus } = useQuery(
    'analysis',
    fetchAnalysisData
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
            imageId
          );
          return { id: asset.id, src: src, contentUrl: asset.filePath };
        });
        return [...prev, ...assets];
      }, imageSourceInitial)
    );

    return imageSources;
  };

  const { data: imageData, status: imageDataStatus } = useQuery(
    'analysesImages',
    fetchImages,
    {
      enabled: analysisData !== undefined && analysisData.length > 0,
    }
  );

  const analysisDataWithImages = React.useMemo(
    () =>
      analysisData?.map(a => {
        return {
          ...a,
          assets: a.assets.concat(unsavedAssets).map(m => {
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
      }),
    [analysisData, imageData, unsavedAssets]
  );

  const mutateAnalysis = useMutation(
    async (data: { id: string; name: string; description: string }) => {
      const resource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(data.id)
      )) as Resource;

      const unsavedAssetsToAddToDistribution = unsavedAssets.map(a => {
        return {
          '@type': 'DataDownload', // TODO: use appropriate prefix depending on context
          contentUrl: a.filePath,
          encodingFormat: 'image/png', // TODO: stop hardcoding
          name: '',
        };
      });

      const distribution = resource['distribution']; // TODO: use appropriate cprefix depending on context
      if (distribution) {
        distribution.push(...unsavedAssetsToAddToDistribution);
      } else {
        resource['distribution'] = unsavedAssetsToAddToDistribution;
      }

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
        queryClient.invalidateQueries('analysis');
      },
    }
  );

  const onFileUploaded = (file: NexusFile) => {
    const newlyUploadedAsset = {
      saved: false,
      id: file['@id'],
      name: '',
      filePath: file['@id'],
      preview: () => {
        return <Image placeholder="Loading..." preview={mode === 'view'} />;
      },
    };
    setUnsavedAssets([...unsavedAssets, newlyUploadedAsset]);
  };

  const FileUploadComponent = (
    <FileUploadContainer
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      onFileUploaded={onFileUploaded}
    />
  );

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
