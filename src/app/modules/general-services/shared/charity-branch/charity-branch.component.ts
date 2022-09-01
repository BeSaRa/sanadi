import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { CharityBranch } from '@app/models/charity-branch';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



@Component({
  selector: 'charity-branch',
  templateUrl: './charity-branch.component.html',
  styleUrls: ['./charity-branch.component.scss']
})
export class CharityBranchComponent implements OnInit, OnDestroy {
  @Input() readonly!: boolean;
  @Input() set list(_list: CharityBranch[]) {
    this._list = _list;
  }
  form!: UntypedFormGroup;
  add$: Subject<null> = new Subject<null>();
  showForm = false;
  private destroy$: Subject<any> = new Subject<any>();
  editRecordIndex = -1;
  columns = ['fullName', 'address', 'streetNumber', 'zoneNumber', 'buildingNumber'];
  _list: CharityBranch[] = [];
  save$ = new Subject<CharityBranch>();
  model!: CharityBranch;

  controls: ControlWrapper[] = [
    { controlName: 'fullName', label: this.lang.map.full_name },
    { controlName: 'category', label: this.lang.map.type, load: this.lookupService.listByCategory.BranchCategory },
    { controlName: 'branchAdjective', label: this.lang.map.branch_adjective, load: this.lookupService.listByCategory.BranchAdjective },
    { controlName: 'usageAdjective', label: this.lang.map.usage_adjective, load: this.lookupService.listByCategory.UsageAdjective },
    { controlName: 'address', label: this.lang.map.lbl_address },
    { controlName: 'streetNumber', label: this.lang.map.lbl_street },
    { controlName: 'buildingNumber', label: this.lang.map.building_number },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone },

  ];

  constructor(public lang: LangService, private lookupService: LookupService, private fb: UntypedFormBuilder) { }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    const model = new CharityBranch();
    this.model = model;
    this.form = this.fb.group(model.buildForm());
    this.listenToAdd();
    this.listenToModelChange();
  }

  listenToAdd(): void {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(
      _ => {
        this.showForm = true;
      }
    );
  }
  listenToModelChange(): void {
    this.save$.pipe(takeUntil(this.destroy$)).subscribe(model => {
      this.model = model;
      this._list.push(this.model);
    });
  }
  save(): void {
    const value = this.form.value;
    const model = (new CharityBranch()).clone({
      ...value
    });
    this.save$.next(model);
  }
  cancel(): void {
    this.form.reset();
    this.showForm = false;
  }

}
