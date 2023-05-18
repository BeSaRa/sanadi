import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, UntypedFormGroup} from '@angular/forms';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {CountryService} from '@services/country.service';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Country} from '@app/models/country';

@Component({
  selector: 'external-offices-popup',
  templateUrl: './external-offices-popup.component.html',
  styleUrls: ['./external-offices-popup.component.scss'],
})
export class ExternalOfficesPopupComponent implements OnInit {
  readonly = true;
  hideFullScreen = false;
  controls: ControlWrapper[] = [
    {
      controlName: 'country',
      langKey: 'country',
      type: 'dropdown',
      load$: this.countryService.loadAsLookups(),
      dropdownValue: 'id',
      dropdownOptionDisabled: (optionItem: Country) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'region',
      langKey: 'region',
      type: 'text'
    },
    {
      controlName: 'recordNo',
      langKey: 'record_number',
      type: 'text',
    },
    {
      controlName: 'fax',
      langKey: 'fax_number',
      type: 'text'
    },
    {
      controlName: 'email',
      langKey: 'lbl_email',
      type: 'text'
    },
    {
      controlName: 'postalCode',
      langKey: 'postal_code',
      type: 'text',
    },
    {
      controlName: 'phone',
      langKey: 'lbl_phone',
      type: 'text'
    },
  ];
  form!: UntypedFormGroup;

  constructor(public lang: LangService,
              private fb: FormBuilder,
              private countryService: CountryService,
              @Inject(DIALOG_DATA_TOKEN) public data: FinalExternalOfficeApprovalResult) {
  }

  ngOnInit(): void {
    this.form = this.fb.group(this.data.buildForm());
    this.form.disable();
  }

  cancel() {
  }
}
