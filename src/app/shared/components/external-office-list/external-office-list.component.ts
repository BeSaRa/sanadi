import {Component, Input, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {Observable} from 'rxjs';
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {CharityOrganizationUpdateService} from '@services/charity-organization-update.service';

@Component({
  selector: 'external-office-list',
  templateUrl: './external-office-list.component.html',
  styleUrls: ['./external-office-list.component.scss']
})
export class ExternalOfficeListComponent implements OnInit {
  @Input() externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  @Input() externalOfficesColumns = [
    'externalOfficeName',
    'country',
    'region',
    'establishmentDate',
    'actions',
  ];
  constructor(public lang: LangService,
              private service: CharityOrganizationUpdateService) { }

  ngOnInit(): void {
  }

  selectExternalOffice(event: any, row: FinalExternalOfficeApprovalResult) {
    this.service.openExternalOfficePopup(row);
  }
}
