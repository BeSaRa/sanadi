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

            founderName: controls ? [founderName, [CustomValidators.required]] : founderName,
            founderIdentifierId: controls ? [founderIdentifierId, [CustomValidators.required]] : founderIdentifierId,
            founderPosition: controls ? [founderPosition, [CustomValidators.required]] : founderPosition,
            founderJob: controls ? [founderJob, [CustomValidators.required]] : founderJob,
            founderNationality: controls ? [founderNationality, [CustomValidators.required]] : founderNationality,
        }
    }
}