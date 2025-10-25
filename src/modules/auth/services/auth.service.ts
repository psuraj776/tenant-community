/**
 * Auth Service
 * Handles authentication logic using backend service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {OTPRequestInput, OTPVerifyInput, AuthResult} from '@types';

export class AuthService {
  private backend = getBackendService();

  /**
   * Request OTP for phone number
   */
  async requestOTP(phone: string): Promise<void> {
    try {
      logger.info('Requesting OTP', {phone: this.maskPhone(phone)});

      const input: OTPRequestInput = {phone};
      await this.backend.auth.requestOTP(input);

      logger.info('OTP requested successfully');
    } catch (error) {
      logger.error('Failed to request OTP', error as Error, {phone: this.maskPhone(phone)});
      throw error;
    }
  }

  /**
   * Verify OTP and complete login
   */
  async verifyOTP(phone: string, code: string): Promise<AuthResult> {
    try {
      logger.info('Verifying OTP', {phone: this.maskPhone(phone)});

      const input: OTPVerifyInput = {phone, code};
      const result = await this.backend.auth.verifyOTP(input);

      logger.info('OTP verified successfully', {userId: result.user.id});
      logger.setUserId(result.user.id);

      return result;
    } catch (error) {
      logger.error('Failed to verify OTP', error as Error, {phone: this.maskPhone(phone)});
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{accessToken: string; refreshToken: string}> {
    try {
      logger.debug('Refreshing access token');

      const result = await this.backend.auth.refreshToken(refreshToken);

      logger.debug('Access token refreshed successfully');
      return result;
    } catch (error) {
      logger.error('Failed to refresh token', error as Error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      logger.info('Logging out user');

      await this.backend.auth.logout();

      logger.info('Logout successful');
      logger.setUserId(null);
    } catch (error) {
      logger.error('Failed to logout', error as Error);
      throw error;
    }
  }

  /**
   * Mask phone number for logging
   */
  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
  }
}

// Export singleton instance
export const authService = new AuthService();
