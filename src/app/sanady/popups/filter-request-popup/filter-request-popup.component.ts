import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {FormManager} from '@app/models/form-manager';
import {ConfigurationService} from '@app/services/configuration.service';
import {LookupService} from '@app/services/lookup.service';
import {isEmptyObject, objectHasValue} from '@app/helpers/utils';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@app/services/dialog.service';
import {OrgUnit} from '@app/models/org-unit';
import {EmployeeService} from '@app/services/employee.service';
import {AidLookup} from '@app/models/aid-lookup';
import {AidTypes} from '@app/enums/aid-types.enum';
import {StatusEnum} from '@app/enums/status.enum';
import {catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AidLookupService} from '@app/services/aid-lookup.service';

@Component({
  selector: 'app-filter-request-popup',
  templateUrl: './filter-request-popup.component.html',
  styleUrls: ['./filter-request-popup.component.scss']
})
export class FilterRequestPopupComponent implements OnInit, AfterViewInit {
  userClick: typeof UserClickOn = UserClickOn;
  criteria: any;
  form: FormGroup = {} as FormGroup;
  fm: FormManager = {} as FormManager;
  years: number[] = this.configurationService.getSearchYears();
  orgList: OrgUnit[] = [];
  mainAidLookupsList: AidLookup[] = [];
  subAidLookupsList: AidLookup[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any,
              private fb: FormBuilder,
              private dialogRef: DialogRef,
              public langService: LangService,
              public lookupService: LookupService,
              private dialogService: DialogService,
              private aidLookupService: AidLookupService,
              private configurationService: ConfigurationService,
              public empService: EmployeeService) {
    this.criteria = data.criteria;
    this.orgList = data.orgUnits;
  }

  ngOnInit(): void {
    this.loadMainAidLookups();
    this.buildForm();
  }

  ngAfterViewInit() {
    if (this.criteria.aidLookupParentId){
      this.loadSubAidLookups(this.criteria.aidLookupParentId);
    }
  }

  private buildForm() {
    this.form = this.fb.group({
      requestYear: [this.criteria.requestYear],
      orgId: [this.criteria.orgId],
      benCategory: [this.criteria.benCategory],
      // requestType: [this.criteria.requestType],
      gender: [this.criteria.gender],
      aidLookupParentId: [this.criteria.aidLookupParentId],
      aidLookupId: [this.criteria.aidLookupId],
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  get hasFilterCriteria(): boolean {
    return !isEmptyObject(this.form.value) && objectHasValue(this.form.value);
  }

  filterRecords(): void {
    this.dialogRef.close(this.form.value);
  }

  resetFilter(): void {
    this.dialogService.confirmWithTree(this.langService.map.msg_confirm_reset_filter_select_action, {
      actionBtn: 'btn_reset',
      cancelBtn: 'btn_cancel',
      thirdBtn: 'btn_reset_close'
    }).onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES || click === UserClickOn.THIRD_BTN) {
        this.form.patchValue({
          requestYear: null,
          orgId: null,
          benCategory: null,
          requestType: null,
          gender: null
        });
        if (click === UserClickOn.THIRD_BTN) {
          this.dialogRef.close({});
        }
      }
    })
  }

  get requestedAidField(): FormControl {
    return this.fm.getFormField('aidLookupId') as FormControl;
  }

  handleMainAidChange($event: number) {
    this.requestedAidField.reset();
    this.loadSubAidLookups($event);
  }

  private loadMainAidLookups() {
    this.mainAidLookupsList = [];
    return this.aidLookupService.loadByCriteria({
      aidType: AidTypes.MAIN_CATEGORY,
      status: StatusEnum.ACTIVE
    }).pipe(
      catchError(err => of([]))
    ).subscribe((list) => {
      this.mainAidLookupsList = list;
    });
  }

  private loadSubAidLookups(mainAidId: number) {
    this.subAidLookupsList = [];
    if (!mainAidId) {
      return;
    }

    this.aidLookupService.loadByCriteria({
      aidType: AidTypes.SUB_CATEGORY,
      status: StatusEnum.ACTIVE,
      parent: mainAidId
    }).pipe(
      catchError(err => of([]))
    ).subscribe(list => {
      this.subAidLookupsList = list;
    });
  }
}
