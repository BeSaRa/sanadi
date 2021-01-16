import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {LangService} from '../../../services/lang.service';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {CustomRole} from '../../../models/custom-role';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {CustomValidators} from '../../../validators/custom-validators';


@Component({
  selector: 'app-custom-role-popup',
  templateUrl: './custom-role-popup.component.html',
  styleUrls: ['./custom-role-popup.component.scss']
})
export class CustomRolePopupComponent implements OnInit {
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: CustomRole;


  constructor(@Inject(DIALOG_DATA_TOKEN)  data: IDialogData<CustomRole>,
              private fb: FormBuilder,
              public langService: LangService) {
    this.operation = data.operation;
    this.model = data.model;
    console.log(data.customRolePermissions);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        status: [this.model.status],
        arName: [this.model.arName, Validators.required],
        enName: [this.model.enName, Validators.required],
        description: [this.model.description],
      }, {validators: CustomValidators.validateFieldsStatus(['arName', 'enName'])}),
      permissions: this.fb.array([], Validators.required)
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.add_custom_role : this.langService.map.edit_custom_role;
  };


  saveModel(): void {

  }
}
