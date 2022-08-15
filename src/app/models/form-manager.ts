import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@services/lang.service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { IStatusClasses } from '@contracts/i-status-classes';

export class FormManager {

  mainContentId = 'main-content';

  constructor(private form: UntypedFormGroup, private langService: LangService) {
  }

  setForm(form: UntypedFormGroup): FormManager {
    this.form = form;
    return this;
  }

  getForm(): UntypedFormGroup | undefined {
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

  /**
   * @description Highlight validity of all fields in form
   * @param elmRefToScroll
   * Scroll the form to the top of given element
   */
  displayFormValidity(elmRefToScroll: any = ''): void {
    this.form.markAllAsTouched();

    if (!elmRefToScroll) {
      return;
    }

    if (typeof elmRefToScroll === 'string') {
      elmRefToScroll = document.getElementById(elmRefToScroll) as HTMLElement;
    }

    if (elmRefToScroll.scrollTop > 0) {
      elmRefToScroll.scrollTo({top: 0, behavior: "smooth"});
    }
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
