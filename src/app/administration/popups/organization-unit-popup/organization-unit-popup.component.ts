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

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_unit : this.langService.map.lbl_edit_org_unit;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      arName: [this.model.arName, [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      enName: [this.model.enName, [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      orgUnitType: [this.model.orgUnitType, Validators.required],
      orgCode: [this.model.orgCode, Validators.maxLength(10)],
      status: [this.model.status, Validators.required],
      email: [this.model.email, [Validators.email, Validators.maxLength(50)]],
      phoneNumber1: [this.model.phoneNumber1, [Validators.required, Validators.maxLength(50)]],
      phoneNumber2: [this.model.phoneNumber2, [Validators.maxLength(50)]],
      address: [this.model.address, [Validators.maxLength(1000)]],
      buildingName: [this.model.buildingName, [Validators.required, Validators.maxLength(200)]],
      unitName: [this.model.unitName, Validators.maxLength(200)],
      street: [this.model.street, [Validators.required, Validators.maxLength(200)]],
      zone: [this.model.zone, [Validators.required, Validators.maxLength(100)]],
      orgNationality: [this.model.orgNationality, Validators.required],
      poBoxNum: [this.model.poBoxNum]
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    const orgUnit = extender<OrgUnit>(OrgUnit, {...this.model, ...this.fm.getForm()?.value});
    orgUnit.save()
      .subscribe(() => {
        const message = (this.operation === OperationTypes.CREATE)
          ? this.langService.map.msg_create_x_success
          : this.langService.map.msg_update_x_success;
        // @ts-ignore
        this.toast.success(message.change({x: orgUnit.getName()}));
        this.model = orgUnit;
        this.operation = OperationTypes.UPDATE;
      });
  }
}
