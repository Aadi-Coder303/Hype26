import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import { shopifyFetch } from '@/lib/shopify';
import { getCustomerQuery } from '@/lib/shopify/queries/customer';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ArrowRight, Clock } from 'lucide-react';

export default async function OrdersPage() {
  const token = await getSession();

  if (!token) {
    redirect('/login');
  }

  const { body } = await shopifyFetch<any>({
    query: getCustomerQuery,
    variables: { customerAccessToken: token },
    cache: 'no-store'
  });

  const customer = body.data?.customer;

  if (!customer) {
    // Token might be invalid or expired
    redirect('/login');
  }

  const orders = customer.orders?.edges.map((edge: any) => edge.node) || [];

  return (
    <div className="container mx-auto px-4 py-12 min-h-[70vh]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-black dark:text-white mb-2">My Account</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-12">
          Welcome back, {customer.firstName}! Here is your order history.
        </p>

        {orders.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
            <Package size={48} className="mx-auto text-neutral-400 mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-black dark:text-white mb-4">No Orders Yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Discover our latest drops and exclusive collections.
            </p>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-900 p-6 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Order Placed</p>
                    <p className="font-medium text-black dark:text-white">
                      {new Date(order.processedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Total</p>
                    <p className="font-medium text-black dark:text-white">
                      {order.totalPrice.currencyCode} ${parseFloat(order.totalPrice.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Order #</p>
                    <p className="font-medium text-black dark:text-white">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
                      <Clock size={12} />
                      {order.fulfillmentStatus || 'Processing'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col gap-6">
                    {order.lineItems.edges.map((edge: any) => {
                      const item = edge.node;
                      return (
                        <div key={item.title} className="flex gap-4 items-center">
                          <div className="h-20 w-20 relative bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden shrink-0">
                            {item.variant?.image?.url ? (
                              <Image 
                                src={item.variant.image.url} 
                                alt={item.title} 
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-black dark:text-white mb-1">{item.title}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
