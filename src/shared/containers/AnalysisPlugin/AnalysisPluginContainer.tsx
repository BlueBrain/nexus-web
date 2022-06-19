import { NexusClient, NexusFile, Resource, SparqlView } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import AnalysisPlugin, {
  Analyses,
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

  const [mode, setMode] = useState('view');
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
    SELECT ?container_resource_id ?analysis_report_id ?analysis_report_name ?analysis_report_description ?asset_content_url ?asset_encoding_format ?asset_name ?self
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
    const reports: Analyses = [];
    const result = await sparqlQueryExecutor(
      nexus,
      ANALYSIS_QUERY,
      {
        _self: DEFAULT_VIEW_SELF_ID,
      } as SparqlView,
      false
    );
    type SparqlQueryRowResult = {
      id: string;
      key: string;
      self: {
        type: string;
        value: string;
      };
      container_resource_id: string;
      analysis_report_id: string;
      analysis_report_name: string;
      analysis_report_description: string;
      asset_name: string;
      asset_content_url: string;
      asset_encoding_format: string;
    };

    const analysisData = result.items.reduce((prev, current) => {
      const currentRow = current as SparqlQueryRowResult;

      if (!reports.some(r => r.id === currentRow['analysis_report_id'])) {
        prev.push({
          id: currentRow['analysis_report_id'],
          description: currentRow['analysis_report_description'],
          name: currentRow['analysis_report_name'],
          analyses: [],
        });
      }
      const report = reports.find(
        r => r.id === currentRow['analysis_report_id']
      );
      const reportIx = reports.findIndex(
        r => r.id === currentRow['analysis_report_id']
      );

      report?.analyses.push({
        saved: true,
        id: currentRow.asset_content_url,
        name: currentRow.asset_name,
        filePath: currentRow.asset_content_url,
        preview: ({ scale, mode }) => {
          const scaledSize = (scale / 100) * 500;
          const size = scaledSize < 150 ? 150 : scaledSize;

          return (
            <Image style={{ maxHeight: size }} preview={mode === 'view'} />
          );
        },
      });
      if (report) {
        prev[reportIx] = report;
      }

      return prev;
    }, reports);

    return analysisData;
  };

  const { data: analysesData, status: analysesDataStatus } = useQuery(
    'analyses',
    fetchAnalysisData
  );

  const fetchImages = async () => {
    const imageSourceInitial: Promise<{
      id: string;
      src: string;
      contentUrl: string;
    }>[] = [];
    if (!analysesData) {
      return [];
    }

    const imageSources = Promise.all(
      analysesData.reduce((prev, current) => {
        const assets = current.analyses
          .concat(unsavedAssets)
          .map(async asset => {
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

  const { data: imageData, status: imageLoadingStatus } = useQuery(
    'analysesImages',
    fetchImages,
    {
      enabled: analysesData !== undefined && analysesData.length > 0,
    }
  );

  const analysesDataWithImages = React.useMemo(
    () =>
      analysesData?.map(a => {
        return {
          ...a,
          analyses: a.analyses.concat(unsavedAssets).map(m => {
            const img = imageData?.find(img => img.contentUrl === m.filePath);

            return {
              ...m,
              preview: ({ scale, mode }: { scale: number; mode: string }) => {
                const scaledSize = (scale / 100) * 500;
                const size = scaledSize < 150 ? 150 : scaledSize;

                return (
                  <Image
                    src={img?.src}
                    style={{ maxHeight: size }}
                    preview={mode === 'view'}
                  />
                );
              },
            };
          }),
        };
      }),
    [analysesData, imageData, unsavedAssets]
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
          '@type': 'DataDownload',
          contentUrl: a.filePath,
          encodingFormat: 'image/png', // TODO: stop hardcoding
          name: '',
        };
      });

      const distribution = resource['distribution'];
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
        queryClient.invalidateQueries('analyses');
      },
    }
  );

  const onFileUploaded = (file: NexusFile) => {
    const newlyUploadedAsset = {
      saved: false,
      id: file['@id'],
      name: '',
      filePath: file['@id'],
      preview: ({ scale }: { scale: number }) => {
        const scaledSize = (scale / 100) * 500;
        const size = scaledSize < 150 ? 150 : scaledSize;

        return (
          <Image
            style={{ maxHeight: size }}
            placeholder="newly uploaded"
            preview={mode === 'view'}
          />
        );
      },
    };
    setUnsavedAssets([...unsavedAssets, newlyUploadedAsset]);
  };

  const FileUpload = (
    <FileUploadContainer
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      onFileUploaded={onFileUploaded}
    />
  );

  return (
    <>
      {analysesDataWithImages && (
        <AnalysisPlugin
          FileUpload={FileUpload}
          analyses={analysesDataWithImages}
          mode="view"
          onCancel={() => {}}
          onChangeMode={(mode: 'view' | 'edit') => {
            setMode(mode);
          }}
          onSave={(id: string, name: string, description: string) => {
            mutateAnalysis.mutate({ id, name, description });
          }}
        />
      )}
    </>
  );
};

export default AnalysisPluginContainer;
