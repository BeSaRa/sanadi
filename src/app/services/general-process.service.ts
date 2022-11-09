import { GeneralProcessPopupComponent } from './../administration/popups/general-process-popup/general-process-popup.component';
import { IDialogData } from './../interfaces/i-dialog-data';
import { OperationTypes } from './../enums/operation-types.enum';
import { DialogRef } from './../shared/models/dialog-ref';
import { switchMap, exhaustMap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { ComponentType } from '@angular/cdk/overlay';
import { FactoryService } from './factory.service';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';
import { HttpClient } from '@angular/common/http';
import { GeneralProcess } from '@app/models/genral-process';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';


@CastResponseContainer({
  $default: {
    model: () => GeneralProcess
  }
})
@Injectable({
  providedIn: 'root'
})
export class GeneralProcessService extends CrudWithDialogGenericService<GeneralProcess> {
  _getModel(): new () => GeneralProcess {
    return GeneralProcess
  }

  list: GeneralProcess[] = [];
  private _selectField: Subject<string> = new Subject<string>();
  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('GeneralProcessService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return GeneralProcessPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.GENERAL_PROCESS;
  }
  listenToSelectField() {
    return this._selectField
  }
  setlectField(fieldId: string) {
    this._selectField.next(fieldId);
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((generalProcess: GeneralProcess) => {
        return of(this.dialog.show<IDialogData<GeneralProcess>>(
          this._getDialogComponent(),
          {
            model: generalProcess,
            operation: OperationTypes.VIEW
          },
          { fullscreen: true }
        ));
      })
    );
  }


  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  filterProcess(params: Partial<GeneralProcess>): Observable<GeneralProcess[]> {
    return this.http.post<GeneralProcess[]>(this._getServiceURL() + '/filter', params)
  }
}
