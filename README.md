# subscription-tracker
[![npm version](https://badge.fury.io/js/ngformatter.svg)](https://badge.fury.io/js/subscription-tracker)
[![Build Status](https://api.travis-ci.org/kevinphelps/subscription-tracker.svg?branch=master)](https://travis-ci.org/kevinphelps/subscription-tracker)
[![codecov](https://codecov.io/gh/kevinphelps/subscription-tracker/branch/master/graph/badge.svg)](https://codecov.io/gh/kevinphelps/subscription-tracker)

A lifecycle-based cleanup strategy for RxJS Observables in Angular apps.

`subscription-tracker` automatically destroys subscriptions the component (or app) that created
them is destroyed by the Angular framework.

## Installation

`npm install --save subscription-tracker` or `yarn add subscription-tracker`

## Usage

1. Create a `BaseComponent` class that extends `SubscriptionTrackerBaseComponent` in the root of
your project.

```typescript
import { SubscriptionTrackerBaseComponent } from 'subscription-tracker';

export abstract class BaseComponent extends SubscriptionTrackerBaseComponent {
}
```

2. Change all `.subscribe(...)` usages to `.subscribeAndTrack(this, ...)`. You will need to extend
your new `BaseComponent`. I recomened making all of your app's components extend `BaseComponent`.
Do not subscribe in services. (Better yet, try to subscribe in templates using the `async` pipe as
much as possible.)

```typescript
import { Component, OnInit } from '@angular/core';

import { BaseComponent } from './base.component';
import { SettingsService } from './common/core/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends BaseComponent implements OnInit {
  constructor(private readonly settingsService: SettingsService) {
    super();
  }

  ngOnInit() {
    this.settingsService.updateSettings().subscribeAndTrack(this);
  }
}
```

3. Add the `no-subscribe` rule to your `tslint.json` configuration. This rulle will warn you if you
use `.subscribe(...)` instead of `.subscribeAndTrack(this, ...)`

```json
{
  "rulesDirectory": [
    "node_modules/subscription-tracker/dist/tslint-rules"
  ],
  "rules": {
    "no-subscribe": true,
  }
}
```

## What if I absolutely need to subscribe outside of a componment?

Subscriptions outside of a component should be very rare -- only when *absolutely* required. But
when you need to subscribe outside of a component, use `GlobalSubscriptionTracker`. This service
will wait until the Angular platform is destroyed before unsubscribing from any subscriptions.

1. Provide `GlobalSubscriptionTracker` in your `AppModule` or wherever you provide shared services.

```typescript
import { NgModule } from '@angular/core';
import { GlobalSubscriptionTracker } from 'subscription-tracker';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
  ],
  providers: [
    ...
    GlobalSubscriptionTracker
  ]
  entryComponents: [AppComponent],
  bootstrap: [AppComponent],
  exports: [AppComponent]
})
export class AppModule { }
```

2. Use `GlobalSubscriptionTracker` only when you cannot tie a subscription to the lifecycle of a
particular component. Rememeber, you can use the root `AppComponent` for most subscription that
need to live for the entire time the app is active.

```typescript
export function authServiceInitFactory(injector: Injector) {
  return () => {
    const authService = injector.get(AuthService);
    const globalSubscriptionTracker = injector.get(GlobalSubscriptionTracker);

    authService.credentials.subscribeAndTrack(globalSubscriptionTracker);
  };
}

export const authServiceInitProvider: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: authServiceInitFactory,
  deps: [Injector]
};
```