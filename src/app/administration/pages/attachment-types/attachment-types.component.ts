import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject} from 'rxjs';
import {AttachmentType} from '../../../models/attachment-type';
import {AttachmentTypeService} from '../../../services/attachment-type.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'attachment-types',
  templateUrl: './attachment-types.component.html',
  styleUrls: ['./attachment-types.component.scss']
})
export class AttachmentTypesComponent implements OnInit {
  reload$ = new BehaviorSubject<any>(null);
  list: AttachmentType[] = [];
  columns = ['arName', 'enName', 'status'];
  filter: FormControl = new FormControl();

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
    this.filter.patchValue(null);
    this.load();
  }

  filterCallback(data: AttachmentType, text: string): boolean {
    return data.arName.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
      data.enName.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  }

  add() {

  }
}
