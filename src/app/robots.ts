import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/orders",
          "/cart",
          "/checkout",
          "/activate",
          "/verify-email",
          "/reset-password",
          "/forgot-password",
          "/delete-account",
          "/ambassador-dashboard",
        ],
      },
    ],
    sitemap: "https://vendorspotng.com/sitemap.xml",
  };
}
