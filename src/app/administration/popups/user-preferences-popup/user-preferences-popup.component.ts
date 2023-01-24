import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {AbstractControl, FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {UserPreferences} from '@models/user-preferences';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from '@models/lookup';
import {CommonUtils} from '@helpers/common-utils';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';

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
  generalUserId: number;
  isLoggedInUserPreferences!: boolean;

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<UserPreferences>,
              public fb: UntypedFormBuilder,
              private toast: ToastService,
              public dialogRef: DialogRef) {
    this.model = data.model;
    this.generalUserId = data.generalUserId;
    this.isLoggedInUserPreferences = data.isLoggedInUserPreferences;
  }

  ngOnInit() {
    let jsonEmailsArray = this.getEmailsAsArray(this.model.alternateEmailList);
    if (jsonEmailsArray.length > 0) {
      this.updateAlternateUserEmailsForm(jsonEmailsArray);
    } else {
      this.initAlternateUserEmailsForm();
    }

    this.languages = this.getLanguages();
    this.buildForm();
  }

  get defaultLang(): AbstractControl {
    return this.form.get('defaultLang')!;
  }

  get isMailNotificationEnabled(): AbstractControl {
    return this.form.get('isMailNotificationEnabled')!;
  }

  buildForm() {
    this.form = this.fb.group(this.model.buildForm(this.isLoggedInUserPreferences, true));
  }

  save() {
    let availableToBeUpdated = {defaultLang: this.defaultLang.value, isMailNotificationEnabled: this.isMailNotificationEnabled.value};
    let updatedModel = new UserPreferences().clone({...this.model, ...availableToBeUpdated});
    this.emails.updateValueAndValidity();
    updatedModel.alternateEmailList = this.getEmailsAsString(this.emails.value);

    updatedModel.updateUserPreferences(this.generalUserId).subscribe(_ => {
      this.dialogRef.close();
      this.toast.success(this.lang.map.msg_save_success);
    });
  }

  get emails() {
    return this.alternateUserEmailsForm.controls['emails'] as UntypedFormArray;
  }

  initAlternateUserEmailsForm(): void {
    this.alternateUserEmailsForm = this.fb.group({
      emails: this.fb.array([])
    });
  }

  updateAlternateUserEmailsForm(emails: string[]): void {
    this.alternateUserEmailsForm = this.fb.group({
      emails: this.fb.array([...emails.map(x => new FormControl(x, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]))])
    });
  }

  newAlternateUserEmail(email: string = ''): FormControl {
    if (CommonUtils.isValidValue(email)) {
      return new FormControl(email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]);
    } else {
      return new FormControl('', [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]);
    }
  }

  addAlternateUserEmail(email: string = '') {
    this.emails.controls.unshift(this.newAlternateUserEmail(email));
    this.emails.controls[0].markAsTouched();
    this.emails.updateValueAndValidity();
  }

  deleteEmail(emailIndex: number) {
    this.emails.removeAt(emailIndex);
  }

  getEmailsAsArray(emailsString: string) {
    let emailsArr: string[];
    try {
      emailsArr = JSON.parse(emailsString);
    } catch (err) {
      emailsArr = [];
    }
    return emailsArr;
  }

  getEmailsAsString(emailsArray: string[]) {
    let finalArr = emailsArray.filter(x => CommonUtils.isValidValue(x));
    return JSON.stringify(finalArr);
  }

  invalidEmailsForm() {
    return this.emails.controls.some(control => control.invalid);
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    if (!form) {
      this.form.markAllAsTouched();
    } else {
      form.markAllAsTouched();
    }

    let ele: HTMLElement | false = false;
    if (!element) {
      return;
    }
    element instanceof HTMLElement && (ele = element);
    typeof element === 'string' && (ele = document.getElementById(element) as HTMLElement);
    if (ele) {
      ele.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  getLanguages() {
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
}
