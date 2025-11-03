/**
 * Payments Service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {Subscription, CheckoutInput, PaymentResult} from '@types';

export class PaymentsService {
  private backend = getBackendService();

  async getSubscription(): Promise<Subscription | null> {
    try {
      const subs = await this.backend.database.query<Subscription>('subscriptions/my');
      return subs[0] || null;
    } catch (error) {
      logger.error('Failed to get subscription', error as Error);
      throw error;
    }
  }

  async createCheckout(input: CheckoutInput): Promise<PaymentResult> {
    try {
      logger.info('Creating payment checkout', {plan: input.plan});
      // Implementation would call payment API
      return {
        orderId: 'mock-order',
        amount: 0,
        currency: 'INR',
      };
    } catch (error) {
      logger.error('Failed to create checkout', error as Error);
      throw error;
    }
  }
}

export const paymentsService = new PaymentsService();
