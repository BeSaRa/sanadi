export function interceptCustomRole(model: any) {
  delete model.service;
  delete model.langService;
  delete model.searchFields;
  return model;
}
