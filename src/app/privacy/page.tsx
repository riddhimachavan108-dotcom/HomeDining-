import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Home Dining",
  description: "How Home Dining collects, uses and protects information.",
};

export default function PrivacyPage() {
  return (
    <div className="legal">
      <div className="legal-wrap">
        <Link href="/" className="legal-back">
          ← Back to Home Dining
        </Link>

        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 9 July 2026</p>

        <h2>1. Who we are</h2>
        <p>
          Home Dining (&ldquo;Home Dining&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a software platform operated by{" "}
          <strong>[your registered business / legal name]</strong>,{" "}
          <strong>[full business address, India]</strong>. Home Dining provides
          hotels with a branded online system that lets their in-house guests
          view a menu and place room-service orders from their own device.
        </p>
        <p>
          We are a technology provider only. We do <strong>not</strong> own,
          operate, cook for, or deliver on behalf of any restaurant or hotel, and
          we do <strong>not</strong> process, collect, hold, or transfer any
          payment for food. All payments are made directly by the guest to the
          hotel via the hotel&rsquo;s own UPI ID; Home Dining is not a party to
          that payment.
        </p>

        <h2>2. Our role under data-protection law</h2>
        <ul>
          <li>
            For information about our hotel customers&rsquo; accounts, Home Dining
            is the &ldquo;Data Fiduciary&rdquo; (data controller).
          </li>
          <li>
            For information about a hotel&rsquo;s guests and their orders, the
            hotel is the Data Fiduciary, and Home Dining acts only as a
            &ldquo;Data Processor&rdquo; that processes such data on the
            hotel&rsquo;s instructions to make the ordering system work. Each
            hotel is responsible for its own guests&rsquo; personal data and for
            its own privacy practices.
          </li>
        </ul>

        <h2>3. Information we collect</h2>
        <ul>
          <li>
            <strong>Hotel account information</strong> (from managers/staff):
            hotel name, logo, tagline, UPI ID, contact details you provide, and
            login credentials (passwords are stored only in encrypted/hashed form
            — we cannot read them).
          </li>
          <li>
            <strong>Guest order information</strong>: the room number entered by
            the guest, the items ordered, the order amount, and the date/time of
            the order.
          </li>
          <li>
            <strong>Technical information</strong>: standard server logs, IP
            address, browser/device type, and cookies strictly necessary to
            operate the site (for example, to keep a manager signed in and to
            remember a guest&rsquo;s cart on their own device).
          </li>
        </ul>
        <p>
          <strong>What we do not collect:</strong> we do not collect
          guests&rsquo; names, phone numbers, email addresses, or accounts; we do
          not collect or store any card numbers, bank details, or UPI transaction
          data (payments occur entirely within the guest&rsquo;s own UPI app); and
          we do not collect location (GPS), Aadhaar, PAN, or any government ID.
        </p>

        <h2>4. How we use information</h2>
        <p>
          We use the information above only to operate the ordering platform; show
          the correct hotel&rsquo;s menu and branding; route each order (with its
          room number) to the correct hotel for fulfilment; keep managers and
          staff securely signed in; maintain security and prevent misuse; comply
          with law; and improve and support the service. We do{" "}
          <strong>not</strong> sell your personal data or guests&rsquo; personal
          data, and we do not use it for third-party advertising.
        </p>

        <h2>5. Consent and legal basis</h2>
        <p>
          Where required, we process personal data on the basis of consent given
          through clear affirmative action (for example, a guest voluntarily
          entering a room number and placing an order), and for the legitimate
          operation of the service requested. You may withdraw consent at any time
          as described in Section 9; withdrawing consent may mean the service can
          no longer be provided.
        </p>

        <h2>6. How we share information</h2>
        <ul>
          <li>
            With the specific hotel the order belongs to (they see their own
            orders and room numbers to fulfil them). We never show one hotel
            another hotel&rsquo;s data.
          </li>
          <li>
            With trusted service providers who host our software on our behalf,
            under confidentiality obligations, namely our cloud hosting provider
            (Vercel Inc.) and our database provider (Neon Inc.). These providers
            act as our sub-processors and may not use the data for their own
            purposes.
          </li>
          <li>
            Where required by law, court order, or a lawful government request, or
            to protect our rights, safety, or property.
          </li>
        </ul>

        <h2>7. Where your data is stored (international transfer)</h2>
        <p>
          Our servers and database are currently hosted with providers whose
          facilities may be located outside India (for example, in Singapore
          and/or the United States). By using the service you acknowledge that
          your information may be stored and processed outside India, protected by
          reasonable safeguards and in accordance with applicable law.
        </p>

        <h2>8. How long we keep data</h2>
        <p>
          We keep order information only as long as needed for the hotel to fulfil
          and account for the order and for the hotel&rsquo;s reasonable
          record-keeping, after which it may be deleted or anonymised. Hotel
          account data is kept while the account is active. We delete or anonymise
          data when it is no longer needed or upon a valid request, unless we must
          keep it to comply with law.
        </p>

        <h2>9. Your rights</h2>
        <p>
          Subject to applicable law, you may: (a) ask what personal data we hold
          about you and access it; (b) ask us to correct or update it; (c) ask us
          to erase it; (d) withdraw consent; and (e) nominate another person to
          exercise your rights in the event of death or incapacity. Guests should
          usually contact their hotel directly (the hotel controls their order
          data); hotel account holders can contact us using Section 12. We will
          respond within the timelines required by law.
        </p>

        <h2>10. Data security</h2>
        <p>
          We use reasonable technical and organisational measures to protect
          personal data, including encryption of passwords, access controls, and
          secure hosting. No method of transmission or storage is 100% secure, and
          we cannot guarantee absolute security, but we work to protect your
          information and to notify affected parties and authorities of any
          personal-data breach as required by law.
        </p>

        <h2>11. Cookies</h2>
        <p>
          We use only cookies and local storage that are necessary to operate the
          site — to keep managers/staff signed in and to remember a guest&rsquo;s
          cart on their own device. We do not use third-party advertising or
          tracking cookies.
        </p>

        <h2>12. Grievance Officer / contact</h2>
        <p>
          In accordance with the Information Technology Act, 2000, the rules
          thereunder, and the Digital Personal Data Protection Act, 2023, our
          Grievance Officer is:
        </p>
        <p className="legal-contact">
          Name: <strong>[Grievance Officer name]</strong>
          <br />
          Email: <strong>riddhimachavan108@gmail.com</strong>
          <br />
          Address: <strong>[business address, India]</strong>
        </p>
        <p>
          We will acknowledge and address complaints within the timeframes
          prescribed by law. If you are not satisfied, you may complain to the
          Data Protection Board of India.
        </p>

        <h2>13. Children</h2>
        <p>
          The service is intended for use by adults (hotel guests, managers, and
          staff) and is not directed at children. We do not knowingly collect
          personal data of children.
        </p>

        <h2>14. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &ldquo;Last
          updated&rdquo; date shows when it last changed. Continued use of the
          service after changes means you accept the updated policy.
        </p>

        <h2>15. Hotels&rsquo; own policies</h2>
        <p>
          Each hotel using Home Dining is an independent business responsible for
          its own food, service, delivery, refunds, and its own privacy and legal
          compliance toward its guests. Home Dining is not responsible for the
          acts or omissions of any hotel.
        </p>

        <p className="legal-foot-note">
          By using Home Dining, you acknowledge that you have read and understood
          this Privacy Policy.
        </p>

        <Link href="/" className="legal-back">
          ← Back to Home Dining
        </Link>
      </div>
    </div>
  );
}
