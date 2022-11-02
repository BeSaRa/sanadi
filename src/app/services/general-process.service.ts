import { GeneralProcessPopupComponent } from './../administration/popups/general-process-popup/general-process-popup.component';
import { IDialogData } from './../interfaces/i-dialog-data';
import { OperationTypes } from './../enums/operation-types.enum';
import { DialogRef } from './../shared/models/dialog-ref';
import { switchMap, exhaustMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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

  addDialog(): DialogRef | Observable<DialogRef> {
    return this.dialog.show<IDialogData<GeneralProcess>>(
      this._getDialogComponent(),
      {
        model: new (this._getModel()),
        operation: OperationTypes.CREATE
      },
      { fullscreen: true }
    )
  }

  editDialog(model: GeneralProcess, getById: boolean = true): Observable<DialogRef> {
    return (getById ? this.getById(model.id) : of(model))
      .pipe(
        exhaustMap((model) => of(
          this.dialog.show<IDialogData<GeneralProcess>>(
            this._getDialogComponent(),
            {
              model: model,
              operation: OperationTypes.UPDATE
            },
            { fullscreen: true }
          ))
        )
      )
  }
  editDialogComposite(model: GeneralProcess): Observable<DialogRef> {
    return this.getByIdComposite(model.id)
      .pipe(exhaustMap((model) => of(this.dialog.show<IDialogData<GeneralProcess>>(
        this._getDialogComponent(),
        {
          model: model,
          operation: OperationTypes.UPDATE
        },
        { fullscreen: true }
      ))));
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
