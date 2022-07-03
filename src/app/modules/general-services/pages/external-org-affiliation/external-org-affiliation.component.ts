import { ToastService } from '@app/services/toast.service';
import { DialogService } from './../../../../services/dialog.service';
import { LookupService } from './../../../../services/lookup.service';
import { Lookup } from './../../../../models/lookup';
import { ExternalOrgAffiliationService } from './../../../../services/external-org-affiliation.service';
import { tap } from 'rxjs/operators';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-external-org-affiliation',
  templateUrl: './external-org-affiliation.component.html',
  styleUrls: ['./external-org-affiliation.component.scss']
})
export class ExternalOrgAffiliationComponent extends EServicesGenericComponent<ExternalOrgAffiliation, ExternalOrgAffiliationService> {
  form!: FormGroup;
  RequestTypeDropDown: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  OrgClassificationDropDown: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  CurrencyDropDown: Lookup[] = this.lookupService.listByCategory.Currency;
  countryList: Lookup[] = [];

  constructor(
    public service: ExternalOrgAffiliationService,
    public fb: FormBuilder,
    public lang: LangService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService
  ) {
    super();
  }

  _getNewInstance(): ExternalOrgAffiliation {
    return new ExternalOrgAffiliation();
  }
  _prepareModel(): ExternalOrgAffiliation | Observable<ExternalOrgAffiliation> {
    throw new Error('Method not implemented.');
  }
  _initComponent(): void {
  }
  _buildForm(): void {
    this.form = new FormGroup({})
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
  }
  _afterSave(model: ExternalOrgAffiliation, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void {
    throw new Error('Method not implemented.');
  }
  _updateForm(model: ExternalOrgAffiliation | undefined): void {
    throw new Error('Method not implemented.');
  }
  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }


}
