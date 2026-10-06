import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';

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
    ? `${title} — ${currentPandal.address}\nExplore this Durga Puja on Pujo Atlas:\n${typeof window !== 'undefined' ? window.location.href : 'https://pujoatlas.in'}`
    : `Explore 730+ Kolkata Durga Puja Pandals, Heritage Rajbaris & Food on Pujo Atlas!\n${typeof window !== 'undefined' ? window.location.href : 'https://pujoatlas.in'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/70 backdrop-blur-xs transition-opacity duration-base"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="bg-paper dark:bg-surface border border-sand dark:border-line rounded-lg max-w-md w-full p-6 shadow-e3 relative animate-in fade-in zoom-in-95 duration-fast"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShareModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-smoke hover:text-ink dark:hover:text-text rounded-full hover:bg-sand/20 transition-colors"
          aria-label="Close share dialog"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="text-center mb-6 space-y-2">
          <div className="w-10 h-10 rounded-full bg-sand/40 dark:bg-line text-terracotta flex items-center justify-center mx-auto">
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 id="share-modal-title" className="text-lg font-serif font-semibold text-ink dark:text-text">
            {language === 'bn' ? 'শেয়ার করুন' : 'Share Pujo Atlas'}
          </h3>
          <p className="text-xs text-smoke dark:text-text-muted">
            {currentPandal
              ? `Share ${title} directions and details`
              : 'Share Kolkata Durga Puja interactive guide'}
          </p>
        </div>

        {/* Share buttons */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-md bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base font-semibold text-xs flex items-center justify-center gap-2 shadow-e1 transition-colors no-underline min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Share to WhatsApp'}</span>
          </a>

          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-md bg-shola dark:bg-base hover:bg-sand/20 text-ink dark:text-text font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-sand dark:border-line min-h-[44px] cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-kumkum" strokeWidth={2} /> : <Copy className="w-4 h-4 text-smoke" strokeWidth={1.5} />}
            <span>{copied ? (language === 'bn' ? 'লিংক কপি হয়েছে' : 'Link Copied!') : (language === 'bn' ? 'লিংক কপি করুন' : 'Copy Share Link')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
