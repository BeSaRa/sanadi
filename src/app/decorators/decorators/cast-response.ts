import {CastResponseContract} from '@decorators/contracts/cast-response-contract'
import {ClassConstructor} from '@app-types/constructor'
import {$$_CAST_RESPONSE, $$_CAST_RESPONSE_CONTAINER, $$_MODEL_INTERCEPTOR,} from '@decorators/symbol'
import {CastOptionContract} from '@decorators/contracts/cast-option-contract'
import {map} from "rxjs/operators";
import {identity, Observable} from "rxjs";
import {isObject} from "@helpers/is-object";
import {GeneralInterceptor} from "@app/model-interceptors/general-interceptor";

function getFilteredProperty(property: string) {
  return property.split('.').filter(item => item !== '.')
}

function castProperty(
  model: any,
  castTo: () => ClassConstructor<any>,
  shapeArray: string[]
) {
  const property = shapeArray.shift()

  if (
    property &&
    property === '*' &&
    !shapeArray.length &&
    Array.isArray(model)
  ) {
    const BluePrint = castTo()
    const interceptor = getReceiveInterceptor(BluePrint)
    model = model.map(item => interceptor(Object.assign(new BluePrint(), item)))
  }

  if (property && model[property] && shapeArray.length) {
    model[property] = castProperty(model[property], castTo, shapeArray.slice())
  }

  if (property && model[property] && !shapeArray.length) {
    const BluePrint = castTo()
    const interceptor = getReceiveInterceptor(BluePrint)
    model[property] = interceptor(
      Object.assign(new BluePrint(), model[property])
    )
  }

  if (
    property &&
    property === '*' &&
    shapeArray.length &&
    Array.isArray(model)
  ) {
    model = model.map(item => {
      return castProperty(item, castTo, shapeArray.slice())
    })
  }
  return model
}

function getReceiveInterceptor(BluePrint: any): (model: any) => any {
  return (
    (BluePrint &&
      BluePrint.prototype &&
      BluePrint.prototype[$$_MODEL_INTERCEPTOR] &&
      BluePrint.prototype[$$_MODEL_INTERCEPTOR].receive) ||
    (identity as (model: any) => any)
  )
}

function castShape(
  model: any,
  shape?: Record<string, () => ClassConstructor<any>>
): any {
  const shapeKeys = shape ? Object.entries(shape) : []
  if (shapeKeys.length) {
    shapeKeys.forEach(([property, cast]) => {
      const shapeArray = getFilteredProperty(property)
      cast ? castProperty(model, cast, shapeArray.slice()) : null
    })
  }
  return model
}

function castModel(
  callback: undefined | string | (() => ClassConstructor<any>),
  model: any,
  options: CastResponseContract,
  instance: any,
  propertyKey: string | symbol
) {
  let BluePrint

  switch (typeof callback) {
    case 'function':
      BluePrint = callback()
      break
    case 'string':
      BluePrint = instance.hasOwnProperty(callback)
        ? instance[callback]()
        : undefined
      break
    default:
      const map = instance[$$_CAST_RESPONSE_CONTAINER] as Map<string | symbol,
        CastOptionContract>

      if (map) {
        const modelInfo = map.has(propertyKey)
          ? map.get(propertyKey)
          : map.has(options.fallback!)
            ? map.get(options.fallback!)
            : undefined

        if (modelInfo) {
          BluePrint = modelInfo.model()
          options.shape = modelInfo.shape
        }
      }
      break
  }
  model = options.shape ? castShape(model, options.shape) : model

  const interceptor = getReceiveInterceptor(BluePrint)

  return interceptor(GeneralInterceptor.receive(BluePrint ? Object.assign(new BluePrint(), model) : model))
}

function caseCollection(
  callback: undefined | string | (() => ClassConstructor<any>),
  models: any[],
  options: CastResponseContract,
  instance: any,
  propertyKey: string | symbol
) {
  return models.map(model =>
    castModel(callback, model, options, instance, propertyKey)
  )
}

export function CastResponse(
  callback: undefined | string | (() => ClassConstructor<any>),
  options: CastResponseContract = {
    fallback: '$default',
    unwrap: 'rs'
  }
): MethodDecorator {
  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    if (!target[$$_CAST_RESPONSE]) {
      target[$$_CAST_RESPONSE] = {}
    }
    
    target[$$_CAST_RESPONSE][propertyKey] = propertyKey


    const original = descriptor.value! as unknown as () => Observable<any>
    descriptor.value = function (this: any, ...args: []): Observable<any> {
      const containerMap = this[$$_CAST_RESPONSE_CONTAINER] as Map<string | symbol,
        CastOptionContract>
      let hasUnwrap: boolean
      let unwrapProperty = ''

      if (options.unwrap) {
        hasUnwrap = true
        unwrapProperty = options.unwrap
      }

      if (containerMap && containerMap.has(propertyKey) && containerMap.get(propertyKey)!.unwrap) {
        hasUnwrap = true
        unwrapProperty = containerMap.get(propertyKey)!.unwrap!
      }

      return original
        .apply(this, args)
        .pipe(
          map(models => {
              models = isObject(models) && hasUnwrap && models.hasOwnProperty(unwrapProperty) ? models[unwrapProperty] : models
              return models ?
                Array.isArray(models)
                  ? caseCollection(callback, models, options, this, propertyKey)
                  : castModel(callback, models, options, this, propertyKey)
                : models
            }
          )
        )
    } as unknown as T
    return descriptor
  }
}

export function CastResponseContainer(
  options: Record<string, CastOptionContract>
): ClassDecorator {
  return (target: any) => {
    if (!target[$$_CAST_RESPONSE_CONTAINER]) {
      target.prototype[$$_CAST_RESPONSE_CONTAINER] = new Map<string,
        CastOptionContract>()
    }
    Object.keys(options).forEach(key => {
      target.prototype[$$_CAST_RESPONSE_CONTAINER].set(key, options[key])
    })
    return target
  }
}

export function CastPagination(callback: undefined | string | (() => ClassConstructor<any>),
  options: CastResponseContract = {
    fallback: '$default',
    unwrap: 'rs'
  }
): MethodDecorator {
  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    if (!target[$$_CAST_RESPONSE]) {
      target[$$_CAST_RESPONSE] = {}
    }
    target[$$_CAST_RESPONSE][propertyKey] = propertyKey


    const original = descriptor.value! as unknown as () => Observable<any>
    descriptor.value = function (this: any, ...args: []): Observable<any> {
      const containerMap = this[$$_CAST_RESPONSE_CONTAINER] as Map<string | symbol,
        CastOptionContract>
      let hasUnwrap: boolean
      let unwrapProperty = ''

      if (options.unwrap) {
        hasUnwrap = true
        unwrapProperty = options.unwrap
      }

      if (containerMap && containerMap.has(propertyKey) && containerMap.get(propertyKey)!.unwrap) {
        hasUnwrap = true
        unwrapProperty = containerMap.get(propertyKey)!.unwrap!
      }

      return original
        .apply(this, args)
        .pipe(
          map(models => {
            const count = models.count;
            models = isObject(models) && hasUnwrap && models.hasOwnProperty(unwrapProperty) ? models[unwrapProperty] : models
            return {
              rs: models ?
                Array.isArray(models)
                  ? caseCollection(callback, models, options, this, propertyKey)
                  : castModel(callback, models, options, this, propertyKey)
                : models,
              count: count
            }

          }
          )
        )
    } as unknown as T
    return descriptor

  }
}

