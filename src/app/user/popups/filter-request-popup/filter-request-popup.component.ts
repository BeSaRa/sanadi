import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {ConfigurationService} from '../../../services/configuration.service';
import {LookupService} from '../../../services/lookup.service';
import {isEmptyObject, objectHasValue} from '../../../helpers/utils';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {DialogService} from '../../../services/dialog.service';
import {OrgUnit} from '../../../models/org-unit';

@Component({
  selector: 'app-filter-request-popup',
  templateUrl: './filter-request-popup.component.html',
  styleUrls: ['./filter-request-popup.component.scss']
})
export class FilterRequestPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  criteria: any;
  form: FormGroup = {} as FormGroup;
  fm: FormManager = {} as FormManager;
  years: number[] = this.configurationService.getSearchYears();
  orgList: OrgUnit[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any,
              private fb: FormBuilder,
              private dialogRef: DialogRef,
              public langService: LangService,
              public lookupService: LookupService,
              private dialogService: DialogService,
              private configurationService: ConfigurationService) {
    this.criteria = data.criteria;
    this.orgList = data.orgUnits;
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.fb.group({
      requestFullSerial: [this.criteria.requestFullSerial, Validators.maxLength(50)],
      requestYear: [this.criteria.requestYear],
      orgId: [this.criteria.orgId],
      benCategory: [this.criteria.benCategory],
      requestSummary: [this.criteria.requestSummary],
      gender: [this.criteria.gender]
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  get hasFilterCriteria(): boolean {
    return !isEmptyObject(this.form.value) && objectHasValue(this.form.value);
  }

  filterRecords($event: MouseEvent): void {
    this.dialogRef.close(this.form.value);
  }

  resetFilter($event: MouseEvent): void {
    this.dialogService.confirmWithTree(this.langService.map.msg_confirm_reset_filter_select_action, {
      actionBtn: 'btn_reset',
      cancelBtn: 'btn_cancel',
      thirdBtn: 'btn_reset_close'
    }).onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES || click === UserClickOn.THIRD_BTN) {
        this.form.patchValue({
          requestFullSerial: null,
          requestYear: null,
          orgId: null,
          benCategory: null,
          requestSummary: null,
          gender: null
        });
        if (click === UserClickOn.THIRD_BTN) {
          this.dialogRef.close({});
        }
      }
    })
  }
}
