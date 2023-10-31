import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SectorPopupComponent } from '@app/administration/popups/sector-popup/sector-popup.component';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { Sector } from '@app/models/sector';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { CastResponseContainer } from '@decorators/cast-response';
import { DialogService } from '@services/dialog.service';
import { FactoryService } from '@services/factory.service';
import { UrlService } from '@services/url.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@CastResponseContainer({
  $default: {
    model: () => Sector
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Sector }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SectorService extends CrudWithDialogGenericService<Sector> {
  list: Sector[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('SectorService', this);
  }

  _getModel(): new () => Sector {
    return Sector;
  }

  _getDialogComponent(): ComponentType<any> {
    return SectorPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SECTOR;
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((Sector: Sector) => {
        return of(this.dialog.show<IDialogData<Sector>>(SectorPopupComponent, {
          model: Sector,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

}
