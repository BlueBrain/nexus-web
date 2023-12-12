export type LinterIssue = {
  message: string;
  line: number;
};

export const customLinter = (text: string): LinterIssue[] => {
  const linterErrors: LinterIssue[] = [];
  const lines = text.split('\n');

  // Check for fields starting with an underscore
  const regex = /"\s*_(\w+)"/g;

  lines.forEach(line => {
    if (line.match(regex)) {
      linterErrors.push({
        message: 'Cannot have fields starting with an underscore',
        line: lines.indexOf(line) + 1,
      });
    }
  });

  return linterErrors;
};
