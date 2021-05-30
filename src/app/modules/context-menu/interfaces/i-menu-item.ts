import {ILanguageKeys} from '../../../interfaces/i-language-keys';

export interface IMenuItem {
  type: 'action' | 'divider';
  onClick?: (item?: any) => void;
  data?: {
    hideFromViewer?: boolean,
    closeViewerAfterClick?: boolean
  };
  label?: keyof ILanguageKeys | ((item?: any) => string);
  icon?: string;
  show?: (item?: any) => boolean;
  children?: IMenuItem[]
}
