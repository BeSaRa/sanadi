export class CustomRoleInterceptor {
  static receive(model: any): any {
    return model;
  }

  static send(model: any): any {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    return model
  }
}
