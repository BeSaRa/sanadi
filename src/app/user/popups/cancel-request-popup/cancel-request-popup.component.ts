import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {SubventionRequestAid} from '../../../models/subvention-request-aid';
import {SubventionRequest} from '../../../models/subvention-request';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {FormControl} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-cancel-request-popup',
  templateUrl: './cancel-request-popup.component.html',
  styleUrls: ['./cancel-request-popup.component.scss']
})
export class CancelRequestPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  readonly serial: string;
  reason: FormControl = new FormControl('', CustomValidators.required);

  constructor(public langService: LangService, @Inject(DIALOG_DATA_TOKEN) public data: { request: SubventionRequest | SubventionRequestAid }) {
    this.serial = data.request.requestFullSerial;
  }

  ngOnInit(): void {

  }

}
