import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import {LangService} from '@app/services/lang.service';
import {Observable} from 'rxjs';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';

@Component({
  selector: 'internal-bank-account-approval',
  templateUrl: './internal-bank-account-approval.component.html',
  styleUrls: ['./internal-bank-account-approval.component.scss']
})
export class InternalBankAccountApprovalComponent extends EServicesGenericComponent<InternalBankAccountApproval, InternalBankAccountApprovalService> {
  form: FormGroup = new FormGroup({});

  constructor(public lang: LangService,
              public fb: FormBuilder,
              public service: InternalBankAccountApprovalService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService) {
    super();
  }

  _getNewInstance(): InternalBankAccountApproval {
      return new InternalBankAccountApproval();
  }

  _initComponent(): void {

  }

  _buildForm(): void {
      ////////
  }

  _afterBuildForm(): void {
      ////////
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
      ////////
    return  true;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
      ////////
    return true;
  }

  _afterLaunch(): void {
      ////////
  }

  _prepareModel(): InternalBankAccountApproval | Observable<InternalBankAccountApproval> {
      ////////
    return new InternalBankAccountApproval();
  }

  _afterSave(model: InternalBankAccountApproval, saveType: SaveTypes, operation: OperationTypes): void {
      ////////
  }

  _saveFail(error: any): void {
      throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
      throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {

  }

  _updateForm(model: InternalBankAccountApproval | undefined): void {
      ////////
  }

  _resetForm(): void {
      ////////
  }
}
