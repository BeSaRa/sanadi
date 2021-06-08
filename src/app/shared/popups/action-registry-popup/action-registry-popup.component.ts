import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {EServiceGenericService} from '../../../generics/e-service-generic-service';
import {take} from 'rxjs/operators';
import {BlobModel} from '../../../models/blob-model';

@Component({
  selector: 'action-registry-popup',
  templateUrl: './action-registry-popup.component.html',
  styleUrls: ['./action-registry-popup.component.scss']
})
export class ActionRegistryPopupComponent implements OnInit {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: EServiceGenericService<any>, caseId: string }) {
  }

  ngOnInit(): void {
  }

  print() {
    this.data.service.exportActions(this.data.caseId).pipe(take(1)).subscribe((blob: BlobModel) => window.open(blob.url));
  }

}
