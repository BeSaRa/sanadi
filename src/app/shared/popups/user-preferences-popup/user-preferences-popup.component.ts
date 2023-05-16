import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {TabMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {IDialogData} from '@contracts/i-dialog-data';
import {CommonUtils} from '@helpers/common-utils';
import {ExternalUser} from '@models/external-user';
import {InternalUser} from '@models/internal-user';
import {Lookup} from '@models/lookup';
import {UserPreferences} from '@models/user-preferences';
import {EmployeeService} from '@services/employee.service';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'user-preferences-popup',
  templateUrl: './user-preferences-popup.component.html',
  styleUrls: ['./user-preferences-popup.component.scss']
})
export class UserPreferencesPopupComponent implements OnInit {
  form!: UntypedFormGroup;
  model: UserPreferences;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  languages: Lookup[] = [];
  alternateUserEmailsForm!: UntypedFormGroup;
  user: InternalUser | ExternalUser;
  canEditPreferences: boolean = false;
  tabIndex$: Subject<number> = new Subject<number>();
  saveVisible = true;
  validateFieldsVisible = true;
  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        if (this.basicInfoTab.disabled) {
          return true;
        }
        return this.basicInfoTab.valid
      },
    },
    vacationTap: {
      name: 'vacationTap',
      langKey: 'beneficiaries_type',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return true;
      },
    },

  };

  get basicInfoTab(): UntypedFormGroup {
    return this.form as UntypedFormGroup;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<UserPreferences>,
              public fb: UntypedFormBuilder,
              private toast: ToastService,
              public dialogRef: DialogRef,
              private employeeService: EmployeeService) {
    this.model = data.model;
    this.user = data.user;
    this.canEditPreferences = data.isLoggedInUserPreferences ? true : this.employeeService.isInternalUser()
  }

  ngOnInit() {
    this.languages = this.getLanguages();
    this.buildForm();
    this.buildAlternateUserEmailsForm();

    if (!this.canEditPreferences) {
      this.disableForms();
    }
  }

  get emailsFormArray(): UntypedFormArray {
    return this.alternateUserEmailsForm.controls['emails'] as UntypedFormArray;
  }

  private disableForms() {
    this.form.disable();
    this.alternateUserEmailsForm.disable();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  buildAlternateUserEmailsForm(): void {
    this.alternateUserEmailsForm = this.fb.group({
      emails: this.fb.array([])
    });

    this.model.alternateEmailListParsed.reverse().forEach((email) => {
      if (CommonUtils.isValidValue(email)) {
        this.addAlternateUserEmail(email);
      }
    })
  }

  private _hasDuplicateEmail() {
    return (new Set(this.emailsFormArray.value)).size !== this.emailsFormArray.length;
  }

  save() {
    if (!this.canEditPreferences || this.isInvalidForm()) {
      return;
    }
    if (this._hasDuplicateEmail()) {
      this.toast.error(this.lang.map.msg_check_x_duplicate.change({x: this.lang.map.alternate_emails}));
      return;
    }

    let updatedModel = new UserPreferences().clone({
      ...this.model,
      ...this.form.value,
      alternateEmailListParsed: this.emailsFormArray.value
    });
    updatedModel.updateUserPreferences(this.user.generalUserId).subscribe(_ => {
      this.dialogRef.close(true);
      this.toast.success(this.lang.map.msg_save_success);
    });
  }

  private _generateEmailControl(email: string): UntypedFormControl {
    return new UntypedFormControl(email, [CustomValidators.required].concat(CustomValidators.commonValidations.email))
  }

  addAlternateUserEmail(email: string = '', isUserInteraction: boolean = false): void {
    if (isUserInteraction && !this.canEditPreferences) {
      return;
    }

    this.emailsFormArray.insert(0, this._generateEmailControl(email));
    this.emailsFormArray.at(0).markAllAsTouched();
    this.emailsFormArray.updateValueAndValidity();
  }

  deleteEmail(emailIndex: number) {
    if (!this.canEditPreferences) {
      return;
    }
    this.emailsFormArray.removeAt(emailIndex);
  }


  isInvalidForm() {
    return !this.form || this.form.invalid || !this.emailsFormArray || this.emailsFormArray.controls.some(control => control.invalid);
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity(form ?? this.form, element);
    CommonUtils.displayFormValidity(this.alternateUserEmailsForm, element);
  }

  getLanguages(): Lookup[] {
    let arabicLang = new Lookup();
    arabicLang.lookupKey = 1;
    arabicLang.arName = 'العربية';
    arabicLang.enName = 'Arabic';

    let englishLang = new Lookup();
    englishLang.lookupKey = 2;
    englishLang.arName = 'الإنجليزية';
    englishLang.enName = 'English';

    return [arabicLang, englishLang];
  }

  onTabChange(tab: TabComponent) {
    this.setDialogButtonsVisibility(tab);
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basicInfo.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basicInfo.name);
  }
}
