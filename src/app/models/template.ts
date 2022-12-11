import { AdminResult } from "@app/models/admin-result";

export class Template {
  templateId!: string;
  projectName!: string
  templateFullSerial!: string
  publicStatus!: number
  templateCost!: number
  templateStatus!: number
  templateStatusInfo!: AdminResult
  publicStatusInfo!: AdminResult
}
