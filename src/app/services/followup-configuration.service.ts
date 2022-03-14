import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FollowupConfigurationPopupComponent } from "@app/administration/popups/followup-configuration-popup/followup-configuration-popup.component";
import { BackendWithDialogOperationsGenericService } from "@app/generics/backend-with-dialog-operations-generic-service";
import { FollowupConfigurationInterceptor } from "@app/model-interceptors/followup-configuration-interceptor";
import { FollowupConfiguration } from "@app/models/followup-configuration";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root",
})
export class FollowupConfigurationService extends BackendWithDialogOperationsGenericService<FollowupConfiguration> {
  interceptor: FollowupConfigurationInterceptor = new FollowupConfigurationInterceptor();

  list: FollowupConfiguration[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService,
    ) {
    super();
    FactoryService.registerService('FollowupConfigurationService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return FollowupConfigurationPopupComponent;
  }
  _getSendInterceptor() {
    return this.interceptor.send;
  }
  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }
  _getModel() {
    return FollowupConfiguration;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_CONFIGURATION;
  }

}
