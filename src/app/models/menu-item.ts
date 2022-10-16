import { LangService } from '@services/lang.service';
import { FactoryService } from '@services/factory.service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { ConfigurationService } from '@services/configuration.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Cloneable } from "@app/models/cloneable";
import { Common } from "@app/models/common";
import { MenuItemInterceptor } from '@app/model-interceptors/menu-item-interceptor';
import { InterceptModel } from "@decorators/intercept-model";
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {StaticAppResourcesService} from '@services/static-app-resources.service';

const { send, receive } = new MenuItemInterceptor();

@InterceptModel({ send, receive })
export class MenuItem extends Cloneable<MenuItem> {
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
  expand: boolean = false;
  langService: LangService;
  configService: ConfigurationService;
  arName!: string;
  enName!: string;
  arSearchText!: string;
  enSearchText!: string;
  svg?: string;
  safeSVG?: SafeHtml;
  itemOrder: number = 1;
  caseType?: number;
  counter?: keyof Common['counters']
  private domSanitizer: DomSanitizer;
  private resourcesService: StaticAppResourcesService;

  constructor() {
    super()
    this.langService = FactoryService.getService('LangService');
    this.configService = FactoryService.getService('ConfigurationService');
    this.domSanitizer = FactoryService.getService('DomSanitizer');
    this.resourcesService = FactoryService.getService('StaticAppResourcesService');
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
    this.permissionList = this.resourcesService.getPermissionsListByGroup(this.permissionGroup as PermissionGroupsEnum);
  }

  getPermissions(): string[] | string {
    return this.permissionList.length ? this.permissionList : this.permission;
  }

  toggle(): void {
    this.expand = !this.expand;
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

  sanitizeSVG(): void {
    this.isSVGIcon() && this.svg ? (this.safeSVG = this.domSanitizer.bypassSecurityTrustHtml(this.svg)) : null;
  }
}
