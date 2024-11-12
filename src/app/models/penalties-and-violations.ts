import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CaseTypes } from "@app/enums/case-types.enum";
import { CommonUtils } from "@app/helpers/common-utils";
import { ObjectUtils } from "@app/helpers/object-utils";
import { IAuditModelProperties } from "@app/interfaces/i-audit-model-properties";
import { PenaltiesAndViolationsInterceptor } from "@app/model-interceptors/penalties-and-violations-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { PenaltiesAndViolationsService } from "@app/services/penalties-and-violations.service";
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { AdminResult } from "./admin-result";
import { LicenseApprovalModel } from "./license-approval-model";
import { ExternalEntity } from "./external-entity";
import { Incident } from "./inceident";
import { ProposedSanction } from "./proposed-sanction";
import { CustomValidators } from "@app/validators/custom-validators";
import { LangService } from "@app/services/lang.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { of } from "rxjs";
import { DialogService } from "@app/services/dialog.service";

const { send, receive } = new PenaltiesAndViolationsInterceptor();

@InterceptModel({ send, receive })
export class PenaltiesAndViolations extends LicenseApprovalModel<PenaltiesAndViolationsService, PenaltiesAndViolations> implements IAuditModelProperties<PenaltiesAndViolations> {
  caseType: number = CaseTypes.PENALTIES_AND_VIOLATIONS;
  organizationId!: number;
  competentTeamID!: number;
  entityType!: number;
  legalAction!: number;
  legalBasis: number[] = [];
  externalEntityDTO: ExternalEntity[] = [];
  incidents: Incident[] = [];
  proposedSanction: ProposedSanction[] = []
  incidentReport!: string[];
  description: string = '';
  service!: PenaltiesAndViolationsService;
  lang!:LangService; 
  dialog!:DialogService


  searchFields: ISearchFieldsMap<PenaltiesAndViolations> = {
    // ...dateSearchFields(['createdOn']),
    // ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo', 'projectTypeInfo', 'requestTypeInfo']),
    // ...normalSearchFields(['projectName', 'fullSerial'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('PenaltiesAndViolationsService');
    this.lang = FactoryService.getService('LangService');
    this.dialog = FactoryService.getService('DialogService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getAdminResultByProperty(property: keyof PenaltiesAndViolations): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {


      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      entityType: { langKey: 'lbl_incident_relation', value: this.entityType },
      competentTeamID: { langKey: 'lbl_team', value: this.competentTeamID },
      organizationId: { langKey: 'lbl_organization_slash_association', value: this.organizationId },
      externalEntityDTO: { langKey: 'lbl_individuals_and_entities', value: this.externalEntityDTO },
      legalAction: { langKey: 'menu_legal_action', value: this.legalAction },
      legalBasis: { langKey: 'menu_legal_basis', value: this.legalBasis },
      incidents: { langKey: 'lbl_incidence_elements', value: this.incidents },
      proposedSanction: { langKey: 'menu_penalties', value: this.proposedSanction },
      incidentReport: { langKey: 'lbl_incident_reports', value: this.incidentReport },
      description: { langKey: 'special_explanations', value: this.description }
    };
  }

  buildForm(controls = false): any {
    const values = ObjectUtils.getControlValues<PenaltiesAndViolations>(this.getValuesWithLabels());
    return {
      organizationId: controls ? [values.organizationId, []] : values.organizationId,
      entityType: controls ? [values.entityType, [CustomValidators.required]] : values.entityType,
      competentTeamID: controls ? [values.competentTeamID, [CustomValidators.required]] : values.competentTeamID,
      legalAction: controls ? [values.legalAction, [CustomValidators.required]] : values.legalAction,
      legalBasis: controls ? [values.legalBasis, [CustomValidators.requiredArrayAfterSave(this)]] : values.legalBasis,
      externalEntityDTO: controls ? [values.externalEntityDTO, []] : values.externalEntityDTO,
      incidents: controls ? [values.incidents, []] : values.incidents,
      proposedSanction: controls ? [values.proposedSanction, [CustomValidators.requiredArrayAfterSave(this)]] : values.proposedSanction,
      incidentReport: controls ? [values.incidentReport, [CustomValidators.requiredArray]] : values.incidentReport,
      description: controls ? [values.description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
    }
  }
  canLaunch() {
    return this.legalBasis.length > 0 && this.proposedSanction.length > 0
  }
   invalidLaunchMessage(){
    if(this.legalBasis.length<1){
      return this.lang.map.msg_please_add_legal_basis;

    }
    if(this.proposedSanction.length<1){
      return this.lang.map.msg_please_add_penalties;
    }
    return '';
  }
  
  finalApprove(): DialogRef {
    if (!this.canLaunch()) {
      return this.dialog.error(this.invalidLaunchMessage());
    }
    return super.finalApprove();
  }
}