import {map} from 'rxjs/operators';
import {map as _map} from 'lodash';
import {GeneratorInterface} from './generator-interface';
import {GeneralInterceptor} from '../model-interceptors/general-interceptor';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {identity} from 'rxjs';

function _generateModel(data: any,
                        model: any,
                        property?: string,
                        receiveCallback?: any,
                        instance?: Partial<BackendServiceModelInterface<any>>): any {
  let finalData;
  if (instance && typeof instance._getModel !== 'undefined') {
    model = instance._getModel();
  }

  if (instance && typeof instance._getReceiveInterceptor !== 'undefined' && !!instance._getReceiveInterceptor()) {
    receiveCallback = instance._getReceiveInterceptor();
  }

  if (instance && typeof instance._getInterceptor !== 'undefined' && !!instance._getInterceptor()) {
    const interceptor = instance._getInterceptor();
    receiveCallback = interceptor ? interceptor.receive : identity;
  }


  if (!property) {
    finalData = model ? Object.assign(new model(), data) : data;
  } else {
    finalData = model ? Object.assign(new model(), data[property]) : data[property];
  }

  return GeneralInterceptor.receive(receiveCallback ? receiveCallback(finalData) : finalData);
}

function _generateCollection(collection: any, model: any, property?: string, receiveCallback?: any, instance?: any): any {
  if (!property) {
    // @ts-ignore
    return _map(collection, item => _generateModel(item, model, null, receiveCallback, instance));
  } else {
    // @ts-ignore
    return _map(collection[property], item => _generateModel(item, model, null, receiveCallback, instance));
  }
}

// @ts-ignore
export function Generator(model?, isCollection = false, options?: { property?: string, interceptReceive?: any } = {property: 'rs'}): any {
  // @ts-ignore
  return <T extends GeneratorInterface>(target, property, descriptor: T) => {
    const original = descriptor.value;
    // tslint:disable-next-line:only-arrow-functions
    // @ts-ignore
    descriptor.value = function(...args): any {
      // @ts-ignore
      if (typeof this._getModel !== 'undefined') {
        // @ts-ignore
        model = this._getModel();
      }


      return original.apply(this, args).pipe(
        map(data => isCollection
          ? _generateCollection(data, model, options?.property, options?.interceptReceive, this)
          : _generateModel(data, model, options?.property, options?.interceptReceive, this))
      );
    };
  };
}


