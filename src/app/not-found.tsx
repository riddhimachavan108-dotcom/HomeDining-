import Link from "next/link";

export default function NotFound() {
  return (
    <div className="lp-notfound">
      <div className="lp-notfound-card">
        <div className="lp-notfound-icon">🛎️</div>
        <h1>Hotel not found</h1>
        <p>
          This link doesn&rsquo;t match any hotel on Home Dining. Please
          double-check the web address on your room card.
        </p>
        <Link href="/" className="lp-btn lp-btn-primary">
          Go to Home Dining
        </Link>
      </div>
    </div>
  );
}
