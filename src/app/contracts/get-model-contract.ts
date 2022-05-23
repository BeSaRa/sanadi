export interface GetModelContract<T> {
  _getModel(): new () => T
}
