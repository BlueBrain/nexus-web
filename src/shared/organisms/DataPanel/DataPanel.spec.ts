import { createNexusClient } from '@bbp/nexus-sdk';
import { vi as jest } from 'vitest';

import {
  getMockDistribution,
  getMockResource,
  resourceWithDistributionArray,
  resourceWithoutDistrition,
} from '../../../shared/utils/__mocks__/data_panel_download_resource';
import { ParsedNexusUrl } from '../../../shared/utils/nexusParse';
import { downloadArchive } from './DataPanel';
const mockNexus = createNexusClient({
  uri: 'https://localhost',
  fetch: {},
});

const mockParsedDataFromUrl: ParsedNexusUrl = {
  url: 'https://localhost/nexus/v1/projects/testorg/testproject',
  deployment: 'https://localhost/nexus',
  apiVersion: 'v1',
  entityType: 'projects',
  org: 'testorg',
  project: 'testproject',
  id: '123',
};

describe('DataPanel', () => {
  it('throws errors when create archive endpoint throws', async () => {
    mockNexus.Resource.get = vi.fn().mockResolvedValue(resourceWithoutDistrition);
    const mockEndpointError = new Error('Test Mock Error');
    mockNexus.Archive.create = vi.fn().mockRejectedValue(mockEndpointError);

    try {
      await downloadArchive({
        nexus: mockNexus,
        parsedData: mockParsedDataFromUrl,
        resourcesPayload: [getMockResource()],
        size: '0 Bytes',
        selectedTypes: [],
      });
    } catch (err) {
      const receivedError: any = err;
      expect(receivedError.message).toEqual('Error when creating archive');
      // @ts-ignore
      expect(receivedError.cause.errors).toEqual(mockEndpointError);
    }
  });

  it('does not contain warnings if all resources were found but archive create failed', async () => {
    mockNexus.Resource.get = vi.fn().mockResolvedValue(resourceWithoutDistrition);
    const mockEndpointError = new Error('Test Mock Error');
    mockNexus.Archive.create = vi.fn().mockRejectedValue(mockEndpointError);

    try {
      await downloadArchive({
        nexus: mockNexus,
        parsedData: mockParsedDataFromUrl,
        resourcesPayload: [getMockResource()],
        size: '0 Bytes',
        selectedTypes: [],
      });
    } catch (err) {
      const receivedError: any = err;
      expect(receivedError.cause.warnings).toEqual([]);
    }
  });

  it('contains warnings for each resource not found when archive creation failed', async () => {
    mockNexus.Resource.get = vi
      .fn()
      .mockResolvedValueOnce(resourceWithoutDistrition)
      .mockRejectedValueOnce(new Error('Mock resource 2 not found'))
      .mockRejectedValueOnce(new Error('Mock resource 3 not found'));

    const mockEndpointError = new Error('Test Mock Error');
    mockNexus.Archive.create = vi.fn().mockRejectedValue(mockEndpointError);

    try {
      await downloadArchive({
        nexus: mockNexus,
        parsedData: mockParsedDataFromUrl,
        resourcesPayload: [
          getMockResource('testresource1'),
          getMockResource('testresource2'),
          getMockResource('testresource3'),
        ],
        size: '0 Bytes',
        selectedTypes: [],
      });
    } catch (err) {
      const receivedError: any = err;
      expect(receivedError.cause.warnings.length).toEqual(2);
    }
  });

  it('throws errors when archive get endpoint failed', async () => {
    mockNexus.Resource.get = vi.fn().mockResolvedValue(resourceWithoutDistrition);

    mockNexus.Archive.create = vi.fn().mockResolvedValue('Archive create passed');
    const mockEndpointError = new Error('However, Archive get failed');
    mockNexus.httpGet = vi.fn().mockRejectedValue(mockEndpointError);

    try {
      await downloadArchive({
        nexus: mockNexus,
        parsedData: mockParsedDataFromUrl,
        resourcesPayload: [
          getMockResource('testresource1'),
          getMockResource('testresource2'),
          getMockResource('testresource3'),
        ],
        size: '0 Bytes',
        selectedTypes: [],
      });
    } catch (err) {
      const receivedError: any = err;
      expect(receivedError.message).toEqual('Error when fetching archive');
      // @ts-ignore
      expect(receivedError.cause.errors).toEqual(mockEndpointError);
      expect(receivedError.cause.warnings).toEqual([]);
    }
  });

  it('contains warnings for each resource not found when archive fetching failed', async () => {
    mockNexus.Resource.get = vi
      .fn()
      .mockResolvedValueOnce(resourceWithoutDistrition)
      .mockRejectedValueOnce(new Error('Mock resource 2 not found'))
      .mockRejectedValueOnce(new Error('Mock resource 3 not found'));

    mockNexus.Archive.create = vi.fn().mockResolvedValue('Archive create passed');
    const mockEndpointError = new Error('However, Archive get failed');
    mockNexus.httpGet = vi.fn().mockRejectedValue(mockEndpointError);

    try {
      await downloadArchive({
        nexus: mockNexus,
        parsedData: mockParsedDataFromUrl,
        resourcesPayload: [
          getMockResource('testresource1'),
          getMockResource('testresource2'),
          getMockResource('testresource3'),
        ],
        size: '0 Bytes',
        selectedTypes: [],
      });
    } catch (err) {
      const receivedError: any = err;
      expect(receivedError.message).toEqual('Error when fetching archive');
      // @ts-ignore
      expect(receivedError.cause.errors).toEqual(mockEndpointError);
      expect(receivedError.cause.warnings.length).toEqual(2);
    }
  });

  it('does not throw if neither archive create nor archive fetch failed', async () => {
    mockNexus.Resource.get = vi.fn().mockResolvedValue(resourceWithoutDistrition);

    mockNexus.Archive.create = vi.fn().mockResolvedValue('Archive create passed');
    mockNexus.httpGet = vi.fn().mockResolvedValue(new Blob());

    const result = await downloadArchive({
      nexus: mockNexus,
      parsedData: mockParsedDataFromUrl,
      resourcesPayload: [
        getMockResource('testresource1'),
        getMockResource('testresource2'),
        getMockResource('testresource3'),
      ],
      size: '0 Bytes',
      selectedTypes: [],
    });

    expect(result.archiveId).toBeTruthy();
    expect(result.blob).toBeTruthy();
    expect(result.errors.length).toEqual(0);
  });

  it('does not throw but contains warnings if some resources were not found but archive creation passed', async () => {
    mockNexus.Resource.get = vi
      .fn()
      .mockResolvedValue(resourceWithoutDistrition)
      .mockRejectedValueOnce(new Error('Mock resource 2 not found'))
      .mockRejectedValueOnce(new Error('Mock resource 3 not found'));

    mockNexus.Archive.create = vi.fn().mockResolvedValue('Archive create passed');
    mockNexus.httpGet = vi.fn().mockResolvedValue(new Blob());

    const result = await downloadArchive({
      nexus: mockNexus,
      parsedData: mockParsedDataFromUrl,
      resourcesPayload: [
        getMockResource('testresource1'),
        getMockResource('testresource2'),
        getMockResource('testresource3'),
      ],
      size: '0 Bytes',
      selectedTypes: [],
    });

    expect(result.archiveId).toBeTruthy();
    expect(result.blob).toBeTruthy();
    expect(result.errors.length).toEqual(2);
  });

  it('contains warnings for every distributions within resources that could not be fetched', async () => {
    mockNexus.Resource.get = vi.fn().mockResolvedValue(resourceWithDistributionArray); // resource with 4 distributions
    mockNexus.httpGet = vi
      .fn()
      // Out of 4 distributions, 2 were not fetched
      .mockRejectedValueOnce(new Error('Distribution 1 could not be found')) // Error for 1st distribution
      .mockRejectedValueOnce(new Error('Distribution 2 could not be found')) // Error for 2nd distribution
      .mockReturnValueOnce(getMockDistribution('mockfilename')) // Successful response for 3rd distribution
      .mockReturnValueOnce(getMockDistribution('mockfilename')) // Successful response for 4th distribution
      .mockResolvedValueOnce(new Blob()); // Successful response for get archive

    mockNexus.Archive.create = vi.fn().mockResolvedValue('Archive create passed');

    const result = await downloadArchive({
      nexus: mockNexus,
      parsedData: mockParsedDataFromUrl,
      resourcesPayload: [getMockResource('testresource1')],
      size: '0 Bytes',
      selectedTypes: ['ttl', 'csv', 'json'],
    });

    expect(result.archiveId).toBeTruthy();
    expect(result.blob).toBeTruthy();
    expect(result.errors.length).toEqual(2);
  });
});
