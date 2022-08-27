import { Component, Inject, OnInit } from '@angular/core';
import { LangService } from '@services/lang.service';
import { DIALOG_DATA_TOKEN } from '../../tokens/tokens';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'manage-comment-popup',
  templateUrl: './manage-comment-popup.component.html',
  styleUrls: ['./manage-comment-popup.component.scss']
})
export class ManageCommentPopupComponent implements OnInit {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { service: BaseGenericEService<any>, caseId: string }) {
  }

  ngOnInit(): void {
  }

}
