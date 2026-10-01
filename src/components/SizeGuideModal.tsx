import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category = 'women',
}) => {
  const [activeTab, setActiveTab] = useState<'abaya' | 'dress' | 'hijab'>('abaya');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        id="sizeguide-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div
        id="sizeguide-modal-dialog"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 my-auto"
      >
        <div className="flex items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F0E4E6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-[#FAF0F2] text-[#2D6A4F] rounded-lg flex-shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base sm:text-xl font-bold text-[#0F1E36] truncate">
                Mumtahina’s Sizing & Modest Fit Guide
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Designed for tailored elegance and full modest coverage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex-shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Unit selector */}
        <div className="flex items-center justify-between mt-5 mb-4 flex-wrap gap-3">
          <div className="flex gap-1 p-1 bg-[#FAF7F6] rounded-xl border border-[#F0E4E6]">
            <button
              onClick={() => setActiveTab('abaya')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'abaya'
                  ? 'bg-white text-[#2D6A4F] shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Abaya Lengths
            </button>
            <button
              onClick={() => setActiveTab('dress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dress'
                  ? 'bg-white text-[#2D6A4F] shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Dresses & Tops
            </button>
            <button
              onClick={() => setActiveTab('hijab')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'hijab'
                  ? 'bg-white text-[#2D6A4F] shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Hijab & Wraps
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Unit:</span>
            <div className="flex rounded-md border border-[#E2D5D7] overflow-hidden">
              <button
                onClick={() => setUnit('in')}
                className={`px-2.5 py-1 ${unit === 'in' ? 'bg-[#2D6A4F] text-white' : 'bg-white text-slate-700'}`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 ${unit === 'cm' ? 'bg-[#2D6A4F] text-white' : 'bg-white text-slate-700'}`}
              >
                CM
              </button>
            </div>
          </div>
        </div>

        {/* Tables */}
        {activeTab === 'abaya' && (
          <div>
            <p className="text-xs text-slate-600 mb-3">
              Abaya size numbers correspond to the total length of the gown from top of the shoulder down to the hem. Choose based on your height and preferred shoe heel height.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#F0E4E6] rounded-lg">
                <thead className="bg-[#FAF7F6] text-[#0F1E36] font-semibold border-b border-[#F0E4E6]">
                  <tr>
                    <th className="p-2.5">Abaya Size</th>
                    <th className="p-2.5">Recommended Height</th>
                    <th className="p-2.5">Garment Length ({unit})</th>
                    <th className="p-2.5">Chest Width ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4E6] text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">52 (Petite)</td>
                    <td className="p-2.5">5'0" – 5'2" (152–158 cm)</td>
                    <td className="p-2.5">{unit === 'in' ? '52"' : '132 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '42"' : '107 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">54 (Regular)</td>
                    <td className="p-2.5">5'3" – 5'4" (160–163 cm)</td>
                    <td className="p-2.5">{unit === 'in' ? '54"' : '137 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '44"' : '112 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">56 (Medium)</td>
                    <td className="p-2.5">5'5" – 5'6" (165–168 cm)</td>
                    <td className="p-2.5">{unit === 'in' ? '56"' : '142 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '46"' : '117 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">58 (Tall)</td>
                    <td className="p-2.5">5'7" – 5'8" (170–173 cm)</td>
                    <td className="p-2.5">{unit === 'in' ? '58"' : '147 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '48"' : '122 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">60 (Extra Tall)</td>
                    <td className="p-2.5">5'9"+ (175+ cm)</td>
                    <td className="p-2.5">{unit === 'in' ? '60"' : '152 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '50"' : '127 cm'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dress' && (
          <div>
            <p className="text-xs text-slate-600 mb-3">
              Our modest dresses feature an intentionally relaxed, non-clingy cut through the hips and waist for maximum modesty and ease of movement.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#F0E4E6] rounded-lg">
                <thead className="bg-[#FAF7F6] text-[#0F1E36] font-semibold border-b border-[#F0E4E6]">
                  <tr>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">USA Standard</th>
                    <th className="p-2.5">Bust ({unit})</th>
                    <th className="p-2.5">Waist ({unit})</th>
                    <th className="p-2.5">Hips ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4E6] text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">XS</td>
                    <td className="p-2.5">0 – 2</td>
                    <td className="p-2.5">{unit === 'in' ? '32 - 34"' : '81 - 86 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '25 - 27"' : '63 - 68 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '35 - 37"' : '89 - 94 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">S</td>
                    <td className="p-2.5">4 – 6</td>
                    <td className="p-2.5">{unit === 'in' ? '35 - 36"' : '89 - 91 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '28 - 29"' : '71 - 74 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '38 - 39"' : '96 - 99 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">M</td>
                    <td className="p-2.5">8 – 10</td>
                    <td className="p-2.5">{unit === 'in' ? '37 - 39"' : '94 - 99 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '30 - 32"' : '76 - 81 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '40 - 42"' : '101 - 106 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">L</td>
                    <td className="p-2.5">12 – 14</td>
                    <td className="p-2.5">{unit === 'in' ? '40 - 42"' : '101 - 107 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '33 - 35"' : '84 - 89 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '43 - 45"' : '109 - 114 cm'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#2D6A4F]">XL</td>
                    <td className="p-2.5">16 – 18</td>
                    <td className="p-2.5">{unit === 'in' ? '43 - 46"' : '109 - 117 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '36 - 39"' : '91 - 99 cm'}</td>
                    <td className="p-2.5">{unit === 'in' ? '46 - 49"' : '117 - 124 cm'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hijab' && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-[#FAF7F6] rounded-xl border border-[#F0E4E6]">
              <h4 className="font-bold text-[#0F1E36] mb-1">Standard Rectangle (72" x 30" / 183 x 76 cm)</h4>
              <p className="text-slate-600">
                Ideal for daily wraps, simple drape loops, and effortless tucks without excess bulk at the neck.
              </p>
            </div>
            <div className="p-3 bg-[#FAF7F6] rounded-xl border border-[#F0E4E6]">
              <h4 className="font-bold text-[#0F1E36] mb-1">Maxi Wide Wrap (80" x 36" / 203 x 91 cm)</h4>
              <p className="text-slate-600">
                Offers full chest-level layering and back coverage. Recommended for layered formal occasions and full modest styling.
              </p>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#F0E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#2D6A4F] flex-shrink-0" />
            <span>Unsure about sizing? Email us at fit@mumtahinascloset.com</span>
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto text-center px-4 py-2 bg-[#0F1E36] text-white rounded-lg font-semibold hover:bg-[#2D6A4F] transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
