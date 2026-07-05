// Build a standard UPI deep link. When encoded into a QR and scanned by any
// UPI app (GPay, PhonePe, Paytm…), it opens a payment to `upiId` with the
// exact amount pre-filled, so the guest can't pay less than the bill.
//
// Format: upi://pay?pa=<vpa>&pn=<payee name>&am=<amount>&cu=INR&tn=<note>
export function buildUpiUri(
  upiId: string,
  payeeName: string,
  amountPaise: number,
  note: string
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: (amountPaise / 100).toFixed(2), // rupees, 2 decimals
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}
