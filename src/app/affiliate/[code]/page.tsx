"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import FooterMini from "@/components/FooterMini";
import Link from "next/link";

export default function AffiliateLandingPage() {
  const { code } = useParams<{ code: string }>();
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  useEffect(() => {
    if (!code) return;
    // Track the affiliate click on the server
    fetch(`${API_BASE}/affiliate/track/${code}`).catch(() => {});
    // Persist code in sessionStorage for website checkout
    sessionStorage.setItem("affiliateCode", code);
  }, [code]);

  // Called when user taps "Open App" (requires user gesture — works on iOS)
  const openInApp = () => {
    const deepLink = `vendorspot://affiliate/${code}`;
    const start = Date.now();
    window.location.href = deepLink;
    setTimeout(() => {
      // If we're still here after 1.5s the app isn't installed
      if (Date.now() - start < 2000) {
        setAppInstalled(false);
      }
    }, 1500);
  };

  const downloadApp = async () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const platform  = isAndroid ? 'android' : 'ios';

    // 1. Server-side deferred deep link — survives clipboard being cleared.
    //    Backend pairs this IP + signals with the affiliate code; the app
    //    calls /resolve on first launch to retrieve it.
    try {
      await fetch(`${API_BASE}/deferred-link/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateCode: code,
          platform,
          timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
          language:  navigator.language,
        }),
      });
    } catch {
      // non-blocking — proceed even if the request fails
    }

    // 2. Clipboard as a fast secondary fallback (best-effort)
    try {
      await navigator.clipboard.writeText(`vendorspot://affiliate/${code}`);
    } catch {
      // clipboard unavailable — safe to ignore
    }

    window.location.href = isAndroid
      ? "https://play.google.com/store/apps/details?id=com.vendorspot.app"
      : "https://apps.apple.com/ng/app/vendorspot-thespot/id6761906107";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <img src="/VLogo.svg" alt="Vendorspot" className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;ve been invited!</h1>
          <p className="text-gray-500 mb-6">
            Someone shared a Vendorspot link with you. Shop thousands of products and earn rewards.
          </p>

          {/* Affiliate code display */}
          <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-gray-500 mb-1">Referral Code</p>
            <p className="text-lg font-bold text-[#CC3366] tracking-widest">{code}</p>
          </div>

          {appInstalled === false ? (
            // App isn't installed — show download CTA
            <>
              <button
                onClick={downloadApp}
                className="w-full bg-[#CC3366] text-white font-bold py-4 rounded-2xl mb-3 text-base"
              >
                Download the App
              </button>
              <p className="text-xs text-gray-400 mb-4">
                Your referral code will be applied automatically when you open the app after installing.
              </p>
            </>
          ) : (
            // Default: try opening the app first
            <>
              <button
                onClick={openInApp}
                className="w-full bg-[#CC3366] text-white font-bold py-4 rounded-2xl mb-3 text-base"
              >
                Open in App
              </button>
              <button
                onClick={downloadApp}
                className="w-full border-2 border-[#CC3366] text-[#CC3366] font-bold py-3 rounded-2xl mb-3 text-base"
              >
                Download the App
              </button>
            </>
          )}

          <Link
            href={`/products?ref=${code}`}
            className="block w-full text-sm text-gray-400 underline py-2"
          >
            Continue on Website
          </Link>

          <p className="text-xs text-gray-400 mt-4">
            The referral code will be automatically applied at checkout.
          </p>
        </div>
      </main>
      <FooterMini />
    </>
  );
}
