import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

export abstract class SubscriptionTracker {
  private subscriptions: Subscription[] = [];

  static subscribeAndTrack<T>(this: Observable<T>, tracker: SubscriptionTracker, next?: (value: T) => void, error?: (error: any) => void, complete?: () => void) {
    // tslint:disable-next-line:no-empty
    tracker.subscriptions.push(this.subscribe(next, error || (() => { }), complete));
  }

  protected destroy() {
    if (this.subscriptions && this.subscriptions.length > 0) {
      for (const subscription of this.subscriptions) {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    }

    this.subscriptions = [];
  }
}

declare module 'rxjs/Observable' {
  // tslint:disable-next-line:no-shadowed-variable
  interface Observable<T> {
    subscribeAndTrack: typeof SubscriptionTracker.subscribeAndTrack;
  }
}

Observable.prototype.subscribeAndTrack = SubscriptionTracker.subscribeAndTrack;
