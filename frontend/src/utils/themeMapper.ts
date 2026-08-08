import type { CardColor, IllustrationKey } from '../data';

/**
 * Dynamically maps scheme category strings to SevaNest visual themes.
 * (CardColor + IllustrationKey)
 */
export function getCategoryTheme(category: string): { color: CardColor; illustration: IllustrationKey } {
  const cat = (category || '').toLowerCase().trim();

  if (cat.includes('house') || cat.includes('housing') || cat.includes('home')) {
    return { color: 'lavender', illustration: 'spiral' };
  }
  if (cat.includes('food') || cat.includes('ration') || cat.includes('grain')) {
    return { color: 'olive', illustration: 'leaf' };
  }
  if (cat.includes('farm') || cat.includes('agri') || cat.includes('crop')) {
    return { color: 'terracotta', illustration: 'sun' };
  }
  if (cat.includes('health') || cat.includes('medical') || cat.includes('hospital')) {
    return { color: 'sage', illustration: 'health' };
  }
  if (cat.includes('edu') || cat.includes('school') || cat.includes('scholarship') || cat.includes('child')) {
    return { color: 'mauve', illustration: 'flower' };
  }
  if (cat.includes('save') || cat.includes('bank') || cat.includes('finance') || cat.includes('money')) {
    return { color: 'khaki', illustration: 'coins' };
  }
  if (cat.includes('women') || cat.includes('girl') || cat.includes('maternity')) {
    return { color: 'mauve', illustration: 'flower' };
  }

  return { color: 'lavender', illustration: 'spiral' };
}
