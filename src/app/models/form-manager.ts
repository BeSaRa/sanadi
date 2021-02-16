import {AbstractControl, FormGroup} from '@angular/forms';
import {LangService} from '../services/lang.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {IStatusClasses} from '../interfaces/i-status-classes';

export class FormManager {
  constructor(private form: FormGroup, private langService: LangService) {
  }

  setForm(form: FormGroup): FormManager {
    this.form = form;
    return this;
  }

  getForm(): FormGroup | undefined {
    return this.form;
  }

  getFormField(field: string): AbstractControl | null {
    return this.form.get(field);
  }

  getFieldErrors(field: string): any {
    return this.getFormField(field)?.errors;
  }

  getFieldInvalidStatus(field: string): boolean {
    const ctrl = this.getFormField(field);
    return !!(ctrl?.invalid && (ctrl?.touched || ctrl?.dirty));
  }

  getFieldValidStatus(field: string): boolean {
    const ctrl = this.getFormField(field);
    return !!(ctrl?.valid && (ctrl?.touched || ctrl?.dirty));
  }

  getStatusClass(field: string): IStatusClasses {
    return {
      ...this.getInvalidClass(field),
      ...this.getValidClass(field)
    };
  }

  getInvalidClass(field: string): Pick<IStatusClasses, 'is-invalid'> {
    return {
      'is-invalid': this.getFieldInvalidStatus(field)
    };
  }

  getValidClass(field: string): Pick<IStatusClasses, 'is-valid'> {
    return {
      'is-valid': this.getFieldValidStatus(field)
    };
  }

  displayFormValidity(): void {
    this.form.markAllAsTouched();
  }

  getStatusFieldTranslate(field: string): any {
    const {lbl_active, lbl_inactive, lbl_status} = this.langService.map;
    return lbl_status + ' : ' + (this.getFormField(field)?.value ? lbl_active : lbl_inactive);
  }

  getBooleanFieldTranslate(field: string, fieldLabel: string, activeLabel: string, inactiveLabel: string): any {
    const label = this.langService.map[fieldLabel as keyof ILanguageKeys];
    const active = this.langService.map[activeLabel as keyof ILanguageKeys];
    const inactive = this.langService.map[inactiveLabel as keyof ILanguageKeys];
    return label + ' : ' + (this.getFormField(field)?.value ? active : inactive);
  }
}
