import {Component, Inject, Input, OnInit} from '@angular/core';
import {ITypeDialogList} from '@app/interfaces/i-type-dialog-list';
import {DIALOG_CONFIG_TOKEN, DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {FactoryService} from '@app/services/factory.service';
import {IDialogButton, IDialogPredefinedConfig} from '@app/interfaces/i-dialog-predefined-config';

@Component({
  selector: 'app-predefined-dialog',
  templateUrl: './predefined-dialog.component.html',
  styleUrls: ['./predefined-dialog.component.scss']
})
export class PredefinedDialogComponent implements OnInit {
  @Input() type: keyof ITypeDialogList = 'alert';

  private _buttonsList: IDialogButton[] = [];
  @Input()
  set buttonsList(value: IDialogButton[]) {
    this._buttonsList = [...value].sort((a, b) => a.index - b.index);
    let hasCancelButton = !!value.find(x => x.key === 'CANCEL_BUTTON');
    if (!hasCancelButton) {
      this._buttonsList.push({
        index: -1,
        key: 'CANCEL_BUTTON',
        langKey: this.config.cancelBtn,
        text: '',
        cssClass: 'btn-secondary',
      });
    }
  };

  get buttonsList(): IDialogButton[] {
    return this._buttonsList;
  }

  typeList: ITypeDialogList = {
    alert: {icon: 'mdi-alert', textClass: 'text-warning'},
    error: {icon: 'mdi-close-circle', textClass: 'text-danger'},
    success: {icon: 'mdi-check-circle', textClass: 'text-success'},
    info: {icon: 'mdi-information', textClass: 'text-info'},
    confirm: {icon: 'mdi-help-rhombus', textClass: 'text-primary'},
    confirmWithThree: {icon: 'mdi-help-rhombus', textClass: 'text-info'},
    confirmWithDynamicButtons: {icon: 'mdi-help-rhombus', textClass: 'text-info'}
  };
  userClickOn = UserClickOn;
  langService: LangService = {} as LangService;
  data: string;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: string,
              @Inject(DIALOG_CONFIG_TOKEN) public config: IDialogPredefinedConfig) {

    this.data = (data + '').replace(new RegExp(/\n/, 'g'), '<br />');
  }

  ngOnInit(): void {
    this.langService = FactoryService.getService('LangService');
  }

}
