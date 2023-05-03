import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CharityOrganizationUpdateRoutingModule} from './charity-organization-update-routing.module';
import {
  CharityOrganizationUpdateOutputsComponent
} from './pages/charity-organization-update-outputs/charity-organization-update-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  CharityOrganizationUpdateComponent
} from '@modules/services/charity-organization-update/pages/charity-organization-update/charity-organization-update.component';
import {BylawsComponent} from '@modules/services/charity-organization-update/shared/bylaws/bylaws.component';
import {
  CharityBranchComponent
} from '@modules/services/charity-organization-update/shared/charity-branch/charity-branch.component';
import {
  CharityDecisionsComponent
} from '@modules/services/charity-organization-update/shared/charity-decisions/charity-decisions.component';
import {
  ForeignAidClassificationsComponent
} from '@modules/services/charity-organization-update/shared/foreign-aid-classifications/foreign-aid-classifications.component';
import {MembersComponent} from '@modules/services/charity-organization-update/shared/members/members.component';
import {
  CharityReportsComponent
} from '@modules/services/charity-organization-update/shared/charity-reports/charity-reports.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  OrganizationOfficersComponent
} from '@modules/services/charity-organization-update/shared/organization-officers/organization-officers.component';
import {
  FollowupDateApprovePopupComponent
} from '@modules/services/charity-organization-update/popups/follow-up-date-approve-popup/follow-up-date-approve-popup.component';
import { AuditCharityOrganizationUpdateComponent } from './audit/audit-charity-organization-update/audit-charity-organization-update.component';
import { AuditCharityBranchComponent } from './audit/audit-charity-branch/audit-charity-branch.component';
import { AuditForeignAidClassificationsComponent } from './audit/audit-foreign-aid-classifications/audit-foreign-aid-classifications.component';
import { AuditCharityReportsComponent } from './audit/audit-charity-reports/audit-charity-reports.component';
import { AuditCharityDecisionsComponent } from './audit/audit-charity-decisions/audit-charity-decisions.component';
import { AuditBylawsComponent } from './audit/audit-bylaws/audit-bylaws.component';
import { AuditOrgMemberComponent } from './audit/audit-org-member/audit-org-member.component';


@NgModule({
  declarations: [
    CharityOrganizationUpdateComponent,
    CharityOrganizationUpdateOutputsComponent,
    BylawsComponent,
    CharityBranchComponent,
    CharityDecisionsComponent,
    ForeignAidClassificationsComponent,
    MembersComponent,
    CharityReportsComponent,
    OrganizationOfficersComponent,
    FollowupDateApprovePopupComponent,
    AuditCharityOrganizationUpdateComponent,
    AuditCharityBranchComponent,
    AuditForeignAidClassificationsComponent,
    AuditCharityReportsComponent,
    AuditCharityDecisionsComponent,
    AuditBylawsComponent,
    AuditOrgMemberComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    CharityOrganizationUpdateRoutingModule
  ]
})
export class CharityOrganizationUpdateModule {
}
