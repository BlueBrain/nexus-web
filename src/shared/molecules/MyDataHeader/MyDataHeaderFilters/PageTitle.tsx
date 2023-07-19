import { TTitleProps } from 'shared/canvas/MyData/types';
import { prettifyNumber } from '../../../../utils/formatNumber';

const PageTitle = ({ text, label, total }: TTitleProps) => {
  return (
    <div className="my-data-header-title_heading">
      <span>{text}</span>
      <span>{total ? `${prettifyNumber(total)} ${label}` : ''}</span>
    </div>
  );
};

export default PageTitle;
