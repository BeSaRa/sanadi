import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ActionRegistry} from '@models/action-registry';

@Component({
  selector: 'service-log-list',
  templateUrl: './service-log-list.component.html',
  styleUrls: ['./service-log-list.component.scss']
})
export class ServiceLogListComponent {
  constructor(public lang: LangService) {
  }

  @Input() logsList: ActionRegistry[] = [];
  @Input() displayedColumns: string[] = [];


}
