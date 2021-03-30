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
  isSvg: boolean = true;
  permissionGroup!: string;
  permissionList: string[] = [];
  permission!: string;
  parent!: number;
  group: string = '';
  children: MenuItem[] = [];
  expend: boolean = false;
  langService: LangService;
  configService: ConfigurationService;
  arName!: string;
  enName!: string;
  arSearchText!: string;
  enSearchText!: string;

  constructor() {
    this.langService = FactoryService.getService('LangService');
    this.configService = FactoryService.getService('ConfigurationService');
  }

  getName(): string {
    return this.langService.map[this.langKey];
  }

  isSVGIcon(): boolean {
    return this.isSvg;
  }

  isFontIcon(): boolean {
    return !this.isSvg;
  }

  preparePermissionList(): void {
    this.permissionList = this.permissionGroup ? (this.configService.CONFIG[this.permissionGroup as keyof IAppConfig] as string[] || []) : [];
  }

  getPermissions(): string[] | string {
    return this.permissionList.length ? this.permissionList : this.permission;
  }

  toggle(): void {
    this.expend = !this.expend;
  }

  getLangKeyValues(): void {
    this.enName = this.langService.getEnglishLocalByKey(this.langKey);
    this.arName = this.langService.getArabicLocalByKey(this.langKey);
  }

  getChildrenText(parentArName?: string, parentEnName?: string): void {
    this.arSearchText = parentArName ? parentArName + this.arName.toLowerCase() : this.arName.toLowerCase();
    this.enSearchText = parentEnName ? parentEnName + this.enName.toLowerCase() : this.enName.toLowerCase();
    this.children.forEach(item => {
      item.getChildrenText(this.arName.toLowerCase(), this.enName.toLowerCase());
      this.arSearchText += item.arSearchText;
      this.enSearchText += item.enSearchText;
    });
  }
}
