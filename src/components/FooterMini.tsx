import Link from "next/link";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

const links = [
  { label: "Help",    href: "/help" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms",   href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function FooterMini() {
  return (
    <footer className="border-t border-gray-100 bg-white py-5 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <img src="/VLogo.svg" alt="Vendorspot" className="h-5 w-auto opacity-60 hover:opacity-100 transition-opacity" />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-5">
          {links.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: socials + copyright */}
        <div className="flex items-center gap-4">
          <a href="https://x.com/vendorsspot" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-600 transition-colors">
            <FaXTwitter size={14} />
          </a>
          <a href="https://www.instagram.com/vendorsspot" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-600 transition-colors">
            <FaInstagram size={14} />
          </a>
          <span className="text-xs text-gray-300">© {new Date().getFullYear()} Vendorspot</span>
        </div>
      </div>
    </footer>
  );
}
