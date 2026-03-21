/**
 * WebSocket Service
 * Handles real-time order notifications and connection management.
 */

import { API_CONFIG } from '../config';
import type { WebSocketMessage } from '../types';

export class OrderWebSocketService {
  private socket: WebSocket | null = null;
  private onMessageCallback: ((data: WebSocketMessage) => void) | null = null;
  private retryLimit: number = 5;
  private currentRetries: number = 0;

  /**
   * Construct WebSocket URL from API_CONFIG BASE_URL
   */
  private getWebSocketUrl(merchantId: string) {
    // Expected to turn http://localhost:8000/api/v1 into ws://localhost:8000/ws/orders/ID
    // Or https://api.kartmithra.com/api/v1 into wss://api.kartmithra.com/ws/orders/ID
    const wsBaseUrl = API_CONFIG.BASE_URL.replace('http', 'ws').replace('/api/v1', '');
    return `${wsBaseUrl}/ws/orders/${merchantId}`;
  }

  connect(merchantId: string) {
    if (this.socket) {
      this.disconnect();
    }

    const url = this.getWebSocketUrl(merchantId);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.currentRetries = 0; // Reset retries on successful connection
    };

    this.socket.onmessage = (event) => {
      try {
        const payload: WebSocketMessage = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(payload);
        }
      } catch (error) {
        console.error('WebSocket payload parsing error:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.reconnect(merchantId);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  onMessage(callback: (data: WebSocketMessage) => void) {
    this.onMessageCallback = callback;
  }

  private reconnect(merchantId: string) {
    if (this.currentRetries < this.retryLimit) {
      this.currentRetries += 1;
      const timeout = Math.pow(2, this.currentRetries) * 1000;
      console.log(`Reconnecting WebSocket in ${timeout / 1000}s...`);
      setTimeout(() => this.connect(merchantId), timeout);
    } else {
      console.error('WebSocket reconnect limit reached. Connection permanently closed.');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const orderWebSocketService = new OrderWebSocketService();
