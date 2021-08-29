import {Observable} from "rxjs";

export interface ICaseModel<T> {
  id: string;

  create(): Observable<T>

  update(): Observable<T>

  save(): Observable<T>

  commit(): Observable<T>

  draft(): Observable<T>
}
