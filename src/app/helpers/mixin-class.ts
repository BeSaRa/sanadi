/** @docs-private */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * This is a permissive type for abstract class constructors.
 * @docs-private
 */
export type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;


/** Mixin to augment a directive with a `disabled` property. */
export function mixinClass<T extends AbstractConstructor<{}>>(base: T): T;
export function mixinClass<T extends Constructor<{}>>(base: T): T {
  return class extends base {
    constructor(...args: any[]) {
      super(...args);
    }
  };
}
