import { Order, OrderItem } from "@/types";
import { supabase } from "@/lib/supabase";

export const orderService = {
  async placeOrder(data: { 
    addressId: string; 
    paymentMethod: string; 
    notes?: string;
    items: any[];
    subtotal: number;
    shipping: number;
    total: number;
    address: any;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Must be logged in to place order");

    // 1. Insert Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        status: 'PENDING',
        subtotal: data.subtotal,
        shipping_charge: data.shipping,
        total: data.total,
        payment_method: data.paymentMethod,
        payment_status: 'PENDING',
        address: data.address,
        notes: data.notes
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Order Items
    const orderItems = data.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      vendor_id: item.product.vendor?.id || null,
      title: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to insert order items", itemsError);
      // In a real production app, we would rollback the order here or use a database function
    }

    return order as any;
  },

  async createPaymentIntent() {
    console.log("Mock createPaymentIntent");
    return { razorpayOrder: {} };
  },

  async verifyAndCreateOrder(data: any) {
    console.log("Mock verifyAndCreateOrder", data);
    return {} as Order;
  },

  async getMyOrders(params = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { status: "error", orders: [], total: 0, pages: 1 };

    const { data, error, count } = await supabase
      .from('orders')
      .select('*, items:order_items(*)', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to fetch orders: ${error.message || JSON.stringify(error)}`, error);
      return { status: "error", orders: [], total: 0, pages: 1 };
    }

    // Map the Supabase order data to the UI format
    const formattedOrders = data.map((order: any) => ({
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingCharge: Number(order.shipping_charge),
      total: Number(order.total),
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      address: order.address,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        vendorId: item.vendor_id,
        title: item.title,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total),
        // Product image could be joined, but we'll mock or leave blank for now as the dashboard handles it
      }))
    }));

    return { status: "success", orders: formattedOrders, total: count || 0, pages: 1 };
  },

  async getOrder(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) throw error;

    return {
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingCharge: Number(order.shipping_charge),
      total: Number(order.total),
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      address: order.address,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        vendorId: item.vendor_id,
        title: item.title,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total),
      }))
    };
  },

  async cancelOrder(id: string) {
    return {} as Order;
  },
};
