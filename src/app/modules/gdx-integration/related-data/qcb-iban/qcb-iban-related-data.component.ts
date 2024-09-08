import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import {CustomValidators} from "@app/validators/custom-validators";
import {GdxQcbIbanResponse} from '@models/gdx-qcb-iban-response';

@Component({
  selector: 'qcb-iban-related-data',
  templateUrl: './qcb-iban-related-data.component.html',
  styleUrls: ['./qcb-iban-related-data.component.scss']
})
export class QcbIbanRelatedDataComponent {
  @Input() list: GdxQcbIbanResponse[] = [];

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [
    'accountStatus',
    'bankCode',
    'bankNameArabic',
    'bankNameEnglish',
    'customerIban',
    'customerId',
    'customerType',
  ];

  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxQcbIbanResponse>[] = [];
}
