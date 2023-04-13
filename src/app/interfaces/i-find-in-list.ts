export interface IFindInList<M> {
  itemToCompare: M,
  listToCompareWith: M[],
  propertyToCompare?: string | keyof M
}
