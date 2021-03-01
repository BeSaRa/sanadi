import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {OrgUnit} from '../../../models/org-unit';
import {OrgBranch} from '../../../models/org-branch';
import {Lookup} from '../../../models/lookup';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {LangService} from '../../../services/lang.service';
import {LookupCategories} from '../../../enums/lookup-categories';
import {extender} from '../../../helpers/extender';
import {CustomValidators} from '../../../validators/custom-validators';
import {Subject} from 'rxjs';
import {exhaustMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-organization-branch-popup',
  templateUrl: './organization-branch-popup.component.html',
  styleUrls: ['./organization-branch-popup.component.scss']
})
export class OrganizationBranchPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: OrgBranch;
  orgUnit: OrgUnit;
  orgUnitStatusList: Lookup[];

  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    users: {name: 'users'}
  };
  saveVisible = true;
  validateFieldsVisible = true;

  constructor(@Inject(DIALOG_DATA_TOKEN)  data: IDialogData<OrgBranch>,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private toast: ToastService,
              public langService: LangService) {
    this.operation = data.operation;
    this.model = data.model;
    this.orgUnit = data.orgUnit;
    this.orgUnitStatusList = lookupService.getByCategory(LookupCategories.ORG_STATUS);
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_branch : this.langService.map.lbl_edit_org_branch;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        orgId: [this.orgUnit.id],
        arName: [this.model.arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        status: [this.model.status, CustomValidators.required],
        // email: [this.model.email, [Validators.email, Validators.maxLength(50)]],
        phoneNumber1: [this.model.phoneNumber1, [
          CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        phoneNumber2: [this.model.phoneNumber2, [
          CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        address: [this.model.address, [Validators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]],
        // buildingName: [this.model.buildingName, [CustomValidators.required, Validators.maxLength(200)]],
        // unitName: [this.model.unitName, [CustomValidators.required, Validators.maxLength(200)]],
        // street: [this.model.street, [CustomValidators.required, Validators.maxLength(200)]],
        // zone: [this.model.zone, [CustomValidators.required, Validators.maxLength(100)]],
        isMain: [this.model.isMain, [CustomValidators.required]]
      }, {validators: CustomValidators.validateFieldsStatus(['orgId', 'arName', 'enName', 'status', 'phoneNumber1', 'phoneNumber2', 'address', 'isMain'])})
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(() => {
          const orgBranch = extender<OrgBranch>(OrgBranch, {...this.model, ...this.fm.getFormField('basic')?.value});
          return orgBranch.save();
        }))
      .subscribe(orgBranch => {
        const message = (this.operation === OperationTypes.CREATE)
          ? this.langService.map.msg_create_x_success
          : this.langService.map.msg_update_x_success;

        this.toast.success(message.change({x: orgBranch.getName()}));
        this.model = orgBranch;
        this.operation = OperationTypes.UPDATE;
      });
  }

}
