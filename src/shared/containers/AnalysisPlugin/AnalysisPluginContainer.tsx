import { NexusClient, SparqlView } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import AnalysisPlugin, {
  analyses,
} from '../../components/AnalysisPlugin/AnalysisPlugin';
import { sparqlQueryExecutor } from '../../utils/querySparqlView';
import { Image } from 'antd';

type AnalysisPluginContainerProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
};

function fetchImage(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  id: string
) {
  const ImageItem = nexus.File.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(id),
    {
      as: 'blob',
    }
  ).then(rawData => {
    const blob = new Blob([rawData as string], {
      type: 'image/png', // TODO: get this properly
    });

    const imageSrc = URL.createObjectURL(blob);

    return imageSrc;
  });
  return ImageItem;
}

export default ({
  orgLabel,
  projectLabel,
  resourceId,
}: AnalysisPluginContainerProps) => {
  const nexus = useNexusContext();
  const analyses: analyses = [];

  const [mode, setMode] = useState('view');

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
    SELECT ?start ?report_id ?report_name ?asset_content_url ?asset_encoding_format ?asset_name ?self
    WHERE {
      BIND(<${resourceId}> as ?start) .
      BIND(<${resourceId}> as ?self) .
      OPTIONAL {
          ?start        nsg:generated       ?report_id .
          OPTIONAL {
            ?report_id    nsg:name            ?report_name .  
            ?report_id    s:description       ?report_description .
          }
          ?report_id    nsg:distribution    ?distribution .
          OPTIONAL {
            ?distribution nsg:name            ?asset_name .
            ?distribution nsg:contentUrl      ?asset_content_url .
            ?distribution nsg:encodingFormat  ?asset_encoding_format .
          }
      }
    }
    LIMIT 100
  `;

  const fetchAnalyses = async () => {
    const reports: analyses = [];
    const result = await sparqlQueryExecutor(
      nexus,
      ANALYSIS_QUERY,
      {
        _self: DEFAULT_VIEW_SELF_ID,
      } as SparqlView,
      false
    );
    type sparqlQueryRow = {
      id: string;
      key: string;
      self: {
        type: string;
        value: string;
      };
      start: string;
      report_id: string;
      report_name: string;
      report_description: string;
      asset_name: string;
      asset_content_url: string;
      asset_encoding_format: string;
    };

    const analysisData = result.items.reduce((prev, current) => {
      const currentRow = current as sparqlQueryRow;

      if (!reports.some(r => r.id === currentRow['report_id'])) {
        prev.push({
          id: currentRow['report_id'],
          description: currentRow['report_description'],
          name: currentRow['report_name'],
          analyses: [],
        });
      }
      const report = reports.find(r => r.id === currentRow['report_id']);
      const reportIx = reports.findIndex(r => r.id === currentRow['report_id']);

      report?.analyses.push({
        id: `${reportIx}`,
        name: currentRow.asset_name,
        filePath: currentRow.asset_content_url,
        preview: ({ scale, mode }) => {
          const scaledSize = (scale / 100) * 500;
          const size = scaledSize < 150 ? 150 : scaledSize;
          const imgSrc = imageData?.find(
            img => img.contentUrl === currentRow.asset_content_url
          );
          return (
            <Image
              placeholder={<>Loading...</>}
              src={imgSrc?.src}
              style={{ maxHeight: size }}
              preview={mode === 'view'}
            />
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

  const { data: analysesData, status } = useQuery('analyses', fetchAnalyses);

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
        const assets = current.analyses.map(async asset => {
          const imageId = asset.filePath.substring(
            asset.filePath.lastIndexOf('/') + 1
          );
          const src = await fetchImage(nexus, orgLabel, projectLabel, imageId);
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

  return (
    <>
      <AnalysisPlugin
        analyses={analysesData ? analysesData : []}
        mode="view"
        onCancel={() => {}}
        onChangeMode={(mode: 'view' | 'edit') => {
          setMode(mode);
        }}
        onSave={(analyses: analyses) => {}}
      />
    </>
  );
};
