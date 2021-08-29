export class GeneralInterceptor {
  static receive(model: any): any {
    return model;
  }

  static send(model: any): any {
    delete model.searchFields;
    delete model.service;
    delete model.employeeService;
    delete model.langService;
    delete model.dialog;
    return model;
  }
}
