import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from '../models/country';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { DialogRef } from '../shared/models/dialog-ref';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '../enums/operation-types.enum';
import { DialogService } from './dialog.service';
import { CountryPopupComponent } from '../shared/popups/country-popup/country-popup.component';
import {
  ChangeCountryParentPopupComponent
} from '../administration/popups/change-country-parent-popup/change-country-parent-popup.component';
import { CommonUtils } from '@helpers/common-utils';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { ComponentType } from '@angular/cdk/portal';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from '@app/models/pagination';

@CastResponseContainer({
  $default: {
    model: () => Country
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Country }
  }
})
@Injectable({
  providedIn: 'root'
})
export class CountryService extends CrudWithDialogGenericService<Country> {

  _getDialogComponent(): ComponentType<any> {
    return CountryPopupComponent
  }

  list: Country[] = [];


  _getModel() {
    return Country;
  }


  _getServiceURL(): string {
    return this.urlService.URLS.COUNTRY;
  }

  private _activeCountries: Country[] = [];
  get activeCountries$(): Observable<Country[]> {

    if (this._activeCountries.length) {
      return of(this._activeCountries)
    }
   return this.loadActive()
      .pipe(
        map(list => list.sort((a, b) => a.getName() > b.getName() ? 1 : -1)),
        tap(list => this._activeCountries = list),
        take(1)
      )

  }

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('CountryService', this);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this._getServiceURL());
  }

  load(): Observable<Country[]> {
    return this._loadCountries()
      .pipe(
        tap((result: Country[]) => {
          this.list = result;
        })
      )
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadCountryById(id: number): Observable<Country> {
    return this.http.get<Country>(this._getServiceURL() + '/' + id + '/composite');
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadCountriesByParentId(parentId: number): Observable<Country[]> {
    return this.http.get<Country[]>(this._getServiceURL() + '/cities/' + parentId);
  }

  private _loadDialogData(countryId?: number): Observable<{
    country: Country
  }> {
    return forkJoin({
      country: !countryId ? of(new Country()) : this.loadCountryById(countryId)
    });
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadDialogData()
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Country>>(CountryPopupComponent, {
            model: result.country,
            operation: OperationTypes.CREATE,
            parentCountries: this.list
          }))
        })
      );
  }

  openUpdateDialog(modelId: number, tabName: string = 'basic'): Observable<DialogRef> {
    return this._loadDialogData(modelId)
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Country>>(CountryPopupComponent, {
            model: result.country,
            operation: OperationTypes.UPDATE,
            parentCountries: this.list,
            selectedTabName: (CommonUtils.isValidValue(tabName) ? tabName : 'basic')
          }))
        })
      );
  }
  openViewDialog(modelId: number, tabName: string = 'basic'): Observable<DialogRef> {
    return this._loadDialogData(modelId)
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Country>>(CountryPopupComponent, {
            model: result.country,
            operation: OperationTypes.VIEW,
            parentCountries: this.list,
            selectedTabName: (CommonUtils.isValidValue(tabName) ? tabName : 'basic')
          }))
        })
      );
  }
  openChangeParentDialog(countriesToChange: Country[]): any {
    return of(this.dialog.show(ChangeCountryParentPopupComponent, {
      countries: countriesToChange,
      parentCountries: this.list
    }))
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  updateBulkParents(parentId: number, countriesId: number[]): Observable<Country[]> {
    return this.http.post<Country[]>(this._getServiceURL() + '/cities-update/' + parentId, countriesId);
  }

  updateStatus(countryId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(countryId) : this._deactivate(countryId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(countryId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + countryId + '/activate', {});
  }

  private _deactivate(countryId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + countryId + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }


}
