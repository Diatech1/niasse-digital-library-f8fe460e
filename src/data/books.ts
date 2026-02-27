export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  cover: string;
  language: string;
  pages: number;
  tags: string[];
  description: string;
  hasAudio: boolean;
  progress?: number;
  audioDuration?: string;
  contentModule?: string;
  isFavorite?: boolean;
  translator?: string;
}
