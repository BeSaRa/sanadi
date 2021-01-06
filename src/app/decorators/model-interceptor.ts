import {findIndex as _findIndex, cloneDeep as deepClone} from 'lodash';

// tslint:disable-next-line:typedef
export function InitClassInterceptor(callback?: any) {
  // tslint:disable-next-line:only-arrow-functions typedef
  return function(constructorFunction: any) {
    // new constructor function
    // @ts-ignore
    // tslint:disable-next-line:only-arrow-functions typedef
    const newConstructorFunction: any = function(...args) {
      // tslint:disable-next-line:only-arrow-functions typedef
      const newClass: any = function() {
        return new constructorFunction(...args);
      };
      newClass.prototype = constructorFunction.prototype;

      const model: any = new newClass();
      if (callback) {
        callback(model);
      }
      return model;
    };
    newConstructorFunction.prototype = constructorFunction.prototype;
    return newConstructorFunction;
  };
}


// @ts-ignore
// tslint:disable-next-line:typedef
export function SendInterceptor(interceptorCallback?) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const metadataProperty = 'metadata_' + propertyKey + '_params';
    // @ts-ignore
    // tslint:disable-next-line:typedef
    descriptor.value = function(...args) {
      const newArgs = deepClone(args);
      if (target.hasOwnProperty(metadataProperty)) {
        const params = target[metadataProperty] as any[];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < params.length; i++) {
          const isObject = typeof params[i] === 'object';
          newArgs[isObject ? params[i].index : params[i]] = isObject ?
            (params[i].callback(newArgs[params[i].index])) : interceptorCallback(newArgs[params[i]]);
        }
      }
      return originalMethod.apply(this, newArgs);
    };
  };
}

// @ts-ignore
// tslint:disable-next-line:typedef
export function InterceptParam(interceptorCallback?) {
  // @ts-ignore
  return (target, methodName: string, paramIndex: number) => {
    const metadataProperty = 'metadata_' + methodName + '_params';
    if (target.hasOwnProperty(metadataProperty)) {
      // const notExists = target[metadataProperty].indexOf(index) === -1;
      // tslint:disable-next-line:only-arrow-functions typedef
      const metadataPropIndex = _findIndex(target[metadataProperty], function(item: any) {
        return paramIndex === (item.hasOwnProperty('index') ? item.index : item);
      });

      if (metadataPropIndex === -1) {
        target[metadataProperty].push((interceptorCallback ? {index: paramIndex, callback: interceptorCallback} : paramIndex));
      }
    } else {
      target[metadataProperty] = [(interceptorCallback ? {index: paramIndex, callback: interceptorCallback} : paramIndex)];
    }
  };
}
