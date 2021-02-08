import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
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
import {Subject} from 'rxjs';
import {exhaustMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-organization-unit-popup',
  templateUrl: './organization-unit-popup.component.html',
  styleUrls: ['./organization-unit-popup.component.scss']
})
export class OrganizationUnitPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: OrgUnit;
  orgUnitTypesList: Lookup[];
  orgUnitStatusList: Lookup[];
  orgNationalityList: Lookup[];
  saveVisible = true;

  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    advanced: {name: 'advanced'},
    branches: {name: 'branches'}
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
    this._saveModel();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = !(tab.name && tab.name === this.tabsData.branches.name);
  }


  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_unit : this.langService.map.lbl_edit_org_unit;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        arName: [this.model.arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG')
        ]],
        orgUnitType: [this.model.orgUnitType, CustomValidators.required],
        orgCode: [{
          value: this.model.orgCode,
          disabled: this.operation
        }, [CustomValidators.required, Validators.maxLength(10)]],
        status: [{value: this.model.status, disabled: this.operation}, CustomValidators.required],
        email: [this.model.email, [CustomValidators.required, Validators.email, Validators.maxLength(50)]],
        phoneNumber1: [this.model.phoneNumber1, [
          CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        phoneNumber2: [this.model.phoneNumber2, [
          CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        address: [this.model.address, [Validators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]],
        buildingName: [this.model.buildingName, [CustomValidators.required, Validators.maxLength(200)]],
        unitName: [this.model.unitName, [CustomValidators.required, Validators.maxLength(200)]],
        street: [this.model.street, [CustomValidators.required, Validators.maxLength(200)]],
        zone: [this.model.zone, [CustomValidators.required, Validators.maxLength(100)]],
        orgNationality: [this.model.orgNationality, CustomValidators.required],
        poBoxNum: [this.model.poBoxNum, [CustomValidators.number, Validators.maxLength(10)]],
        hotLine: [this.model.hotLine, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
        faxNumber: [this.model.faxNumber, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
      }, {
        validators: CustomValidators.validateFieldsStatus([
          'arName', 'enName', 'orgUnitType', 'orgCode', 'status', 'email', 'phoneNumber1', 'phoneNumber2',
          'address', 'buildingName', 'unitName', 'street', 'zone', 'orgNationality', 'poBoxNum', 'hotLine', 'faxNumber'
        ])
      }),
      advanced: this.fb.group({
        unifiedEconomicRecord: [this.model.unifiedEconomicRecord, [Validators.maxLength(150)]],
        webSite: [this.model.webSite, [Validators.maxLength(350)]],
        establishmentDate: [this.model.establishmentDate],
        registryNumber: [this.model.registryNumber, [Validators.maxLength(50)]],
        budgetClosureDate: [this.model.budgetClosureDate],
        orgUnitAuditor: [this.model.orgUnitAuditor, [Validators.maxLength(350)]],
        linkToInternalSystem: [this.model.linkToInternalSystem, [Validators.maxLength(450)]],
        lawSubjectedName: [this.model.lawSubjectedName, [Validators.maxLength(450)]],
        boardDirectorsPeriod: [this.model.boardDirectorsPeriod, [Validators.maxLength(350)]]
      }, {
        validators: CustomValidators.validateFieldsStatus([
          'unifiedEconomicRecord', 'webSite', 'establishmentDate', 'registryNumber', 'budgetClosureDate',
          'orgUnitAuditor', 'linkToInternalSystem', 'lawSubjectedName', 'boardDirectorsPeriod'
        ])
      })
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
    this.save$.pipe(
      takeUntil(this.destroy$),
      exhaustMap(() => {
        const orgUnit = extender<OrgUnit>(OrgUnit,
          {...this.model, ...this.fm.getForm()?.value.basic, ...this.fm.getForm()?.value.advanced});
        return orgUnit.save();
      })
    ).subscribe((orgUnit) => {
      const message = (this.operation === OperationTypes.CREATE)
        ? this.langService.map.msg_create_x_success
        : this.langService.map.msg_update_x_success;
      this.toast.success(message.change({x: orgUnit.getName()}));
      this.model = orgUnit;
      this.operation = OperationTypes.UPDATE;
    });
  }
}
