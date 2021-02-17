import {Component, OnInit} from '@angular/core';
import {SubventionRequestAidService} from '../../../services/subvention-request-aid.service';
import {LangService} from '../../../services/lang.service';
import {SubventionRequestAid} from '../../../models/subvention-request-aid';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-requests-under-process',
  templateUrl: './requests-under-process.component.html',
  styleUrls: ['./requests-under-process.component.scss']
})
export class RequestsUnderProcessComponent implements OnInit {
  requests: SubventionRequestAid[] = [];

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
      });
  }

  printRequest($event: MouseEvent, request: SubventionRequestAid): void {
    $event.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequestAid): any {
    return this.router.navigate(['/home/user/request', {id: request.requestId}]);
  }
}
