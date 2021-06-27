import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {CaseComment} from '../../../models/case-comment';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'comment-history-popup',
  templateUrl: './comment-history-popup.component.html',
  styleUrls: ['./comment-history-popup.component.scss']
})
export class CommentHistoryPopupComponent implements OnInit {
  displayedColumns: string[] = ['text', 'createdOn'];
  comments: CaseComment[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: { comment: CaseComment },
              public lang: LangService) {
  }

  ngOnInit(): void {
    this.comments = this.data.comment.editHistory.reverse();
    this.data.comment.createdOn = this.data.comment.lastModified;
    this.comments.unshift(this.data.comment);
  }

}
