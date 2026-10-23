import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Download, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  Zap, 
  Filter 
} from 'lucide-react';
import { api } from '../api/client';
import { MarketplaceItem } from '../types';

export const MarketplaceView: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      const res = await api.getMarketplaceItems({ category, search });
      setItems(res.items || []);
    } catch (err) {
      console.error('[Marketplace Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [category, search]);

  const handleToggleInstall = async (item: MarketplaceItem) => {
    try {
      if (item.is_installed) {
        await api.uninstallMarketplaceItem(item.id);
        setActionNotice(`Uninstalled "${item.title}" from active workspace.`);
      } else {
        await api.installMarketplaceItem(item.id);
        setActionNotice(`Installed "${item.title}" into active workspace.`);
      }
      await loadItems();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-yellow-400 uppercase font-semibold">
          <ShoppingBag className="w-4 h-4" />
          <span>DAYMARK AGENT & BLUEPRINT MARKETPLACE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Pre-Vetted Automation Blueprints
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Install audited first-party workflow templates and specialized agent behaviors directly into your organization workspace.
        </p>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints, categories, keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'Agency Operations', 'Customer Success', 'Market Intelligence'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                category === cat
                  ? 'bg-yellow-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Blueprints' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{item.category}</span>
                <span className="flex items-center text-xs font-mono font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {item.rating}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[48px] line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Author:</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    {item.author} <ShieldCheck className="w-3 h-3 text-blue-400" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Installs:</span>
                  <span className="text-slate-200">{item.installs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License:</span>
                  <span className="text-emerald-400 font-bold">{item.price}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                {item.is_installed ? 'Installed in Workspace' : 'Available'}
              </span>

              <button
                onClick={() => handleToggleInstall(item)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  item.is_installed
                    ? 'bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20'
                }`}
              >
                {item.is_installed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Installed</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Install Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
