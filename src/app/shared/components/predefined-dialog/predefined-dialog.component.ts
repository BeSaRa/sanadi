import {Component, Inject, Input, OnInit} from '@angular/core';
import {ITypeDialogList} from '../../../interfaces/i-type-dialog-list';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';

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
    confirm: {icon: 'mdi-help-rhombus', textClass: 'text-primary'}
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any) {
  }

  ngOnInit(): void {
  }

}
