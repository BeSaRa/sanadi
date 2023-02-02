import { AdminResult } from './admin-result';
import { INames } from '@contracts/i-names';

export class AssignedTask extends AdminResult {
  isMain?: boolean;
  startDate!: string;
  organizationId?: number;
  profileArName?: string;
  profileEnName?: string;

  getOrgName(): string {
    return this[('profile' + this.langService?.map.lang[0].toUpperCase() + this.langService?.map.lang[1] + 'Name') as keyof INames] || '';
  }
  static createInstance(model: Partial<AssignedTask>): AssignedTask {
    return Object.assign(new AssignedTask, model);
  }
}
