import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "./searchable-cloneable";

export class ExternalCharityFounder extends SearchableCloneable<ExternalCharityFounder> {
    updatedBy!: number;
    clientData!: string;
    founderName!: string;
    founderIdentifierId!: string;
    founderPosition!: string;
    founderJob!: string;
    founderNationality!: number;
    id!: number;

    buildForm(controls?: boolean): any {
        const {
            founderName,
            founderIdentifierId,
            founderPosition,
            founderJob,
            founderNationality
        } = this;
        return {

            founderName: controls ? [founderName, [CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)
            ]] : founderName,
            founderIdentifierId: controls ? [founderIdentifierId, [CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.QID_MAX)
            ]] : founderIdentifierId,
            founderPosition: controls ? [founderPosition, [CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)
            ]] : founderPosition,
            founderJob: controls ? [founderJob, [CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)
            ]] : founderJob,
            founderNationality: controls ? [founderNationality, [CustomValidators.required]] : founderNationality,
        }
    }
}