import './Categories.less';
import { CategoryWidgetProps } from '../../types/plugins/report';
declare const CategoryWidget: ({
  allCategories,
  availableCategories,
  selectedCategories,
  mode,
  toggleSelectCategory: selectCategory,
}: CategoryWidgetProps) => JSX.Element;
export default CategoryWidget;
