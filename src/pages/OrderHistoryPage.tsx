import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../types';
import { useShop } from '../context/ShopContext';

export const OrderHistoryPage: React.FC = () => {
  const { orders } = useShop();
  const { orderId } = useParams<{ orderId?: string }>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const match = orders.find((o) => (o.orderId || o.id) === orderId);
      if (match) {
        setSelectedOrder(match);
        return;
      }
    }
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orderId, orders]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] bg-[#EBF5F0] px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            <Truck className="w-3.5 h-3.5" />
            In Transit (Shipped)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Processing at Dallas Studio
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="border-b border-[#F0E4E6] pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            Customer Portal
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
            Order History & Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fulfillment tracking from our Texas atelier to your USA doorstep.
          </p>
        </div>

        <Link
          to="/shop"
          className="text-xs font-semibold text-[#2D6A4F] hover:underline hidden sm:flex items-center gap-1"
        >
          <span>Browse New Collections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF0F2] text-[#2D6A4F] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#0F1E36]">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-500">
            Once you place an order with Mumtahina's Closet Inc, you'll be able to track every stage of dispatch here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Orders Listing Column */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#0F1E36] mb-2">
              Your Orders ({orders.length})
            </h3>

            <div className="space-y-3">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-[#2D6A4F] ring-1 ring-[#2D6A4F] shadow-sm'
                        : 'border-[#F0E4E6] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#0F1E36] block">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-slate-400">Placed {order.date}</span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Miniature item images */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#FAF0F2]">
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 3).map((it, idx) => (
                          <img
                            key={idx}
                            src={it.image}
                            alt={it.name}
                            className="w-10 h-12 rounded-lg object-cover border border-[#F0E4E6]"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-slate-400 font-semibold">
                            +{order.items.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Paid</span>
                        <strong className="text-sm text-[#0F1E36]">
                          ${order.total.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Order Column */}
          <div className="lg:col-span-6">
            {selectedOrder ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-6 sticky top-28">
                <div className="flex items-start justify-between pb-4 border-b border-[#F5EBED]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                      Active Order Inspector
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#0F1E36]">
                      {selectedOrder.id}
                    </h3>
                    <p className="text-xs text-slate-400">Placed on {selectedOrder.date}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-2 border border-[#EADBDE] hover:border-[#0F1E36] rounded-xl text-slate-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Print invoice receipt"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                </div>

                {/* Progress Visualizer */}
                <div className="p-4 rounded-xl bg-[#FAF7F6] border border-[#F0E4E6] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1">
                    <span className="text-slate-500">Carrier: {selectedOrder.carrier}</span>
                    <span className="text-[#2D6A4F] font-bold">
                      Est. Arrival: {selectedOrder.estimatedDelivery}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="relative pt-2">
                    <div className="h-1.5 bg-[#EADBDE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2D6A4F] rounded-full transition-all duration-700"
                        style={{
                          width:
                            selectedOrder.status === 'Delivered'
                              ? '100%'
                              : selectedOrder.status === 'Shipped'
                              ? '65%'
                              : '25%',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                      <span>Order Confirmed</span>
                      <span>Dispatched (Dallas)</span>
                      <span>Out for Delivery</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-[#EADBDE]/50">
                    <span className="text-slate-500">Tracking Code:</span>
                    <span className="font-mono font-bold text-[#0F1E36] flex items-center gap-1">
                      {selectedOrder.trackingNumber}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </div>

                {/* Garments in this Order */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#0F1E36] mb-3">
                    Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-3 divide-y divide-[#FAF0F2]">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[#0F1E36] truncate">{item.name}</p>
                            <p className="text-slate-400 text-[11px] truncate">
                              Size: {item.size} • Color: {item.color}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-[#0F1E36]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-slate-400 block text-[10px]">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="pt-3 border-t border-[#F5EBED] text-xs">
                  <h4 className="font-bold text-[#0F1E36] mb-1">USA Delivery Address:</h4>
                  <p className="text-slate-600">
                    {selectedOrder.shippingAddress.fullName}
                    <br />
                    {selectedOrder.shippingAddress.street} {selectedOrder.shippingAddress.apt}
                    <br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#F0E4E6] text-slate-400 text-xs">
                Select an order on the left to review shipping status.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
