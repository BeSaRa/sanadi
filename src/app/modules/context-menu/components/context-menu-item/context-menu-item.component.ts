import {
  Component,
  EmbeddedViewRef, Inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {Overlay} from '@angular/cdk/overlay';
import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {BehaviorSubject, fromEvent, Subject} from 'rxjs';
import {IMenuItem} from '../../interfaces/i-menu-item';
import {filter, map, takeUntil} from 'rxjs/operators';
import {TemplatePortal} from '@angular/cdk/portal';
import {LangService} from '../../../../services/lang.service';
import {Language} from '../../../../models/language';
import {DOCUMENT} from '@angular/common';
import {ILanguageKeys} from '../../../../interfaces/i-language-keys';

@Component({
  selector: 'context-menu-item',
  templateUrl: './context-menu-item.component.html',
  styleUrls: ['./context-menu-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContextMenuItemComponent implements OnInit, OnDestroy {
  @ViewChild(TemplateRef) private template!: TemplateRef<any>;
  overlayRef!: OverlayRef;
  private destroy$: Subject<any> = new Subject<any>();

  private itemsChange: BehaviorSubject<IMenuItem[]> = new BehaviorSubject<IMenuItem[]>([]);

  private preparedActions: BehaviorSubject<IMenuItem[]> = new BehaviorSubject<IMenuItem[]>([]);

  private open$: Subject<{ $event: MouseEvent, item: any }> = new Subject<{ $event: MouseEvent, item: any }>();

  filteredAction: IMenuItem[] = [];

  item: any;
  event?: MouseEvent;
  menuRef?: EmbeddedViewRef<any>;

  @Input()
  prevent?: (() => boolean) | boolean;

  @Input()
  set actions(val: IMenuItem[]) {
    this.itemsChange.next(val);
  };

  get actions(): IMenuItem[] {
    return this.itemsChange.value;
  }


  constructor(private overlay: Overlay,
              private lang: LangService,
              @Inject(DOCUMENT) private document: HTMLDocument,
              private viewContainerRef: ViewContainerRef) {

  }

  ngOnDestroy(): void {
    this.overlayRef.dispose();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.overlayRef = this.overlay.create();
    this.listenToBackdropClick();
    this.listenToItemChange();
    this.listenToOpenEvent();
    this.listenToLanguageChange();
  }

  open($event: MouseEvent, item?: any): void {
    $event.preventDefault();

    if (typeof this.prevent !== 'undefined') {
      if (typeof this.prevent === 'function' && this.prevent()) {
        return;
      } else if (this.prevent) {
        return;
      }
    }

    this.open$.next({$event: $event, item: item});
  }

  private listenToItemChange() {
    // wil user later something here to prepare the actions hierarchy for sub menus.
    this.itemsChange
      .subscribe((items: IMenuItem[]) => {
        this.preparedActions.next(items);
      });
  }

  private listenToOpenEvent(): void {
    this.open$
      .pipe(map((value) => ({
        actions: this.preparedActions.value.filter(action => {
          return action.show ? action.show(value.item) : true;
        }),
        ...value
      })))
      .subscribe((data) => {
        if (!data.actions.length) {
          return;
        }
        this.filteredAction = data.actions;
        this.item = data.item;
        this.event = data.$event;
        this.overlayRef.detach();
        this.menuRef = this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef));

        const list = this.menuRef.rootNodes[0].firstChild as HTMLUListElement;
        const size: DOMRect = list.getBoundingClientRect();

        const width: number = this.document.defaultView?.innerWidth!;
        const height: number = this.document.defaultView?.innerHeight!;

        const x = (this.event.x + size.width) >= width ? (this.event.x - size.width) : this.event.x;
        const y = (this.event.y + size.height) >= height ? (this.event.y - size.height) : this.event.y;

        let transformYOrigin: string = (this.event.y + size.height) >= height ? 'bottom' : 'top';
        let transformXOrigin: string = (this.event.x + size.width) >= width ? 'right' : 'left';

        let transformClass: string = transformYOrigin + '-' + transformXOrigin;
        list.classList.add('scale-0');
        this.menuRef.rootNodes[0].style.left = x + 'px';
        this.menuRef.rootNodes[0].style.top = y + 'px';
        setTimeout(() => {
          list.classList.add('transition');
          list.classList.add(transformClass);
        }, 10);
      });
  }

  displayLabel(action: IMenuItem): string {
    return typeof action.label === 'function' ? action.label(this.item) : this.lang.map[action.label as unknown as keyof ILanguageKeys];
  }

  private listenToBackdropClick() {
    fromEvent(document, 'click')
      .pipe(takeUntil(this.destroy$))
      .pipe(
        filter(event => {
          const element = event.target as HTMLElement;
          return !!(!this.overlayRef.hostElement.contains(element) && this.menuRef);
        }))
      .subscribe(_ => {
        this.close();
      });
  }

  close() {
    this.menuRef?.detach();
    this.overlayRef.detach();
    this.menuRef = undefined;
  }

  onClick(event: MouseEvent, action: IMenuItem) {
    event.preventDefault();
    action.onClick && action.onClick(this.item);
    this.close();
  }

  private listenToLanguageChange() {
    this.lang.onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang: Language) => {
        this.overlayRef.setDirection(lang.direction);
      });
  }

  isAction(action: IMenuItem): boolean {
    return action.type === 'action';
  }

  isDivider(action: IMenuItem): boolean {
    return action.type === 'divider';
  }
}
