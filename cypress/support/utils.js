const inputs = [
  'thalamus',
  'neurotransmitters',
  'angiography',
  'cerebrospinal',
  'mapping',
  'cortex',
  'synaptic',
  'vestibular',
  'optogenetics',
  'neuron',
  'microglia',
  'insula',
  'expression',
  'phenotyping',
  'connectome',
  'sensory',
  'spinal',
  'cord',
  'data',
  'ion',
  'potential',
  'stem',
  'integrative',
  'project',
  'cognition',
  'neocortical',
  'biomedical',
  'molecular',
  'polyphenols',
  'trans-resveratrol',
  'angiographic',
  'multimerization',
  'derivatives',
  'randomized',
  'vivarium',
  'monophosphate',
  'protein',
  'measurements',
  'procedure',
];

const randomValue = array => array[Math.floor(Math.random() * array.length)];

export const createInput = () => {
  return randomValue(inputs) + '-cy-test';
};

export const createLongerInput = () => {
  return randomValue(inputs) + ' ' + randomValue(inputs) + 'cypress test';
};
