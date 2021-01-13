import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {Localization} from '../../../models/localization';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {cloneDeep as _clone} from 'lodash';
import {FactoryService} from '../../../services/factory.service';
import {ToastService} from '../../../services/toast.service';
import {OperationTypes} from '../../../enums/operation-types.enum';

@Component({
  selector: 'app-localization-popup',
  templateUrl: './localization-popup.component.html',
  styleUrls: ['./localization-popup.component.scss']
})
export class LocalizationPopupComponent implements OnInit, OnDestroy {
  localForm: FormGroup = {} as FormGroup;
  localization: Localization;
  operation: OperationTypes;
  fm: FormManager = {} as FormManager;
  langService: LangService = {} as LangService;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: { localization: Localization, operation: OperationTypes },
              private toast: ToastService,
              private fb: FormBuilder) {
    this.localization = data.localization;
    this.operation = data.operation;
  }

  ngOnInit(): void {
    this.langService = FactoryService.getService('LangService');
    this.localForm = this.fb.group({
      localizationKey: [{
        value: this.localization.localizationKey,
        disabled: this.operation
      }, [Validators.required, Validators.minLength(2)]],
      arName: [this.localization.arName, [Validators.required, Validators.minLength(2)]],
      enName: [this.localization.enName, [Validators.required, Validators.minLength(2)]]
    });
    this.fm = new FormManager(this.localForm);
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveLocalization(): void {
    let localization = _clone(Object.assign(new Localization(), {...this.localization, ...this.localForm.value})) as Localization;
    const message = this.operation === OperationTypes.CREATE ? this.langService.lang.create_x_success : this.langService.lang.update_x_success;
    const sub = localization.save().subscribe(local => {
      this.toast.success(message.change({x: local.localizationKey}));
      this.localization = local;
      this.operation = OperationTypes.UPDATE;
      this.localForm.get('localizationKey')?.disable();
      sub.unsubscribe();
    });
  }

  ngOnDestroy(): void {

  }
}
