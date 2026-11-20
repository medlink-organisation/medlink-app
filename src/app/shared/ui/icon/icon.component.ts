import { Component, Input } from '@angular/core';
import {
  lucideActivity,
  lucideBell,
  lucideBuilding2,
  lucideCalendarDays,
  lucideCalendarX,
  lucideCheck,
  lucideChevronDown,
  lucideChevronRight,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCircleX,
  lucideClipboardList,
  lucideClock3,
  lucideFileText,
  lucideImage,
  lucideInfo,
  lucideHouse,
  lucideLayoutDashboard,
  lucideLoaderCircle,
  lucideLogOut,
  lucideMenu,
  lucideMinus,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSettings,
  lucideShieldCheck,
  lucideStethoscope,
  lucideTags,
  lucideTrendingDown,
  lucideTrendingUp,
  lucideUploadCloud,
  lucideUserRound,
  lucideUsers,
  lucideX
} from '@ng-icons/lucide';

const ICONS = {
  activity: lucideActivity,
  bell: lucideBell,
  building: lucideBuilding2,
  calendar: lucideCalendarDays,
  'calendar-x': lucideCalendarX,
  check: lucideCheck,
  'chevron-down': lucideChevronDown,
  'chevron-right': lucideChevronRight,
  'circle-alert': lucideCircleAlert,
  'circle-check': lucideCircleCheck,
  'circle-x': lucideCircleX,
  clipboard: lucideClipboardList,
  clock: lucideClock3,
  dashboard: lucideLayoutDashboard,
  file: lucideFileText,
  image: lucideImage,
  info: lucideInfo,
  home: lucideHouse,
  loader: lucideLoaderCircle,
  logout: lucideLogOut,
  menu: lucideMenu,
  minus: lucideMinus,
  'panel-close': lucidePanelLeftClose,
  'panel-open': lucidePanelLeftOpen,
  plus: lucidePlus,
  refresh: lucideRefreshCw,
  search: lucideSearch,
  settings: lucideSettings,
  shield: lucideShieldCheck,
  stethoscope: lucideStethoscope,
  tag: lucideTags,
  'trending-down': lucideTrendingDown,
  'trending-up': lucideTrendingUp,
  upload: lucideUploadCloud,
  user: lucideUserRound,
  users: lucideUsers,
  x: lucideX
} as const;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  standalone: false
})
export class IconComponent {
  @Input({ required: true }) name: IconName = 'info';
  @Input() size: string | number = 20;
  @Input() label = '';
  @Input() strokeWidth: string | number = 1.8;

  get svg(): string {
    return ICONS[this.name];
  }

  get iconSize(): string {
    return typeof this.size === 'number' ? `${this.size}px` : this.size;
  }
}
