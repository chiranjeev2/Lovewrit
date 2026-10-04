import type { Metadata } from "next";
import { db } from "@/lib/db";

interface LayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const order = await db.order.findUnique({
      where: { slug },
      include: { pageData: true, cardData: true },
    });

    if (!order) {
      return { title: "Keepsake" };
    }

    const recipientName =
      order.pageData?.recipientName || order.cardData?.recipientName || "Loved One";
    const occasion =
      order.pageData?.occasion || order.cardData?.occasion || "";
    const isMemorial =
      occasion === "memorial" ||
      occasion === "tribute" ||
      order.templateId === "in-loving-memory";

    if (isMemorial) {
      const title = `In Loving Memory of ${recipientName}`;
      return {
        title,
        description: `A sacred tribute in quiet remembrance of ${recipientName}.`,
        openGraph: {
          title,
          description: `A sacred tribute in quiet remembrance of ${recipientName}.`,
          siteName: "",
        },
        twitter: {
          card: "summary",
          title,
          description: `A sacred tribute in quiet remembrance of ${recipientName}.`,
        },
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${recipientName} • A Special Story | Lovewrit`;
    return {
      title,
      description: `A special interactive keepsake story handcrafted for ${recipientName}.`,
      openGraph: {
        title,
        description: `A special interactive keepsake story handcrafted for ${recipientName}.`,
        siteName: "Lovewrit",
      },
    };
  } catch {
    return { title: "Keepsake" };
  }
}

export default function KeepsakeLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
