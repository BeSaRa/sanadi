import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {take} from 'rxjs/operators';
import {BlobModel} from '@app/models/blob-model';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {CaseTypes} from '@app/enums/case-types.enum';

@Component({
  selector: 'action-registry-popup',
  templateUrl: './action-registry-popup.component.html',
  styleUrls: ['./action-registry-popup.component.scss']
})
export class ActionRegistryPopupComponent implements OnInit {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: BaseGenericEService<any>, caseId: string, caseType: CaseTypes, isMainRequest: boolean }) {
  }

  ngOnInit(): void {
  }

  print() {
    this.data.service.exportActions(this.data.caseId).pipe(take(1)).subscribe((blob: BlobModel) => window.open(blob.url));
  }

}
