export type DeliveryMode = "inbox" | "email" | "both";

export type FormDelivery = {
  hidden?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  delivery?: DeliveryMode;
  errorMessage?: string;
};

export function deliveryOf(value: string | undefined): DeliveryMode {
  return value === "inbox" || value === "email" ? value : "both";
}
