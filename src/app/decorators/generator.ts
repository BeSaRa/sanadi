import {map} from 'rxjs/operators';
import {map as _map} from 'lodash';

function _generateModel(data: any, model: any, property?: string, receiveCallback?: any): any {
  let finalData;
  if (!property) {
    finalData = model ? Object.assign(new model(), data) : data;
  } else {
    finalData = model ? Object.assign(new model(), data[property]) : data[property];
  }
  return receiveCallback ? receiveCallback(finalData) : finalData;
}

function _generateCollection(collection: any, model: any, property?: string, receiveCallback?: any): any {
  if (!property) {
    // @ts-ignore
    return _map(collection, item => _generateModel(item, model, null, receiveCallback));
  } else {
    // @ts-ignore
    return _map(collection[property], item => _generateModel(item, model, null, receiveCallback));
  }
}

// @ts-ignore
export function Generator(model?, isCollection = false, options?: { property?: string, interceptReceive?: any }): any {
  // @ts-ignore
  return (target, property, descriptor: PropertyDescriptor) => {
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
          ? _generateCollection(data, model, options?.property, options?.interceptReceive)
          : _generateModel(data, model, options?.property, options?.interceptReceive))
      );
    };
  };
}


