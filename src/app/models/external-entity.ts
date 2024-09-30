import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "./searchable-cloneable";

export class ExternalEntity extends SearchableCloneable<ExternalEntity> {
    arabicName!: string;
    englishName!: string;
    identificationNumber!: string;
    nationality!: number;
    residencyClassification!: string;
    details!: string;

    buildForm(controls?: boolean): any {
        const {
            arabicName,
            englishName,
            identificationNumber,
            nationality,
            residencyClassification,
            details,
        } = this;
        return {

            arabicName: controls ? [arabicName, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('AR_NUM_ONE_AR')
            ]] : arabicName,
            englishName: controls ? [englishName, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('ENG_NUM_ONE_ENG')
            ]] : englishName,
            identificationNumber: controls ? [identificationNumber, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]]: identificationNumber,
            nationality: controls ? [nationality, []] : nationality,
            residencyClassification: controls ? [residencyClassification, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : residencyClassification,
            details: controls ? [details, [ CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),]] : details,
        }
    }
}