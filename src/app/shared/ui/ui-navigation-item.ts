import { IconName } from './icon/icon.component';

export interface NavigationItem {
  label: string;
  route: string;
  icon?: IconName;
  exact?: boolean;
}
