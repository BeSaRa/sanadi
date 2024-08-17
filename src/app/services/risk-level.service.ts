import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { RiskLevel } from "@app/models/risk-level";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, switchMap, of } from "rxjs";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { RiskLevelPopupComponent } from "@app/administration/popups/risk-level-popup/risk-level-popup.component";
import { Injectable } from "@angular/core";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => RiskLevel
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => RiskLevel }
  }
})
@Injectable({
  providedIn: 'root'
})
export class RiskLevelService extends CrudWithDialogGenericService<RiskLevel> {
  list: RiskLevel[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('RiskLevelService', this);
  }

  _getModel(): new () => RiskLevel {
    return RiskLevel;
  }

  _getDialogComponent(): ComponentType<any> {
    return RiskLevelPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.RISK_LEVEL;
  }


  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((RiskLevel: RiskLevel) => {
        return of(this.dialog.show<IDialogData<RiskLevel>>(RiskLevelPopupComponent, {
          model: RiskLevel,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  saveAttachment(id: number, attachment: File): Observable<string> {
    const form = new FormData()
    form.append('attachment', attachment || null);

    return this.http.post<string>(this._getServiceURL() + `/${id}/attachment`, form)

  }

  loadByVsIdAsBlob(vsId: string): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/content/' + vsId, { responseType: 'blob' });
  }
}
