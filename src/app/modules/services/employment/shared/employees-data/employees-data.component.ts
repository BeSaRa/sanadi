import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IGridAction} from '@contracts/i-grid-action';
import {Employee} from '@models/employee';
import {Lookup} from '@models/lookup';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {Employment} from '@models/employment';
import {Observable} from 'rxjs';
import {HasAttachmentHandlerDirective} from '@app/shared/directives/has-attachment-handler.directive';
import {AttachmentHandlerDirective} from '@app/shared/directives/attachment-handler.directive';

@Component({
  selector: 'app-employees-data',
  templateUrl: './employees-data.component.html',
  styleUrls: ['./employees-data.component.scss'],
})
export class EmployeesDataComponent extends HasAttachmentHandlerDirective implements OnInit, AfterViewInit {
  @ViewChild(AttachmentHandlerDirective) attachmentHandlerDirective?: AttachmentHandlerDirective;
  @Output() attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective> = new EventEmitter<AttachmentHandlerDirective>();

  Gender: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  _displayedColumns: string[] = ['arabicName', 'englishName', 'jobTitle', 'gender'];
  get displayedColumns() {
    if (!this.isPopup) {
      return [...this._displayedColumns, 'attachment'];
    }
    return !this.actions.length ? this._displayedColumns : [...this._displayedColumns, 'actions'];
  }

  @Input() employees: Partial<Employee>[] = [];
  @Input() actions: IGridAction[] = [];
  @Input() isPopup: boolean = false;
  @Input() model!: Employment;
  @Input() formProperties: Record<string, () => Observable<any>> = {};

  constructor(public lang: LangService, private lookupService: LookupService) {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.attachmentHandlerEmitter.emit(this.attachmentHandlerDirective);
  }

  getGenderName(gender: number) {
    return this.Gender.find((g) => g.lookupKey == gender)?.getName();
  }

  cb(e: Event, btn: any, data: any) {
    e.preventDefault();
    if (btn.callback) {
      btn.callback(e, data);
    }
  }
}
