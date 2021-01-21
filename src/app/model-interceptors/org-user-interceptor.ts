import {OrgUser} from '../models/org-user';

export function interceptOrganizationUser(model: OrgUser | any) {
  delete model.service;
  delete model.langService;

  return model;
}
