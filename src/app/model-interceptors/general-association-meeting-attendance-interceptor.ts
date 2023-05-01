import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { GeneralAssociationMeetingAttendance } from '@app/models/general-association-meeting-attendance';
import { DateUtils } from '@helpers/date-utils';
import { FactoryService } from '@services/factory.service';
import { GeneralAssociationMeetingAttendanceService } from '@services/general-association-meeting-attendance.service';
import { GeneralAssociationExternalMember } from '@app/models/general-association-external-member';
import { AdminResult } from '@app/models/admin-result';
import { GeneralAssociationInternalMember } from '@app/models/general-association-internal-member';
import { GeneralAssociationAgenda } from '@app/models/general-association-meeting-agenda';

export class GeneralAssociationMeetingAttendanceInterceptor implements IModelInterceptor<GeneralAssociationMeetingAttendance> {
  caseInterceptor?: IModelInterceptor<GeneralAssociationMeetingAttendance> | undefined;

  send(model: Partial<GeneralAssociationMeetingAttendance>): Partial<GeneralAssociationMeetingAttendance> {
    const service: GeneralAssociationMeetingAttendanceService = FactoryService.getService('GeneralAssociationMeetingAttendanceService');
    delete model.specialistDecisionInfo;
    delete model.meetingTypeInfo;
    delete model.meetingClassificationInfo;
    delete model.managerDecisionInfo;
    delete model.requestTypeInfo;

    if (model.administrativeBoardMembers && model.administrativeBoardMembers.length > 0) {
      model.administrativeBoardMembers = model.administrativeBoardMembers.map(x => service.externalMembersInterceptor.send(x) as GeneralAssociationExternalMember);
    }
    if (model.generalAssociationMembers && model.generalAssociationMembers.length > 0) {
      model.generalAssociationMembers = model.generalAssociationMembers.map(x => service.externalMembersInterceptor.send(x) as GeneralAssociationExternalMember);
    }
    if (model.internalMembersDTO && model.internalMembersDTO.length > 0) {
      model.internalMembersDTO = model.internalMembersDTO.map(x => service.internalMembersInterceptor.send(x) as GeneralAssociationInternalMember);
    }
    model.meetingDate = DateUtils.getDateStringFromDate(model.meetingDate);

    return model;
  }

  receive(model: GeneralAssociationMeetingAttendance): GeneralAssociationMeetingAttendance {
    const service: GeneralAssociationMeetingAttendanceService = FactoryService.getService('GeneralAssociationMeetingAttendanceService');

    model.specialistDecisionInfo == model.specialistDecisionInfo ? AdminResult.createInstance(model.specialistDecisionInfo) : AdminResult.createInstance({});
   model.managerDecisionInfo == model.managerDecisionInfo ? AdminResult.createInstance(model.managerDecisionInfo) : AdminResult.createInstance({});

    if (model.administrativeBoardMembers && model.administrativeBoardMembers.length > 0) {
      model.administrativeBoardMembers = model.administrativeBoardMembers.map(x => new GeneralAssociationExternalMember().clone(service.externalMembersInterceptor.receive(x) as GeneralAssociationExternalMember));
    }
    if (model.generalAssociationMembers && model.generalAssociationMembers.length > 0) {
      model.generalAssociationMembers = model.generalAssociationMembers.map(x => new GeneralAssociationExternalMember().clone(service.externalMembersInterceptor.receive(x) as GeneralAssociationExternalMember));
    }
    if (model.internalMembersDTO && model.internalMembersDTO.length > 0) {
      model.internalMembersDTO = model.internalMembersDTO.map(x => new GeneralAssociationInternalMember().clone(service.internalMembersInterceptor.receive(x) as GeneralAssociationInternalMember));
    }
    model.meetingDate = DateUtils.changeDateToDatepicker(model.meetingDate);
    model.requestTypeInfo = model.requestTypeInfo ? AdminResult.createInstance(model.requestTypeInfo) : AdminResult.createInstance({});
    model.meetingTypeInfo = AdminResult.createInstance(model.meetingTypeInfo || {});
    model.meetingClassificationInfo = AdminResult.createInstance(model.meetingClassificationInfo || {});
    model.meetingDateTimestamp = !model.meetingDate ? null : DateUtils.getTimeStampFromDate(model.meetingDate);

    const agendas= <string[]>JSON.parse(model.agenda);
    model.agendaList = agendas.map(x=>new GeneralAssociationAgenda().clone({description : x}));
    return model;
  }
}
