import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { SubventionRequestService } from '@app/services/subvention-request.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { SubventionRequest } from '@app/models/subvention-request';
import { ToastService } from '@app/services/toast.service';
import { EmployeeService } from '@app/services/employee.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';
import { UntypedFormControl } from '@angular/forms';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { ECookieService } from '@services/e-cookie.service';
import { BeneficiaryService } from '@services/beneficiary.service';
import { SubventionResponseService } from '@app/services/subvention-response.service';
import { DialogService } from '@app/services/dialog.service';

@Component({
  selector: 'app-requests-under-process',
  templateUrl: './requests-under-process.component.html',
  styleUrls: ['./requests-under-process.component.scss']
})
export class RequestsUnderProcessComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();

  constructor(private subventionRequestService: SubventionRequestService,
    private router: Router,
    private toastService: ToastService,
    public langService: LangService,
    private eCookieService: ECookieService,
    private beneficiaryService: BeneficiaryService,
    private subventionResponseService: SubventionResponseService,
    private dialogService: DialogService,
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
  filterControl: UntypedFormControl = new UntypedFormControl('');
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
      show: (_item) => this.empService.checkPermissions('EDIT_SUBVENTION_REQUEST')
    },
    // cancel request
    {
      type: 'action',
      icon: ActionIconsEnum.CANCEL_BOOK,
      label: 'btn_cancel',
      onClick: (item: SubventionRequest) => this.cancelRequest(item),
      show: (_item) => this.empService.checkPermissions('EDIT_SUBVENTION_REQUEST')
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE_TRASH,
      label: 'btn_delete',
      onClick: (item: SubventionRequest) => this.deleteRequest(item),
      show: (item) => item.isUnderProcessing()
    },
    // inquire beneficiary
    {
      type: 'action',
      icon: ActionIconsEnum.SEARCH_USER,
      label: 'inquire_beneficiary',
      onClick: (item: SubventionRequest) => this.inquireBeneficiary(item),
      show: (_item: SubventionRequest) => this.empService.checkPermissions('SUBVENTION_AID_SEARCH')
    }
  ];

  sortingCallbacks = {
    requestDate: (a: SubventionRequest, b: SubventionRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.creationDateString.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.creationDateString.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organization: (a: SubventionRequest, b: SubventionRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
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
  };

  inquireBeneficiary(request: SubventionRequest) {
    this.beneficiaryService.getById(request.benId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe((beneficiary) => {
        if (!beneficiary) {
          return;
        }
        this.eCookieService.putEObject('b_i_d', {
          idType: beneficiary.benPrimaryIdType,
          idNumber: beneficiary.benPrimaryIdNumber,
          nationality: beneficiary.benPrimaryIdNationality
        });
        this.router.navigate(['/home/sanady/inquiry']).then();
      });
  }

  printRequest(request: SubventionRequest, $event?: MouseEvent): void {
    $event?.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequest): any {
    return this.router.navigate(['/home/sanady/request', request.id]);
  }

  cancelRequest(request: SubventionRequest) {
    this.subventionResponseService.loadById(request.id)
      .pipe(
        take(1),
        filter(response => {
          if (response.aidList.length > 0) {
            this.dialogService.error(this.langService.map.remove_provided_aid_first_to_change_request_status);
            return false;
          }
          return true;
        }),
        switchMap(_ => request.cancel()),
        catchError(() => of(null))
      ).subscribe((status) => {
        status ? this.toastService.success(this.langService.map.request_cancelled_successfully) : null;
        this.reload$.next(null);
      });
    
  }

  deleteRequest(request: SubventionRequest) {
    this.subventionResponseService.loadById(request.id)
      .pipe(
        take(1),
        filter(response => {
          if (response.aidList.length > 0) {
            this.dialogService.error(this.langService.map.remove_provided_aid_first_to_change_request_status);
            return false;
          }
          return true;
        }),
        switchMap(_ => request.deleteRequest()),
        catchError(() => of(null))
      ).subscribe((status) => {
        status ? this.toastService.success(this.langService.map.msg_delete_success) : null;
        this.reload$.next(null);
      });
    // request.deleteRequest()
    //   .pipe(take(1))
    //   .subscribe((status) => {
    //     status ? this.toastService.success(this.langService.map.msg_delete_success) : null;
    //     this.reload$.next(null);
    //   });
  }

  private listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.subventionRequestService.loadUnderProcess()
          .pipe(
            catchError(() => of([]))
          );
      })
    ).subscribe((requests) => {
      this.requests = requests;
    });
  }
}
