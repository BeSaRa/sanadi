import {BaseModel} from '@models/base-model';
import {GlobalSettingsService} from '@services/global-settings.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {InterceptModel} from '@decorators/intercept-model';
import {GlobalSettingsInterceptor} from '@model-interceptors/global-settings-interceptor';

const interceptor: GlobalSettingsInterceptor = new GlobalSettingsInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class GlobalSettings extends BaseModel<GlobalSettings, GlobalSettingsService> {
  systemArabicName!: string;
  systemEnName!: string;
  sessionTimeout!: number;
  fileSize!: number;
  fileType!: string;
  inboxRefreshInterval!: number;
  supportEmailList!: string;
  enableMailNotification!: boolean;
  enableSMSNotification!: boolean;

  service: GlobalSettingsService;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('GlobalSettingsService');
  }
}
