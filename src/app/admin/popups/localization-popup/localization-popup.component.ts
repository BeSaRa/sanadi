import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {Localization} from '../../../models/localization';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {cloneDeep as _clone} from 'lodash';
import {FactoryService} from '../../../services/factory.service';
import {ToastService} from '../../../services/toast.service';

@Component({
  selector: 'app-localization-popup',
  templateUrl: './localization-popup.component.html',
  styleUrls: ['./localization-popup.component.scss']
})
export class LocalizationPopupComponent implements OnInit, OnDestroy {
  localForm: FormGroup = {} as FormGroup;
  localization: Localization;
  editMode: boolean;
  fm: FormManager = {} as FormManager;
  lang: LangService = {} as LangService;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: { localization: Localization, editMode: boolean },
              private toast: ToastService,
              private fb: FormBuilder) {
    this.localization = data.localization;
    this.editMode = data.editMode;
    this.lang = FactoryService.getService('LangService');
  }

  ngOnInit(): void {
    this.localForm = this.fb.group({
      localizationKey: [{
        value: this.localization.localizationKey,
        disabled: this.editMode
      }, [Validators.required, Validators.minLength(3)]],
      arName: [this.localization.arName, [Validators.required, Validators.minLength(3)]],
      enName: [this.localization.enName, [Validators.required, Validators.minLength(3)]]
    });
    this.fm = new FormManager(this.localForm);
    // will check it later
    if (this.editMode) {
      this.fm.displayFormValidity();
    }
  }

  ngOnDestroy(): void {

  }

  saveLocalization(): void {
    let localization = _clone(Object.assign(new Localization(), {...this.localization, ...this.localForm.value})) as Localization;
    const sub = localization.save().subscribe(local => {
      this.toast.success(this.lang.lang.update_x_success.change({x: local.localizationKey}));
      sub.unsubscribe();
    });
  }
}
