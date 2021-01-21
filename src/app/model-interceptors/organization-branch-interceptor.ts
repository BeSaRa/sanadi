export function interceptOrganizationBranch(model: any): any {
  delete model.service;
  delete model.langService;
  delete model.lookupService;
  delete model.organizationUnitService;
  return model;
}
