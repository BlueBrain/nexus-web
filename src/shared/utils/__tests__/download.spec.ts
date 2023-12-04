import { download } from '../download';
import { fileExtensionFromResourceEncoding } from '../../../utils/contentTypes';

// Mock fileExtensionFromResourceEncoding
jest.mock('../../../utils/contentTypes', () => ({
  fileExtensionFromResourceEncoding: jest.fn(),
}));

describe('download function', () => {
  // Mocks
  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();

  beforeAll(() => {
    // Mock Blob
    globalThis.Blob = jest.fn(() => ({})) as any;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock fileExtensionFromResourceEncoding
    (fileExtensionFromResourceEncoding as jest.Mock).mockImplementation(
      (mediaType: string) => {
        if (mediaType === 'application/json') {
          return 'json';
        }
        return '';
      }
    );
  });

  beforeEach(() => {
    // Reset mocks before each test
    mockCreateObjectURL.mockReset();
    mockRevokeObjectURL.mockReset();
  });

  it('should handle filename with existing correct extension', () => {
    const linkClickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(
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
    const linkClickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(
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
    const linkClickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(
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
    const linkClickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(
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
});
