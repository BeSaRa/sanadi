import {AbstractControl, FormGroup} from '@angular/forms';
import {LangService} from '../services/lang.service';

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

  getStatusClass(field: string): { 'is-valid': boolean, 'is-invalid': boolean } {
    return {
      'is-valid': this.getFieldValidStatus(field),
      'is-invalid': this.getFieldInvalidStatus(field)
    };
  }

  displayFormValidity(): void {
    this.form.markAllAsTouched();
  }

  getStatusFieldTranslate(field: string): any {
    let {active, inactive, status} = this.langService.map;
    status = status + ' : ';
    return this.getFormField(field)?.value ? status + active : status + inactive;
  }


}
