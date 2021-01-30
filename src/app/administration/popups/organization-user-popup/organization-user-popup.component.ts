import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {FormManager} from '../../../models/form-manager';
import {LangService} from '../../../services/lang.service';
import {OrgUser} from '../../../models/org-user';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {ToastService} from '../../../services/toast.service';
import {extender} from '../../../helpers/extender';
import {LookupCategories} from '../../../enums/lookup-categories';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {OrgUnit} from '../../../models/org-unit';
import {CustomRole} from '../../../models/custom-role';
import {OrgBranch} from '../../../models/org-branch';
import {OrganizationBranchService} from '../../../services/organization-branch.service';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-organization-user-popup',
  templateUrl: './organization-user-popup.component.html',
  styleUrls: ['./organization-user-popup.component.scss']
})
export class OrganizationUserPopupComponent implements OnInit {
  form!: FormGroup;
  model: OrgUser;
  operation: OperationTypes;
  fm!: FormManager;
  userTypeList: Lookup[];
  jobTitleList: Lookup[];
  customRoleList: CustomRole[];
  orgUnitList: OrgUnit[];
  orgBranchList!: OrgBranch[];
  orgUserStatusList!: Lookup[];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgUser>,
              private toast: ToastService, public langService: LangService,
              private organizationBranchService: OrganizationBranchService,
              private lookupService: LookupService, private fb: FormBuilder) {
    this.model = data.model;
    this.operation = data.operation;
    this.customRoleList = data.customRoleList;
    this.orgUnitList = data.orgUnitList;
    this.userTypeList = lookupService.getByCategory(LookupCategories.ORG_USER_TYPE);
    this.jobTitleList = lookupService.getByCategory(LookupCategories.ORG_USER_JOB_TITLE);
    this.orgUserStatusList = lookupService.getByCategory(LookupCategories.ORG_USER_STATUS);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      orgId: [this.model.orgId, CustomValidators.required],
      orgBranchId: [this.model.orgBranchId, [CustomValidators.required]],
      customRoleId: [this.model.customRoleId, CustomValidators.required],
      userType: [this.model.userType, CustomValidators.required],
      arName: [this.model.arName, [CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: [this.model.enName, [CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      qid: [this.model.qid, [CustomValidators.required, CustomValidators.number, Validators.minLength(7), Validators.maxLength(10)]],
      empNum: [this.model.empNum, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
      phoneNumber: [this.model.phoneNumber, [CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      phoneExtension: [this.model.phoneExtension, [CustomValidators.number, Validators.maxLength(10)]],
      officialPhoneNumber: [this.model.officialPhoneNumber, [CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      email: [this.model.email, [CustomValidators.required, Validators.email, Validators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]],
      jobTitle: [this.model.jobTitle, [CustomValidators.required]],
      status: [this.model.status, CustomValidators.required]
    });
    this.fm = new FormManager(this.form, this.langService);
    this.bindOrgBranchList();
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }


  saveModel(): void {
    const orgUser = extender<OrgUser>(OrgUser, {...this.model, ...this.form.value});
    const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
    const sub = orgUser.save().subscribe(user => {
      // @ts-ignore
      this.toast.success(message.change({x: user.arName}));
      this.model = user;
      this.operation = OperationTypes.UPDATE;
      sub.unsubscribe();
    });
  }

  onOrgUnitChange(): void {
    this.fm.getFormField('orgBranchId')?.setValue(null);
    this.bindOrgBranchList();
  }

  bindOrgBranchList(): void {
    this.orgBranchList = [];
    this.organizationBranchService.loadByCriteria({orgId: this.fm.getFormField('orgId')?.value})
      .subscribe((orgBranch: OrgBranch[]) => {
        this.orgBranchList = orgBranch;
      });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_user : this.langService.map.lbl_edit_org_user;
  }
}
