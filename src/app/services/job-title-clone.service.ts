import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { JobTitleClonePopupComponent } from "@app/administration/popups/job-title-clone-popup/job-title-clone-popup.component";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { JobTitleClone } from "@app/models/job-title-clone";
import { Pagination } from "@app/models/pagination";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@CastResponseContainer({
    $default: {
      model: () => JobTitleClone
    },
    $pagination: {
      model: () => Pagination,
      shape: { 'rs.*': () => JobTitleClone }
    }
  })
@Injectable({
    providedIn: 'root'
  })
export class JobTitleCloneService extends CrudWithDialogGenericService<JobTitleClone>{
    list: JobTitleClone[] = [];
    
    constructor(
        public http: HttpClient,
        public dialog: DialogService,
        private urlService: UrlService
    ){
        super()
        FactoryService.registerService('JobTitleCloneService',this)
    }

    _getModel(): new () => JobTitleClone {
        return JobTitleClone
    }
    _getDialogComponent(): ComponentType<any> {
        return JobTitleClonePopupComponent
    }
    _getServiceURL(): string {
        return this.urlService.URLS.JOB_TITLE_CLONE
    }
    updateStatus(jobTitleCloneId:number, newStatus:CommonStatusEnum){
        return this.http.put<any>(this._getServiceURL() + '/' + jobTitleCloneId + (newStatus===CommonStatusEnum.ACTIVATED?'/activate':'/de-activate'), {}) 
    }

    updateStatusBulk(recordIds:number[], newStatus:CommonStatusEnum):Observable<any>{
        return  newStatus===CommonStatusEnum.ACTIVATED?this._activateBulk(recordIds):this._deactivateBulk(recordIds)
    }

    private _activateBulk(recordIds: number[]) { return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds) }
    
    private _deactivateBulk(recordIds: number[]) { return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds) }

    openViewDialog(modelId: number): Observable<DialogRef> {
        return this.getByIdComposite(modelId).pipe(
          switchMap((jobTitle: JobTitleClone) => {
            return of(this.dialog.show<IDialogData<JobTitleClone>>(JobTitleClonePopupComponent, {
              model: jobTitle,
              operation: OperationTypes.VIEW
            }));
          })
        );
      }
}