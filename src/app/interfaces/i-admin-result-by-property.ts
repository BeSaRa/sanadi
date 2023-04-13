import {AdminResult} from '@models/admin-result';

export interface IAdminResultByProperty<M> {
  getAdminResultByProperty: (key: keyof M) => AdminResult;
}
