import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  isArabic
}) => {
  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms'>('tops');

  if (!isOpen) return null;

  const topsData = [
    { size: 'S', weight: '55 - 65 kg', height: '165 - 172 cm', chest: '96 - 100 cm' },
    { size: 'M', weight: '65 - 75 kg', height: '170 - 177 cm', chest: '100 - 106 cm' },
    { size: 'L', weight: '75 - 85 kg', height: '175 - 182 cm', chest: '106 - 112 cm' },
    { size: 'XL', weight: '85 - 95 kg', height: '178 - 186 cm', chest: '112 - 118 cm' },
    { size: 'XXL', weight: '95 - 108 kg', height: '180 - 190 cm', chest: '118 - 126 cm' },
    { size: '3XL', weight: '108 - 120 kg', height: '182 - 195 cm', chest: '126 - 134 cm' }
  ];

  const bottomsData = [
    { size: 'S', waist: '74 - 78 cm', hips: '92 - 96 cm', length: '98 cm' },
    { size: 'M', waist: '78 - 84 cm', hips: '96 - 102 cm', length: '100 cm' },
    { size: 'L', waist: '84 - 90 cm', hips: '102 - 108 cm', length: '102 cm' },
    { size: 'XL', waist: '90 - 98 cm', hips: '108 - 114 cm', length: '104 cm' },
    { size: 'XXL', waist: '98 - 106 cm', hips: '114 - 122 cm', length: '105 cm' },
    { size: '3XL', waist: '106 - 116 cm', hips: '122 - 130 cm', length: '106 cm' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-neutral-300" />
            <h3 className="font-bold text-sm sm:text-base">
              {isArabic ? 'دليل المقاسات المعتمد - SOTRA' : 'Official SOTRA Size Guide'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('tops')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'tops'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            {isArabic ? 'القمصان، التيشرتات والهوديز' : 'Tops, T-Shirts & Hoodies'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bottoms')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'bottoms'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            {isArabic ? 'البناطيل والشورتات' : 'Pants & Shorts'}
          </button>
        </div>

        {/* Size Table */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          {activeTab === 'tops' ? (
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-700 font-bold uppercase">
                  <th className="p-2.5 text-center">{isArabic ? 'المقاس' : 'Size'}</th>
                  <th className="p-2.5 text-center">{isArabic ? 'الوزن التقريبي' : 'Weight'}</th>
                  <th className="p-2.5 text-center">{isArabic ? 'الطول التقريبي' : 'Height'}</th>
                  <th className="p-2.5 text-center">{isArabic ? 'محيط الصدر' : 'Chest'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {topsData.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50 transition">
                    <td className="p-2.5 text-center font-black text-black">{row.size}</td>
                    <td className="p-2.5 text-center">{row.weight}</td>
                    <td className="p-2.5 text-center">{row.height}</td>
                    <td className="p-2.5 text-center">{row.chest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-700 font-bold uppercase">
                  <th className="p-2.5 text-center">{isArabic ? 'المقاس' : 'Size'}</th>
                  <th className="p-2.5 text-center">{isArabic ? 'محيط الخصر' : 'Waist'}</th>
                  <th className="p-2.5 text-center">{isArabic ? 'محيط الأرداف' : 'Hips'}</th>
                  <th className="p-2.5 text-center">{isArabic ? 'طول البنطلون' : 'Length'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {bottomsData.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50 transition">
                    <td className="p-2.5 text-center font-black text-black">{row.size}</td>
                    <td className="p-2.5 text-center">{row.waist}</td>
                    <td className="p-2.5 text-center">{row.hips}</td>
                    <td className="p-2.5 text-center">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4 p-3 bg-neutral-50 rounded text-[11px] text-neutral-500 leading-relaxed">
            {isArabic
              ? '💡 نصيحة: إذا كنت تفضل القصة الواسعة المريحة (Oversized Fit) أو بين مقاسين، ننصح باختيار المقاس الأكبر.'
              : '💡 Tip: For an oversized, relaxed drape or if between two sizes, we recommend sizing up.'}
          </div>
        </div>
      </div>
    </div>
  );
};
