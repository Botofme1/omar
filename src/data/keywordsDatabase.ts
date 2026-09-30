import { MediaItem } from '../types';

export interface KeywordSuggestion {
  text: string;
  category: 'anime' | 'movie' | 'series' | 'genre' | 'actor';
  arabic?: string;
  count?: number;
}

// Comprehensive database of trending and popular search keywords
export const SEARCH_KEYWORDS: KeywordSuggestion[] = [
  // ANIME
  { text: 'Attack on Titan', arabic: 'هجوم العمالقة', category: 'anime' },
  { text: 'One Piece', arabic: 'ون بيس', category: 'anime' },
  { text: 'Demon Slayer', arabic: 'قاتل الشياطين', category: 'anime' },
  { text: 'Jujutsu Kaisen', arabic: 'جوجيتسو كايسن', category: 'anime' },
  { text: 'Solo Leveling', arabic: 'سولو ليفلينج', category: 'anime' },
  { text: 'Naruto Shippuden', arabic: 'ناروتو شيبودن', category: 'anime' },
  { text: 'Death Note', arabic: 'مذكرة الموت', category: 'anime' },
  { text: 'Bleach', arabic: 'بليتش', category: 'anime' },
  { text: 'Hunter x Hunter', arabic: 'هنتر اكس هنتر القناص', category: 'anime' },
  { text: 'Dragon Ball Super', arabic: 'دراغون بول', category: 'anime' },
  { text: 'Chainsaw Man', arabic: 'رجل المنشار', category: 'anime' },
  { text: 'Vinland Saga', arabic: 'فاينلاند ساغا', category: 'anime' },
  { text: 'Tokyo Ghoul', arabic: 'طوكيو غول', category: 'anime' },
  { text: 'Spy x Family', arabic: 'عائلة الجاسوس', category: 'anime' },
  { text: 'Fullmetal Alchemist', arabic: 'الكيميائي المعدني', category: 'anime' },
  { text: 'My Hero Academia', arabic: 'أكاديميتي للأبطال', category: 'anime' },
  { text: 'One Punch Man', arabic: 'ون بنش مان', category: 'anime' },
  { text: 'Blue Lock', arabic: 'بلو لوك', category: 'anime' },
  { text: 'Black Clover', arabic: 'بلاك كلوفر', category: 'anime' },
  { text: 'Berserk', arabic: 'بيرسيرك', category: 'anime' },
  { text: 'Steins;Gate', arabic: 'شتاينز غيت', category: 'anime' },

  // MOVIES
  { text: 'Terrifier 3', arabic: 'تيريفاير 3 رعب', category: 'movie' },
  { text: 'Interstellar', arabic: 'انترستيلر خيال علمي', category: 'movie' },
  { text: 'Oppenheimer', arabic: 'اوبنهايمر', category: 'movie' },
  { text: 'The Dark Knight', arabic: 'باتمان فارس الظلام', category: 'movie' },
  { text: 'Inception', arabic: 'استهلال انسبشن', category: 'movie' },
  { text: 'Avatar: The Way of Water', arabic: 'افاتار', category: 'movie' },
  { text: 'Dune: Part Two', arabic: 'كثيب ديون', category: 'movie' },
  { text: 'Gladiator II', arabic: 'المصارع', category: 'movie' },
  { text: 'Avengers: Endgame', arabic: 'المنتقمون افنجرز', category: 'movie' },
  { text: 'Spider-Man', arabic: 'سبايدرمان', category: 'movie' },
  { text: 'Batman', arabic: 'باتمان', category: 'movie' },
  { text: 'John Wick', arabic: 'جون ويك', category: 'movie' },
  { text: 'Top Gun: Maverick', arabic: 'توب غان مافريك', category: 'movie' },
  { text: 'Fast & Furious', arabic: 'السرعة والغضب', category: 'movie' },
  { text: 'Joker', arabic: 'الجوكر', category: 'movie' },
  { text: 'The Matrix', arabic: 'ماتريكس', category: 'movie' },
  { text: 'The Lord of the Rings', arabic: 'سيد الخواتم', category: 'movie' },
  { text: 'Harry Potter', arabic: 'هاري بوتر', category: 'movie' },
  { text: 'Titanic', arabic: 'تيتانيك', category: 'movie' },
  { text: 'Fight Club', arabic: 'نادي القتال', category: 'movie' },

  // SERIES
  { text: 'Breaking Bad', arabic: 'بريكنج باد', category: 'series' },
  { text: 'Game of Thrones', arabic: 'صراع العروش جيم اوف ثرونز', category: 'series' },
  { text: 'Stranger Things', arabic: 'أشياء غريبة سترينجر ثينقز', category: 'series' },
  { text: 'Peaky Blinders', arabic: 'بيكي بلايندرز تومي شيلبي', category: 'series' },
  { text: 'Better Call Saul', arabic: 'بيتر كول سول', category: 'series' },
  { text: 'House of the Dragon', arabic: 'بيت التنين', category: 'series' },
  { text: 'The Last of Us', arabic: 'ذا لاست اوف اس', category: 'series' },
  { text: 'Squid Game', arabic: 'لعبة الحبار', category: 'series' },
  { text: 'Vikings', arabic: 'فايكنج راغنار', category: 'series' },
  { text: 'Dark', arabic: 'دارك مسلسل ألماني', category: 'series' },
  { text: 'Chernobyl', arabic: 'تشرنوبيل', category: 'series' },
  { text: 'Prison Break', arabic: 'بريزون بريك الهروب من السجن', category: 'series' },
  { text: 'The Boys', arabic: 'ذا بويز هوملاندر', category: 'series' },
  { text: 'Money Heist', arabic: 'لا كاسا دي بابيل البروفيسور', category: 'series' },
  { text: 'Wednesday', arabic: 'وينزداي ادامز', category: 'series' },
  { text: 'Sherlock', arabic: 'شارلوك هولمز', category: 'series' },

  // GENRES & POPULAR TAGS
  { text: 'Action Movies', arabic: 'أفلام أكشن قتال حماس', category: 'genre' },
  { text: 'Anime Series', arabic: 'مسلسلات أنمي ياباني مترجم', category: 'genre' },
  { text: 'Horror Movies', arabic: 'أفلام رعب مخيفة جن', category: 'genre' },
  { text: 'Sci-Fi Space', arabic: 'خيال علمي فضاء وزمن', category: 'genre' },
  { text: 'Korean Drama', arabic: 'مسلسلات كورية دراما', category: 'genre' },
  { text: 'Crime & Mystery', arabic: 'غموض وتحقيق جرائم', category: 'genre' },
  { text: 'Comedy', arabic: 'كوميديا وضحك', category: 'genre' },
  { text: 'Fantasy & Magic', arabic: 'فانتازيا وسحر وتنانين', category: 'genre' },
];

export const POPULAR_CHIPS = [
  { label: '🩸 Terrifier 3', query: 'Terrifier 3' },
  { label: '🔥 Attack on Titan', query: 'Attack on Titan' },
  { label: '⚔️ One Piece', query: 'One Piece' },
  { label: '🌌 Interstellar', query: 'Interstellar' },
  { label: '🩸 Demon Slayer', query: 'Demon Slayer' },
  { label: '🔮 Jujutsu Kaisen', query: 'Jujutsu Kaisen' },
  { label: '⚡ Solo Leveling', query: 'Solo Leveling' },
  { label: '🦊 Naruto Shippuden', query: 'Naruto' },
  { label: '📓 Death Note', query: 'Death Note' },
  { label: '🗡️ Bleach', query: 'Bleach' },
  { label: '🎣 Hunter x Hunter', query: 'Hunter x Hunter' },
  { label: '🪚 Chainsaw Man', query: 'Chainsaw Man' },
  { label: '🏜️ Dune 2', query: 'Dune' },
  { label: '⏳ Oppenheimer', query: 'Oppenheimer' },
  { label: '🧪 Breaking Bad', query: 'Breaking Bad' },
  { label: '🦇 The Dark Knight', query: 'Dark Knight' },
  { label: '👑 Game of Thrones', query: 'Game of Thrones' },
  { label: '🎬 أفلام أكشن', query: 'Action' },
  { label: '🇯🇵 مسلسلات أنمي', query: 'Anime' },
];

// Helper to normalize strings for robust fuzzy Arabic & English matching
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    // Normalize Arabic letters
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u0652]/g, '')
    // Normalize punctuation
    .replace(/[-_:.']/g, ' ');
}

// Live search matching helper: matches even with 1 or 2 letters typed
export function matchMediaItem(item: MediaItem, rawQuery: string): boolean {
  if (!rawQuery.trim()) return true;

  const q = normalizeSearchTerm(rawQuery);
  const qTokens = q.split(/\s+/).filter(Boolean);

  const titleNorm = normalizeSearchTerm(item.title);
  const arabicNorm = normalizeSearchTerm(item.arabicTitle || '');
  const synopsisNorm = normalizeSearchTerm(item.synopsis);
  const castNorm = (item.cast || []).map(normalizeSearchTerm).join(' ');
  const genresNorm = (item.genres || []).map(normalizeSearchTerm).join(' ');
  const directorNorm = normalizeSearchTerm(item.director || '');
  const keywordsNorm = (item.keywords || []).map(normalizeSearchTerm).join(' ');

  const searchableBlob = `${titleNorm} ${arabicNorm} ${synopsisNorm} ${castNorm} ${genresNorm} ${directorNorm} ${keywordsNorm}`;

  // Check if every token matches somewhere in the item's metadata
  return qTokens.every((token) => searchableBlob.includes(token));
}

// Find instant keyword suggestions based on partial input
export function getKeywordSuggestions(query: string, limit = 6): KeywordSuggestion[] {
  if (!query.trim()) return [];
  const q = normalizeSearchTerm(query);

  return SEARCH_KEYWORDS.filter((k) => {
    const textNorm = normalizeSearchTerm(k.text);
    const arabicNorm = normalizeSearchTerm(k.arabic || '');
    return textNorm.includes(q) || arabicNorm.includes(q);
  }).slice(0, limit);
}
