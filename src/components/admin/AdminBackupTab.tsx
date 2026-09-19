import React, { useRef } from 'react';
import { Download, Upload, Trash2, RefreshCw, AlertTriangle, CheckCircle2, Database } from 'lucide-react';
import { Product, StoreCategory, OutfitBundle, CustomerOrder } from '../../types';
import { deleteAllOrdersFromFirestore, clearAllDummyCatalogDataFromFirestore } from '../../firebase/db';

interface AdminBackupTabProps {
  products: Product[];
  categories: StoreCategory[];
  bundles: OutfitBundle[];
  orders: CustomerOrder[];
  onSaveProducts: (products: Product[]) => void;
  onSaveCategories: (categories: StoreCategory[]) => void;
  onSaveBundles: (bundles: OutfitBundle[]) => void;
  onUpdateOrders: (orders: CustomerOrder[]) => void;
  onResetDefaults: () => void;
  isArabic: boolean;
  onNotify: (msg: string) => void;
}

export const AdminBackupTab: React.FC<AdminBackupTabProps> = ({
  products,
  categories,
  bundles,
  orders,
  onSaveProducts,
  onSaveCategories,
  onSaveBundles,
  onUpdateOrders,
  onResetDefaults,
  isArabic,
  onNotify
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      store: 'SOTRA E-COMMERCE',
      version: '1.0',
      products,
      categories,
      bundles,
      orders
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sotra_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onNotify(isArabic ? 'تم تنزيل ملف النسخة الاحتياطية بنجاح' : 'Backup downloaded successfully');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (data.products && Array.isArray(data.products)) {
          onSaveProducts(data.products);
        }
        if (data.categories && Array.isArray(data.categories)) {
          onSaveCategories(data.categories);
        }
        if (data.bundles && Array.isArray(data.bundles)) {
          onSaveBundles(data.bundles);
        }
        if (data.orders && Array.isArray(data.orders)) {
          onUpdateOrders(data.orders);
        }

        onNotify(isArabic ? 'تم استرجاع النسخة الاحتياطية ومزامنتها بنجاح' : 'Backup restored successfully');
      } catch (err) {
        console.error('Failed to parse backup:', err);
        alert(isArabic ? 'خطأ في قراءة ملف النسخة الاحتياطية' : 'Invalid backup JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteCancelledOrders = async () => {
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled');
    if (cancelledOrders.length === 0) {
      alert(isArabic ? 'لا توجد طلبات ملغية لحذفها' : 'No cancelled orders to delete');
      return;
    }

    if (
      window.confirm(
        isArabic
          ? `هل أنت متأكد من حذف ${cancelledOrders.length} طلب ملغي نهائياً من قاعدة البيانات؟`
          : `Permanently delete ${cancelledOrders.length} cancelled orders?`
      )
    ) {
      const ids = cancelledOrders.map((o) => o.orderId);
      await deleteAllOrdersFromFirestore(ids);
      onUpdateOrders(orders.filter((o) => o.status !== 'cancelled'));
      onNotify(isArabic ? 'تم حذف الطلبات الملغية بنجاح' : 'Cancelled orders deleted');
    }
  };

  const handleClearDemoData = async () => {
    if (
      window.confirm(
        isArabic
          ? 'تحذير هام: سيتم تصفير الموقع بالكامل وحذف جميع المنتجات، الأطقم، والطلبات نهائياً من قاعدة بيانات فايربيس (Firestore). هل تريد المتابعة بالتصفير؟'
          : 'Warning: This will completely zero out the store and delete all products, bundles, and orders from Firestore. Proceed?'
      )
    ) {
      await clearAllDummyCatalogDataFromFirestore();
      onSaveProducts([]);
      onSaveBundles([]);
      onUpdateOrders([]);
      try {
        localStorage.removeItem('sotra_products_data');
        localStorage.removeItem('sotra_bundles_data');
        localStorage.removeItem('sotra_customer_orders');
        localStorage.removeItem('sotra_cart');
      } catch (e) {
        console.error(e);
      }
      onNotify(isArabic ? 'تم تصفير الموقع وحذف البيانات من فايربيس بنجاح' : 'Store successfully zeroed out in Firebase');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h3 className="text-base font-black uppercase tracking-wider text-neutral-950 font-heading">
          {isArabic ? 'النسخ الاحتياطي، الاسترجاع وتنظيف البيانات' : 'Backup, Restore & Maintenance'}
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          {isArabic
            ? 'تصدير نسخة كاملة من الكتالوج والطلبات كملف JSON واسترجاعها في أي وقت'
            : 'Export and import complete database snapshots and perform maintenance'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Card */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
            <Download className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-neutral-900">
            {isArabic ? 'تصدير نسخة احتياطية (Export Backup)' : 'Export JSON Backup'}
          </h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {isArabic
              ? 'تنزيل ملف يحتوي على كافة المنتجات، المقاسات، الألوان، الأطقم والطلبات الحالية.'
              : 'Download a full snapshot containing all products, colors, sizes, bundles, and orders.'}
          </p>
          <button
            type="button"
            onClick={handleExportBackup}
            className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{isArabic ? 'تنزيل النسخة الاحتياطية الآن' : 'Download Backup JSON'}</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-neutral-900">
            {isArabic ? 'استرجاع نسخة احتياطية (Restore Backup)' : 'Restore from Backup'}
          </h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {isArabic
              ? 'رفع ملف JSON تم تصديره مسبقاً لاستعادة كافة البيانات إلى فايربيس.'
              : 'Upload a previously saved JSON file to restore and sync data to Firestore.'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-black text-white font-bold text-xs rounded transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>{isArabic ? 'اختيار ملف الاسترجاع' : 'Select Backup File'}</span>
          </button>
        </div>
      </div>

      {/* Maintenance & Purge Card */}
      <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <h4 className="text-sm font-black uppercase tracking-wider text-neutral-900">
          {isArabic ? 'عمليات الصيانة وإدارة قاعدة البيانات' : 'Database Maintenance Operations'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Delete Cancelled Orders Only */}
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 space-y-2">
            <h5 className="text-xs font-bold text-neutral-800">
              {isArabic ? 'حذف الطلبات الملغية فقط' : 'Delete Cancelled Orders'}
            </h5>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              {isArabic
                ? 'تنظيف قاعدة البيانات وحذف الطلبات التي حالتها (ملغي) نهائياً مع إبقاء باقي الطلبات.'
                : 'Safely purge orders marked as cancelled from Firestore while keeping all active records.'}
            </p>
            <button
              type="button"
              onClick={handleDeleteCancelledOrders}
              className="px-3 py-1.5 bg-neutral-200 hover:bg-red-50 text-neutral-800 hover:text-red-700 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حذف الطلبات الملغية' : 'Delete Cancelled Orders'}</span>
            </button>
          </div>

          {/* Clear Demo Data */}
          <div className="p-4 border border-red-200 rounded-lg bg-red-50/40 space-y-2">
            <h5 className="text-xs font-bold text-red-800">
              {isArabic ? 'تفريغ البيانات التجريبية القديمة' : 'Clear Demo Catalog Data'}
            </h5>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              {isArabic
                ? 'حذف المنتجات والأطقم التجريبية من أجل تهيئة المتجر للمنتجات الفعلية.'
                : 'Clear initial mock catalog items to prepare for your live products.'}
            </p>
            <button
              type="button"
              onClick={handleClearDemoData}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تفريغ الكتالوج التجريبي' : 'Purge Demo Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
