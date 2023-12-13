import { Observable, of } from 'rxjs';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { NpoData } from './../models/npo-data';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { ComponentType } from '@angular/cdk/portal';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { switchMap } from 'rxjs/operators';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { Pagination } from '@app/models/pagination';
import { NpoProfilePopupComponent } from '@app/administration/popups/npo-profile-popup/npo-profile-popup.component';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { NpoBankInterceptor } from '@app/model-interceptors/npo-bank-interceptor';
import { NpoBankAccount } from '@app/models/npo-bank-account';
import { RealBeneficiaryInterceptor } from '@app/model-interceptors/real-beneficiary-interceptors';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { FounderMemberInterceptor } from '@app/model-interceptors/founder-member-interceptor';
import { FounderMembers } from '@app/models/founder-members';

@CastResponseContainer({
  $default: {
    model: () => NpoData
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => NpoData }
  }
})
@Injectable({
  providedIn: 'root'
})
export class NpoDataService extends CrudWithDialogGenericService<NpoData> {
  _getDialogComponent(): ComponentType<any> {
    return NpoProfilePopupComponent;
  }
  list: NpoData[] = [];
  npoBankInterceptor: IModelInterceptor< Partial<NpoBankAccount>> = new NpoBankInterceptor();
  realBeneficiaryInterceptor: IModelInterceptor<RealBeneficiary> = new RealBeneficiaryInterceptor();
  founderMembersInterceptor: IModelInterceptor<FounderMembers> = new FounderMemberInterceptor();

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('NpoDataService', this);
  }

  _getModel(): new () => NpoData {
    return NpoData
  }
  _getServiceURL(): string {
    return this.urlService.URLS.NPO_DATA;
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadCompositeById(id: number): Observable<NpoData[]> {
    return this.http.get<NpoData[]>(this._getServiceURL() + '/' + id + '/composite');
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadActiveAsLookup(): Observable<NpoData[]> {
    return this.http.get<NpoData[]>(this._getServiceURL() + '/active/lookup');
  }
  openViewDialog(profileId: number): Observable<DialogRef> {
    return this.loadProfile(profileId).pipe(
      switchMap((model: NpoData) => {
        return of(this.dialog.show<IDialogData<NpoData>>(this._getDialogComponent(), {
          model,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadProfile(id:number): Observable<NpoData> {
    return this.http.get<NpoData>(this._getServiceURL() + `/profile/${id}`);
  }
}
