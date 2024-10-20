import { ComponentType } from "@angular/cdk/portal";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { HasInterception, InterceptParam } from "@app/decorators/decorators/intercept-model";
import { ActualInspectionCreationSource } from "@app/enums/actual-inspection-creation-source.enum";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { ActualInspectionInterceptor } from "@app/model-interceptors/actual-inspection-interceptor";
import { ActualInspection } from "@app/models/actual-inspection";
import { InspectionSpecialist } from "@app/models/inspection-specialist";
import { Pagination } from "@app/models/pagination";
import { ActualInspectionPopupComponent } from "@app/modules/services/inspection/popups/actual-inspection-popup/actual-inspection-popup.component";
import { ManageInspectionPopupComponent } from "@app/modules/services/inspection/popups/manage-inspection-popup/manage-inspection-popup.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { LicenseActivity } from "@app/models/license-activity";
import { ActualInceptionStatus } from "@app/enums/actual-inspection-status.enum";
import { DocumentService } from "./document.service";
import { DomSanitizer } from "@angular/platform-browser";
import { FileNetDocument } from "@app/models/file-net-document";
import { InspectionDocumentService } from "./Inspection-document.service";

@CastResponseContainer({
  $default: {
    model: () => ActualInspection,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ActualInspection }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ActualInspectionService extends CrudWithDialogGenericService<ActualInspection> {

  list: ActualInspection[] = [];
  documentService = new InspectionDocumentService(this);

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
  ) {
    super();
    FactoryService.registerService('ActualInspectionService', this);
  }

  _getModel(): new () => ActualInspection {
    return ActualInspection;
  }

  _getDialogComponent(): ComponentType<any> {
    return ActualInspectionPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ACTUAL_INSPECTION;
  }



  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((ActualInspection: ActualInspection) => {
        return of(this.dialog.show<IDialogData<ActualInspection>>(ActualInspectionPopupComponent, {
          model: ActualInspection,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  @HasInterception
  @CastResponse(undefined)
  create(@InterceptParam() model: ActualInspection): Observable<ActualInspection> {
    return this.http.post<ActualInspection>(this._getServiceURL(), model);
  }

  @HasInterception
  @CastResponse(undefined)
  start(@InterceptParam() model: ActualInspection): Observable<ActualInspection> {
    return this.http.post<ActualInspection>(this._getServiceURL() + `/start/${model.id}`, {});
  }
  @HasInterception
  @CastResponse(undefined)
  complete(@InterceptParam() model: ActualInspection): Observable<ActualInspection> {
    return this.http.post<ActualInspection>(this._getServiceURL() + `/complete/${model.id}`, {});
  }
  @HasInterception
  @CastResponse(undefined)
  reject(@InterceptParam() model: ActualInspection, rejectReason: string): Observable<ActualInspection> {
    return this.http.delete<ActualInspection>(this._getServiceURL() + `/${model.id}/reason`,
      {
        params: new HttpParams({
          fromObject: {
            rejectReason
          }
        })
      });
  }
  @HasInterception
  @CastResponse(undefined)
  rejectBulk(ids: number[], rejectReason: string): Observable<ActualInspection> {
    return this.http.delete<ActualInspection>(this._getServiceURL() + `/bulk/reason`,
      {
        body: ids,
        params: new HttpParams({
          fromObject: {
            rejectReason
          }
        })
      });
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByInspector(): Observable<ActualInspection[]> {
    return this.http.get<ActualInspection[]>(this._getServiceURL() + `/inspector`);
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  licenseActivitiesSearch(caseType: number, fullSerialNumber?: string): Observable<LicenseActivity[]> {
    return this.http.get<LicenseActivity[]>(this._getServiceURL() + `/license-activity/search`, {
      params: new HttpParams({
        fromObject: !!fullSerialNumber ? {
          caseType,
          fullSerialNumber
        } : { caseType }
      })
    });
  }

  showCreateActualInspectionPopup(creationSource: ActualInspectionCreationSource, model: ActualInspection) {
    return this.dialog.show<IDialogData<ActualInspection>>(ActualInspectionPopupComponent, {
      model,
      operation: OperationTypes.CREATE,
      creationSource: creationSource
    }).onAfterClose$
  }
  showViewActualInspectionPopup(model: ActualInspection) {
    return this.dialog.show<IDialogData<ActualInspection>>(ManageInspectionPopupComponent, {
      model,
      operation: OperationTypes.VIEW,
      readonly: true

    })
  }
  showUpdateActualInspectionPopup(model: ActualInspection) {
    return this.dialog.show<IDialogData<ActualInspection>>(ManageInspectionPopupComponent, {
      model,
      operation: OperationTypes.UPDATE,
      readonly: false

    })
  }

  @HasInterception
  AddSpecialist(@InterceptParam() model: InspectionSpecialist, parent: ActualInspection) {
    model.actualInspection = { id: parent.id } as ActualInspection
    return this.http.post<{ sc: number, rs: number }>(this._getServiceURL() + '/specialist', model)
      .pipe(map(result => result.rs));
  }

  @HasInterception
  updateSpecialist(@InterceptParam() model: InspectionSpecialist, parent: ActualInspection) {
    model.actualInspection = new ActualInspectionInterceptor().send(parent) as ActualInspection
    return this.http.put<InspectionSpecialist>(this._getServiceURL() + '/specialist', model);
  }

  deleteSpecialist(id: number) {
    return this.http.delete<InspectionSpecialist>(this._getServiceURL() + `/specialist/${id}`);
  }
  @HasInterception
  @CastResponse(undefined)
  changeInspector(@InterceptParam() model: ActualInspection, inspectorId: string): Observable<ActualInspection> {
    return this.http.post<ActualInspection>(this._getServiceURL() + `/change-inspector`, {}, {
      params: new HttpParams({
        fromObject: {
          inspectorId,
          actualId: model.id
        }
      })
    });
  }
}
