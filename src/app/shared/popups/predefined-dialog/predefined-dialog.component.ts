import {Component, Inject, Input, OnInit} from '@angular/core';
import {ITypeDialogList} from '../../../interfaces/i-type-dialog-list';
import {DIALOG_CONFIG_TOKEN, DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {FactoryService} from '../../../services/factory.service';
import {IDialogPredefinedConfig} from '../../../interfaces/i-dialog-predefined-config';

@Component({
  selector: 'app-predefined-dialog',
  templateUrl: './predefined-dialog.component.html',
  styleUrls: ['./predefined-dialog.component.scss']
})
export class PredefinedDialogComponent implements OnInit {
  @Input() type: keyof ITypeDialogList = 'alert';
  typeList: ITypeDialogList = {
    alert: {icon: 'mdi-alert', textClass: 'text-warning'},
    error: {icon: 'mdi-close-circle', textClass: 'text-danger'},
    success: {icon: 'mdi-check-circle', textClass: 'text-success'},
    info: {icon: 'mdi-information', textClass: 'text-info'},
    confirm: {icon: 'mdi-help-rhombus', textClass: 'text-primary'},
    confirmWithThree: {icon: 'mdi-help-rhombus', textClass: 'text-info'}
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
