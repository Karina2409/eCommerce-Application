export type ProductQueryArgs = {
  limit?: number;
  staged?: boolean;
  priceCurrency?: string;
  filter?: string[];
  where?: string;
  sort?: string;
  markMatchingVariants?: true;
  type?: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
  'text.en-US'?: string;
};
