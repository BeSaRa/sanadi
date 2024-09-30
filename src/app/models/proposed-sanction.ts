import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "./searchable-cloneable";
import { AdminResult } from "./admin-result";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { ProposedSanctionInterceptor } from "@app/model-interceptors/proposed-sanction-interceptor";
import { Penalty } from "./penalty";

const {send,receive} = new ProposedSanctionInterceptor();
@InterceptModel({send,receive})
export class ProposedSanction extends SearchableCloneable<ProposedSanction> {
    id!:number;
    sanctionComment!:string;
    penaltyInfo!:Penalty;

    buildForm(controls?:boolean):any{
        const {id,sanctionComment} = this;
        return {
            id: controls ? [id, [CustomValidators.required]] : id,
            sanctionComment: controls ? [sanctionComment, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : sanctionComment,
        }
    }
}