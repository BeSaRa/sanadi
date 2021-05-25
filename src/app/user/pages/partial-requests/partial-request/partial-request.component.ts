import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../../services/lang.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CustomValidators} from '../../../../validators/custom-validators';
import {switchMap} from 'rxjs/operators';
import {SubventionRequestService} from '../../../../services/subvention-request.service';
import {UserClickOn} from '../../../../enums/user-click-on.enum';
import {Router} from '@angular/router';
import {DialogService} from '../../../../services/dialog.service';
import {IPartialRequestCriteria} from '../../../../interfaces/i-partial-request-criteria';
import {DialogRef} from '../../../../shared/models/dialog-ref';
import {isEmptyObject, objectHasValue} from '../../../../helpers/utils';
import {FilterEventTypes} from '../../../../types/types';
import {SubventionRequestPartial} from '../../../../models/subvention-request-partial';
import {SubventionRequestPartialService} from '../../../../services/subvention-request-partial.service';
import {SubventionResponseService} from '../../../../services/subvention-response.service';
import {BeneficiaryService} from '../../../../services/beneficiary.service';
import {EmployeeService} from '../../../../services/employee.service';

@Component({
  selector: 'app-partial-request',
  templateUrl: './partial-request.component.html',
  styleUrls: ['./partial-request.component.scss']
})
export class PartialRequestComponent implements OnInit, OnDestroy {
  partialRequests: SubventionRequestPartial[] = [];
  partialRequestsClone: SubventionRequestPartial[] = [];
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(true);
  reloadSubscription!: Subscription;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterCriteria: Partial<IPartialRequestCriteria> = {};
  displayedColumns: string[] = ['requestNumber', 'creationDate', 'creationYear', 'organization', 'benCategory',
    'requestType', 'gender', 'estimatedValue', 'totalAidAmount', 'remainingAmount', 'actions'];

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private subventionRequestService: SubventionRequestService,
              private subventionResponseService: SubventionResponseService, // for model/interceptor
              private subventionRequestPartialService: SubventionRequestPartialService,
              private beneficiaryService: BeneficiaryService, // for model/interceptor
              private router: Router,
              public empService: EmployeeService) {
  }

  ngOnInit(): void {
    this.listenToReload();
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
  }

  hasFilterCriteria(): boolean {
    return !isEmptyObject(this.filterCriteria) && objectHasValue(this.filterCriteria);
  }

  private _loadPartialRequests(): Observable<SubventionRequestPartial[]> {
    if (!this.hasFilterCriteria()) {
      return this.subventionRequestPartialService.loadPartialRequests();
    } else {
      return this.subventionRequestPartialService.loadPartialRequestsByCriteria(this.filterCriteria);
    }
  }

  private listenToReload() {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this._loadPartialRequests();
      }),
    ).subscribe((partialRequests: SubventionRequestPartial[]) => {
      this.partialRequests = partialRequests;
      this.partialRequestsClone = partialRequests.slice();
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
            if (result === UserClickOn.CLOSE) {
              return;
            }
            this.filterCriteria = result as Partial<IPartialRequestCriteria>;
            this.reload$.next(true);
            sub.unsubscribe();
          });
        })
    }
  }

  addPartialRequest($event: MouseEvent, request: SubventionRequestPartial): void {
    this.dialogService.confirm(this.langService.map.msg_confirm_create_partial_request)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        this.router.navigate(['/home/main/request/partial', request.requestId],).then();
      }
    })
  }
}
