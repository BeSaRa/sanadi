import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DialogRef} from '../../models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';

@Component({
  selector: 'app-test-dialog',
  templateUrl: './test-dialog.component.html',
  styleUrls: ['./test-dialog.component.scss']
})
export class TestDialogComponent implements OnInit, OnDestroy {

  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA_TOKEN) public data: any) {
  }

  ngOnDestroy(): void {
    console.log('OnDestroy');
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close('!! HELLO DEAR IM AFTER CLOSE !!');
  }
}
