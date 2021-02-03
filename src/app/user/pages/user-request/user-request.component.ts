import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {LookupService} from '../../../services/lookup.service';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent implements OnInit {
  constructor(public langService: LangService, public lookup: LookupService, private dialog: DialogService) {

  }

  ngOnInit(): void {
  }

  saveModel() {
    this.dialog.error(this.langService.map.something_went_wrong_during_process);
  }
}
