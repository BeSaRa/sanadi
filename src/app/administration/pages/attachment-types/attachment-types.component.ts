import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Subscription} from 'rxjs';
import {AttachmentType} from '../../../models/attachment-type';
import {AttachmentTypeService} from '../../../services/attachment-type.service';
import {FormControl} from '@angular/forms';
import {Localization} from '../../../models/localization';
import {DialogRef} from '../../../shared/models/dialog-ref';

@Component({
  selector: 'attachment-types',
  templateUrl: './attachment-types.component.html',
  styleUrls: ['./attachment-types.component.scss']
})
export class AttachmentTypesComponent implements OnInit {
  list: AttachmentType[] = [];
  columns = ['arName', 'enName', 'status', 'actions'];
  filter: FormControl = new FormControl();
  addSubscription!: Subscription;
  reloadSubscription!: Subscription;

  constructor(public lang: LangService, private attachmentTypeService: AttachmentTypeService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.attachmentTypeService.load().subscribe(data => {
      this.list = data;
    });
  }

  reload() {
    this.load();
  }

  filterCallback(data: AttachmentType, text: string): boolean {
    return data.arName.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
      data.enName.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  }

  add(): void {
    const sub = this.attachmentTypeService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload();
      sub.unsubscribe();
    });
  }

  edit(localization: Localization, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.attachmentTypeService.openUpdateDialog(localization.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload();
        sub.unsubscribe();
      });
    });

  }
}
