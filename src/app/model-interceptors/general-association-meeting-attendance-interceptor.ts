import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {DateUtils} from '@helpers/date-utils';
import {FactoryService} from '@services/factory.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {AdminResult} from '@app/models/admin-result';

export class GeneralAssociationMeetingAttendanceInterceptor implements IModelInterceptor<GeneralAssociationMeetingAttendance> {
  caseInterceptor?: IModelInterceptor<GeneralAssociationMeetingAttendance> | undefined;

  send(model: Partial<GeneralAssociationMeetingAttendance>): Partial<GeneralAssociationMeetingAttendance> {
    const service: GeneralAssociationMeetingAttendanceService = FactoryService.getService('GeneralAssociationMeetingAttendanceService');
    delete model.specialistDecisionInfo;
    delete model.meetingTypeInfo;
    delete model.meetingClassificationInfo;
    delete model.managerDecisionInfo;

    if (model.administrativeBoardMembers && model.administrativeBoardMembers.length > 0) {
      model.administrativeBoardMembers = model.administrativeBoardMembers.map(x => service.externalMembersInterceptor.send(x) as GeneralAssociationExternalMember);
    }
    if (model.generalAssociationMembers && model.generalAssociationMembers.length > 0) {
      model.generalAssociationMembers = model.generalAssociationMembers.map(x => service.externalMembersInterceptor.send(x) as GeneralAssociationExternalMember);
    }
    model.meetingDate = DateUtils.getDateStringFromDate(model.meetingDate);

    return model;
  }

  receive(model: GeneralAssociationMeetingAttendance): GeneralAssociationMeetingAttendance {
    const service: GeneralAssociationMeetingAttendanceService = FactoryService.getService('GeneralAssociationMeetingAttendanceService');

    model.specialistDecisionInfo == model.specialistDecisionInfo ? AdminResult.createInstance(model.specialistDecisionInfo) : AdminResult.createInstance({});
    model.meetingTypeInfo == model.meetingTypeInfo ? AdminResult.createInstance(model.meetingTypeInfo) : AdminResult.createInstance({});
    model.meetingClassificationInfo == model.meetingClassificationInfo ? AdminResult.createInstance(model.meetingClassificationInfo) : AdminResult.createInstance({});
    model.managerDecisionInfo == model.managerDecisionInfo ? AdminResult.createInstance(model.managerDecisionInfo) : AdminResult.createInstance({});

    if (model.administrativeBoardMembers && model.administrativeBoardMembers.length > 0) {
      model.administrativeBoardMembers = model.administrativeBoardMembers.map(x => service.externalMembersInterceptor.receive(x) as GeneralAssociationExternalMember);
    }
    if (model.generalAssociationMembers && model.generalAssociationMembers.length > 0) {
      model.generalAssociationMembers = model.generalAssociationMembers.map(x => service.externalMembersInterceptor.receive(x) as GeneralAssociationExternalMember);
    }
    model.meetingDate = DateUtils.changeDateToDatepicker(model.meetingDate);

    return model;
  }
}
