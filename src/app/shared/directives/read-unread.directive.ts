import {Directive, HostBinding, Input, OnInit} from '@angular/core';
import {QueryResult} from "@app/models/query-result";

@Directive({
  selector: '[readUnread]'
})
export class ReadUnreadDirective implements OnInit {
  @Input()
  model!: QueryResult

  @HostBinding('class.unread')
  unread: boolean = false;

  ngOnInit(): void {
    this.unread = !this.model.isRead();
  }

}
