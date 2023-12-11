export type LinterIssue = {
  message: string;
  line: number;
};

export const customLinter = (text: string): LinterIssue[] => {
  const linterErrors: LinterIssue[] = [];
  const lines = text.split('\n');

  // TODO Improve the performance of this linter by only checking the lines that have changed
  lines.forEach(line => {
    // TODO Check to only check if it's an underscore at the beginning of the line
    const regex = /"([^"]*_[^"]*)"\s*:/g;
    if (line.match(regex)) {
      linterErrors.push({
        message: 'Cannot have fields starting with an underscore',
        line: lines.indexOf(line) + 1,
      });
    }
  });

  return linterErrors;
};
