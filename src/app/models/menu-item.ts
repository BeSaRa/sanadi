import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {ConfigurationService} from '../services/configuration.service';
import {IAppConfig} from '../interfaces/i-app-config';

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
  configService: ConfigurationService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
    this.configService = FactoryService.getService('ConfigurationService');
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

  preparePermissionList(): void {
    this.permissionList = this.permissionGroup ? (this.configService.CONFIG[this.permissionGroup as keyof IAppConfig] as string[] || []) : [];
  }

  getPermissions(): string[] | string {
    return this.permissionList.length ? this.permissionList : this.permission;
  }
}
