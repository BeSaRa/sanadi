export function interceptCustomRole(model: any) {
  delete model.service;
  delete model.langService;
  return model;
}
