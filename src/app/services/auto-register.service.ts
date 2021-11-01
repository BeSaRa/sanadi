import {Injectable} from '@angular/core';
import {DynamicComponentService} from './dynamic-component.service';
import {InquiryComponent} from '../e-services/pages/inquiry-container/inquiry/inquiry.component';
import {ConsultationComponent} from '../e-services/pages/consultation-container/consultation/consultation.component';
import {InternationalCooperationComponent} from '../e-services/pages/international-cooperation-container/international-cooperation/international-cooperation.component';
import {TeamService} from './team.service';
import {InitialExternalOfficeApprovalComponent} from "@app/e-services/pages/initial-external-office-approval/initial-external-office-approval.component";
import {PartnerApprovalComponent} from "@app/e-services/pages/partner-approval/partner-approval.component";
import {FinalExternalOfficeApprovalComponent} from "@app/e-services/pages/final-external-office-approval/final-external-office-approval.component";
import {InternalProjectLicenseComponent} from '@app/projects/pages/internal-project-license/internal-project-license.component';

@Injectable({
  providedIn: 'root'
})
export class AutoRegisterService {

  constructor(private teamService: TeamService) { // teamService is injected because it is used in info request
    this.ngOnInit();
  }

  private ngOnInit(): void {
    new DynamicComponentService(() => {
      // any Dynamic Components will be register here.
      DynamicComponentService.registerComponent('InquiryComponent', InquiryComponent);
      DynamicComponentService.registerComponent('ConsultationComponent', ConsultationComponent);
      DynamicComponentService.registerComponent('InternationalCooperationComponent', InternationalCooperationComponent);
      DynamicComponentService.registerComponent('InitialExternalOfficeApprovalComponent', InitialExternalOfficeApprovalComponent);
      DynamicComponentService.registerComponent('FinalExternalOfficeApprovalComponent', FinalExternalOfficeApprovalComponent);
      DynamicComponentService.registerComponent('PartnerApprovalComponent', PartnerApprovalComponent);
      DynamicComponentService.registerComponent('InternalProjectLicenseComponent', InternalProjectLicenseComponent);

    });// just to make sure that service constructed and register all dynamic components
  }

  ping(): void {
    console.log('auto register service started');
  }
}
