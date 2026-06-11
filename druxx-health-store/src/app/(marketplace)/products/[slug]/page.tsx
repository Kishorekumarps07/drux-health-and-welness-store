import { notFound } from "next/navigation";
import { productService } from "@/services/productService";
import { ProductView } from "@/components/products/ProductView";

export const dynamic = "force-dynamic";
export const revalidate = 0;
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const product = await productService.getProductBySlug(slug);
    const primaryImage = product.images?.[0] || "https://drux.in/placeholder.png";
    const description = product.shortDescription || product.description?.substring(0, 160) || `Buy ${product.name} from Druxx Health Store`;
    const url = `https://drux.in/products/${slug}`;

    return {
      title: `${product.name} | Druxx Health Store`,
      description,
      openGraph: {
        type: "website",
        url,
        title: `${product.name} — ₹${product.price.toLocaleString("en-IN")} | Druxx Health Store`,
        description,
        images: [
          {
            url: primaryImage,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        siteName: "Druxx Health Store",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Druxx Health Store`,
        description,
        images: [primaryImage],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    // Fetch data in parallel on the server
    const product = await productService.getProductBySlug(slug);
    
    if (!product) notFound();

    const [relatedRes] = await Promise.all([
      productService.getAllProducts({
        categoryId: product.categoryId,
        limit: 5
      })
    ]);
    
    const reviews = product.reviews || [];

    const related = relatedRes.products.filter((p: any) => p.id !== product.id).slice(0, 4);

    // Build Schema.org Product JSON-LD structured data
    const primaryImage = product.images?.[0] || "https://drux.in/placeholder.png";
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription || product.description || "",
      image: product.images?.length > 0 ? product.images : [primaryImage],
      sku: product.sku,
      brand: {
        "@type": "Brand",
        name: product.vendor?.name || "Druxx Health Store",
      },
      offers: {
        "@type": "Offer",
        url: `https://drux.in/products/${slug}`,
        priceCurrency: "INR",
        price: product.price,
        priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: product.vendor?.name || "Druxx Health Store",
        },
      },
      ...(reviews.length > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.reviewCount,
          bestRating: "5",
          worstRating: "1",
        },
      }),
    };

    return (
      <>
        {/* Schema.org Product JSON-LD for Google Shopping + rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <ProductView 
          product={product} 
          related={related} 
          reviews={reviews} 
        />
      </>
    );
  } catch (error) {
    console.error("Error loading product page:", error);
    notFound();
  }
}

