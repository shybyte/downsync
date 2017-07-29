export type ArticleId = string;

export interface Article {
  id: ArticleId;
  displayName: string;
  comment: string;
  builtIn: boolean;
}

export function canBeDeleted(article: Article) {
  return !article.builtIn;
}

export function validateDisplayName(articles: Article[],
                                    articleId: ArticleId,
                                    displayName: string): string | undefined {
  if (articles.some(a => a.id !== articleId && a.displayName === displayName)) {
    return 'This displayName exist already.';
  }
  if (displayName.trim() !== displayName) {
    return 'The displayName is not trimmed.';
  }
  if (displayName === '') {
    return 'The displayName is empty';
  }
  return undefined;
}

export function sanitizeArticleDisplayName(displayName: string) {
  return displayName.trim();
}