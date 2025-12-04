export interface VanishMessage {
  id: string;
  text: string;
  created_at: string;
  viewed_at: string | null;
  deleted_at: string | null;
  expires_at: string;
  payment_status: 'free' | 'paid' | 'pending';
  transaction_ref: string | null;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}