import {Component, Inject, OnInit} from '@angular/core';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {OrgUnit} from '../../../models/org-unit';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {LangService} from '../../../services/lang.service';
import {extender} from '../../../helpers/extender';
import {Lookup} from '../../../models/lookup';
import {LookupCategories} from '../../../enums/lookup-categories';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-organization-unit-popup',
  templateUrl: './organization-unit-popup.component.html',
  styleUrls: ['./organization-unit-popup.component.scss']
})
export class OrganizationUnitPopupComponent implements OnInit {
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: OrgUnit;
  orgUnitTypesList: Lookup[];
  orgUnitStatusList: Lookup[];
  orgNationalityList: Lookup[];

  tabsData: IKeyValue = {
    basic: {key: 'basic', show: true},
    branches: {
      key: 'branches', show: (): boolean => !!this.model.id
    }
  };

  constructor(@Inject(DIALOG_DATA_TOKEN)  data: IDialogData<OrgUnit>,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private toast: ToastService,
              public langService: LangService) {
    this.operation = data.operation;
    this.model = data.model;
    this.orgUnitTypesList = lookupService.getByCategory(LookupCategories.ORG_UNIT_TYPE);
    this.orgUnitStatusList = lookupService.getByCategory(LookupCategories.ORG_STATUS);
    this.orgNationalityList = lookupService.getByCategory(LookupCategories.NATIONALITY);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  canShowTab(tab: string | object): boolean {
    // @ts-ignore
    const tabName = (typeof tab === 'string') ? tab : tab.key;
    if (!this.tabsData.hasOwnProperty(tabName)) {
      return false;
    } else {
      const canShow = this.tabsData[tabName].show;
      return (typeof canShow === 'function') ? canShow() : canShow;
    }
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_unit : this.langService.map.lbl_edit_org_unit;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      arName: [this.model.arName, [Validators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: [this.model.enName, [Validators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      orgUnitType: [this.model.orgUnitType, Validators.required],
      orgCode: [this.model.orgCode, [Validators.required, Validators.maxLength(10)]],
      status: [this.model.status, Validators.required],
      email: [this.model.email, [Validators.required, Validators.email, Validators.maxLength(50)]],
      phoneNumber1: [this.model.phoneNumber1, [Validators.required, CustomValidators.numberValidator(), Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      phoneNumber2: [this.model.phoneNumber2, [CustomValidators.numberValidator(), Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      address: [this.model.address, [Validators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]],
      buildingName: [this.model.buildingName, [Validators.required, Validators.maxLength(200)]],
      unitName: [this.model.unitName, [Validators.required, Validators.maxLength(200)]],
      street: [this.model.street, [Validators.required, Validators.maxLength(200)]],
      zone: [this.model.zone, [Validators.required, Validators.maxLength(100)]],
      orgNationality: [this.model.orgNationality, Validators.required],
      poBoxNum: [this.model.poBoxNum, [CustomValidators.numberValidator()]]
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    const orgUnit = extender<OrgUnit>(OrgUnit, {...this.model, ...this.fm.getForm()?.value});
    orgUnit.save()
      .subscribe((local) => {
        const message = (this.operation === OperationTypes.CREATE)
          ? this.langService.map.msg_create_x_success
          : this.langService.map.msg_update_x_success;
        this.toast.success(message.change({x: orgUnit.getName()}));
        this.model = local;
        this.operation = OperationTypes.UPDATE;
      });
  }
}
