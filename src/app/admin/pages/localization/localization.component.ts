import {Component, ElementRef, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {TestDialogComponent} from '../../../shared/components/test-dialog/test-dialog.component';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent implements OnInit {

  constructor(private dialog: DialogService) {
  }

  ngOnInit(): void {
  }

  showDialog(): void {
    this.dialog
      .show(TestDialogComponent, {welcome: true}, {escToClose: true})
      .onAfterClose.subscribe(value => console.log('value : ', value));
  }

}
