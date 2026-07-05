// Pure money helpers — safe to import in both client and server code.
// Money is stored everywhere as integer paise to avoid float errors.

/** Format integer paise as a rupee string, e.g. 34900 -> "₹349". */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  const isWhole = Number.isInteger(rupees);
  return (
    "₹" +
    rupees.toLocaleString("en-IN", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}
