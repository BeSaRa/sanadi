interface ServiceInterface<T> {
  [index: string]: T;
}

export class FactoryService {
  static services: ServiceInterface<any> = {};

  static registerService<T>(serviceName: string, service: T): FactoryService {
    if (!serviceName || serviceName.trim() === '') {
      throw Error('Failed to register service');
    }
    if (serviceName[0] !== serviceName[0].toUpperCase()) {
      throw Error('Service name should start with upper case');
    }
    FactoryService.services[serviceName] = service;
    return FactoryService;
  }

  static getService<T>(serviceName: string): T {
    if (!FactoryService.services.hasOwnProperty(serviceName)) {
      throw Error('Service not register yet: ' + serviceName);
    }
    return FactoryService.services[serviceName] as T;
  }
}
