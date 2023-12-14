import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, takeUntil, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CollectedFundsService } from '@app/services/collected-funds.service';
import { EmployeeService } from '@app/services/employee.service';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'app-add-fund-unit-popup',
  templateUrl: './add-fund-unit-popup.component.html',
  styleUrls: ['./add-fund-unit-popup.component.scss']
})
export class AddFundUnitPopupComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject();
  save$: Subject<void> = new Subject();
  form!: FormGroup;
  constructor(
    private dialogRef: DialogRef,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private toast: ToastService,
    private service: CollectedFundsService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      vsId: string,
      projectTotalCost: number,
      permitType: number
    },
    public lang: LangService,
  ) { }
  
  ngOnInit() {
    this.buildForm();
    this._listenToSave();
  }
  buildForm() {
    this.form = this.fb.group({
      collectedAmount: [0, [CustomValidators.required, Validators.min(1)]],
    })
  }
  private _listenToSave() {
    this.save$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(_ => this.form.valid))
      .pipe(switchMap(_ => {
        return this.service.createFundsUnit({
          collectedAmount: +this.form.value.collectedAmount,
          approvalStatus: 0,
          fundraisingVsId: this.data.vsId,
          permitType: this.data.permitType,
          projectTotalCost: this.data.projectTotalCost,
          totalCost: 0
        })
      }))
      .subscribe(() => {
        if(this.employeeService.isCharityManager()) {
          this.toast.success(this.lang.map.msg_fund_added_success);
        } else {
          this.toast.success(this.lang.map.msg_add_fund_request_success);
        }
        this.dialogRef.close();
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
