export function interceptOrganizationUnit(model: any) {
  delete model.service;
  delete model.langService;
  delete model.lookupService;
  return model;
}
