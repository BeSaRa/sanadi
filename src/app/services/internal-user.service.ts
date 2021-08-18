import {Injectable} from '@angular/core';
import {InternalUser} from "@app/models/internal-user";
import {HttpClient} from "@angular/common/http";
import {InternalUserInterceptor} from "@app/model-interceptors/internal-user-interceptor";
import {UrlService} from "@app/services/url.service";
import {BackendWithDialogOperationsGenericService} from "@app/generics/backend-with-dialog-operations-generic-service";

@Injectable({
  providedIn: 'root'
})
export class InternalUserService extends BackendWithDialogOperationsGenericService<InternalUser> {
  list: InternalUser[] = [];
  interceptor: InternalUserInterceptor = new InternalUserInterceptor();

  constructor(public http: HttpClient, private urlService: UrlService) {
    super()
  }

  _getModel() {
    return InternalUser;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_USER;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }
}
