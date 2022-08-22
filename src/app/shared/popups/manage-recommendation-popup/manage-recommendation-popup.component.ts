import { Component, Inject, OnInit } from '@angular/core';
import { LangService } from '@services/lang.service';
import { DIALOG_DATA_TOKEN } from '../../tokens/tokens';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'manage-recommendation-popup',
  templateUrl: './manage-recommendation-popup.component.html',
  styleUrls: ['./manage-recommendation-popup.component.scss']
})
export class ManageRecommendationPopupComponent implements OnInit {

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: {
                service: BaseGenericEService<any>,
                caseId: string,
                onlyLogs: boolean
              }) {
  }

  ngOnInit(): void {
  }

}
