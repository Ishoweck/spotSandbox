// Shared chrome for the /pay/[code] pages (link page and payment receipt).
import Link from "next/link";
import { FiLock } from "react-icons/fi";

export const naira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Paystack passes its local-card fee on to the customer on this account:
// 1.5% + N100 (the N100 is waived under N2,500), grossed up, capped at N2,000.
// Matches what Paystack adds on its own checkout page, to the kobo.
export function paystackFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const gross = amount < 2500 ? amount / 0.985 : (amount + 100) / 0.985;
  return Math.min(Math.ceil((gross - amount) * 100) / 100, 2000);
}

export function PayTopBar() {
  return (
    <header className="border-b border-gray-200/70 bg-white print:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/VLogo.svg" alt="Vendorspot" className="h-6 w-auto" />
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <FiLock size={12} /> Secure checkout
        </span>
      </div>
    </header>
  );
}

export function PayFooter() {
  return (
    <footer className="py-8 text-center text-xs text-gray-400 print:hidden">
      <p>
        Powered by <span className="font-medium text-gray-500">Vendorspot</span> · Payments processed by Paystack
      </p>
      <div className="mt-2 flex justify-center gap-4">
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
        <Link href="/help" className="hover:text-gray-600">Help</Link>
      </div>
    </footer>
  );
}

export function VendorAvatar({
  vendor,
  size,
}: {
  vendor: { businessName: string; logo?: string } | null | undefined;
  size: number;
}) {
  const name = vendor?.businessName || "Vendor";
  return vendor?.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={vendor.logo}
      alt={name}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full border border-gray-200 bg-white object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
