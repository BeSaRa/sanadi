import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import {CustomValidators} from "@app/validators/custom-validators";
import { GdxMsdfSecurityResponse } from '@app/models/gdx-msdf-security';

@Component({
  selector: 'security-bs-related-data-list',
  templateUrl: './security-bs-related-data-list.component.html',
  styleUrls: ['./security-bs-related-data-list.component.scss']
})
export class SecurityBSRelatedDataListComponent {
  @Input() list: GdxMsdfSecurityResponse[] = [];

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [
    'statusCode',
    'beneficiaryStatus',
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxMsdfSecurityResponse>[] = [];
}
