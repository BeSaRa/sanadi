import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UntypedFormControl} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {ILanguageKeys} from '@contracts/i-language-keys';

@Component({
  selector: 'app-reason-popup',
  templateUrl: './reason-popup.component.html',
  styleUrls: ['./reason-popup.component.scss']
})
export class ReasonPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  readonly recordText: string;
  readonly submitButtonKey: keyof ILanguageKeys;
  reason: UntypedFormControl = new UntypedFormControl('', CustomValidators.required);

  constructor(public langService: LangService, @Inject(DIALOG_DATA_TOKEN) public data: { record: any, titleText: string, submitButtonKey: keyof ILanguageKeys}) {
    this.recordText = data.titleText;
    this.submitButtonKey = data.submitButtonKey;
  }

  ngOnInit(): void {

  }

}
