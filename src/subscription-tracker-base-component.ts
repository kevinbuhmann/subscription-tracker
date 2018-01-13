import { OnDestroy } from '@angular/core';

import { SubscriptionTracker } from './subscription-tracker';

export abstract class SubscriptionTrackerBaseComponent extends SubscriptionTracker implements OnDestroy {
  ngOnDestroy() {
    super.destroy();
  }
}
