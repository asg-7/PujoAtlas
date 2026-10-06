export type Language = 'en' | 'bn';

export const DICTIONARY = {
  brandTitle: {
    en: 'PUJO ATLAS',
    bn: 'পুজো অ্যাটলাস',
  },
  brandSubtitle: {
    en: 'Kolkata, mapped through its Durga Puja.',
    bn: 'কলকাতার সেরা দুর্গোৎসব পরিক্রমা',
  },
  nav: {
    explore: { en: 'Explore', bn: 'পরিক্রমা' },
    discover: { en: 'Discover', bn: 'আবিষ্কার' },
    heritage: { en: 'Heritage', bn: 'ঐতিহ্য' },
    food: { en: 'Food', bn: 'আহার' },
    planner: { en: 'Routes', bn: 'রুট প্ল্যানার' },
    mypuja: { en: 'My Puja', bn: 'আমার পুজো' },
  },
  hero: {
    tagline: {
      en: 'The definitive editorial guide & interactive map for Kolkata Durga Puja 2026.',
      bn: 'কলকাতার ৭৩০+ মণ্ডপ, বিখ্যাত বনেদি পুজো ও রসনার সেরা মানচিত্র ও পরিক্রমা সহায়িকা।',
    },
    pandalsCount: { en: 'Pandals Mapped', bn: 'মণ্ডপ মানচিত্রে' },
    heritageCount: { en: 'Heritage (>75 Yrs)', bn: 'ঐতিহাসিক পুজো' },
    featuredCount: { en: 'Editor’s Picks', bn: 'সেরা আকর্ষণ' },
    regionsCount: { en: 'Regions', bn: 'অঞ্চল' },
    searchPlaceholder: {
      en: 'Search pandal, locality, street or metro...',
      bn: 'মণ্ডপ, এলাকা, রাস্তা বা মেট্রো সন্ধান করুন...',
    },
    nearMe: { en: 'Near Me', bn: 'কাছের পুজো' },
    planRoute: { en: 'Plan Route', bn: 'রুট তৈরি করুন' },
    foodSpots: { en: 'Food Spots', bn: 'জনপ্রিয় খাবার' },
  },
  filters: {
    all: { en: 'All', bn: 'সব পুজো' },
    featured: { en: 'Featured', bn: 'বিশেষ আকর্ষণ' },
    heritage: { en: 'Heritage (>75 Yrs)', bn: 'ঐতিহ্যবাহী' },
    saved: { en: 'Saved', bn: 'সংরক্ষিত' },
    visited: { en: 'Visited', bn: 'দেখা হয়েছে' },
    clearAll: { en: 'Clear All', bn: 'মুছে ফেলুন' },
    layers: { en: 'Layers', bn: 'লেয়ার' },
    metroLines: { en: 'Metro Lines', bn: 'মেট্রো লাইন' },
    foodLayer: { en: 'Food Spots', bn: 'খাবার' },
  },
  regions: {
    ALL: { en: 'All Regions', bn: 'সমগ্র কলকাতা' },
    NORTH: { en: 'North Kolkata', bn: 'উত্তর কলকাতা' },
    SOUTH: { en: 'South Kolkata', bn: 'দক্ষিণ কলকাতা' },
    CENTRAL: { en: 'Central Kolkata', bn: 'মধ্য কলকাতা' },
    EAST: { en: 'East / Salt Lake', bn: 'পূর্ব কলকাতা ও সল্টলেক' },
    HOWRAH: { en: 'Howrah', bn: 'হাওড়া' },
    OTHERS: { en: 'Greater Kolkata', bn: 'বৃহত্তর কলকাতা' },
    WEST: { en: 'West / Behala', bn: 'পশ্চিম কলকাতা' },
  },
  cards: {
    directions: { en: 'Get Directions', bn: 'গুগল ম্যাপে দর্শন' },
    metro: { en: 'Metro', bn: 'মেট্রো' },
    walk: { en: 'Walk', bn: 'হাঁটাপথ' },
    mapInfo: { en: 'Map Info', bn: 'ম্যাপ তথ্য' },
    addToRoute: { en: 'Add to Route', bn: 'রুটে যুক্ত করুন' },
    inRoute: { en: 'In Route', bn: 'রুটে আছে' },
    save: { en: 'Save', bn: 'সংরক্ষণ' },
    saved: { en: 'Saved', bn: 'সংরক্ষিত' },
    markVisited: { en: 'Check In', bn: 'দর্শন করেছি' },
    visited: { en: 'Visited', bn: 'দেখা হয়েছে' },
    share: { en: 'Share', bn: 'শেয়ার করুন' },
    est: { en: 'Est.', bn: 'প্রতিষ্ঠা' },
    yrs: { en: 'Yrs', bn: 'বছর' },
    crowd: { en: 'Crowd', bn: 'ভিড়' },
    visitingHours: { en: 'Visiting Windows', bn: 'সেরা দর্শনের সময়' },
  },
  myPuja: {
    title: { en: 'My Puja Dashboard', bn: 'আমার পুজো ড্যাশবোর্ড' },
    subtitle: { en: 'Your personal itinerary, saved favourites and check-ins.', bn: 'আপনার সংরক্ষিত পুজো, ট্রেইল ও চেক-ইন তালিকা।' },
    visitedProgress: { en: 'Visited Progress', bn: 'পরিক্রমা অগ্রগতি' },
    savedTab: { en: 'Saved Pandals', bn: 'পছন্দের মণ্ডপ' },
    visitedTab: { en: 'Visited Checklist', bn: 'দেখা মণ্ডপের তালিকা' },
    routeTab: { en: 'Custom Itinerary', bn: 'কাস্টম রুট' },
    emptySaved: { en: 'No saved pandals yet. Tap 🤍 on any pandal card to add it to your list.', bn: 'এখনো কোনো মণ্ডপ সংরক্ষণ করেননি। যে কোনো কার্ডের 🤍 চিহ্নে ট্যাপ করুন।' },
    emptyVisited: { en: 'No check-ins yet. Tap ✓ Check In when you visit a pandal.', bn: 'কোনো চেক-ইন নেই। মণ্ডপে পৌঁছে ✓ দর্শন করেছি বোতামে চাপুন।' },
  },
  planner: {
    title: { en: 'Plan My Puja', bn: 'পুজো রুট প্ল্যানার' },
    subtitle: { en: 'Create optimal multi-stop routes across Kolkata with walking & transit estimates.', bn: 'কম সময়ে বেশি মণ্ডপ দর্শনের জন্য অপ্টিমাইজড রুট ও সময় গণনা।' },
    curatedTrails: { en: 'Curated Puja Trails', bn: 'প্রস্তুত বিশেষ পরিক্রমা' },
    customRoute: { en: 'Custom Itinerary', bn: 'নিজের রুট তৈরি করুন' },
    optimizeBtn: { en: 'Optimize Shortest Route', bn: 'সবচেয়ে কম দূরত্বের রুট সাজান' },
    openGoogleMaps: { en: 'Open Route in Google Maps', bn: 'গুগল ম্যাপে পুরো রুট খুলুন' },
    stops: { en: 'Stops', bn: 'টি মণ্ডপ' },
    estDuration: { en: 'Est. Duration', bn: 'আনুমানিক সময়' },
    totalDistance: { en: 'Total Distance', bn: 'মোট দূরত্ব' },
    startTrail: { en: 'Start Trail', bn: 'পরিক্রমা শুরু করুন' },
  },
};

export function t(keyPath: string, lang: Language = 'en'): string {
  const parts = keyPath.split('.');
  let current: any = DICTIONARY;
  for (const p of parts) {
    if (current && typeof current === 'object' && p in current) {
      current = current[p];
    } else {
      return keyPath;
    }
  }
  if (current && typeof current === 'object' && lang in current) {
    return current[lang];
  }
  return typeof current === 'string' ? current : keyPath;
}
