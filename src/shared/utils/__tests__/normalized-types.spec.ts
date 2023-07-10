import { getNormalizedTypes } from '..';

describe('getNormalizedTypes', () => {
  const typesAsString = 'Resource';
  it('should return the normalized types', () => {
    const result = getNormalizedTypes(typesAsString);
    expect(result).toEqual(['Resource']);
  });

  const typesAsUrl = 'https://bluebrain.github.io/nexus/vocabulary/Resource';
  it('should return the normalized types', () => {
    const result = getNormalizedTypes(typesAsUrl);
    expect(result).toEqual(['Resource']);
  });

  const typesWithUrls = [
    'https://bluebrain.github.io/nexus/vocabulary/Schema',
    'https://bluebrain.github.io/nexus/vocabulary/Resource',
    'https://bluebrain.github.io/nexus/vocabulary/Project',
    'Realm',
    'NeuronMorphology',
  ];
  it('should return the normalized types', () => {
    const result = getNormalizedTypes(typesWithUrls);
    expect(result).toEqual([
      'Schema',
      'Resource',
      'Project',
      'Realm',
      'NeuronMorphology',
    ]);
  });
});
