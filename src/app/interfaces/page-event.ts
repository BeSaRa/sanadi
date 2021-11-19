export interface PageEvent {
  previousPageIndex: number | null;
  pageIndex: number;
  pageSize: number;
  length: number;
  emitter?: string
}
