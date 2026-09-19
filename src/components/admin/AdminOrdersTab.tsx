import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  Phone,
  Calendar,
  AlertCircle,
  ArrowRight,
  Filter,
  DollarSign,
  UserCheck,
  RefreshCw,
  Check
} from 'lucide-react';
import { CustomerOrder, OrderStatusType, Product } from '../../types';
import { getAcknowledgedOrderIds, markOrdersAsAcknowledged, orderAlarm } from '../../utils/audioAlarm';

interface AdminOrdersTabProps {
  orders: CustomerOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatusType) => void;
  onDeleteOrder?: (orderId: string) => void;
  isArabic: boolean;
  products: Product[];
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  isArabic
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [archivePeriod, setArchivePeriod] = useState<
    'all' | 'today' | 'yesterday' | '7days' | 'month'
  >('all');
  const [acknowledgedList, setAcknowledgedList] = useState<string[]>(() => getAcknowledgedOrderIds());

  useEffect(() => {
    const handleSync = () => {
      setAcknowledgedList(getAcknowledgedOrderIds());
    };
    window.addEventListener('sotra_orders_acknowledged', handleSync);
    return () => {
      window.removeEventListener('sotra_orders_acknowledged', handleSync);
    };
  }, []);

  useEffect(() => {
    const acks = getAcknowledgedOrderIds();
    setAcknowledgedList(acks);

    // If there are any unacknowledged active orders, start alarm sound
    const hasUnacked = orders.some(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled' && !acks.includes(o.orderId)
    );
    if (hasUnacked) {
      orderAlarm.start();
    } else {
      orderAlarm.stop();
    }
  }, [orders]);

  const handleAcknowledgeOrder = (orderId: string) => {
    markOrdersAsAcknowledged([orderId]);
    setAcknowledgedList(getAcknowledgedOrderIds());
  };

  const handleAcknowledgeAll = () => {
    const unacked = orders.map((o) => o.orderId);
    markOrdersAsAcknowledged(unacked);
    setAcknowledgedList(getAcknowledgedOrderIds());
  };

  // Filter Active vs Delivered Orders
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered');
  }, [orders]);

  const archivedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'delivered');
  }, [orders]);

  // Date helpers for archive filtering
  const matchesPeriod = (dateStr: string, period: string) => {
    if (period === 'all') return true;
    const orderDate = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (isNaN(orderDate.getTime())) return true; // fallback

    const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
    const diffDays = Math.floor((today.getTime() - orderDay.getTime()) / (1000 * 3600 * 24));

    if (period === 'today') return diffDays === 0;
    if (period === 'yesterday') return diffDays === 1;
    if (period === '7days') return diffDays >= 0 && diffDays <= 7;
    if (period === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  // Filter list based on subTab, search query, status, and period
  const displayedOrders = useMemo(() => {
    const list = activeSubTab === 'active' ? activeOrders : archivedOrders;
    const q = searchQuery.trim().toLowerCase();

    return list.filter((order) => {
      // Search
      if (q) {
        const matchesId = order.orderId.toLowerCase().includes(q);
        const matchesName = order.customer.name.toLowerCase().includes(q);
        const matchesPhone = order.customer.phone.includes(q);
        const matchesGov = order.customer.governorate.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesGov) return false;
      }

      // Status filter in active tab
      if (activeSubTab === 'active' && statusFilter !== 'all') {
        if (order.status !== statusFilter) return false;
      }

      // Archive period filter
      if (activeSubTab === 'archive' && archivePeriod !== 'all') {
        if (!matchesPeriod(order.deliveredAt || order.date, archivePeriod)) return false;
      }

      return true;
    });
  }, [activeSubTab, activeOrders, archivedOrders, searchQuery, statusFilter, archivePeriod]);

  // Archive statistics
  const archiveStats = useMemo(() => {
    const totalRev = archivedOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = archivedOrders.length > 0 ? Math.round(totalRev / archivedOrders.length) : 0;
    return {
      count: archivedOrders.length,
      totalRevenue: totalRev,
      averageOrder: avgOrder
    };
  }, [archivedOrders]);

  // Order Counts by Status for Dropdown
  const statusCounts = useMemo(() => {
    return {
      all: activeOrders.length,
      received: activeOrders.filter((o) => o.status === 'received').length,
      shipping_paid: activeOrders.filter((o) => o.status === 'shipping_paid').length,
      courier: activeOrders.filter((o) => o.status === 'courier').length,
      cancelled: activeOrders.filter((o) => o.status === 'cancelled').length
    };
  }, [activeOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'تم استلام الطلب' : 'Order Received'}
          </span>
        );
      case 'shipping_paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <CheckCircle2 className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'تاكيد دفع الشحن' : 'Shipping Paid (Stock Deducted)'}
          </span>
        );
      case 'courier':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'الطلب بشركة الشحن' : 'With Courier'}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'تم التوصيل' : 'Delivered'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'ملغي' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  const unacknowledgedOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled' && !acknowledgedList.includes(o.orderId));
  }, [orders, acknowledgedList]);

  return (
    <div className="space-y-5">
      {/* Repeating Audio Alert Banner */}
      {unacknowledgedOrders.length > 0 && (
        <div className="bg-red-600 text-white p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-red-700 animate-pulse">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse font-bold text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="block font-black text-sm">
                {isArabic
                  ? `🔔 طلبات جديدة بحاجة للمعاينة (${unacknowledgedOrders.length})`
                  : `🔔 New Orders Pending Attention (${unacknowledgedOrders.length})`}
              </span>
              <span className="text-[11px] text-red-100 font-normal">
                {isArabic
                  ? 'يصدر رنين مستمر لا يتوقف إلا بالضغط على "استلام الطلب".'
                  : 'Continuous ringtone is active until order is received.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            className="px-4 py-2 bg-white text-red-700 hover:bg-neutral-100 font-black text-xs rounded transition shadow cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isArabic ? 'استلام جميع الطلبات (إيقاف النغمة)' : 'Receive All Orders (Stop Alarm)'}</span>
          </button>
        </div>
      )}
      {/* Top Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-wider text-neutral-950 font-heading">
            {isArabic ? 'إدارة الطلبات وحالات الشحن والأرشيف' : 'Orders, Shipping Status & Archive'}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isArabic
              ? 'متابعة الطلبات وتحديث حالات الشحن وتأكيد الدفع وخصم المخزون التلقائي'
              : 'Manage customer orders, track fulfillment states, and sync inventory.'}
          </p>
        </div>

        {/* Sub-tabs: Active vs Archive */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('active')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 rtl:space-x-reverse ${
              activeSubTab === 'active'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isArabic ? `الطلبات النشطة (${activeOrders.length})` : `Active (${activeOrders.length})`}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('archive')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 rtl:space-x-reverse ${
              activeSubTab === 'archive'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isArabic ? `الأرشيف (${archivedOrders.length})` : `Archive (${archivedOrders.length})`}</span>
          </button>
        </div>
      </div>

      {/* Archive Summary Cards (only in archive mode) */}
      {activeSubTab === 'archive' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="p-3 bg-white rounded border border-neutral-200">
            <span className="text-[11px] font-bold text-neutral-500 uppercase block">
              {isArabic ? 'إجمالي الطلبات المسلمة' : 'Delivered Orders'}
            </span>
            <span className="text-xl font-black text-black">{archiveStats.count}</span>
          </div>
          <div className="p-3 bg-white rounded border border-neutral-200">
            <span className="text-[11px] font-bold text-neutral-500 uppercase block">
              {isArabic ? 'إجمالي مبيعات الأرشيف' : 'Archived Sales'}
            </span>
            <span className="text-xl font-black text-green-700">{archiveStats.totalRevenue.toLocaleString()} ج.م</span>
          </div>
          <div className="p-3 bg-white rounded border border-neutral-200">
            <span className="text-[11px] font-bold text-neutral-500 uppercase block">
              {isArabic ? 'متوسط قيمة الطلب' : 'Average Order Value'}
            </span>
            <span className="text-xl font-black text-black">{archiveStats.averageOrder.toLocaleString()} ج.م</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={
              isArabic
                ? 'بحث برقم الطلب، اسم العميل، الهاتف، أو المحافظة...'
                : 'Search by Order #, Customer, Phone, Governorate...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:outline-none focus:border-black"
          />
        </div>

        {/* Status filter in Active subTab */}
        {activeSubTab === 'active' ? (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold cursor-pointer"
          >
            <option value="all">
              {isArabic ? `جميع الحالات (${statusCounts.all})` : `All Statuses (${statusCounts.all})`}
            </option>
            <option value="received">
              {isArabic ? `تم استلام الطلب (${statusCounts.received})` : `Received (${statusCounts.received})`}
            </option>
            <option value="shipping_paid">
              {isArabic ? `تأكيد دفع الشحن (${statusCounts.shipping_paid})` : `Shipping Paid (${statusCounts.shipping_paid})`}
            </option>
            <option value="courier">
              {isArabic ? `الطلب بشركة الشحن (${statusCounts.courier})` : `With Courier (${statusCounts.courier})`}
            </option>
            <option value="cancelled">
              {isArabic ? `ملغي (${statusCounts.cancelled})` : `Cancelled (${statusCounts.cancelled})`}
            </option>
          </select>
        ) : (
          /* Period filter in Archive subTab */
          <select
            value={archivePeriod}
            onChange={(e) => setArchivePeriod(e.target.value as any)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold cursor-pointer"
          >
            <option value="all">{isArabic ? 'كل الفترات (All Time)' : 'All Time'}</option>
            <option value="today">{isArabic ? 'اليوم (Today)' : 'Today'}</option>
            <option value="yesterday">{isArabic ? 'أمس (Yesterday)' : 'Yesterday'}</option>
            <option value="7days">{isArabic ? 'آخر 7 أيام (Last 7 Days)' : 'Last 7 Days'}</option>
            <option value="month">{isArabic ? 'هذا الشهر (This Month)' : 'This Month'}</option>
          </select>
        )}
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-lg p-8">
          <Package className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-neutral-700">
            {isArabic ? 'لا توجد طلبات تطابق معايير البحث' : 'No orders found matching criteria'}
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            {activeSubTab === 'active'
              ? isArabic
                ? 'ستظهر هنا طلبات العملاء الجديدة فور إتمام عملية الشراء'
                : 'New customer orders will appear here once submitted'
              : isArabic
              ? 'الطلبات المكتملة والموصلة تظهر في الأرشيف'
              : 'Delivered orders will appear in the archive'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const hasDeducted = !!order.stockDeducted;
            return (
              <div
                key={order.orderId}
                className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs hover:border-neutral-400 transition space-y-3"
              >
                {/* Header Row: ID, Date, Status, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <span className="font-mono font-black text-sm bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                      #{order.orderId}
                    </span>
                    <span className="text-xs text-neutral-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1 text-neutral-400" />
                      {order.date}
                    </span>
                    {hasDeducted && (
                      <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">
                        {isArabic ? 'المخزون مخصوم ✓' : 'Stock Deducted ✓'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    {!acknowledgedList.includes(order.orderId) && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeOrder(order.orderId)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded shadow transition flex items-center space-x-1 rtl:space-x-reverse cursor-pointer animate-pulse"
                        title={isArabic ? 'إيقاف التنبيه الصوتي وتأكيد الرؤية' : 'Acknowledge order and stop alert'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'استلام الطلب' : 'Receive Order'}</span>
                      </button>
                    )}
                    {getStatusBadge(order.status)}
                    <span className="font-black text-sm text-neutral-950 font-heading">
                      {order.total} ج.م
                    </span>
                  </div>
                </div>

                {/* Customer Details & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
                  <div className="space-y-1">
                    <div className="font-bold text-neutral-900 flex items-center space-x-1 rtl:space-x-reverse">
                      <span>👤 {order.customer.name}</span>
                    </div>
                    <div className="text-neutral-600 flex items-center space-x-2 rtl:space-x-reverse">
                      <span>📞 {order.customer.phone}</span>
                      {order.customer.whatsapp && order.customer.whatsapp !== order.customer.phone && (
                        <span>(واتساب: {order.customer.whatsapp})</span>
                      )}
                    </div>
                    <div className="text-neutral-600">
                      📍 <strong>{order.customer.governorate}</strong>: {order.customer.address}
                    </div>
                  </div>

                  <div className="space-y-1 md:border-l rtl:md:border-l-0 rtl:md:border-r border-neutral-200 md:pl-3 rtl:md:pl-0 rtl:md:pr-3">
                    <div className="text-neutral-700">
                      💳 طريقة الدفع: <strong>
                        {order.paymentMethod === 'vodafone_cash'
                          ? 'فودافون كاش'
                          : order.paymentMethod === 'instapay'
                          ? 'انستاباي INSTAPAY'
                          : 'الدفع عند الاستلام'}
                      </strong>
                    </div>
                    {order.senderPhone && (
                      <div className="text-neutral-700">
                        📱 رقم المحول منه: <strong className="font-mono">{order.senderPhone}</strong>
                      </div>
                    )}
                    {order.transactionRef && (
                      <div className="text-neutral-700">
                        🔢 رقم الحوالة / المرجع: <strong className="font-mono text-purple-700">{order.transactionRef}</strong>
                      </div>
                    )}
                    <div className="text-[11px] text-neutral-500">
                      رسوم الشحن: {order.shippingFee} ج.م • المنتجات: {order.subtotal} ج.م
                      {order.discount > 0 && ` (خصم: -${order.discount} ج.م)`}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    {isArabic ? `المنتجات المطلوبة (${order.items.length}):` : `Order Items (${order.items.length}):`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 rtl:space-x-reverse p-2 bg-white rounded border border-neutral-200 text-xs"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-12 object-cover bg-neutral-100 rounded shrink-0 border border-neutral-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-neutral-900 truncate">
                            {isArabic && item.nameAr ? item.nameAr : item.name}
                          </h5>
                          <div className="text-[10px] text-neutral-500 flex items-center space-x-1.5 rtl:space-x-reverse">
                            <span className="font-bold text-black">{item.size}</span>
                            <span>•</span>
                            <span>{item.colorName}</span>
                            <span>•</span>
                            <span className="font-bold text-neutral-800">العدد: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs shrink-0">
                          {item.price * item.quantity} ج.م
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Changer Actions & Inventory Control */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-700 mr-1 rtl:mr-0 rtl:ml-1">
                      {isArabic ? 'تغيير حالة الطلب:' : 'Update Status:'}
                    </span>

                    {/* Button 1: Received */}
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.orderId, 'received')}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer border ${
                        order.status === 'received'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {isArabic ? 'تم استلام الطلب' : 'Received'}
                    </button>

                    {/* Button 2: Shipping Paid (Stock Deduct) */}
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.orderId, 'shipping_paid')}
                      title={isArabic ? 'خصم الكميات من المخزون وتأكيد الشحن' : 'Deducts items from stock'}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer border ${
                        order.status === 'shipping_paid'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {isArabic ? 'تاكيد دفع الشحن' : 'Shipping Paid'}
                    </button>

                    {/* Button 3: With Courier */}
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.orderId, 'courier')}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer border ${
                        order.status === 'courier'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {isArabic ? 'الطلب بشركة الشحن' : 'With Courier'}
                    </button>

                    {/* Button 4: Delivered (Moves to Archive) */}
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.orderId, 'delivered')}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer border ${
                        order.status === 'delivered'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {isArabic ? 'تم التوصيل (نقل للأرشيف)' : 'Delivered'}
                    </button>

                    {/* Button 5: Cancelled (Restores Stock) */}
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.orderId, 'cancelled')}
                      title={isArabic ? 'إرجاع الكميات المخصومة إلى المخزون' : 'Restores stock if deducted'}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer border ${
                        order.status === 'cancelled'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                      }`}
                    >
                      {isArabic ? 'إلغاء الطلب (إرجاع المخزون)' : 'Cancel Order'}
                    </button>
                  </div>

                  {/* WhatsApp Quick Chat */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <a
                      href={`https://wa.me/${
                        order.customer.whatsapp.replace(/\D/g, '').startsWith('0')
                          ? `2${order.customer.whatsapp.replace(/\D/g, '')}`
                          : order.customer.whatsapp.replace(/\D/g, '')
                      }?text=${encodeURIComponent(
                        isArabic
                          ? `مرحباً ${order.customer.name}، بخصوص طلبك من سوترة رقم #${order.orderId}:`
                          : `Hello ${order.customer.name}, regarding your SOTRA order #${order.orderId}:`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition flex items-center space-x-1 rtl:space-x-reverse cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{isArabic ? 'مراسلة العميل واتساب' : 'WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
