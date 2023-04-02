import {Component, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {GlobalSettings} from '@models/global-settings';
import {GlobalSettingsService} from '@services/global-settings.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {FileType} from '@models/file-type';
import {CommonUtils} from '@helpers/common-utils';
import {ToastService} from '@services/toast.service';
import {Router} from '@angular/router';
import {AuthService} from '@services/auth.service';

@Component({
  selector: 'global-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit {
  model!: GlobalSettings;
  form!: UntypedFormGroup;
  adminEmailsForm!: UntypedFormGroup;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  fileTypesList: FileType[] = [];

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              public service: GlobalSettingsService,
              private toast: ToastService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.loadFileTypes();

    this.loadCurrentGlobalSettings().subscribe(() => {
      this.buildForm();
      this.buildAdminEmailsForm();

      this.displayFormValidity();
    });
  }

  loadCurrentGlobalSettings(): Observable<GlobalSettings> {
    return this.service.loadCurrentGlobalSettings()
      .pipe(tap((setting) => this.model = setting))
  }

  buildForm() {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  buildAdminEmailsForm(): void {
    this.adminEmailsForm = this.fb.group({
      emails: this.fb.array([])
    });

    this.model.supportEmailListParsed.reverse().forEach((email) => {
      if (CommonUtils.isValidValue(email)) {
        this.addSupportEmail(email);
      }
    })
  }

  addSupportEmail(email: string = '', isUserInteraction: boolean = false): void {
    this.emailsFormArray.insert(0, this._generateEmailControl(email));
    this.emailsFormArray.at(0).markAllAsTouched();
    this.emailsFormArray.updateValueAndValidity();
  }

  private _generateEmailControl(email: string): UntypedFormControl {
    return new UntypedFormControl(email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(50)]);
  }

  loadFileTypes() {
    this.service.loadAllFileTypes()
      .subscribe(list => {
        this.fileTypesList = list;
      });
  }

  get emailsFormArray(): UntypedFormArray {
    return this.adminEmailsForm.controls['emails'] as UntypedFormArray;
  }

  deleteEmail(emailIndex: number) {
    this.emailsFormArray.removeAt(emailIndex);
  }

  isInvalidForm() {
    return !this.form || this.form.invalid || !this.emailsFormArray || this.emailsFormArray.controls.some(control => control.invalid);
  }

  private _hasDuplicateEmail() {
    return (new Set(this.emailsFormArray.value)).size !== this.emailsFormArray.length;
  }

  save() {
    if (this.isInvalidForm()) {
      return;
    }
    if (this._hasDuplicateEmail()) {
      this.toast.error(this.lang.map.msg_check_x_duplicate.change({x: this.lang.map.admin_emails}));
      return;
    }
    let updatedModel = new GlobalSettings().clone({
      ...this.model,
      ...this.form.value,
      supportEmailListParsed: this.emailsFormArray.value
    });
    this.service.update(updatedModel)
      .subscribe(_ => {
        this.toast.success(this.lang.map.msg_save_success);
        this.authService.logout()
          .subscribe(() => {
            this.router.navigate(['/login']).then();
          })
      });
  }

  displayFormValidity(contentId: string = 'main-content'): void {
    CommonUtils.displayFormValidity(this.form, contentId);
    CommonUtils.displayFormValidity(this.adminEmailsForm, contentId);
  }

  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }

  cancelSettings(): void {
    this.router.navigate(['/home/administration']).then();
  }
}
