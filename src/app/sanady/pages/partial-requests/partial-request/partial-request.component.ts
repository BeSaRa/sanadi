import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {CustomValidators} from '@app/validators/custom-validators';
import {catchError, switchMap, takeUntil} from 'rxjs/operators';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {Router} from '@angular/router';
import {DialogService} from '@app/services/dialog.service';
import {IPartialRequestCriteria} from '@app/interfaces/i-partial-request-criteria';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {isEmptyObject, isValidValue, objectHasValue} from '@app/helpers/utils';
import {FilterEventTypes} from '@app/types/types';
import {SubventionRequestPartial} from '@app/models/subvention-request-partial';
import {SubventionRequestPartialService} from '@app/services/subvention-request-partial.service';
import {SubventionResponseService} from '@app/services/subvention-response.service';
import {BeneficiaryService} from '@app/services/beneficiary.service';
import {EmployeeService} from '@app/services/employee.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {UntypedFormControl} from '@angular/forms';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'app-partial-request',
  templateUrl: './partial-request.component.html',
  styleUrls: ['./partial-request.component.scss']
})
export class PartialRequestComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private subventionRequestService: SubventionRequestService,
              private subventionResponseService: SubventionResponseService, // for model/interceptor
              private subventionRequestPartialService: SubventionRequestPartialService,
              private beneficiaryService: BeneficiaryService, // for model/interceptor
              private router: Router,
              public empService: EmployeeService) {
  }

  partialRequests: SubventionRequestPartial[] = [];
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(true);
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterCriteria: Partial<IPartialRequestCriteria> = {};
  displayedColumns: string[] = ['icons', 'creationDate', 'creationYear', 'organization', 'gender', 'estimatedValue', 'totalAidAmount', 'remainingAmount', 'actions'];//'benCategory', 'requestType',
  headerColumn: string[] = ['extra-header'];
  actionIconsEnum = ActionIconsEnum;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  actions: IMenuItem<SubventionRequestPartial>[] = [
    // show details
    {
      type: 'action',
      icon: ActionIconsEnum.DETAILS,
      label: 'show_details',
      onClick: (item: SubventionRequestPartial) => item.showPartialRequestDetails()
    },
    // add partial request
    {
      type: 'action',
      icon: ActionIconsEnum.ADD_SIMPLE,
      label: 'btn_add_partial_request',
      onClick: (item: SubventionRequestPartial) => this.addPartialRequest(item),
      show: (_item) => this.empService.checkPermissions('SUBVENTION_ADD')
    }
  ];

  sortingCallbacks = {
    creationDate: (a: SubventionRequestPartial, b: SubventionRequestPartial, dir: SortEvent): number => {
      let value1 = !isValidValue(a) ? '' : new Date(a.creationDate).valueOf(),
        value2 = !isValidValue(b) ? '' : new Date(b.creationDate).valueOf();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organization: (a: SubventionRequestPartial, b: SubventionRequestPartial, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    gender: (a: SubventionRequestPartial, b: SubventionRequestPartial, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.genderInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.genderInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    estimatedValue: (a: SubventionRequestPartial, b: SubventionRequestPartial, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidTotalSuggestedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidTotalSuggestedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    totalAidAmount: (a: SubventionRequestPartial, b: SubventionRequestPartial, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidTotalPayedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidTotalPayedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    remainingAmount: (a: SubventionRequestPartial, b: SubventionRequestPartial, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidRemainingAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidRemainingAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  ngOnInit(): void {
    this.listenToReload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  hasFilterCriteria(): boolean {
    return !isEmptyObject(this.filterCriteria) && objectHasValue(this.filterCriteria);
  }

  private _loadPartialRequests(): Observable<SubventionRequestPartial[]> {
    if (!this.hasFilterCriteria()) {
      return this.subventionRequestPartialService.loadPartialRequests()
    } else {
      return this.subventionRequestPartialService.loadPartialRequestsByCriteria(this.filterCriteria)
    }
  }

  private listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => this._loadPartialRequests().pipe(catchError((_) => of([])))),
    ).subscribe((partialRequests: SubventionRequestPartial[]) => {
      this.partialRequests = partialRequests;
    });
  }

  listenToFilter(type: FilterEventTypes): void {
    if (type === 'CLEAR') {
      this.filterCriteria = {};
      this.reload$.next(true);
    } else if (type === 'OPEN') {
      const sub = this.subventionRequestPartialService.openFilterPartialRequestDialog(this.filterCriteria)
        .subscribe((dialog: DialogRef) => {
          dialog.onAfterClose$.subscribe((result: UserClickOn | Partial<IPartialRequestCriteria>) => {
            if (!isValidValue(result) || result === UserClickOn.CLOSE) {
              return;
            }
            this.filterCriteria = result as Partial<IPartialRequestCriteria>;
            this.reload$.next(true);
            sub.unsubscribe();
          });
        })
    }
  }

  addPartialRequest(request: SubventionRequestPartial): void {
    this.dialogService.confirm(this.langService.map.msg_confirm_create_partial_request)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        this.router.navigate(['/home/sanady/request/partial', request.requestId],).then();
      }
    })
  }
}
