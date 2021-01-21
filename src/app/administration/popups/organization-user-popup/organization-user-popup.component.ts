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

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgUser>,
              private toast: ToastService, public langService: LangService,
              private fb: FormBuilder) {
    this.model = data.model;
    this.operation = data.operation;

  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      orgId: [this.model.orgId, Validators.required],
      customRoleId: [this.model.customRoleId, Validators.required],
      userType: [this.model.userType, Validators.required],
      arName: [this.model.arName, [Validators.required, Validators.minLength(3)]],
      enName: [this.model.enName, [Validators.required, Validators.minLength(3)]],
      qid: [this.model.qid, [Validators.required, Validators.minLength(3)]],
      empNum: [this.model.empNum, [Validators.required]],
      phoneNumber: [this.model.phoneNumber, [Validators.required, Validators.maxLength(50)]],
      officialPhoneNumber: [this.model.officialPhoneNumber, [Validators.required]],
      email: [this.model.email, [Validators.email, Validators.maxLength(50)]],
      jobTitle: [this.model.jobTitle, [Validators.required]],
      status: [this.model.status, Validators.required]
    });
    this.fm = new FormManager(this.form, this.langService);
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }


  saveModel(): void {
    let orgUser = extender<OrgUser>(OrgUser, {...this.model, ...this.form.value});
    const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
    const sub = orgUser.save().subscribe(user => {
      //@ts-ignore
      this.toast.success(message.change({x: user.arName}));
      this.model = user;
      this.operation = OperationTypes.UPDATE;
      sub.unsubscribe();
    });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_user : this.langService.map.lbl_edit_org_user;
  }
}
