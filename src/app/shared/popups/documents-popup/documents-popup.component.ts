import { Component, Inject } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '../../tokens/tokens';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'documents-popup',
  templateUrl: './documents-popup.component.html',
  styleUrls: ['./documents-popup.component.scss']
})
export class DocumentsPopupComponent {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: BaseGenericEService<any>, caseId: string, caseType: number, model: any }) {

  }

}
