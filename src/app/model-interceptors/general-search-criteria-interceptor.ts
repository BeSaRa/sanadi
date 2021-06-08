import {IModelInterceptor} from '../interfaces/i-model-interceptor';

export class GeneralSearchCriteriaInterceptor implements IModelInterceptor<any> {
  // not important we will never use it
  receive(model: any): any {
    return model;
  }

  send(model: any): any {
    // here you can check the search criteria type if match any of your model you can pass it to your custom interceptor.send method
    delete model.service;
    return model;
  }
}
