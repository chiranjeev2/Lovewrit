import { MetadataRoute } from "next";

/**
 * Robots.txt configuration for staging / pre-domain deployment.
 * Strictly disallows all search engine crawlers until real custom domain is connected in Phase C2.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
