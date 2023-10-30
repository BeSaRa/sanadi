import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CaseTypes } from '@app/enums/case-types.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { FactoryService } from '@app/services/factory.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { EmployeeService } from '@services/employee.service';
import { LicenseApprovalModel } from './license-approval-model';
import { FinancialAnalysisService } from '@app/services/financial-analysis.service';
import { FinancialAnalysisInterceptor } from '@app/model-interceptors/financial-analysis-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';


export class FinancialReport  {
    id!: number;
    reportName!:string;
    reportType!: number;
    reportPeriodicity!: number;
    isCharityOrg!:number;
    isNPO!:number;
    isCharity!:number;

    isCharityReport():boolean{
      return this.isCharity === 1
    }
    isNPOReport():boolean{
      return this.isNPO === 1
    }
    isCharityOrgReport():boolean{
      return this.isCharityOrg === 1
    }

}
