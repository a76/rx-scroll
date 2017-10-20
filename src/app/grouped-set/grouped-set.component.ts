import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import { OnChanges, OnInit, OnDestroy, ElementRef  } from '@angular/core';

import { Subject, Observable, Subscription } from 'rxjs/Rx';
import { State, Group, Action, Scroll, Toggle, IteratorResult, Resize } from '../model';
import { createIterator } from '../grouped-set-iterator';
import { generateArray } from '../generate-array';

@Component({
  selector: 'app-grouped-set',
  templateUrl: './grouped-set.component.html',
  styleUrls: ['./grouped-set.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedSetComponent implements OnChanges, OnInit, OnDestroy {
  @Input() state: State<Group>;
  @Output() actions: EventEmitter<Action<Group>> = new EventEmitter();
  items: any = [];
  private subscription: Subscription;

  constructor(private container: ElementRef) {
  }

  get containerHeight(): number {
    return this.container.nativeElement.firstElementChild.clientHeight;
  }

  ngOnInit() {
    this.subscription = Observable.fromEvent(window, 'resize').subscribe(
      () => { this.actions.next(new Resize(this.containerHeight)); }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes) {
    // console.log(this.state);
    if (this.state) {
      this.items = createIterator(this.state, group => generateArray(group.count, index => index));
    }
  }

  scroll(e) {
    const { scrollTop } = e.target;
    this.actions.next(new Scroll(scrollTop));
  }

  toggle(item) {
    const id = this.state.reverseMap.get(item);
    this.actions.emit(new Toggle(id));
  }
}
