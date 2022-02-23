import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {Router} from '@angular/router';
import {BehaviorSubject, Subscription} from 'rxjs';
import {debounceTime, switchMap, take} from 'rxjs/operators';
import {SubventionRequest} from '@app/models/subvention-request';
import {ToastService} from '@app/services/toast.service';
import {EmployeeService} from '@app/services/employee.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-requests-under-process',
  templateUrl: './requests-under-process.component.html',
  styleUrls: ['./requests-under-process.component.scss']
})
export class RequestsUnderProcessComponent implements OnInit, OnDestroy {
  requests: SubventionRequest[] = [];
  requestsClone: SubventionRequest[] = [];
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  internalSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(true);
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  displayedColumns: string[] = ['requestFullSerial', 'requestDate', 'organization', 'requestStatus', 'requestedAidAmount', 'actions'];
  fileIconsEnum = FileIconsEnum;
  filterControl: FormControl = new FormControl('');

  constructor(private subventionRequestService: SubventionRequestService,
              private router: Router,
              private toastService: ToastService,
              public langService: LangService,
              public empService: EmployeeService) {
  }

  ngOnInit(): void {
    this.listenToSearch();
    this.listenToInternalSearch();
    this.listenToReload();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

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

  printRequest($event: MouseEvent, request: SubventionRequest): void {
    $event.preventDefault();
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

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.requests = this.requestsClone.slice().filter((item) => {
        return item.search(searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.requests = this.requestsClone.slice().filter((item) => {
        return item.search(searchText);
      });
    });
  }

  private listenToReload() {
    this.reload$.pipe(
      switchMap(() => {
        return this.subventionRequestService
          .loadUnderProcess();
      }),
    ).subscribe((requests) => {
      this.requests = requests;
      this.requestsClone = requests.slice();
      this.internalSearch$.next(this.search$.value);
    });
  }
}
