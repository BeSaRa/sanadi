export abstract class Cloner {
  clone<T>(override?: Partial<T>): T {
    const constructor = this.constructor;
    // @ts-ignore
    return Object.assign(new constructor(), this, override);
  }
}
