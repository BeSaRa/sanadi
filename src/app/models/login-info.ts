import { ILookupMap } from "@app/interfaces/i-lookup-map";
import { ILoginInfo } from "@contracts/i-login-info";
import { Localization } from "./localization";
import { InterceptModel } from "@decorators/intercept-model";
import { interceptLoginInfo } from "@app/model-interceptors/login-info-interceptor";

@InterceptModel({
  receive: interceptLoginInfo
})
export class LoginInfo implements ILoginInfo {
  localizationSet!: Localization[];
  lookupMap!: ILookupMap;
}
