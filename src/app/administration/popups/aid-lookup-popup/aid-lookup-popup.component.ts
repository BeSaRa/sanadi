import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
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
import {Subject, timer} from 'rxjs';
import {exhaustMap, takeUntil, timeout} from 'rxjs/operators';
import {Lookup} from '../../../models/lookup';
import {LookupCategories} from '../../../enums/lookup-categories';
import {LookupService} from '../../../services/lookup.service';
import {IKeyValue} from '../../../interfaces/i-key-value';

@Component({
  selector: 'app-aid-lookup-popup',
  templateUrl: './aid-lookup-popup.component.html',
  styleUrls: ['./aid-lookup-popup.component.scss']
})
export class AidLookupPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: AidLookup;
  parentId: number;
  operation: OperationTypes;
  fm!: FormManager;
  aidType: number;
  gridAidType!: number;
  isAidTabVisible!: boolean;
  aidLookupStatusList!: Lookup[];
  saveVisible = true;
  validateFieldsVisible = true;

  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    childAids: {name: 'childAids'}
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AidLookup>,
              private toast: ToastService,
              private lookupService: LookupService,
              public langService: LangService,
              private fb: FormBuilder) {
    this.model = data.model;
    this.parentId = data.parentId;
    this.operation = data.operation;
    this.aidType = data.aidType;
    this.checkIfAidTabEnabled();
    this.setGridAidType();
    this.aidLookupStatusList = lookupService.getByCategory(LookupCategories.AID_LOOKUP_STATUS);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildForm();
    this._initStatusChangeSubscribe();
    this._saveModel();
  }

  private _initStatusChangeSubscribe(): void {
    this.fm.getFormField('status')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fm.getFormField('statusDateModified')?.setValue(new Date().toISOString());
      });
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  buildForm(): void {
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
        aidCode: [this.model.aidCode, [CustomValidators.required, CustomValidators.number, Validators.maxLength(50)]],
        aidType: [this.model.aidType ?? this.aidType, [CustomValidators.required]],
        parent: [
          this.aidType === AidTypes.CLASSIFICATIONS ? null : (this.operation === OperationTypes.CREATE) ? this.parentId : this.model.parent
        ],
        status: [this.model.status, [CustomValidators.required]],
        statusDateModified: [this.model.statusDateModified]
      }, {validators: CustomValidators.validateFieldsStatus(['arName', 'enName', 'aidCode', 'aidType', 'status'])})
    });

    this.fm = new FormManager(this.form, this.langService);
    // will check it later
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
        const aidLookup = extender<AidLookup>(AidLookup, {...this.model, ...this.fm.getFormField('basic')?.value});
        return aidLookup.save();
      }),
    ).subscribe(aid => {
      const message = this.operation === OperationTypes.CREATE
        ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
      this.toast.success(message.change({x: aid.aidCode}));
      this.model = aid;
      this.operation = OperationTypes.UPDATE;
      this.checkIfAidTabEnabled();
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
