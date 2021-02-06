export abstract class Cloneable<T> {
  // shallow clone
  clone(override?: Partial<T>): T {
    const constructor = this.constructor;
    // @ts-ignore
    return Object.assign(new constructor(), this, override);
  }
}
