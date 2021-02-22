import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubventionRequestAidService} from '../../../services/subvention-request-aid.service';
import {LangService} from '../../../services/lang.service';
import {SubventionRequestAid} from '../../../models/subvention-request-aid';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {searchInObject} from '../../../helpers/utils';

@Component({
  selector: 'app-requests-under-process',
  templateUrl: './requests-under-process.component.html',
  styleUrls: ['./requests-under-process.component.scss']
})
export class RequestsUnderProcessComponent implements OnInit, OnDestroy {
  requests: SubventionRequestAid[] = [];
  requestsClone: SubventionRequestAid[] = [];
  searchSubscription!: Subscription;
  search$: Subject<string> = new Subject<string>();

  constructor(private subventionRequestService: SubventionRequestService,
              private router: Router,
              private subventionRequestAidService: SubventionRequestAidService,
              public langService: LangService) {
  }

  ngOnInit(): void {
    this.subventionRequestAidService
      .loadUnderProcess()
      .subscribe((result) => {
        this.requests = result;
        this.requestsClone = result;
      });
    this.listenToSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  printRequest($event: MouseEvent, request: SubventionRequestAid): void {
    $event.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequestAid): any {
    return this.router.navigate(['/home/user/request', {id: request.requestId}]);
  }

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.requests = this.requestsClone.slice().filter((item) => {
        return searchInObject(item, searchText, 'underProcessingSearchFields');
      });
    });
  }
}
