import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { BannedPerson } from "@app/models/banned-person";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';

export class BannedPersonInterceptor implements IModelInterceptor<BannedPerson> {
    send(model: Partial<BannedPerson>): Partial<BannedPerson> {
        model.dateOfBirth && (model.dateOfBirth = DateUtils.changeDateFromDatepicker(model.dateOfBirth as unknown as IMyDateModel)?.toISOString());
        model.otherDateOfBirth && (model.otherDateOfBirth = DateUtils.changeDateFromDatepicker(model.otherDateOfBirth as unknown as IMyDateModel)?.toISOString());
        model.documentIssuanceDate && (model.documentIssuanceDate = DateUtils.changeDateFromDatepicker(model.documentIssuanceDate as unknown as IMyDateModel)?.toISOString());
        model.dateOfAdding && (model.dateOfAdding = DateUtils.changeDateFromDatepicker(model.dateOfAdding as unknown as IMyDateModel)?.toISOString());
        BannedPersonInterceptor._deleteBeforeSend(model);
        return model;
    }
    receive(model: BannedPerson): BannedPerson {
        model.dateOfBirth = DateUtils.changeDateToDatepicker(model.dateOfBirth);
        model.otherDateOfBirth = DateUtils.changeDateToDatepicker(model.otherDateOfBirth);
        model.documentIssuanceDate = DateUtils.changeDateToDatepicker(model.documentIssuanceDate);
        model.dateOfAdding = DateUtils.changeDateToDatepicker(model.dateOfAdding);

        model.countryInfo = AdminResult.createInstance(model.countryInfo);
        model.internalUserInfo = AdminResult.createInstance(model.internalUserInfo);
        model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo);
        model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
        model.documentTypeInfo = AdminResult.createInstance(model.documentTypeInfo);
        model.legalNatureInfo = AdminResult.createInstance(model.legalNatureInfo);
        model.sourceTypeInfo = AdminResult.createInstance(model.sourceTypeInfo);
        model.departmentInfo = AdminResult.createInstance(model.departmentInfo);
        model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);
        model.sourceClassificationInfo = AdminResult.createInstance(model.sourceClassificationInfo);
        return model
    }

    private static _deleteBeforeSend(model: Partial<BannedPerson> | any): void {
        delete model.service;
        delete model.countryInfo;
        delete model.internalUserInfo;
        delete model.requestStatusInfo;
        delete model.requestTypeInfo;
        delete model.documentTypeInfo;
        delete model.legalNatureInfo;
        delete model.sourceTypeInfo;
        delete model.departmentInfo;
        delete model.nationalityInfo;
        delete model.langService;
        delete model.sourceClassificationInfo;

    }
}