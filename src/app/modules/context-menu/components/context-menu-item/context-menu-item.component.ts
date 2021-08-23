import {
  Component,
  EmbeddedViewRef,
  Inject,
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
import {LangService} from '@app/services/lang.service';
import {Language} from '@app/models/language';
import {DOCUMENT} from '@angular/common';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';

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

  private itemsChange: BehaviorSubject<IMenuItem<any>[]> = new BehaviorSubject<IMenuItem<any>[]>([]);

  private preparedActions: BehaviorSubject<IMenuItem<any>[]> = new BehaviorSubject<IMenuItem<any>[]>([]);

  private open$: Subject<{ $event: MouseEvent, item: any }> = new Subject<{ $event: MouseEvent, item: any }>();

  filteredAction: IMenuItem<any>[] = [];

  item: any;
  event?: MouseEvent;
  menuRef?: EmbeddedViewRef<any>;

  @Input()
  prevent?: (() => boolean) | boolean;

  @Input()
  debug: boolean = false;

  @Input()
  set actions(val: IMenuItem<any>[]) {
    this.debugInfo(() => {
      console.log('action list assigned to the context menu', val);
    });
    this.itemsChange.next(val);
  };

  get actions(): IMenuItem<any>[] {
    this.debugInfo(() => {
      console.log('actions assigned', this.itemsChange.value);
    });
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

  private debugInfo(callback: () => void) {
    if (this.debug) {
      callback();
    }
  }

  open($event: MouseEvent, item?: any): void {
    $event.preventDefault();

    this.debugInfo(() => {
      console.log('Open Event fired');
      console.log({$event, item});
    });

    if (typeof this.prevent !== 'undefined') {
      if (typeof this.prevent === 'function' && this.prevent()) {
        this.debugInfo(() => {
          console.log('prevent Callback returned true , context menu won\'t open');
        });
        return;
      } else if (this.prevent) {
        this.debugInfo(() => {
          console.log('prevent variable has value true , context menu won\'t open');
        });
        return;
      }
    }
    this.open$.next({$event: $event, item: item});
  }

  private listenToItemChange() {
    // wil user later something here to prepare the actions hierarchy for sub menus.
    this.itemsChange
      .subscribe((items: IMenuItem<any>[]) => {
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
      .pipe(map((value) => {
        value.actions = value.actions.filter(action => {
          return !(action.data && action.data.hideFromContext);
        });
        return value;
      }))
      .subscribe((data) => {
        this.debugInfo(() => {
          console.log('actions after filter', data.actions);
        });
        if (!data.actions.length) {
          this.debugInfo(() => {
            console.log('actions has 0 length after filter', data.actions);
          });
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

        const isRTL: () => boolean = () => this.overlayRef.hostElement.dir === 'rtl';
        const elCrossedOver: () => boolean = () => isRTL() ? (this.event!.x - size.width <= 0) : (this.event!.x + size.width >= width);
        const x = elCrossedOver() ? (isRTL() ? this.event.x + size.width : this.event.x - size.width) : this.event.x;
        const y = (this.event.y + size.height) >= height ? (this.event.y - size.height) : this.event.y;
        let transformYOrigin: string = (this.event.y + size.height) >= height ? 'bottom' : 'top';
        let transformXOrigin: string = elCrossedOver() ? 'right' : 'left';

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

  displayLabel(action: IMenuItem<any>): string {
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
        this.debugInfo(() => {
          console.log('menu is going to close now');
        });
        this.close();
      });
  }

  close() {
    this.menuRef?.detach();
    this.overlayRef.detach();
    this.menuRef = undefined;
    this.debugInfo(() => {
      console.log('menu closed and ref undefined');
    });
  }

  onClick(event: MouseEvent, action: IMenuItem<any>) {
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

  isAction(action: IMenuItem<any>): boolean {
    return action.type === 'action';
  }

  isDivider(action: IMenuItem<any>): boolean {
    return action.type === 'divider';
  }
}
