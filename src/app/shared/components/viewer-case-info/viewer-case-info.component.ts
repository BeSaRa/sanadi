import {Component, Input, OnInit} from '@angular/core';
import {CaseModel} from '../../../models/case-model';
import {QueryResult} from '../../../models/query-result';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'viewer-case-info',
  templateUrl: './viewer-case-info.component.html',
  styleUrls: ['./viewer-case-info.component.scss']
})
export class ViewerCaseInfoComponent implements OnInit {
  @Input()
  model!: CaseModel<any, any> | QueryResult;

  get username(): string {
    return this.model instanceof QueryResult ? this.model.fromUserInfo.getName() : this.model.creatorInfo.getName();
  };

  get fullSerial(): string {
    return this.model instanceof QueryResult ? this.model.BD_FULL_SERIAL : this.model.fullSerial;
  };

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
  }

}
