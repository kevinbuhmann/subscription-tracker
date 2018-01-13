import { Injectable, PlatformRef } from '@angular/core';

import { SubscriptionTracker } from './subscription-tracker';

/**
 * The global subscription tracker should only be used when subscription inside a component is not
 * possible such as in APP_INITIALIZER providers for work that needs to start before the AppComponent
 * is bootstrapped.
 */
@Injectable()
export class GlobalSubscriptionTracker extends SubscriptionTracker {
  constructor(platformRef: PlatformRef) {
    super();

    platformRef.onDestroy(() => { this.destroy(); });
  }
}
