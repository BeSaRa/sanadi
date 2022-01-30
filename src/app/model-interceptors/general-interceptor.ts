export class GeneralInterceptor {
  static receive(model: any): any {
    model.setItemRoute && model.setItemRoute();
    return model;
  }

  static send(model: any): any {
    delete model.searchFields;
    delete model.service;
    delete model.employeeService;
    delete model.langService;
    delete model.dialog;
    delete model.encrypt;
    delete model.itemRoute;
    delete model.itemDetails;
    delete model.inboxService;
    return model;
  }
}
