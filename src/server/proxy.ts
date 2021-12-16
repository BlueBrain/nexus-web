const { createProxyMiddleware } = require('http-proxy-middleware');
import * as express from 'express';

function setUpDeltaProxy(app: express.Express, apiEndpoint: string) {
  const esResult = {
    hits: {
      hits: [
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/circuits/ffae42d9-4f2c-49dd-bfaa-8be81d093782',
          _index:
            'delta_02de5794-e1d9-49d8-884c-6ae08b78566a_17e4db15-4f35-4c01-87fe-f3e1ef237e2e_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/circuits/ffae42d9-4f2c-49dd-bfaa-8be81d093782',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/projX/circuits/a_circuit',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2020-07-22T11:04:47.828Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            description: 'O1.v5 created in 2014',
            name: 'O1.v5 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/akk_snap_test1',
              label: 'bbp_test/akk_snap_test1',
            },
            updatedAt: '2020-07-28T14:10:12.686Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/akk_snap_test1/_/circuits%2Fffae42d9-4f2c-49dd-bfaa-8be81d093782',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/circuits/901c2fa2-63d5-415b-811c-68040864279e',
          _index:
            'delta_02de5794-e1d9-49d8-884c-6ae08b78566a_17e4db15-4f35-4c01-87fe-f3e1ef237e2e_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/circuits/901c2fa2-63d5-415b-811c-68040864279e',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0001950',
              label: 'neocortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/projX/circuits/a_circuit',
            },
            circuitType: 'Circuit with S1 regions (S1FL,S1HL,S1Tr,S1Sh)',
            createdAt: '2020-07-22T11:04:47.828Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            description: 'S1.V6 somatosensory circuit created in 2017',
            name: 'S1.V6a (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/akk_snap_test1',
              label: 'bbp_test/akk_snap_test1',
            },
            updatedAt: '2020-07-28T14:10:21.433Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/akk_snap_test1/_/circuits%2F901c2fa2-63d5-415b-811c-68040864279e',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/circuits/adc4155f-8865-48e4-9dd3-818d5a04ba2f',
          _index:
            'delta_02de5794-e1d9-49d8-884c-6ae08b78566a_17e4db15-4f35-4c01-87fe-f3e1ef237e2e_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/circuits/adc4155f-8865-48e4-9dd3-818d5a04ba2f',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0001950',
              label: 'neocortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/projX/circuits/a_circuit',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2020-07-22T11:04:47.828Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            description: 'O1.v5 created in 2014',
            name: 'O1.v5 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/akk_snap_test1',
              label: 'bbp_test/akk_snap_test1',
            },
            updatedAt: '2021-11-25T09:54:42.563Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/akk_snap_test1/_/circuits%2Fadc4155f-8865-48e4-9dd3-818d5a04ba2f',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/circuits/45749618-1b32-4c38-a0a8-fb6e90fef5a5',
          _index:
            'delta_02de5794-e1d9-49d8-884c-6ae08b78566a_17e4db15-4f35-4c01-87fe-f3e1ef237e2e_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/circuits/45749618-1b32-4c38-a0a8-fb6e90fef5a5',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/projX/circuits/a_circuit',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2020-07-22T11:04:47.828Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            description: 'O1.v5 created in 2015',
            name: 'O1.v5 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/akk_snap_test1',
              label: 'bbp_test/akk_snap_test1',
            },
            updatedAt: '2021-11-25T09:56:31.141Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/akk_snap_test1/_/circuits%2F45749618-1b32-4c38-a0a8-fb6e90fef5a5',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/eb28243b-7e24-439f-b561-5773ef4731cb',
          _index:
            'delta_0645b2fe-3300-418c-ae25-c387348a0a84_afaea849-ad19-4703-b743-4ea05d094e13_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/eb28243b-7e24-439f-b561-5773ef4731cb',
            '@type': [
              'https://neuroshapes.org/NeuronMorphology',
              'https://neuroshapes.org/ReconstructedCell',
              'https://neuroshapes.org/ReconstructedWholeBrainCell',
            ],
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/733',
              label: 'Ventral posteromedial nucleus of the thalamus',
            },
            createdAt: '2020-11-19T13:27:20.635Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/lurie',
            description:
              'Neuron morphology provided by South East University, referenced in AIBS Mouse CCF',
            name: '18454-Z3747-X7161-Y3600',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp-external/seu',
              label: 'bbp-external/seu',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2020-12-07T14:34:29.112Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/lurie',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp-external/seu/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2Feb28243b-7e24-439f-b561-5773ef4731cb',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/d5ea8899-2747-4679-a07a-935426e676f9',
          _index:
            'delta_0645b2fe-3300-418c-ae25-c387348a0a84_afaea849-ad19-4703-b743-4ea05d094e13_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/d5ea8899-2747-4679-a07a-935426e676f9',
            '@type': [
              'https://neuroshapes.org/NeuronMorphology',
              'https://neuroshapes.org/ReconstructedWholeBrainCell',
              'https://neuroshapes.org/ReconstructedCell',
            ],
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/733',
              label: 'Ventral posteromedial nucleus of the thalamus',
            },
            createdAt: '2020-11-19T13:23:00.945Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/lurie',
            description:
              'Neuron morphology provided by South East University, referenced in AIBS Mouse CCF',
            name: '18455-Z3749-X7201-Y3716',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp-external/seu',
              label: 'bbp-external/seu',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2020-12-07T14:35:03.510Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/lurie',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp-external/seu/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2Fd5ea8899-2747-4679-a07a-935426e676f9',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/da21f1c1-bf94-4cfd-90a0-c33dca944a05',
          _index:
            'delta_1b7318dd-0200-403e-856c-34936cc0e7af_bd369fd9-dcfc-4238-b25a-13e1433186f9_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/da21f1c1-bf94-4cfd-90a0-c33dca944a05',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj1/circuits/SomatosensoryCxS1-v5.r0/O1/merged_circuit',
            },
            circuitConfigPath: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj1/circuits/SomatosensoryCxS1-v5.r0/O1/merged_circuit/CircuitConfig',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2020-10-15T11:29:32.807Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/adietz',
            description: 'O1.v5 created in 2014',
            name: 'O1.v5 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/alexander',
              label: 'bbp_test/alexander',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2020-10-15T11:29:32.807Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/adietz',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/alexander/_/da21f1c1-bf94-4cfd-90a0-c33dca944a05',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/4487421c-3c88-453d-9428-b36cbd7483a8',
          _index:
            'delta_33700068-ea0b-4c4f-a9d6-4e032048a9af_2d0ffa9b-3140-47fe-beb4-eecfd60aa881_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/4487421c-3c88-453d-9428-b36cbd7483a8',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207',
            },
            circuitConfigPath: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207/CircuitConfig',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2020-10-13T09:50:45.625Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            description: 'unreleased O1.v6a circuit created in 2018',
            name: 'O1.v6a 20181207 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/hugo',
              label: 'bbp_test/hugo',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2020-10-13T09:50:45.625Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/hugo/_/4487421c-3c88-453d-9428-b36cbd7483a8',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/9dd48ba6-d9b4-4dbe-ba5b-287d1c3d9e66',
          _index:
            'delta_33700068-ea0b-4c4f-a9d6-4e032048a9af_2d0ffa9b-3140-47fe-beb4-eecfd60aa881_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/9dd48ba6-d9b4-4dbe-ba5b-287d1c3d9e66',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207',
            },
            circuitConfigPath: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207/CircuitConfig',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2020-10-13T11:37:36.877Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            description: 'unreleased O1.v6a circuit created in 2018',
            name: 'O1.v6a 20181207 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/hugo',
              label: 'bbp_test/hugo',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2020-10-13T11:37:36.877Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/hugo/_/9dd48ba6-d9b4-4dbe-ba5b-287d1c3d9e66',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/a4372d6e-eda1-4791-be92-34d9c1f2938b',
          _index:
            'delta_33700068-ea0b-4c4f-a9d6-4e032048a9af_2d0ffa9b-3140-47fe-beb4-eecfd60aa881_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/a4372d6e-eda1-4791-be92-34d9c1f2938b',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207',
            },
            circuitConfigPath: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207/CircuitConfig',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2021-01-26T13:19:31.574Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            description: 'unreleased O1.v6a circuit created in 2018',
            name: 'O1.v6a 20181207 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/hugo',
              label: 'bbp_test/hugo',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-01-26T13:19:31.574Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/hugo/_/a4372d6e-eda1-4791-be92-34d9c1f2938b',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/1ed63817-9a95-448c-9451-c32d62374b54',
          _index:
            'delta_33700068-ea0b-4c4f-a9d6-4e032048a9af_2d0ffa9b-3140-47fe-beb4-eecfd60aa881_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/1ed63817-9a95-448c-9451-c32d62374b54',
            '@type': 'https://neuroshapes.org/DetailedCircuit',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            circuitBase: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207',
            },
            circuitConfigPath: {
              '@id':
                'file:///gpfs/bbp.cscs.ch/project/proj64/var/git/circuits/O1.v6a/20181207/CircuitConfig',
            },
            circuitType: 'Circuit with O1 geometry',
            createdAt: '2021-01-26T13:24:00.885Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            description: 'unreleased O1.v6a circuit created in 2018',
            name: 'O1.v6a 20181207 (Rat)',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/hugo',
              label: 'bbp_test/hugo',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-01-26T13:24:00.885Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/dictus',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/hugo/_/1ed63817-9a95-448c-9451-c32d62374b54',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/78b0ea56-04ba-4607-b7cf-d5ceeab6fe5d',
          _index:
            'delta_373b32df-76a1-4a4c-b6c2-d9e7d93662f7_24150b97-9160-4f0e-9349-dcd0410145ad_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/78b0ea56-04ba-4607-b7cf-d5ceeab6fe5d',
            '@type': [
              'https://neuroshapes.org/NeuronMorphology',
              'https://neuroshapes.org/ReconstructedCell',
            ],
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            createdAt: '2021-04-20T16:11:51.537Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            description:
              'This dataset is about an in vitro-filled neuron morphology from layer 1 with m-type L1_DAC. The distribution contains the neuron morphology in ASC and in SWC file format.',
            license: {
              identifier: 'https://creativecommons.org/licenses/by/4.0/',
            },
            mType: {
              identifier: 'http://uri.interlex.org/base/ilx_0383192',
              label: 'L1_DAC',
            },
            name: 'sm120429_2photon_a1-3_idA',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion-bbp-ulbrich/sscx',
              label: 'fusion-bbp-ulbrich/sscx',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-04-20T16:11:51.537Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-bbp-ulbrich/sscx/_/neuronmorphologies%2F78b0ea56-04ba-4607-b7cf-d5ceeab6fe5d',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/c5214504-d85c-46d1-b166-b4bf915322ae',
          _index:
            'delta_373b32df-76a1-4a4c-b6c2-d9e7d93662f7_24150b97-9160-4f0e-9349-dcd0410145ad_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/c5214504-d85c-46d1-b166-b4bf915322ae',
            '@type': [
              'https://neuroshapes.org/ReconstructedCell',
              'https://neuroshapes.org/NeuronMorphology',
            ],
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            createdAt: '2021-04-20T16:12:07.888Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            description:
              'This dataset is about an in vitro-filled neuron morphology from layer 1 with m-type L1_DAC. The distribution contains the neuron morphology in ASC and in SWC file format.',
            license: {
              identifier: 'https://creativecommons.org/licenses/by/4.0/',
            },
            mType: {
              identifier: 'http://uri.interlex.org/base/ilx_0383192',
              label: 'L1_DAC',
            },
            name: 'sm080625a1-6_idD',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion-bbp-ulbrich/sscx',
              label: 'fusion-bbp-ulbrich/sscx',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-04-20T16:12:07.888Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-bbp-ulbrich/sscx/_/neuronmorphologies%2Fc5214504-d85c-46d1-b166-b4bf915322ae',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/e00798e9-6c47-48ad-bb4b-ec863863cbcd',
          _index:
            'delta_373b32df-76a1-4a4c-b6c2-d9e7d93662f7_24150b97-9160-4f0e-9349-dcd0410145ad_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/e00798e9-6c47-48ad-bb4b-ec863863cbcd',
            '@type': [
              'https://neuroshapes.org/NeuronMorphology',
              'https://neuroshapes.org/ReconstructedCell',
            ],
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            createdAt: '2021-04-20T16:12:24.401Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            description:
              'This dataset is about an in vitro-filled neuron morphology from layer 1 with m-type L1_DAC. The distribution contains the neuron morphology in ASC and in SWC file format.',
            license: {
              identifier: 'https://creativecommons.org/licenses/by/4.0/',
            },
            mType: {
              identifier: 'http://uri.interlex.org/base/ilx_0383192',
              label: 'L1_DAC',
            },
            name: 'sm080529a1-5_idA',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion-bbp-ulbrich/sscx',
              label: 'fusion-bbp-ulbrich/sscx',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-04-20T16:12:24.401Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-bbp-ulbrich/sscx/_/neuronmorphologies%2Fe00798e9-6c47-48ad-bb4b-ec863863cbcd',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/3a8b4b05-977c-4c5e-848b-dbbea46fa7c2',
          _index:
            'delta_373b32df-76a1-4a4c-b6c2-d9e7d93662f7_24150b97-9160-4f0e-9349-dcd0410145ad_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/3a8b4b05-977c-4c5e-848b-dbbea46fa7c2',
            '@type': 'https://neuroshapes.org/Trace',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            createdAt: '2021-04-20T16:12:49.391Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            license: {
              identifier: 'https://creativecommons.org/licenses/by/4.0/',
            },
            name: 'C010600A2-MT-C1',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion-bbp-ulbrich/sscx',
              label: 'fusion-bbp-ulbrich/sscx',
            },
            subjectAge: {
              label: '13 days Post-natal',
              period: 'Post-natal',
              unit: 'days',
              value: 13,
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-04-20T16:12:49.391Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-bbp-ulbrich/sscx/_/3a8b4b05-977c-4c5e-848b-dbbea46fa7c2',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/b980345f-667a-4aaf-8238-9afa85147eb1',
          _index:
            'delta_373b32df-76a1-4a4c-b6c2-d9e7d93662f7_24150b97-9160-4f0e-9349-dcd0410145ad_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/b980345f-667a-4aaf-8238-9afa85147eb1',
            '@type': 'https://neuroshapes.org/Trace',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            createdAt: '2021-04-20T16:13:02.912Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            license: {
              identifier: 'https://creativecommons.org/licenses/by/4.0/',
            },
            name: 'C010600C1-MT-C1',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion-bbp-ulbrich/sscx',
              label: 'fusion-bbp-ulbrich/sscx',
            },
            subjectAge: {
              label: '13 days Post-natal',
              period: 'Post-natal',
              unit: 'days',
              value: 13,
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-04-20T16:13:02.912Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-bbp-ulbrich/sscx/_/b980345f-667a-4aaf-8238-9afa85147eb1',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/9ada1e92-f65d-4def-be2b-b102cc18ff13',
          _index:
            'delta_373b32df-76a1-4a4c-b6c2-d9e7d93662f7_24150b97-9160-4f0e-9349-dcd0410145ad_4',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/9ada1e92-f65d-4def-be2b-b102cc18ff13',
            '@type': 'https://neuroshapes.org/Trace',
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0008933',
              label: 'primary somatosensory cortex',
            },
            createdAt: '2021-04-20T16:13:18.522Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            license: {
              identifier: 'https://creativecommons.org/licenses/by/4.0/',
            },
            name: 'C011101B2-MT-C1',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion-bbp-ulbrich/sscx',
              label: 'fusion-bbp-ulbrich/sscx',
            },
            subjectAge: {
              label: '14 days Post-natal',
              period: 'Post-natal',
              unit: 'days',
              value: 14,
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            updatedAt: '2021-04-20T16:13:18.522Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/ulbrich',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-bbp-ulbrich/sscx/_/9ada1e92-f65d-4def-be2b-b102cc18ff13',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1024',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1024',
            '@type': [
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/Datatset,',
              'https://neuroshapes.org/NeuronMorphology',
            ],
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/1017',
              label: 'Ansiform lobule',
            },
            createdAt: '2021-06-25T16:55:47.012Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1024',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-25T16:55:47.012Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1024',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1015',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1015',
            '@type': [
              'https://neuroshapes.org/NeuronMorphology',
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/Datatset',
            ],
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/1007',
              label: 'Simple lobule',
            },
            createdAt: '2021-06-25T16:55:47.003Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1015',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-25T17:21:57.022Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1015',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1076',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1076',
            '@type': 'https://neuroshapes.org/NeuronMorphology',
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/931',
              label: 'Pontine gray',
            },
            createdAt: '2021-06-30T13:11:53.120Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1076',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-30T13:11:53.120Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1076',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1089',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1089',
            '@type': 'https://neuroshapes.org/NeuronMorphology',
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/918',
              label: 'Entorhinal area lateral part',
            },
            createdAt: '2021-06-30T13:11:53.124Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1089',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-30T13:11:53.124Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1089',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1477',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1477',
            '@type': 'https://neuroshapes.org/NeuronMorphology',
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/342',
              label: 'Substantia innominata',
            },
            createdAt: '2021-06-30T13:11:53.122Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1477',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-30T13:11:53.122Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1477',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1493',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1493',
            '@type': 'https://neuroshapes.org/NeuronMorphology',
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/342',
              label: 'Substantia innominata',
            },
            createdAt: '2021-06-30T13:11:53.125Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1493',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-30T13:11:53.125Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1493',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1061',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_5',
          _score: 1.0,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/AA1061',
            '@type': 'https://neuroshapes.org/NeuronMorphology',
            brainRegion: {
              identifier: 'http://api.brain-map.org/api/v2/data/Structure/658',
              label: 'lateral lemniscus',
            },
            createdAt: '2021-06-30T13:11:53.127Z',
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            description:
              'CCFv2.5 (ML legacy) Axes> Z: Anterior-Posterior; Y: Inferior-Superior; X:Left-Right',
            license: { identifier: 'https://mouselight.janelia.org/' },
            name: 'AA1061',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.443970.d' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
              label: 'Mus musculus',
            },
            updatedAt: '2021-06-30T13:11:53.127Z',
            updatedBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2FAA1061',
          },
          _type: '_doc',
        },
      ],
      max_score: 1.0,
      total: { relation: 'eq', value: 14361 },
    },
    timed_out: false,
    took: 3852,
    _shards: { failed: 0, skipped: 840, successful: 1139, total: 1139 },
  };

  type SearchConfig = {
    fields: (
      | {
          name: string;
          label: string;
          array: boolean;
          fields: {
            name: string;
            format: string | string[];
            optional: boolean;
          }[];
          optional: boolean;
          format?: undefined;
        }
      | {
          name: string;
          label: string;
          format: string | string[];
          array: boolean;
          optional?: boolean;
          fields?: undefined;
        }
    )[];
  };

  const searchConfig: SearchConfig = {
    fields: [
      {
        array: false,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: false,
          },
        ],
        label: 'Project',
        name: 'project',
        optional: false,
      },
      {
        array: true,
        format: ['uri'],
        label: 'Types',
        name: '@type',
        optional: false,
      },
      {
        array: false,
        format: ['keyword', 'text'],
        label: 'Name',
        name: 'name',
        optional: true,
      },
      {
        array: false,
        format: ['text'],
        label: 'Description',
        name: 'description',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'Brain Region',
        name: 'brainRegion',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'Subject Species',
        name: 'subjectSpecies',
        optional: true,
      },
      {
        array: true,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'Contributors',
        name: 'contributors',
        optional: true,
      },
      {
        array: true,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'Organizations',
        name: 'organizations',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'License',
        name: 'license',
        optional: true,
      },
      {
        array: true,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'M-Type',
        name: 'mType',
        optional: true,
      },
      {
        array: true,
        fields: [
          {
            format: ['uri'],
            name: 'identifier',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
        ],
        label: 'E-Type',
        name: 'eType',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['number'],
            name: 'value',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: false,
          },
          {
            format: ['keyword'],
            name: 'unit',
            optional: false,
          },
        ],
        label: 'Subject Age',
        name: 'subjectAge',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['number'],
            name: 'value',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
          {
            format: ['keyword'],
            name: 'unit',
            optional: false,
          },
          {
            format: ['number'],
            name: 'nValue',
            optional: false,
          },
        ],
        label: 'Neuron Density',
        name: 'neuronDensity',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['number'],
            name: 'value',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
          {
            format: ['keyword'],
            name: 'unit',
            optional: false,
          },
          {
            format: ['number'],
            name: 'nValue',
            optional: false,
          },
        ],
        label: 'Layer Thickness',
        name: 'layerThickness',
        optional: true,
      },
      {
        array: false,
        fields: [
          {
            format: ['number'],
            name: 'value',
            optional: false,
          },
          {
            format: ['keyword', 'text'],
            name: 'label',
            optional: true,
          },
          {
            format: ['keyword'],
            name: 'unit',
            optional: false,
          },
        ],
        label: 'Bouton Density',
        name: 'boutonDensity',
        optional: true,
      },
      {
        array: false,
        format: ['text'],
        label: 'Circuit Type',
        name: 'circuitType',
        optional: true,
      },
      {
        array: false,
        format: ['uri'],
        label: 'Circuit Base',
        name: 'circuitBase',
        optional: true,
      },
      {
        array: false,
        format: ['uri'],
        label: 'Circuit Config',
        name: 'circuitConfigPath',
        optional: true,
      },
      {
        array: false,
        format: ['date'],
        label: 'Created At',
        name: 'createdAt',
        optional: false,
      },
      {
        array: false,
        format: ['uri'],
        label: 'Created By',
        name: 'createdBy',
        optional: false,
      },
      {
        array: false,
        format: ['date'],
        label: 'Last Modified',
        name: 'updatedAt',
        optional: false,
      },
      {
        array: false,
        format: ['uri'],
        label: 'Last Modified By',
        name: 'updatedBy',
        optional: false,
      },
    ],
  };

  const filter = function(pathname: string, req: express.Request) {
    const query =
      pathname.match('^/proxy/search/query') && req.method === 'POST';
    const config =
      pathname.match('^/proxy/search/config') && req.method === 'GET';
    if (query || config) {
      return false;
    }
    return true;
  };

  app.use(
    '/proxy',
    createProxyMiddleware(filter, {
      target: apiEndpoint,
      changeOrigin: true,
      pathRewrite: {
        [`^/proxy`]: '',
      },
    })
  );
  // search proxy
  app.get(
    `/proxy/search/config`,
    (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(searchConfig));
    }
  );

  // search query
  app.post(
    `/proxy/search/query`,
    (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(esResult));
    }
  );
}

export default setUpDeltaProxy;
