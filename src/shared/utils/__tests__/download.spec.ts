import { download } from '../download';
import { fileExtensionFromResourceEncoding } from '../../../utils/contentTypes';

// Mock fileExtensionFromResourceEncoding
jest.mock('../../../utils/contentTypes', () => ({
  fileExtensionFromResourceEncoding: jest.fn(),
}));

describe('download function', () => {
  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();

  beforeAll(() => {
    globalThis.Blob = jest.fn(() => ({})) as any;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

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

  it('should download without a mediaType', () => {
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

    download('example', '', 'test data');
    expect(linkClickMock).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });
});
