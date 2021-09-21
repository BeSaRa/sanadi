import {Component, Input, OnInit} from '@angular/core';
import {CaseModel} from '../../../models/case-model';
import {QueryResult} from '../../../models/query-result';
import {LangService} from '../../../services/lang.service';
import {AdminResult} from "@app/models/admin-result";

@Component({
  selector: 'viewer-case-info',
  templateUrl: './viewer-case-info.component.html',
  styleUrls: ['./viewer-case-info.component.scss']
})
export class ViewerCaseInfoComponent implements OnInit {
  @Input()
  model!: CaseModel<any, any> | QueryResult;
  @Input()
  loadedModel!: any;
  showManagerRequestStatus: boolean = false;

  get username(): string {
    return this.model instanceof QueryResult ? this.model.fromUserInfo.getName() : this.model.creatorInfo.getName();
  };

  get fullSerial(): string {
    return this.model instanceof QueryResult ? this.model.BD_FULL_SERIAL : this.model.fullSerial;
  };

  get creationDate(): string {
    return this.model instanceof QueryResult ? this.model.PI_CREATE : this.model.createdOn;
  }

  get managerJustification(): string | null {
    return this.loadedModel.managerJustification ? this.loadedModel.managerJustification : null;
  }

  get managerDecisionInfo(): AdminResult | null {
    return this.loadedModel.managerDecision ? this.loadedModel.managerDecisionInfo : null;
  }

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
    this.showManagerRequestStatus = !!this.loadedModel.managerDecision;
  }

}
