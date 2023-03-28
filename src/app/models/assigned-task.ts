import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from './admin-result';
import { INames } from '@contracts/i-names';

export class AssignedTask extends AdminResult {
  isMain?: boolean;
  startDate!: string;
  organizationId?: number;
  profileArName?: string;
  profileEnName?: string;
  stepSubject?: keyof ILanguageKeys;

  getOrgName(): string {
    return this[('profile' + this.langService?.map.lang[0].toUpperCase() + this.langService?.map.lang[1] + 'Name') as keyof INames] || '';
  }
  getActionName(): string{
    if(!this.stepSubject) return ''
    return this.langService.map[this.stepSubject!]
  }
  static createInstance(model: Partial<AssignedTask>): AssignedTask {
    return Object.assign(new AssignedTask, model);
  }
}
