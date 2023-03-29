import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {UserPreferences} from '@models/user-preferences';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from '@models/lookup';
import {CommonUtils} from '@helpers/common-utils';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {InternalUser} from '@models/internal-user';
import {ExternalUser} from '@models/external-user';

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
  isLoggedInUserPreferences!: boolean;

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<UserPreferences>,
              public fb: UntypedFormBuilder,
              private toast: ToastService,
              public dialogRef: DialogRef) {
    this.model = data.model;
    this.user = data.user;
    this.isLoggedInUserPreferences = data.isLoggedInUserPreferences;
  }

  ngOnInit() {
    this.languages = this.getLanguages();
    this.buildForm();
    this.buildAlternateUserEmailsForm();
  }

  get emailsFormArray(): UntypedFormArray {
    return this.alternateUserEmailsForm.controls['emails'] as UntypedFormArray;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(this.isLoggedInUserPreferences, true));
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
    if (this.isInvalidForm()) {
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

  addAlternateUserEmail(email: string = ''): void {
    this.emailsFormArray.insert(0, this._generateEmailControl(email));
    this.emailsFormArray.at(0).markAllAsTouched();
    this.emailsFormArray.updateValueAndValidity();
  }

  deleteEmail(emailIndex: number) {
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
}
