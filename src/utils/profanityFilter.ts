// List of Portuguese and English profanity words to censor
const PROFANITY_LIST = [
  // Portuguese
  'porra', 'caralho', 'merda', 'bosta', 'puta', 'vagabunda', 'viado', 'veado',
  'bicha', 'fdp', 'pqp', 'vsf', 'tnc', 'cuzao', 'cuzão', 'buceta', 'cacete',
  'foder', 'foda', 'fodase', 'foda-se', 'arrombado', 'filho da puta', 'filha da puta',
  'desgraça', 'desgraçado', 'desgraçada', 'otario', 'otário', 'babaca', 'imbecil',
  'idiota', 'retardado', 'retardada', 'corno', 'piranha', 'vadia', 'viadinho',
  'putinha', 'canalha', 'safado', 'safada', 'pau no cu', 'vai se fuder', 'vai tomar no cu',
  'cu', 'rola', 'pinto', 'cabaço', 'bucetinha', 'punheta', 'punheteiro',
  // English
  'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'dick',
  'cock', 'pussy', 'cunt', 'whore', 'slut', 'fag', 'faggot', 'nigger', 'nigga',
  'retard', 'motherfucker', 'bullshit', 'damn', 'dumbass', 'jackass', 'prick',
  'wanker', 'twat', 'bollocks', 'arse', 'bugger',
  // Common variations/leetspeak
  'f0da', 'fod4', 'c4ralho', 'put4', 'b1tch', 'sh1t', 'f*ck', 'fvck', 'fcuk',
];

// Create regex patterns for each word (case insensitive, word boundaries)
const patterns = PROFANITY_LIST.map(word => {
  // Escape special regex characters
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Create pattern that matches the word with optional character substitutions
  return new RegExp(`\\b${escaped}\\b`, 'gi');
});

// Single regex for checking multiple character variations
const advancedPatterns = PROFANITY_LIST.map(word => {
  // Create pattern that accounts for common letter substitutions
  let pattern = word
    .replace(/a/gi, '[a@4]')
    .replace(/e/gi, '[e3]')
    .replace(/i/gi, '[i1!]')
    .replace(/o/gi, '[o0]')
    .replace(/s/gi, '[s$5]')
    .replace(/u/gi, '[u]');
  return new RegExp(`\\b${pattern}\\b`, 'gi');
});

/**
 * Censors profanity in a message by replacing with asterisks
 * @param message The message to filter
 * @returns The filtered message with profanity censored
 */
export function censorProfanity(message: string): string {
  let filtered = message;
  
  // Apply basic patterns
  patterns.forEach(pattern => {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  });
  
  // Apply advanced patterns with character substitutions
  advancedPatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  });
  
  return filtered;
}

/**
 * Checks if a message contains profanity
 * @param message The message to check
 * @returns True if profanity is found
 */
export function containsProfanity(message: string): boolean {
  return patterns.some(pattern => pattern.test(message)) ||
         advancedPatterns.some(pattern => pattern.test(message.toLowerCase()));
}
