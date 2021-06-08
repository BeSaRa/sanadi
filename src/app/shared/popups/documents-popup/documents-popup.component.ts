import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {EServiceGenericService} from '../../../generics/e-service-generic-service';

@Component({
  selector: 'documents-popup',
  templateUrl: './documents-popup.component.html',
  styleUrls: ['./documents-popup.component.scss']
})
export class DocumentsPopupComponent implements OnInit {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: EServiceGenericService<any>, caseId: string }) {

  }

  ngOnInit(): void {

  }

}
