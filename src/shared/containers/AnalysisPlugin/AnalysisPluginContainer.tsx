import { NexusClient, NexusFile, Resource, SparqlView } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import { sparqlQueryExecutor } from '../../utils/querySparqlView';
import { Image } from 'antd';
import FileUploadContainer from '../FileUploadContainer';
import { FileImageOutlined } from '@ant-design/icons';
import { makeResourceUri } from '../../../shared/utils';
import { useHistory, useLocation } from 'react-router';
import ImageFileInfo from '../../components/FileInfo/ImageFileInfo';
import { PDFThumbnail } from '../../../shared/components/Preview/PDFPreview';
import PDFFileInfo from '../../../shared/components/FileInfo/PDFFileInfo';
import AnalysisPlugin from '../../../shared/components/AnalysisPlugin/AnalysisPlugin';

import analysisUIReducer, {
  setReportResourceType,
  setSelectedReportFirstLoad,
  changeSelectedReports,
} from '../../slices/plugins/report';

import {
  Asset,
  AnalysesState,
  AnalysisReport,
  AnalysisPluginContainerProps,
  AnalysisAssetSparqlQueryRowResult,
  ReportGeneration,
} from '../../types/plugins/report';

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

const AnalysisPluginContainer = ({
  orgLabel,
  projectLabel,
  resourceId,
}: AnalysisPluginContainerProps) => {
  const identities = useSelector((state: RootState) => state.auth.identities);
  const currentUser = identities?.data?.identities.find(
    id => id['@type'] === 'User'
  );
  const nexus = useNexusContext();
  const queryClient = useQueryClient();

  const [unsavedAssets, setUnsavedAssets] = React.useState<Asset[]>([]);

  const apiEndpoint = useSelector(
    (state: RootState) => state.config.apiEndpoint
  );
  const history = useHistory();
  const location = useLocation();

  const viewSelfId = `${apiEndpoint}/nexus/v1/views/${orgLabel}/${projectLabel}/graph`;

  const handleClickAnalysisResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    history.push(
      makeResourceUri(orgLabel, projectLabel, resourceId),
      location.state
    );
  };

  const { analysisPluginSparqlDataQuery } = useSelector(
    (state: RootState) => state.config
  );

  const analysisSparqlQuery = analysisPluginSparqlDataQuery.replaceAll(
    '{resourceId}',
    resourceId
  );

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

    const uniqueReportIds = [
      ...new Set(
        result.items.map(
          r => (r as AnalysisAssetSparqlQueryRowResult).analysis_report_id
        )
      ),
    ];
    const reportResources = (await Promise.all(
      uniqueReportIds.map(reportResourceId =>
        nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(reportResourceId)
        )
      )
    )) as Resource[];

    const analysisData = result.items.reduce((analysisReports, current) => {
      const currentRow = current as AnalysisAssetSparqlQueryRowResult;
      /* add new entry if report not in array yet */
      if (
        !analysisReports.some(r => r.id === currentRow['analysis_report_id'])
      ) {
        const types =
          currentRow['analysis_report_types'] !== undefined
            ? [currentRow['analysis_report_types']]
            : [];
        const categories =
          currentRow['analysis_report_categories'] !== undefined
            ? [currentRow['analysis_report_categories']]
            : [];

        const report = {
          types,
          categories,
          containerId: currentRow['container_resource_id'],
          containerName: currentRow['container_resource_name'],
          id: currentRow['analysis_report_id'],
          description: currentRow['analysis_report_description'],
          name: currentRow['analysis_report_name'],
          createdBy: currentRow['created_by'],
          createdAt: currentRow['created_at'],
          updatedBy: currentRow['updated_by'],
          updatedAt: currentRow['updated_at'],
          assets: [],
        };

        analysisReports.push(report);

        const reportIx = analysisReports.findIndex(
          r => r.id === currentRow['analysis_report_id']
        );
        const reportResource = reportResources.find(
          r => r['@id'] === currentRow['analysis_report_id']
        );

        if (reportResource === undefined) return analysisReports;

        if ('contribution' in reportResource) {
          analysisReports[reportIx].contribution = [
            reportResource.contribution,
          ].flat();
        }

        if ('hasPart' in reportResource) {
          analysisReports[reportIx].assets = [reportResource.hasPart]
            .flat()
            .map((asset: any) => {
              return {
                analysisReportId: currentRow['analysis_report_id'],
                saved: true,
                id: asset.distribution.contentUrl['@id'],
                name: asset.name,
                description: asset.description,
                filePath: asset.distribution.contentUrl['@id'],
                encodingFormat: asset.distribution.encodingFormat,
                preview: ({ mode }: { mode: 'view' | 'edit' }) => {
                  return <Image preview={mode === 'view'} />;
                },
              };
            });
        }
      } else {
        // @TODO: get this from the report resource
        const reportIx = analysisReports.findIndex(
          r => r.id === currentRow['analysis_report_id']
        );
        const r = analysisReports[reportIx];
        if (currentRow['analysis_report_categories'] !== undefined) {
          if (r.categories !== undefined) {
            if (
              !r.categories.includes(currentRow['analysis_report_categories'])
            ) {
              r.categories.push(currentRow['analysis_report_categories']);
            }
          } else {
            analysisReports[reportIx].categories = [
              currentRow['analysis_report_categories'],
            ];
          }
        }
        if (currentRow['analysis_report_types'] !== undefined) {
          if (r.types !== undefined) {
            if (!r.types.includes(currentRow['analysis_report_types'])) {
              r.types.push(currentRow['analysis_report_types']);
            }
          } else {
            analysisReports[reportIx].types = [
              currentRow['analysis_report_types'],
            ];
          }
        }
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
          dispatch(
            setSelectedReportFirstLoad({
              analysisReportId:
                data.length > 0 && data[0].id !== undefined ? data[0].id : '',
            })
          );
        }
        dispatch(
          setReportResourceType({
            resourceType:
              data.length > 0 && data[0].id === resourceId
                ? 'individual_report'
                : 'report_container',
            containerId:
              data.length > 0 && data[0].containerId !== ''
                ? data[0].containerId
                : undefined,
            containerName:
              data.length > 0 && data[0].containerName !== ''
                ? data[0].containerName
                : undefined,
          })
        );
      },
    }
  );

  const fetchImages = async () => {
    const imageSourceInitial: Promise<{
      id: string;
      src: string;
      contentUrl: string;
      deprecated: boolean;
      filename: string;
      lastUpdated: string;
      lastUpdatedBy: string;
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
          const imgResource = (await nexus.Resource.get(
            orgLabel,
            projectLabel,
            encodeURIComponent(asset.filePath)
          )) as Resource;

          const src = await fetchImageObjectUrl(
            nexus,
            orgLabel,
            projectLabel,
            imageId,
            asset.encodingFormat
          );
          return {
            src,
            id: asset.id,
            contentUrl: asset.filePath,
            deprecated: imgResource['_deprecated'],
            filename: imgResource['_filename'],
            lastUpdated: imgResource['_updatedAt'],
            lastUpdatedBy: imgResource['_updatedBy'],
          };
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

  const mutateAsset = useMutation(
    async (data: {
      resourceId: string;
      assetContentUrl: string;
      title: string;
      caption: string;
    }) => {
      const resource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(data.resourceId)
      )) as Resource;
      resource.hasPart = [resource.hasPart].flat().map(a => {
        if (a.distribution.contentUrl['@id'] !== data.assetContentUrl) {
          return a;
        }

        return {
          ...a,
          name: data.title,
          description: data.caption,
        };
      });

      // Add user as contributor if not already
      const contributions = resource['contribution']
        ? [resource['contribution']].flat()
        : [];

      if (!contributions.some(c => c.agent['@id'] === currentUser?.['@id'])) {
        contributions.push({
          '@type': 'Contribution',
          agent: {
            '@id': currentUser?.['@id'],
            '@type': ['Person', 'Agent'],
          },
        });
      }
      resource['contribution'] = contributions;

      return nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(data.resourceId),
        resource._rev,
        resource
      );
    },
    {
      onSuccess: () => {
        return Promise.all([
          queryClient.invalidateQueries(['analysis']),
          queryClient.invalidateQueries(['analysesImages']),
        ]);
      },
    }
  );

  const mutateAnalysis = useMutation(
    async (data: {
      id?: string;
      name: string;
      description?: string;
      categories?: string[];
      types?: string[];
      scripts?: ReportGeneration[];
    }) => {
      const unsavedAssetsToAddToDistribution = unsavedAssets.map(a => {
        return {
          '@type': 'Entity',
          name: a.name,
          description: a.description,
          distribution: {
            '@type': 'DataDownload',
            contentUrl: { '@id': a.filePath },
            encodingFormat: a.encodingFormat,
            contentSize: a.contentSize,
            digest: a.digest,
          },
        };
      });

      if (data.id) {
        const resource = (await nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(data.id)
        )) as Resource;

        const hasPart = [resource['hasPart']].flat();
        hasPart.push(...unsavedAssetsToAddToDistribution);
        resource['hasPart'] = hasPart;

        // Add user as contributor if not already
        const contributions = resource['contribution']
          ? [resource['contribution']]
              .flat()
              .filter(c => c.agent['@type'].includes('Person'))
          : [];

        if (!contributions.some(c => c.agent['@id'] === currentUser?.['@id'])) {
          contributions.push({
            '@type': 'Contribution',
            agent: {
              '@id': currentUser?.['@id'],
              '@type': ['Person', 'Agent'],
            },
          });
        }
        // add software contributions
        if (data.scripts) {
          contributions.push(
            ...data.scripts.map(s => ({
              '@type': 'Contribution',
              agent: {
                '@type': ['Software', 'Agent'],
              },
              repository: s.scriptPath,
              description: s.description,
            }))
          );
        }

        resource['contribution'] = contributions;
        return nexus.Resource.update(
          orgLabel,
          projectLabel,
          encodeURIComponent(data.id),
          resource['_rev'],
          {
            ...resource,
            name: data.name,
            description: data.description,
            categories: data.categories,
            types: data.types,
          }
        );
      }

      // Create new Analysis Report
      return nexus.Resource.create(orgLabel, projectLabel, {
        '@context': [
          {
            '@vocab': 'https://neuroshapes.org/',
            nxv: 'https://bluebrain.github.io/nexus/vocabulary/',
            derivation: 'http://www.w3.org/ns/prov#derivation',
          },
        ],
        '@type': 'Report',
        name: data.name,
        description: data.description,
        categories: data.categories,
        types: data.types,
        hasPart: unsavedAssetsToAddToDistribution,
        derivation: { entity: { '@id': resourceId } },
        contribution: data.scripts
          ? data.scripts.map(s => ({
              '@type': 'Contribution',
              agent: { '@type': ['Software', 'Agent'] },
              repository: s.scriptPath,
              description: s.description,
            }))
          : [],
      });
    },
    {
      onSuccess: resource => {
        setUnsavedAssets([]);
        Promise.all([
          queryClient.invalidateQueries(['analysis']),
          queryClient.invalidateQueries(['analysesImages']),
        ]).then(() => {
          dispatch(
            changeSelectedReports({ analysisReportIds: [resource['@id']] })
          );
        });
      },
    }
  );

  const deleteImages = useMutation(
    async () => {
      if (selectedAssets) {
        await Promise.all(
          selectedAssets.map(async d => {
            const resource = (await nexus.Resource.get(
              orgLabel,
              projectLabel,
              encodeURIComponent(d)
            )) as Resource;
            await nexus.Resource.deprecate(
              orgLabel,
              projectLabel,
              encodeURIComponent(resource['@id']),
              resource._rev
            );
          })
        );
        // TODO: update report contributors
        if (currentlyBeingEditedAnalysisReportId) {
          const reportResource = (await nexus.Resource.get(
            orgLabel,
            projectLabel,
            encodeURIComponent(currentlyBeingEditedAnalysisReportId)
          )) as Resource;

          // Add user as contributor if not already
          const contributions = reportResource['contribution']
            ? [reportResource['contribution']].flat()
            : [];

          if (
            !contributions.some(c => c.agent['@id'] === currentUser?.['@id'])
          ) {
            contributions.push({
              '@type': 'Contribution',
              agent: {
                '@id': currentUser?.['@id'],
                '@type': ['Person', 'Agent'],
              },
            });
          }
          reportResource['contribution'] = contributions;

          await nexus.Resource.update(
            orgLabel,
            projectLabel,
            encodeURIComponent(reportResource['@id']),
            reportResource._rev,
            {
              ...reportResource,
              contribution: contributions,
            }
          );
        }
      }
      return selectedAnalysisReports;
    },
    {
      onSuccess: resourceIds => {
        Promise.all([
          queryClient.invalidateQueries(['analysis']),
          queryClient.invalidateQueries(['analysesImages']),
        ]).then(() => {
          dispatch(
            changeSelectedReports({
              analysisReportIds: resourceIds ? resourceIds : [],
            })
          );
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
        return (
          <>
            {file._mediaType.substring(0, 'image'.length) === 'image' && (
              <>
                {file._mediaType.substring(0, 'image'.length) === 'image' && (
                  <Image placeholder={<FileImageOutlined />} preview={false} />
                )}
                {file._mediaType === 'application/pdf' && (
                  <PDFThumbnail
                    url={file['@id']}
                    onPreview={() => {}}
                    previewDisabled={true}
                  />
                )}
              </>
            )}
            {file._mediaType === 'application/pdf' && (
              <PDFThumbnail
                url={file['@id']}
                onPreview={() => {}}
                previewDisabled={true}
              />
            )}
          </>
        );
      },
    };
    setUnsavedAssets(assets => [...assets, newlyUploadedAsset]);
  };

  const DEFAULT_SCALE = 50;

  const initState = ({
    mode,
    analysisResourceType,
    selectedAnalysisReports,
    hasInitializedSelectedReports,
    imagePreviewScale: scale,
  }: AnalysesState): AnalysesState => {
    return {
      mode,
      analysisResourceType,
      hasInitializedSelectedReports,
      selectedAnalysisReports,
      imagePreviewScale: scale,
    };
  };

  const [
    {
      imagePreviewScale,
      mode,
      analysisResourceType,
      containerId,
      containerName,
      currentlyBeingEditedAnalysisReportId,
      selectedAssets,
      selectedAnalysisReports,
      currentlyBeingEditedAnalysisReportName,
      currentlyBeingEditedAnalysisReportDescription,
      currentlyBeingEditedAnalysisReportCategories,
      currentlyBeingEditedAnalysisReportTypes,
      currentlyBeingEditedAnalysisReportTools,
      isUploadAssetDialogOpen,
      hasInitializedSelectedReports,
    },
    dispatch,
  ] = React.useReducer(
    analysisUIReducer,
    {
      imagePreviewScale: DEFAULT_SCALE,
      analysisResourceType: 'report_container',
      mode: 'view',
      hasInitializedSelectedReports: false,
      selectedAnalysisReports: [],
    },
    initState
  );

  const analysisDataWithImages = React.useMemo(() => {
    const newAnalysisReports: AnalysisReport[] =
      mode === 'create'
        ? [
            {
              name: currentlyBeingEditedAnalysisReportName || '',
              description: currentlyBeingEditedAnalysisReportDescription || '',
              categories: currentlyBeingEditedAnalysisReportCategories || [],
              types: currentlyBeingEditedAnalysisReportTypes || [],
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
        assets: a.assets
          .concat(unsavedAssets)
          .map(m => {
            const img = imageData?.find(img => img.contentUrl === m.filePath);
            return {
              ...m,
              filename: img?.filename,
              deprecated: img?.deprecated,
              lastUpdated: img?.lastUpdated,
              lastUpdatedBy: img?.lastUpdatedBy,
              preview: ({ mode }: { mode: string }) => {
                return (
                  <>
                    {m.encodingFormat.substring(0, 'image'.length) ===
                      'image' && (
                      <ImageFileInfo
                        previewDisabled={mode === 'edit'}
                        src={img?.src}
                        lastUpdated={img?.lastUpdated}
                        lastUpdatedBy={img?.lastUpdatedBy}
                        title={m.name}
                        text={m.description}
                        onSave={(name, description) => {
                          a.id &&
                            img &&
                            mutateAsset.mutate({
                              resourceId: a.id,
                              assetContentUrl: img.contentUrl,
                              title: name,
                              caption: description,
                            });
                        }}
                      />
                    )}
                    {m.encodingFormat === 'application/pdf' && img?.src && (
                      <PDFFileInfo
                        previewDisabled={mode === 'edit'}
                        src={img?.src}
                        lastUpdated={img?.lastUpdated}
                        lastUpdatedBy={img?.lastUpdatedBy}
                        title={m.name}
                        text={m.description}
                        onSave={(name, description) => {
                          a.id &&
                            img &&
                            mutateAsset.mutate({
                              resourceId: a.id,
                              assetContentUrl: img.contentUrl,
                              title: name,
                              caption: description,
                            });
                        }}
                      />
                    )}
                  </>
                );
              },
            };
          })
          .filter(a => a.deprecated === undefined || !a.deprecated),
      };
    });
  }, [analysisData, imageData, unsavedAssets, mode]);

  const FileUploadComponent = (analysisReportId?: string) => (
    <FileUploadContainer
      orgLabel={orgLabel}
      showStorageMenu={false}
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
          containerId={containerId}
          onCancel={() => {}}
          onSave={(
            name: string,
            description?: string,
            id?: string,
            categories?: string[],
            types?: string[],
            scripts?: ReportGeneration[]
          ) => {
            mutateAnalysis.mutate({
              name,
              description,
              id,
              categories,
              types,
              scripts,
            });
          }}
          onDelete={() => {
            deleteImages.mutate();
          }}
          imagePreviewScale={imagePreviewScale}
          mode={mode}
          analysisResourceType={analysisResourceType}
          currentlyBeingEditedAnalysisReportDescription={
            currentlyBeingEditedAnalysisReportDescription
          }
          currentlyBeingEditedAnalysisReportId={
            currentlyBeingEditedAnalysisReportId
          }
          currentlyBeingEditedAnalysisReportName={
            currentlyBeingEditedAnalysisReportName
          }
          currentlyBeingEditedAnalysisReportCategories={
            currentlyBeingEditedAnalysisReportCategories
          }
          currentlyBeingEditedAnalysisReportTypes={
            currentlyBeingEditedAnalysisReportTypes
          }
          currentlyBeingEditedAnalysisReportTools={
            currentlyBeingEditedAnalysisReportTools
          }
          selectedAssets={selectedAssets}
          dispatch={dispatch}
          selectedAnalysisReports={selectedAnalysisReports}
          isUploadAssetDialogOpen={isUploadAssetDialogOpen}
          onClickRelatedResource={(resourceId: string) =>
            handleClickAnalysisResource(orgLabel, projectLabel, resourceId)
          }
          containerName={containerName}
        />
      )}
    </>
  );
};

export default AnalysisPluginContainer;
