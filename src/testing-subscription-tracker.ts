import { SubscriptionTracker } from './subscription-tracker';

export class TestingSubscriptionTracker extends SubscriptionTracker {
  destroy() {
    super.destroy();
  }
}
