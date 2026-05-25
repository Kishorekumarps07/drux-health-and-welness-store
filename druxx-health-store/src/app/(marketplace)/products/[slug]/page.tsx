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
    return {
      title: `${product.name} | Druxx Health Store`,
      description: product.shortDescription,
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

    return (
      <ProductView 
        product={product} 
        related={related} 
        reviews={reviews} 
      />
    );
  } catch (error) {
    console.error("Error loading product page:", error);
    notFound();
  }
}
