import {AdminResult} from "@app/models/admin-result";

export interface HasRequestType {
  requestType: number;
  requestTypeInfo: AdminResult;

  getRequestType(): number;
}
