import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';

export class MenuItem {
  id!: number;
  langKey!: keyof ILanguageKeys;
  path!: string;
  icon!: string;
  iconType: 'svg' | 'font' = 'font';
  permissionGroup!: string;
  permissionList: string[] = [];
  permission!: string;
  parent!: number;
  group: string = '';
  children: MenuItem[] = [];
  langService: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService.map[this.langKey];
  }

  isSVGIcon(): boolean {
    return this.iconType === 'svg';
  }

  isFontIcon(): boolean {
    return this.iconType === 'font';
  }
}
