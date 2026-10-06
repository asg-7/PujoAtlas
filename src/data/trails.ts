import type { Zone } from '../lib/schemas';

export interface PujaTrail {
  id: string;
  title: string;
  bngTitle: string;
  tagline: string;
  bngTagline: string;
  zone: Zone;
  estimatedHours: number;
  distanceKm: number;
  pandalIds: string[];
  foodIds?: string[];
  highlights: string[];
  theme: 'heritage' | 'theme' | 'night' | 'bonedi' | 'popular';
  coverEmoji: string;
  description: string;
}

export const PUJA_TRAILS: PujaTrail[] = [
  {
    id: 'north-heritage-trail',
    title: 'North Kolkata Heritage & Rajbari Trail',
    bngTitle: 'উত্তর কলকাতার বনেদি ও রাজবাড়ি পরিক্রমা',
    tagline: '8 historic pandals · 3.5 km · ~3.5 hours',
    bngTagline: '৮টি ঐতিহাসিক মণ্ডপ · ৩.৫ কিমি · ~৩.৫ ঘণ্টা',
    zone: 'NORTH',
    estimatedHours: 3.5,
    distanceKm: 3.8,
    pandalIds: [
      'bagbazar-sarbojanin-durga-puja-mandap',
      'sovabazar-rajbari-boro-rajbari',
      'kumartuli-park-sarbojanin-durgotsab',
      'ahirtola-sarbojanin-durgotsab-samity',
      'chhatu-babu-latu-babu-thakur-bari-ramdulal-nibas',
      'khelat-bhavan-pathuriaghata-rajbari',
      'thanthania-dutta-bari',
      'hatibagan-nabin-pally',
    ],
    foodIds: ['f-mitra-cafe', 'f-girish-nakur', 'f-chittaranjan'],
    highlights: [
      'Centuries-old Bonedi Pratima at Sovabazar Rajbari',
      'Iconic traditional Daaker Saaj idol at Bagbazar',
      'Historic Pathuriaghata & Thanthania mansions',
    ],
    theme: 'heritage',
    coverEmoji: '🏛️',
    description:
      'Immerse in the timeless soul of old Calcutta. From the aristocratic courtyard of Sovabazar Rajbari to the iconic Bagbazar Ghat legacy, this walking route is best experienced in the crisp morning air or evening illumination.',
  },
  {
    id: 'south-theme-masters',
    title: 'South Kolkata Theme Masters Trail',
    bngTitle: 'দক্ষিণ কলকাতার থিম ও স্থাপত্য পরিক্রমা',
    tagline: '8 award-winning pandals · 4.2 km · ~4 hours',
    bngTagline: '৮টি পুরস্কারপ্রাপ্ত মণ্ডপ · ৪.২ কিমি · ~৪ ঘণ্টা',
    zone: 'SOUTH',
    estimatedHours: 4.0,
    distanceKm: 4.2,
    pandalIds: [
      'tridhara-sammilani',
      'samaj-sebi-sangha',
      'hindusthan-park-sarbojanin',
      'ekdalia-evergreen-club',
      'singhi-park-sarbojanin-durgapuja-committee',
      'mudiali-club',
      'shibmandir',
      'badamtala-ashar-sangha',
    ],
    foodIds: ['f-bedouin', 'f-campari', 'f-maharani'],
    highlights: [
      'Spectacular architectural themes along Gariahat & Lake Road',
      'Grand Chandannagar lighting displays at Ekdalia & Singhi Park',
      'Vibrant artistic storytelling & immersive soundscapes',
    ],
    theme: 'theme',
    coverEmoji: '🎨',
    description:
      'The vibrant modern heart of Kolkata Durga Puja. Walk through the bustling Gariahat corridor connecting contemporary artistic masterpieces with dazzling illumination.',
  },
  {
    id: 'central-grand-night',
    title: 'Central Kolkata Grand Landmark Trail',
    bngTitle: 'মধ্য কলকাতার বিখ্যাত আলোকসজ্জা পরিক্রমা',
    tagline: '6 grand spectacles · 2.8 km · ~3 hours',
    bngTagline: '৬টি বিখ্যাত মণ্ডপ · ২.৮ কিমি · ~৩ ঘণ্টা',
    zone: 'CENTRAL',
    estimatedHours: 3.0,
    distanceKm: 2.8,
    pandalIds: [
      'mohammad-ali-park',
      'santosh-mitra-square-lebutala',
      'janbazar-rajbari',
      'rani-rashmoni-palace',
      'entally-sarbojanin-sri-sri-durga-puja',
    ],
    foodIds: ['f-paramount', 'f-putiram', 'f-anadi'],
    highlights: [
      'Gigantic illuminated palace replicas at Santosh Mitra Square & Md Ali Park',
      'Legendary Rani Rashmoni historic residence',
      'Iconic College Street heritage eateries & Sharbat',
    ],
    theme: 'night',
    coverEmoji: '✨',
    description:
      'Famous for monumental replicas and electrifying light gates that turn central Kolkata into an open-air carnival after sunset.',
  },
  {
    id: 'east-saltlake-art',
    title: 'Salt Lake & East Kolkata Art Corridor',
    bngTitle: 'সল্টলেক ও পূর্ব কলকাতার শৈল্পিক পরিক্রমা',
    tagline: '6 sprawling pujas · 5.5 km · ~3.5 hours',
    bngTagline: '৬টি নান্দনিক পুজো · ৫.৫ কিমি · ~৩.৫ ঘণ্টা',
    zone: 'EAST',
    estimatedHours: 3.5,
    distanceKm: 5.5,
    pandalIds: [
      'sreebhumi-sporting-club',
      'dum-dum-park-yubak-brinda',
      'salt-lake-fd-block',
      'salt-lake-bj-block',
      'beliaghata-33-pally',
      'kankurgachi-jubak-brinda',
    ],
    foodIds: ['f-arsalan-ruby', 'f-6-ballygunge'],
    highlights: [
      'Sreebhumi’s viral royal architectural marvel',
      'Tree-lined peaceful boulevard pandal-hopping in Salt Lake blocks',
      'Innovative conceptual eco-installations',
    ],
    theme: 'popular',
    coverEmoji: '💎',
    description:
      'Sprawling, wide-avenue pujas perfect for evening car routes or relaxed walks through Bidhannagar blocks and Lake Town.',
  },
  {
    id: 'howrah-heritage-gems',
    title: 'Howrah Historic & Riverside Trail',
    bngTitle: 'হাওড়ার ঐতিহ্য ও গঙ্গাতীর পরিক্রমা',
    tagline: '5 riverfront pujas · 4.0 km · ~3 hours',
    bngTagline: '৫টি গঙ্গার পারের পুজো · ৪.০ কিমি · ~৩ ঘণ্টা',
    zone: 'HOWRAH',
    estimatedHours: 3.0,
    distanceKm: 4.0,
    pandalIds: [
      'andul-rajbari',
      'salkia-alapani',
      'salkia-chatra-bayam-samity-shishu-udyan',
      'mandirtala-durga-puja-pandal',
      'bally-juba-sangha-kali-mandir',
    ],
    highlights: [
      'Royal heritage of Andul Rajbari',
      'Rich community festivities in Salkia & Mandirtala',
      'Ganges riverside ambience & festive flavours',
    ],
    theme: 'heritage',
    coverEmoji: '🚢',
    description:
      'Cross the Hooghly to discover centuries-old royal pujas and tight-knit para festivities with unmatched warmth.',
  },
];
