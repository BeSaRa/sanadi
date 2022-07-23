import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';
import {LangService} from '@app/services/lang.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {Observable} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';

@Component({
  selector: 'transferring-individual-funds-abroad',
  templateUrl: './transferring-individual-funds-abroad.component.html',
  styleUrls: ['./transferring-individual-funds-abroad.component.scss']
})
export class TransferringIndividualFundsAbroadComponent extends EServicesGenericComponent<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroadService> implements AfterViewInit {
  form!: FormGroup;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public service: TransferringIndividualFundsAbroadService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService) {
    super();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _initComponent(): void {
    // load initials here
  }

  _buildForm(): void {
    const model = new TransferringIndividualFundsAbroad();
    this.form = this.fb.group({
      // add form groups here
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
  }

  _updateForm(model: TransferringIndividualFundsAbroad | undefined): void {
    if (!model) {
      return;
    }

    this.model = new TransferringIndividualFundsAbroad().clone({...this.model, ...model});
    this.form.patchValue({
      // patch values here
    });
  }

  _resetForm(): void {
    this.form.reset();
  }

  _prepareModel(): TransferringIndividualFundsAbroad | Observable<TransferringIndividualFundsAbroad> {
    let model = new TransferringIndividualFundsAbroad().clone({
      ...this.model,
      // form
    });

    return model;
  }

  _getNewInstance(): TransferringIndividualFundsAbroad {
    return new TransferringIndividualFundsAbroad();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // add extra validation if exist
    return this.form.valid;
  }

  _afterSave(model: TransferringIndividualFundsAbroad, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {

  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }
}
