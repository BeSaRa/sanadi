import {Injectable} from '@angular/core';
import {DynamicComponentService} from './dynamic-component.service';
import {TeamService} from './team.service';
import {CustomEmployeePermission} from "@app/helpers/custom-employee-permission";
import {InquiryComponent} from '@app/e-services/pages/inquiry/inquiry.component';
import {ConsultationComponent} from '@app/e-services/pages/consultation/consultation.component';
import {
  InternationalCooperationComponent
} from "@app/e-services/pages/international-cooperation/international-cooperation.component";
import {
  InitialExternalOfficeApprovalComponent
} from "@app/e-services/pages/initial-external-office-approval/initial-external-office-approval.component";
import {
  FinalExternalOfficeApprovalComponent
} from "@app/e-services/pages/final-external-office-approval/final-external-office-approval.component";
import {PartnerApprovalComponent} from "@app/e-services/pages/partner-approval/partner-approval.component";
import {
  InternalProjectLicenseComponent
} from "@app/projects/pages/internal-project-license/internal-project-license.component";
import {ProjectModelComponent} from "@app/projects/pages/project-model/project-model.component";
import {
  CollectionApprovalComponent
} from "@app/modules/collection/pages/collection-services-approval/collection-approval.component";
import {MapService} from "@app/services/map.service";
import {CollectorApprovalComponent} from '@app/modules/collection/pages/collector-approval/collector-approval.component';
import {
  UrgentInterventionLicenseComponent
} from '@app/projects/pages/urgent-intervention-license/urgent-intervention-license.component';

@Injectable({
  providedIn: 'root'
})
export class AutoRegisterService {

  constructor(private teamService: TeamService, private mapService: MapService) { // teamService is injected because it is used in info request
    this.ngOnInit();
    this.mapService.ping();
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
      DynamicComponentService.registerComponent('ProjectModelComponent', ProjectModelComponent);
      DynamicComponentService.registerComponent('CollectionApprovalComponent', CollectionApprovalComponent);
      DynamicComponentService.registerComponent('CollectorApprovalComponent', CollectorApprovalComponent);
      DynamicComponentService.registerComponent('UrgentInterventionLicenseComponent', UrgentInterventionLicenseComponent);

    });// just to make sure that service constructed and register all dynamic components


    // for making custom permissions form the menu based on the current employee
    CustomEmployeePermission
      .registerCustomPermission('menu_available_programs', (employee, _item) => {
        return employee.isExternalUser();
      })
  }

  ping(): void {
    console.log('auto register service started');
  }
}
