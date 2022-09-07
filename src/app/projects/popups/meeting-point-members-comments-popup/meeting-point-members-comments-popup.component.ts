import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';

@Component({
  selector: 'meeting-point-members-comments-popup',
  templateUrl: './meeting-point-members-comments-popup.component.html',
  styleUrls: ['./meeting-point-members-comments-popup.component.scss']
})
export class MeetingPointMembersCommentsPopupComponent implements OnInit {
  displayedColumns: string[] = ['member', 'comment'];
  membersComments: MeetingPointMemberComment[] = [];
  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      membersComments: MeetingPointMemberComment[]
    },
    public lang: LangService
  ) {
    this.membersComments = data.membersComments;
  }

  ngOnInit(): void {
    console.log('comments', this.data.membersComments);
  }

}
