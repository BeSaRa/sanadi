import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {DateUtils} from '@helpers/date-utils';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {AdminResult} from '@app/models/admin-result';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {GeneralAssociationAgenda} from '@app/models/general-association-meeting-agenda';
import {
  GeneralAssociationExternalMemberInterceptor
} from "@model-interceptors/general-association-external-member-interceptor";
import {
  GeneralAssociationInternalMemberInterceptor
} from "@model-interceptors/general-association-internal-member-interceptor";

const externalMembersInterceptor = new GeneralAssociationExternalMemberInterceptor();
const internalMembersInterceptor = new GeneralAssociationInternalMemberInterceptor();

export class GeneralAssociationMeetingAttendanceInterceptor implements IModelInterceptor<GeneralAssociationMeetingAttendance> {
  caseInterceptor?: IModelInterceptor<GeneralAssociationMeetingAttendance> | undefined;

  send(model: Partial<GeneralAssociationMeetingAttendance>): Partial<GeneralAssociationMeetingAttendance> {
    if (model.administrativeBoardMembers && model.administrativeBoardMembers.length > 0) {
      model.administrativeBoardMembers = model.administrativeBoardMembers.map(x => externalMembersInterceptor.send(x) as GeneralAssociationExternalMember);
    }
    if (model.generalAssociationMembers && model.generalAssociationMembers.length > 0) {
      model.generalAssociationMembers = model.generalAssociationMembers.map(x => externalMembersInterceptor.send(x) as GeneralAssociationExternalMember);
    }
    if (model.internalMembersDTO && model.internalMembersDTO.length > 0) {
      model.internalMembersDTO = model.internalMembersDTO.map(x => internalMembersInterceptor.send(x) as GeneralAssociationInternalMember);
    }
    model.meetingDate = DateUtils.getDateStringFromDate(model.meetingDate);

    GeneralAssociationMeetingAttendanceInterceptor.stringifyAgendaListToAgendas(model);

    GeneralAssociationMeetingAttendanceInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: GeneralAssociationMeetingAttendance): GeneralAssociationMeetingAttendance {
    model.specialistDecisionInfo = model.specialistDecisionInfo ? AdminResult.createInstance(model.specialistDecisionInfo) : AdminResult.createInstance({});
    model.managerDecisionInfo = model.managerDecisionInfo ? AdminResult.createInstance(model.managerDecisionInfo) : AdminResult.createInstance({});

    if (model.administrativeBoardMembers && model.administrativeBoardMembers.length > 0) {
      model.administrativeBoardMembers = model.administrativeBoardMembers.map(x => externalMembersInterceptor.receive(new GeneralAssociationExternalMember().clone(x)));
    }
    if (model.generalAssociationMembers && model.generalAssociationMembers.length > 0) {
      model.generalAssociationMembers = model.generalAssociationMembers.map(x => externalMembersInterceptor.receive(new GeneralAssociationExternalMember().clone(x)));
    }
    if (model.internalMembersDTO && model.internalMembersDTO.length > 0) {
      model.internalMembersDTO = model.internalMembersDTO.map(x => internalMembersInterceptor.receive(new GeneralAssociationInternalMember().clone(x)));
    }
    model.meetingDate = DateUtils.changeDateToDatepicker(model.meetingDate);
    model.requestTypeInfo = model.requestTypeInfo ? AdminResult.createInstance(model.requestTypeInfo) : AdminResult.createInstance({});
    model.meetingTypeInfo = AdminResult.createInstance(model.meetingTypeInfo || {});
    model.meetingClassificationInfo = AdminResult.createInstance(model.meetingClassificationInfo || {});
    model.meetingDateTimestamp = !model.meetingDate ? null : DateUtils.getTimeStampFromDate(model.meetingDate);

    GeneralAssociationMeetingAttendanceInterceptor.parseAgendasToAgendaList(model);

    return model;
  }

  private static stringifyAgendaListToAgendas(model: Partial<GeneralAssociationMeetingAttendance>): void {
    model.agenda = JSON.stringify((model.agendaList ?? []).map(x => x.description));
  }

  private static parseAgendasToAgendaList(model: GeneralAssociationMeetingAttendance): void {
    let agendas: string[] = [];
    try {
      agendas = <string[]>JSON.parse(model.agenda);
    } catch (_) {
      agendas = [];
    }
    model.agendaList = agendas.map(x => new GeneralAssociationAgenda().clone({description: x}));
  }

  private static _deleteBeforeSend(model: Partial<GeneralAssociationMeetingAttendance>): void {
    delete model.specialistDecisionInfo;
    delete model.meetingTypeInfo;
    delete model.meetingClassificationInfo;
    delete model.managerDecisionInfo;
    delete model.requestTypeInfo;
    delete model.agendaList
  }
}
