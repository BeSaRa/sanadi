import {Observable} from 'rxjs';
import {Comment} from '../models/comment';
import {HttpClient} from '@angular/common/http';

export class CommentService<T extends { http: HttpClient, _getServiceURL(): string }> {

  constructor(private service: T) {
  }

  create(caseId: string, comment: Partial<Comment>): Observable<boolean> {
    return this.service.http.post<boolean>(this.service._getServiceURL() + '/' + caseId + '/comment', comment);
  }

  load(caseId: string): Observable<Comment[]> {
    return this.service.http.get<Comment[]>(this.service._getServiceURL() + '/' + caseId + '/comments');
  }
}
