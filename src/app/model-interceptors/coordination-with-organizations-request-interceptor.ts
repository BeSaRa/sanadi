import { CoordinationWithOrganizationTemplate } from './../models/corrdination-with-organization-template';
import { CoordinationWithOrganizationTemplateInterceptor } from './coordination-with-organization-template-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { isValidAdminResult } from '@app/helpers/utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CoordinationWithOrganizationsRequest } from '@app/models/coordination-with-organizations-request';
import { EffectiveCoordinationCapabilities } from '@app/models/effective-coordination-capabilities';
import { ParticipantOrg } from '@app/models/participant-org';
import { ResearchAndStudies } from '@app/models/research-and-studies';
import { TaskDetails } from '@app/models/task-details';
import { IMyDateModel } from 'angular-mydatepicker';
import { BuildingAbility } from './../models/building-ability';
import { BuildingAbilityInterceptor } from './building-ability-interceptor';
import { EffectiveCoordinationInterceptor } from './effective-coordination-interceptor';
import { ParticipatingOrgInterceptor } from './participating-org-interceptor';
import { ResearchAndStudiesInterceptor } from './research-and-studies-interceptor';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';

const participatingOrgInterceptor = new ParticipatingOrgInterceptor();
const buildinAbilityInterceptor = new BuildingAbilityInterceptor();
const effectiveCoordinationInterceptor = new EffectiveCoordinationInterceptor();
const researchAndStudiesInterceptor = new ResearchAndStudiesInterceptor();
const coordinationWithOrganizationTemplateInterceptor = new CoordinationWithOrganizationTemplateInterceptor();
const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
export class CoordinationWithOrganizationsRequestInterceptor
  implements IModelInterceptor<CoordinationWithOrganizationsRequest>
{
  send(
    model: Partial<CoordinationWithOrganizationsRequest>
  ): Partial<CoordinationWithOrganizationsRequest> {
    model.licenseStartDate &&
      (model.licenseStartDate = DateUtils.changeDateFromDatepicker(
        model.licenseStartDate as unknown as IMyDateModel
      )?.toISOString());

    model.licenseEndDate &&
      (model.licenseEndDate = DateUtils.changeDateFromDatepicker(
        model.licenseEndDate as unknown as IMyDateModel
      )?.toISOString());

    model.participatingOrganizaionList &&
      (model.participatingOrganizaionList =
        model.participatingOrganizaionList.map((item) => {
          return participatingOrgInterceptor.send(
            item
          ) as unknown as ParticipantOrg;
        }));
    model.temporaryOrganizaionOfficerList?.forEach((x) => {
      delete x.langService;
      delete (x as any).searchFields;
      delete (x as any).organizationInfo;
      delete (x as any).branchInfo;
      delete (x as any).ouInfo;
    });

    model.temporaryBuildingAbilitiesList &&
      (model.temporaryBuildingAbilitiesList = model.temporaryBuildingAbilitiesList.map((item) => {
        return buildinAbilityInterceptor.send(
          item
        ) as unknown as BuildingAbility;
      }));

    model.temporaryEffectiveCoordinationCapabilities &&
      (model.temporaryEffectiveCoordinationCapabilities =
        model.temporaryEffectiveCoordinationCapabilities.map((item) => {
          return effectiveCoordinationInterceptor.send(
            item
          ) as unknown as EffectiveCoordinationCapabilities;
        }));

    model.temporaryResearchAndStudies &&
      (model.temporaryResearchAndStudies = model.temporaryResearchAndStudies.map((item) => {
        return researchAndStudiesInterceptor.send(
          item
        ) as unknown as ResearchAndStudies;
      }));
    model.temporaryTemplateList &&
      (model.temporaryTemplateList = model.temporaryTemplateList.map((item) => {
        return coordinationWithOrganizationTemplateInterceptor.send(
          item
        ) as unknown as CoordinationWithOrganizationTemplate;
      }));


    delete model.service;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    delete model.ouInfo;
    delete model.employeeService;
    delete model.domainInfo;
    delete model.approved;
    delete model.organizaionOfficerList;
    delete model.buildingAbilitiesList;
    delete model.effectiveCoordinationCapabilities;
    delete model.researchAndStudies;
    delete model.templateList;
    delete model.locations;
    return model;
  }
  receive(
    model: CoordinationWithOrganizationsRequest
  ): CoordinationWithOrganizationsRequest {
    model.licenseStartDate = DateUtils.changeDateToDatepicker(
      model.licenseStartDate
    );
    model.licenseEndDate = DateUtils.changeDateToDatepicker(
      model.licenseEndDate
    );
    model.taskDetails = new TaskDetails().clone(model.taskDetails);

    model.requestTypeInfo &&
      (model.requestTypeInfo = AdminResult.createInstance(
        model.requestTypeInfo
      ));
    model.domainInfo = AdminResult.createInstance(
      isValidAdminResult(model.domainInfo) ? model.domainInfo : {}
    );

    model.participatingOrganizaionList = model.participatingOrganizaionList?.map(
      (item) => {
        return participatingOrgInterceptor.receive(
          new ParticipantOrg().clone(item)
        );
      }
    ) ?? [];
    model.organizaionOfficerList = model.organizaionOfficerList?.map((item) => {
      return organizationOfficerInterceptor.receive(
        new OrganizationOfficer().clone(item)
      );
    }) ?? [];
    model.buildingAbilitiesList = model.buildingAbilitiesList?.map((item) => {
      return buildinAbilityInterceptor.receive(
        new BuildingAbility().clone(item)
      );
    }) ?? [];
    model.effectiveCoordinationCapabilities =
      model.effectiveCoordinationCapabilities?.map((item) => {
        return effectiveCoordinationInterceptor.receive(
          new EffectiveCoordinationCapabilities().clone(item)
        );
      }) ?? [];
    model.researchAndStudies =
      model.researchAndStudies?.map((item) => {
        return researchAndStudiesInterceptor.receive(
          new ResearchAndStudies().clone(item)
        );
      }) ?? [];
    model.templateList =
      model.templateList?.map((item) => {
        return coordinationWithOrganizationTemplateInterceptor.receive(
          new CoordinationWithOrganizationTemplate().clone(item)
        );
      }) ?? [];
    model.temporaryOrganizaionOfficerList = model.temporaryOrganizaionOfficerList?.map((item) => {
      return organizationOfficerInterceptor.receive(
        new OrganizationOfficer().clone(item)
      );
    }) ?? [];
    model.temporaryBuildingAbilitiesList = model.temporaryBuildingAbilitiesList?.map((item) => {
      return buildinAbilityInterceptor.receive(
        new BuildingAbility().clone(item)
      );
    }) ?? [];
    model.temporaryEffectiveCoordinationCapabilities =
      model.temporaryEffectiveCoordinationCapabilities?.map((item) => {
        return effectiveCoordinationInterceptor.receive(
          new EffectiveCoordinationCapabilities().clone(item)
        );
      }) ?? [];
    model.temporaryResearchAndStudies =
      model.temporaryResearchAndStudies?.map((item) => {
        return researchAndStudiesInterceptor.receive(
          new ResearchAndStudies().clone(item)
        );
      }) ?? [];
    model.temporaryTemplateList = model.temporaryTemplateList?.map((item) => {
      return coordinationWithOrganizationTemplateInterceptor.receive(
        new CoordinationWithOrganizationTemplate().clone(item)
      );
    }) ?? [];
    model.licenseStartDateStamp = !model.licenseStartDate ? null: DateUtils.getTimeStampFromDate(model.licenseStartDate);
    model.licenseEndDateStamp = !model.licenseEndDate ? null: DateUtils.getTimeStampFromDate(model.licenseEndDate);
    return model;
  }

}
