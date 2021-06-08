import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {EServiceGenericService} from '../../../generics/e-service-generic-service';

@Component({
  selector: 'manage-comment-popup',
  templateUrl: './manage-comment-popup.component.html',
  styleUrls: ['./manage-comment-popup.component.scss']
})
export class ManageCommentPopupComponent implements OnInit {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: EServiceGenericService<any>, caseId: string }) {
  }

  ngOnInit(): void {
  }

}
