import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {SubventionRequest} from '../../../models/subvention-request';

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
    return this.router.navigate(['/home/user/request', {id: request.id}]);
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
    this.subventionRequestService.loadUnderProcess().subscribe((requests) => {
      this.requests = requests;
      this.requestsClone = requests.slice();
    });
  }
}
