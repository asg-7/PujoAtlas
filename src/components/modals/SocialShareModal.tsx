import React, { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { t } from '../../lib/i18n';

export const SocialShareModal: React.FC = () => {
  const { isShareModalOpen, setShareModalOpen, selectedEntity, pandals, language } = useMapStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const currentPandal =
    selectedEntity?.type === 'pandal'
      ? pandals.find((p) => p.id === selectedEntity.id)
      : null;

  const title = currentPandal
    ? language === 'bn'
      ? currentPandal.bngName || currentPandal.name
      : currentPandal.name
    : 'Pujo Atlas 2026';

  const shareText = currentPandal
    ? `✨ ${title} — ${currentPandal.address}\n🗺️ Check out this Durga Puja pandal on Pujo Atlas:\n${typeof window !== 'undefined' ? window.location.href : 'https://pujoatlas.in'}`
    : `🌟 Explore 730+ Kolkata Durga Puja Pandals, Heritage Rajbaris & Food Spots on Pujo Atlas!\n${typeof window !== 'undefined' ? window.location.href : 'https://pujoatlas.in'}`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://pujoatlas.in';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-zinc-900 border border-sand-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShareModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-sand-500 hover:text-sand-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full hover:bg-sand-100 dark:hover:bg-zinc-800 transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-100 dark:bg-terracotta-950/60 text-terracotta-600 dark:text-terracotta-400 text-2xl flex items-center justify-center mx-auto mb-3">
            📤
          </div>
          <h3 className="text-xl font-serif font-bold text-sand-950 dark:text-zinc-100">
            {language === 'bn' ? 'শেয়ার করুন বন্ধুদের সাথে' : 'Share Pujo Atlas'}
          </h3>
          <p className="text-xs text-sand-600 dark:text-zinc-400 mt-1">
            {currentPandal
              ? `Share ${title} details and directions`
              : 'Share this live interactive Kolkata Puja guide'}
          </p>
        </div>

        {/* Share buttons */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>💬</span> {language === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Share on WhatsApp'}
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>🐦</span> {language === 'bn' ? 'টুইটারে পোস্ট করুন' : 'Share on X (Twitter)'}
          </a>

          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl bg-sand-100 dark:bg-zinc-800 hover:bg-sand-200 dark:hover:bg-zinc-700 text-sand-900 dark:text-zinc-100 font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-sand-200 dark:border-zinc-700"
          >
            <span>📋</span> {copied ? (language === 'bn' ? '✓ লিংক কপি হয়েছে!' : '✓ Link Copied!') : (language === 'bn' ? 'লিংক কপি করুন' : 'Copy Share Link')}
          </button>
        </div>

        {/* Preview snippet */}
        <div className="mt-5 p-3 rounded-xl bg-sand-50 dark:bg-zinc-800/60 border border-sand-200/80 dark:border-zinc-700/60 text-xs text-sand-600 dark:text-zinc-400 italic">
          "{shareText.slice(0, 100)}..."
        </div>
      </div>
    </div>
  );
};
