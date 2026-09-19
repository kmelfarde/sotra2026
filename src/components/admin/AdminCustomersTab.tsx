import React, { useState, useMemo } from 'react';
import { Users, Search, Phone, MapPin, ShoppingBag, ExternalLink, Calendar } from 'lucide-react';
import { CustomerOrder } from '../../types';

interface AdminCustomersTabProps {
  orders: CustomerOrder[];
  isArabic: boolean;
}

interface CustomerSummary {
  phone: string;
  name: string;
  governorate: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastOrderId: string;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({ orders, isArabic }) => {
  const [search, setSearch] = useState('');

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    for (const order of orders) {
      const phone = order.customer?.phone || order.senderPhone || 'unknown';
      const name = order.customer?.name || 'عميل';
      const gov = order.customer?.governorate || '';
      const addr = order.customer?.address || '';

      const existing = map.get(phone);
      if (!existing) {
        map.set(phone, {
          phone,
          name,
          governorate: gov,
          address: addr,
          orderCount: 1,
          totalSpent: order.total || 0,
          lastOrderDate: order.date || '',
          lastOrderId: order.orderId
        });
      } else {
        existing.orderCount += 1;
        existing.totalSpent += order.total || 0;
        if (order.date > existing.lastOrderDate) {
          existing.lastOrderDate = order.date;
          existing.lastOrderId = order.orderId;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.governorate.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-5">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-wider text-neutral-950 font-heading">
            {isArabic ? 'سجل وقاعدة بيانات العملاء' : 'Customer Registry & CRM'}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isArabic
              ? 'إحصائيات العملاء المسجلين من واقع الطلبات السابقة وسجل مشترياتهم'
              : 'Registered customer profiles aggregated from historical orders'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-neutral-100 rounded-md border border-neutral-200 text-xs font-bold text-neutral-700">
            {isArabic ? 'إجمالي العملاء:' : 'Total Customers:'}{' '}
            <span className="font-black text-black">{customers.length}</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isArabic ? 'بحث باسم العميل، رقم الهاتف أو المحافظة...' : 'Search by name, phone or governorate...'}
          className="w-full ps-9 pe-4 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-none focus:border-black transition"
        />
      </div>

      {/* Customers Table / Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-neutral-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-bold">
            {isArabic ? 'لا يوجد عملاء مسجلون حالياً' : 'No customer records found'}
          </p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase">
                  <th className="p-3 text-start">{isArabic ? 'العميل' : 'Customer'}</th>
                  <th className="p-3 text-start">{isArabic ? 'الهاتف والواتساب' : 'Phone / WhatsApp'}</th>
                  <th className="p-3 text-start">{isArabic ? 'المحافظة والعنوان' : 'Location'}</th>
                  <th className="p-3 text-center">{isArabic ? 'الطلبات' : 'Orders'}</th>
                  <th className="p-3 text-start">{isArabic ? 'إجمالي المشتريات' : 'Total Spent'}</th>
                  <th className="p-3 text-start">{isArabic ? 'آخر طلب' : 'Last Order'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {filtered.map((c) => {
                  const cleanPhone = c.phone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/20${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
                  return (
                    <tr key={c.phone} className="hover:bg-neutral-50/70 transition">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{c.name}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-neutral-700">{c.phone}</span>
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 hover:bg-green-50 text-green-600 rounded transition"
                              title="Chat on WhatsApp"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-neutral-900 font-bold">{c.governorate || '-'}</div>
                        {c.address && (
                          <div className="text-[11px] text-neutral-500 line-clamp-1">{c.address}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-neutral-100 rounded text-neutral-900 font-black">
                          {c.orderCount}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-black text-neutral-900">
                          {c.totalSpent.toLocaleString()} {isArabic ? 'ج.م' : 'EGP'}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-500 text-[11px]">
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
