import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Profile } from '@app/models/profile';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends CrudWithDialogGenericService<Profile>{
  list: Profile[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('ProfileService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => Profile {
    return Profile;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROFILE;
  }

}
