import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {FormManager} from '../../../models/form-manager';
import {LangService} from '../../../services/lang.service';
import {AidLookup} from '../../../models/aid-lookup';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {ToastService} from '../../../services/toast.service';
import {extender} from '../../../helpers/extender';
import {CustomValidators} from '../../../validators/custom-validators';
import {AidTypes} from '../../../enums/aid-types.enum';

@Component({
  selector: 'app-aid-lookup-popup',
  templateUrl: './aid-lookup-popup.component.html',
  styleUrls: ['./aid-lookup-popup.component.scss']
})
export class AidLookupPopupComponent implements OnInit {
  form!: FormGroup;
  model: AidLookup;
  parentId: number;
  operation: OperationTypes;
  fm!: FormManager;
  aidType: number;
  gridAidType!: number;
  isAidTabVisible!: boolean;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AidLookup>,
              private toast: ToastService,
              public langService: LangService,
              private fb: FormBuilder) {
    this.model = data.model;
    this.parentId = data.parentId;
    this.operation = data.operation;
    this.aidType = data.aidType;
    this.checkIfAidTabEnabled();
    this.setGridAidType();
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      arName: [this.model.arName, [Validators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: [this.model.enName, [Validators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      aidCode: [this.model.aidCode, [Validators.required, CustomValidators.number, Validators.maxLength(50)]],
      aidType: [this.model.aidType ?? this.aidType, [Validators.required]],
      parent: [this.aidType === AidTypes.CLASSIFICATIONS ? null : (this.operation === OperationTypes.CREATE) ? this.parentId : this.model.parent],
      status: [this.model.status]
    }, {validators: CustomValidators.validateFieldsStatus(['arName', 'enName', 'aidCode', 'aidType'])});

    this.fm = new FormManager(this.form, this.langService);
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    let aidLookup = extender<AidLookup>(AidLookup, {...this.model, ...this.form.value});
    const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
    const sub = aidLookup.save().subscribe(aid => {
      //@ts-ignore
      this.toast.success(message.change({x: aid.aidCode}));
      this.model = aid;
      this.operation = OperationTypes.UPDATE;
      sub.unsubscribe();
    });
  }

  get popupTitle(): string {
    let title!: string;
    switch (this.aidType) {
      case AidTypes.CLASSIFICATIONS:
        title = this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_aid_class : this.langService.map.lbl_edit_aid_class;
        break;
      case AidTypes.MAIN_CATEGORY:
        title = this.operation === OperationTypes.CREATE ?
          this.langService.map.lbl_add_aid_main_category :
          this.langService.map.lbl_edit_aid_main_category;
        break;
      case AidTypes.SUB_CATEGORY:
        title = this.operation === OperationTypes.CREATE ?
          this.langService.map.lbl_add_aid_sub_category :
          this.langService.map.lbl_edit_aid_sub_category;
        break;
    }
    return title;
  }

  getTabTitleText(): string {
    let title!: string;
    switch (this.gridAidType) {
      case AidTypes.MAIN_CATEGORY:
        title = this.langService.map.menu_aid_main_category;
        break;
      case AidTypes.SUB_CATEGORY:
        title = this.langService.map.menu_aid_sub_category;
        break;
    }

    return title;
  }

  checkIfAidTabEnabled(): void {
    this.isAidTabVisible = this.aidType !== AidTypes.SUB_CATEGORY && this.operation === OperationTypes.UPDATE;
  }

  setGridAidType(): void {
    if (this.aidType === AidTypes.CLASSIFICATIONS) {
      this.gridAidType = AidTypes.MAIN_CATEGORY;
    } else {
      this.gridAidType = AidTypes.SUB_CATEGORY;
    }
  }
}
