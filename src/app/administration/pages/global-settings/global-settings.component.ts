import {Component, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {GlobalSettings} from '@models/global-settings';
import {GlobalSettingsService} from '@services/global-settings.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {FileType} from '@models/file-type';
import {CommonUtils} from '@helpers/common-utils';
import {ToastService} from '@services/toast.service';

@Component({
  selector: 'global-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit {
  model!: GlobalSettings;
  form!: UntypedFormGroup;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  fileTypes: FileType[] = [];
  adminEmailsForm!: UntypedFormGroup;

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              public service: GlobalSettingsService,
              private toast: ToastService) {
  }

  ngOnInit() {
    this.initAdminEmailsForm();
    this.loadFileTypes();

    this.getCurrentGlobalSettings()
      .subscribe((setting) => {
        this.model = setting;
        this.buildForm();

        let jsonEmailsArray = this.getEmailsAsArray(this.model.supportEmailList);
        if(jsonEmailsArray.length > 0) {
          this.updateAdminEmailsForm(jsonEmailsArray);
        }
      });
  }

  getCurrentGlobalSettings(): Observable<GlobalSettings> {
    return this.service.load().pipe(map(settings => settings[0]));
  }

  initiateForm() {
    this.form = this.fb.group({});
  }

  buildForm() {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  loadFileTypes() {
    this.service.getFileTypes()
      .subscribe(list => {
      this.fileTypes = list;
    });
  }

  get emails() {
    return this.adminEmailsForm.controls['emails'] as UntypedFormArray;
  }

  initAdminEmailsForm(): void {
    this.adminEmailsForm = this.fb.group({
      emails: this.fb.array([])
    });
  }

  updateAdminEmailsForm(emails: string[]): void {
    this.adminEmailsForm = this.fb.group({
      emails: this.fb.array([...emails.map(x => new FormControl(x, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]))])
    });
  }

  newAdminEmail(email: string = ''): FormControl {
    if (CommonUtils.isValidValue(email)) {
      return new FormControl(email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]);
    } else {
      return new FormControl('', [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]);
    }
  }

  addAdminEmail(email: string = '') {
    this.emails.controls.unshift(this.newAdminEmail(email));
    this.emails.controls[0].markAsTouched();
    this.emails.updateValueAndValidity();
    // this.emails.push(this.newAdminEmail(email));
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

  save() {
    let updatedModel = new GlobalSettings().clone({...this.model, ...this.form.value});
    this.emails.updateValueAndValidity();
    updatedModel.supportEmailList = this.getEmailsAsString(this.emails.value);
    this.service.update(updatedModel).subscribe(_ => {
      this.toast.success(this.lang.map.msg_save_success);
    });
  }

  invalidEmailsForm() {
    return this.emails.controls.some(control => control.invalid);
  }
}
