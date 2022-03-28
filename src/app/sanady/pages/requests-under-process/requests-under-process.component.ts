import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {SubventionRequest} from '@app/models/subvention-request';
import {ToastService} from '@app/services/toast.service';
import {EmployeeService} from '@app/services/employee.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {FormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'app-requests-under-process',
  templateUrl: './requests-under-process.component.html',
  styleUrls: ['./requests-under-process.component.scss']
})
export class RequestsUnderProcessComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();

  constructor(private subventionRequestService: SubventionRequestService,
              private router: Router,
              private toastService: ToastService,
              public langService: LangService,
              public empService: EmployeeService) {
  }

  ngOnInit(): void {
    this.listenToReload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  requests: SubventionRequest[] = [];
  headerColumn: string[] = ['extra-header'];
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(true);
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  displayedColumns: string[] = ['requestFullSerial', 'requestDate', 'organization', 'requestStatus', 'requestedAidAmount', 'actions'];
  fileIconsEnum = FileIconsEnum;
  filterControl: FormControl = new FormControl('');
  actions: IMenuItem<SubventionRequest>[] = [
    // print request
    {
      type: 'action',
      icon: ActionIconsEnum.PRINT,
      label: 'print_request_form',
      onClick: (item: SubventionRequest) => this.printRequest(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.LOGS,
      label: 'logs',
      onClick: (item: SubventionRequest) => item.showLogs()
    },
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT_BOOK,
      label: 'btn_edit',
      onClick: (item: SubventionRequest) => this.editRequest(item),
      show: (item) => this.empService.checkPermissions('EDIT_SUBVENTION_REQUEST')
    },
    // cancel request
    {
      type: 'action',
      icon: ActionIconsEnum.CANCEL_BOOK,
      label: 'btn_cancel',
      onClick: (item: SubventionRequest) => this.cancelRequest(item),
      show: (item) => this.empService.checkPermissions('EDIT_SUBVENTION_REQUEST')
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE_TRASH,
      label: 'btn_delete',
      onClick: (item: SubventionRequest) => this.deleteRequest(item),
      show: (item) => item.isUnderProcessing()
    }
  ];

  sortingCallbacks = {
    requestDate: (a: SubventionRequest, b: SubventionRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.creationDateString.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.creationDateString.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organizationAndBranch: (a: SubventionRequest, b: SubventionRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgAndBranchInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgAndBranchInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestStatus: (a: SubventionRequest, b: SubventionRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestStatusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.requestStatusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidAmount: (a: SubventionRequest, b: SubventionRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestedAidAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.requestedAidAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  printRequest(request: SubventionRequest, $event?: MouseEvent): void {
    $event?.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequest): any {
    return this.router.navigate(['/home/sanady/request', request.id]);
  }

  cancelRequest(request: SubventionRequest) {
    request.cancel()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.request_cancelled_successfully) : null;
        this.reload$.next(null);
      });
  }

  deleteRequest(request: SubventionRequest) {
    request.deleteRequest()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.msg_delete_success) : null;
        this.reload$.next(null);
      });
  }

  private listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.subventionRequestService.loadUnderProcess()),
    ).subscribe((requests) => {
      this.requests = requests;
    });
  }
}
