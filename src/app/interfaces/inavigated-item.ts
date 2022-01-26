import {OpenFrom} from "@app/enums/open-from.enum";

export interface INavigatedItem {
  openFrom: OpenFrom
  taskId: string | null,
  caseId: string,
  caseType: number
}

