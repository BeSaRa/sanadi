import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {DialogRef} from '../../models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-test-dialog',
  templateUrl: './test-dialog.component.html',
  styleUrls: ['./test-dialog.component.scss']
})
export class TestDialogComponent implements OnInit, OnDestroy {

  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA_TOKEN) public data: any) {
    setTimeout(() => this.closeDialog(), 5000);
  }

  ngOnDestroy(): void {
    console.log('OnDestroy');
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
