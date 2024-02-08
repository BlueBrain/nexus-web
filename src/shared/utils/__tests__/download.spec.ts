import { download } from '../download';
import { fileExtensionFromResourceEncoding } from '../../../utils/contentTypes';
import { vi, describe, it, expect, beforeAll, beforeEach, Mock } from 'vitest';

// Mocking modules with Vitest
vi.mock('../../../utils/contentTypes', () => {
  const originalModule = vi.importActual('../../../utils/contentTypes');
  return {
    ...originalModule,
    fileExtensionFromResourceEncoding: vi.fn(),
  };
});

describe('download function', () => {
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeAll(() => {
    // Global mocks setup with Vitest
    globalThis.Blob = vi.fn(() => ({})) as any;
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

    // Reset and redefine mocks here
    (fileExtensionFromResourceEncoding as Mock).mockImplementation(
      (mediaType: string) => {
        if (mediaType === 'application/json') {
          return 'json';
        }
        return ''; // Default mock return value
      }
    );
  });

  beforeEach(() => {
    mockCreateObjectURL.mockReset();
    mockRevokeObjectURL.mockReset();
    (fileExtensionFromResourceEncoding as Mock).mockReset();
  });

  it('should handle filename with existing correct extension', () => {
    const linkClickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          set href(url: string) {
            mockCreateObjectURL(url);
          },
          click: linkClickMock,
          download: '',
        } as any)
    );

    download('example.json', 'application/json', 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should handle filename with duplicate extension', () => {
    const linkClickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          set href(url: string) {
            mockCreateObjectURL(url);
          },
          click: linkClickMock,
          download: '',
        } as any)
    );

    download('example.json.json', 'application/json', 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should append extension if missing', () => {
    const linkClickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          set href(url: string) {
            mockCreateObjectURL(url);
          },
          click: linkClickMock,
          download: '',
        } as any)
    );

    download('example', 'application/json', 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should handle if filename is another type than extension', () => {
    const linkClickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          set href(url: string) {
            mockCreateObjectURL(url);
          },
          click: linkClickMock,
          download: '',
        } as any)
    );

    download('example.png', 'application/json', 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should handle if filename is another type than extension', () => {
    const linkClickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          set href(url: string) {
            mockCreateObjectURL(url);
          },
          click: linkClickMock,
          download: '',
        } as any)
    );

    download('example.png', 'application/json', 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should download without a mediaType', () => {
    const linkClickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          set href(url: string) {
            mockCreateObjectURL(url);
          },
          click: linkClickMock,
          download: '',
        } as any)
    );

    download('example', undefined, 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });
});
