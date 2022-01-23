import {Component, HostBinding, Input} from '@angular/core';
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {QueryResult} from "@app/models/query-result";
import {LangService} from "@app/services/lang.service";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";

@Component({
  selector: 'inbox-grid-actions',
  templateUrl: './inbox-grid-actions.component.html',
  styleUrls: ['./inbox-grid-actions.component.scss']
})
export class InboxGridActionsComponent {
  @Input()
  actions: IMenuItem<QueryResult>[] = [];
  @Input()
  model?: QueryResult
  @HostBinding()
  class: string = 'd-flex'

  constructor(public lang: LangService) {
  }

  getLabel(action: IMenuItem<QueryResult>): string {
    return typeof action.label === 'function' ? action.label(this.model!) : this.lang.map[action.label as keyof ILanguageKeys];
  }

  onActionClicked(action: IMenuItem<QueryResult>) {
    action.onClick && action.onClick(this.model!);
  }
}
