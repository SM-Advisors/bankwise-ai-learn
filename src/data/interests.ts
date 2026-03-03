export interface Interest {
  id: string;
  label: string;
  emoji: string;
}

export const INTERESTS: Interest[] = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'cooking', label: 'Cooking & Food', emoji: '🍳' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'movies', label: 'Movies & TV', emoji: '🎬' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'fitness', label: 'Fitness & Wellness', emoji: '💪' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'art', label: 'Art & Design', emoji: '🎨' },
  { id: 'outdoors', label: 'Nature & Outdoors', emoji: '🌲' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'finance', label: 'Finance & Investing', emoji: '📈' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'pets', label: 'Pets & Animals', emoji: '🐾' },
  { id: 'diy', label: 'DIY & Crafts', emoji: '🔨' },
];

export const MAX_INTERESTS = 3;
