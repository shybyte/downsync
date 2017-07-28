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