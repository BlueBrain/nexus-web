import { customLinter } from './customLinter';

describe('customLinter', () => {
  it('should return an empty array for valid text', () => {
    const text = `{
      "validField": "value"
    }`;
    const result = customLinter(text);
    expect(result).toEqual([]);
  });

  it('should detect a field starting with an underscore', () => {
    const text = `{
      "_invalidField": "value"
    }`;
    const result = customLinter(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      message: 'Cannot have fields starting with an underscore',
      line: 2,
    });
  });

  it('should detect multiple fields starting with underscores', () => {
    const text = `{
      "_invalidField1": "value",
      "validField": "value",
      "_invalidField2": "value"
    }`;
    const result = customLinter(text);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      message: 'Cannot have fields starting with an underscore',
      line: 2,
    });
    expect(result).toContainEqual({
      message: 'Cannot have fields starting with an underscore',
      line: 4,
    });
  });

  it('should detect a field starting with an underscore with spaces', () => {
    const text = `{
      "  _invalidField": "value"
    }`;
    const result = customLinter(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      message: 'Cannot have fields starting with an underscore',
      line: 2,
    });
  });

  it('should ignore a field that has an underscore in the middle', () => {
    const text = `{
      "valid_Field": "value"
    }`;
    const result = customLinter(text);
    expect(result).toEqual([]);
  });
});
