import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { BannedPersonSearchInterceptor } from "@app/model-interceptors/banned-person-search-interceptor";
import { CustomValidators } from "@app/validators/custom-validators";

const { send, receive } = new BannedPersonSearchInterceptor();
@InterceptModel({send,receive})
export class BannedPersonSearch {
    registrationNo!: string;
    dateFrom!: string;
    dateTo!: string;
    requestStatus!: number;
    nationality!: number;
    arName!: string;
    enName!: string;
    name!:string;


    buildForm() {
        const { registrationNo, dateFrom, dateTo, requestStatus, nationality, arName, enName } = this;

        return {
            registrationNo: [registrationNo, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
            arName: [arName,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.pattern('AR_ONLY')]],

            enName: [enName,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.pattern('ENG_ONLY')]],
            dateFrom: [dateFrom, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
            dateTo: [dateTo, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
            requestStatus: [requestStatus],
            nationality: [nationality],
        };
    }
}
