import ReactJson from 'react-json-view';

type Props = {
  data: any;
  header?: string;
  showHeader?: boolean;
};

const ResponseViewer = ({ data, showHeader = false, header = '' }: Props) => {
  return (
    <ReactJson
      collapsed
      name={showHeader ? header : undefined}
      src={data as object}
      indentWidth={3}
      iconStyle="square"
      enableClipboard={false}
      displayObjectSize={false}
      displayDataTypes={false}
      style={{ maxWidth: 'inherit', width: '600px' }}
    />
  );
};

export default ResponseViewer;
