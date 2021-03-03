import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {SubventionRequestAid} from '../../../models/subvention-request-aid';
import {SubventionRequest} from '../../../models/subvention-request';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {FormControl} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';

@Component({
  selector: 'app-reason-popup',
  templateUrl: './reason-popup.component.html',
  styleUrls: ['./reason-popup.component.scss']
})
export class ReasonPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  readonly recordText: string;
  readonly submitButtonKey: string;
  reason: FormControl = new FormControl('', CustomValidators.required);

  constructor(public langService: LangService, @Inject(DIALOG_DATA_TOKEN) public data: { record: any, titleText: string, submitButtonKey: keyof ILanguageKeys}) {
    this.recordText = data.titleText;
    this.submitButtonKey = data.submitButtonKey;
  }

  ngOnInit(): void {

  }

}
