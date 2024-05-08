import { CustomValidators } from "@app/validators/custom-validators";
import { Cloneable } from "./cloneable";

export class VerificationTemplate  extends Cloneable<VerificationTemplate>{
  id!:number;
  verification!:string;

  // searchFields: ISearchFieldsMap<VerificationTemplate> = {
  //   ...normalSearchFields(['verification']),
  // };
  buildForm(controls?: boolean): any {
    const {
      verification,
     
    } = this;
    return {
      verification: controls ? [verification, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
      ]] : verification,
    
    }
  }



}
