import {Injectable} from '@angular/core';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {FactoryService} from '@services/factory.service';
import {
  UrgentInterventionReportPopupComponent
} from '@app/modules/services/urgent-intervention-license-followup/popups/urgent-intervention-report-popup/urgent-intervention-report-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';

@CastResponseContainer({
  $default: {
    model: () => UrgentInterventionReport
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionReportService extends CrudWithDialogGenericService<UrgentInterventionReport> {

  list: UrgentInterventionReport[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('UrgentInterventionReportService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return UrgentInterventionReportPopupComponent;
  }

  _getModel(): { new(): UrgentInterventionReport } {
    return UrgentInterventionReport;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.URGENT_INTERVENTION_REPORT;
  }

  @CastResponse(undefined)
  loadByDocumentVsId(documentVsId: string): Observable<any> {
    if (!documentVsId) {
      return of([]);
    }
    return this.http.get<any>(this._getServiceURL() + '/documentVsId/' + documentVsId)
      .pipe(catchError(_ => of([])));
  }

  openCreateDialog(caseId: string, documentId: string): DialogRef {
    return this.dialog.show<IDialogData<UrgentInterventionReport>>(this._getDialogComponent(), {
      model: new UrgentInterventionReport().clone({caseId: caseId, documentId: documentId}),
      operation: OperationTypes.CREATE
    });
  }

  /*openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((result: UrgentInterventionReport) => {
        return of(this.dialog.show<IDialogData<UrgentInterventionReport>>(this._getDialogComponent(), {
          model: result,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }*/

  openViewDialog(model: UrgentInterventionReport): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<UrgentInterventionReport>>(this._getDialogComponent(), {
      model: model,
      operation: OperationTypes.VIEW
    }));
  }
}
