export interface ClonerContract {
  clone<T>(override?: Partial<T>): T
}
