import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {debounceTime, switchMap, take} from 'rxjs/operators';
import {SubventionRequest} from '../../../models/subvention-request';
import {ToastService} from '../../../services/toast.service';

@Component({
  selector: 'app-requests-under-process',
  templateUrl: './requests-under-process.component.html',
  styleUrls: ['./requests-under-process.component.scss']
})
export class RequestsUnderProcessComponent implements OnInit, OnDestroy {
  requests: SubventionRequest[] = [];
  requestsClone: SubventionRequest[] = [];
  searchSubscription!: Subscription;
  search$: Subject<string> = new Subject<string>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(true);

  constructor(private subventionRequestService: SubventionRequestService,
              private router: Router,
              private toastService: ToastService,
              public langService: LangService) {
  }

  ngOnInit(): void {
    this.listenToSearch();
    this.listenToReload();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  printRequest($event: MouseEvent, request: SubventionRequest): void {
    $event.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequest): any {
    return this.router.navigate(['/home/user/request', request.id]);
  }

  cancelRequest(request: SubventionRequest) {
    request.cancel()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.request_cancelled_successfully) : null;
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

  private listenToReload() {
    this.reload$.pipe(
      switchMap(() => {
        return this.subventionRequestService
          .loadUnderProcess();
      }),
    ).subscribe((requests) => {
      this.requests = requests;
      this.requestsClone = requests.slice();
    });
  }
}
