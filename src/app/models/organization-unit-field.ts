import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { INames } from "@app/interfaces/i-names";
import { OrganizationUnitFieldInterceptor } from "@app/model-interceptors/organization-unit-field-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { OrganizationUnitFieldService } from "@app/services/organization-unit-field.service";
import { searchFunctionType } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { BaseModel } from "./base-model";
import { Lookup } from "./lookup";

const interceptor: OrganizationUnitFieldInterceptor = new OrganizationUnitFieldInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class OrganizationUnitField extends BaseModel<
  OrganizationUnitField,
  OrganizationUnitFieldService
> {
  service: OrganizationUnitFieldService;
  langService: LangService;
  status!: number;
  statusInfo!: Lookup;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: "arName",
    enName: "enName",
    status: (text) =>
      !this.statusInfo
        ? false
        : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  constructor() {
    super();
    this.langService = FactoryService.getService("LangService");
    this.service = FactoryService.getService("OrganizationUnitFieldService");
  }
  getName(): string {
    return this[(this.langService.map.lang + "Name") as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const { arName, enName, status } = this;
    return {
      arName: controls
        ? [
            arName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ARABIC_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
              CustomValidators.pattern("AR_NUM_ONE_AR"),
            ],
          ]
        : arName,
      enName: controls
        ? [
            enName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
              CustomValidators.pattern("ENG_NUM_ONE_ENG"),
            ],
          ]
        : enName,
      status: controls ? [status, [CustomValidators.required]] : status,
    };
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }
}
