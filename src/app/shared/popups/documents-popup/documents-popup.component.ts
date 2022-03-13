import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {CaseTypes} from "@app/enums/case-types.enum";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'documents-popup',
  templateUrl: './documents-popup.component.html',
  styleUrls: ['./documents-popup.component.scss']
})
export class DocumentsPopupComponent {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: EServiceGenericService<any>, caseId: string, caseType: number }) {

  }

}
