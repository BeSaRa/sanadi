import { AdminResult } from "./admin-result";

export class InspectionLog {
    id!: number;
    action!: number;
    actionDate!: string;
    userId!: number;
    actionInfo!:AdminResult
}