import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Country} from '../models/country';
import {FactoryService} from './factory.service';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {CountryInterceptor} from '../model-interceptors/country-interceptor';
import {UrlService} from './url.service';
import {forkJoin, Observable, of} from 'rxjs';
import {DialogRef} from '../shared/models/dialog-ref';
import {map, switchMap, tap} from 'rxjs/operators';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {Generator} from '../decorators/generator';
import {DialogService} from './dialog.service';
import {CountryPopupComponent} from '../administration/popups/country-popup/country-popup.component';
import {ChangeCountryParentPopupComponent} from '../administration/popups/change-country-parent-popup/change-country-parent-popup.component';
import {StatusEnum} from '../enums/status.enum';
import {CommonUtils} from '../helpers/common-utils';

@Injectable({
  providedIn: 'root'
})
export class CountryService extends BackendGenericService<Country> {
  list: Country[] = [];
  listCountries: Country[] = [];
  interceptor: IModelInterceptor<Country> = new CountryInterceptor();

  _getModel() {
    return Country;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.COUNTRY;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService,) {
    super();
    FactoryService.registerService('CountryService', this);
  }

  @Generator(undefined, true, {property: 'rs'})
  private _loadCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this._getServiceURL() + '/countries');
  }

  loadCountries(): Observable<Country[]> {
    return this._loadCountries()
      .pipe(
        tap((result: Country[]) => {
          this.listCountries = result;
        })
      )
  }

  @Generator(undefined, false)
  loadCountryById(id: number): Observable<Country> {
    return this.http.get<Country>(this._getServiceURL() + '/' + id + '/composite');
  }

  @Generator(undefined, true, {property: 'rs'})
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

  openCreateDialog(parent?: Country): Observable<DialogRef> {
    return this._loadDialogData()
      .pipe(
        switchMap((result) => {
          if (parent) {
            result.country.parentId = parent.id;
          }
          return of(this.dialogService.show<IDialogData<Country>>(CountryPopupComponent, {
            model: result.country,
            operation: OperationTypes.CREATE,
            parentCountries: this.listCountries,
            isParent: !parent
          }))
        })
      );
  }

  openUpdateDialog(modelId: number, tabName: string = 'basic'): Observable<DialogRef> {
    return this._loadDialogData(modelId)
      .pipe(
        switchMap((result) => {
          return of(this.dialogService.show<IDialogData<Country>>(CountryPopupComponent, {
            model: result.country,
            operation: OperationTypes.UPDATE,
            parentCountries: this.listCountries,
            isParent: !result.country.parentId,
            selectedTabName: (CommonUtils.isValidValue(tabName) ? tabName : 'basic')
          }))
        })
      );
  }

  openChangeParentDialog(countriesToChange: Country[]): any {
    return of(this.dialogService.show(ChangeCountryParentPopupComponent, {
      countries: countriesToChange,
      parentCountries: this.listCountries
    }))
  }

  @Generator(undefined, true, {property: 'rs'})
  updateBulkParents(parentId: number, countriesId: number[]): Observable<Country[]> {
    return this.http.post<Country[]>(this._getServiceURL() + '/cities-update/' + parentId, countriesId);
  }

  updateStatus(countryId: number, newStatus: StatusEnum) {
    return newStatus === StatusEnum.ACTIVE ? this._activate(countryId) : this._deactivate(countryId);
  }

  updateStatusBulk(recordIds: number[], newStatus: StatusEnum): Observable<any> {
    return newStatus === StatusEnum.ACTIVE ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
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
