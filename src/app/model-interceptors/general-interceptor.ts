export class GeneralInterceptor {
  static receive(model: any): any {
    return model;
  }

  static send(model: any): any {
    delete model.searchFields;
    return model;
  }
}
