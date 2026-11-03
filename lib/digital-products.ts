// Digital products (/center/products): files students buy and download, like
// a PDF guide, a ZIP of templates or a code repository. The shapes the API
// sends (the /products routes), and the checks of the product form (the same
// as the API's, so most mistakes are shown before anything is sent).
// The file has no imports, so `pnpm test` can run it with Node directly.

// GET /products/admin/all
export type AdminProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  // The download link buyers get once their payment is confirmed
  fileUrl: string;
  // false: hidden from the store (nobody new can buy it)
  isActive: boolean;
  centerId: string | null;
  createdAt: string;
  // How many times it was ordered, whatever the order status
  _count?: { orderItems: number };
};

export type ProductValues = {
  title: string;
  description: string;
  price: string;
  fileUrl: string;
};
export type ProductErrors = Partial<Record<keyof ProductValues, string>>;
export type ProductPayload = {
  title: string;
  description: string;
  price: number;
  fileUrl: string;
};

export const PRODUCT_TITLE_MAX = 120;
export const PRODUCT_DESCRIPTION_MAX = 2000;
export const PRODUCT_LINK_MAX = 1000;

export function emptyProductForm(): ProductValues {
  return { title: '', description: '', price: '', fileUrl: '' };
}

export function productFormFrom(product: AdminProduct): ProductValues {
  return {
    title: product.title,
    description: product.description ?? '',
    price: String(product.price),
    fileUrl: product.fileUrl,
  };
}

// A price in dinars: "25", "12.5", "12,500" (at most 3 decimals, the
// millimes). The same rule as the course form (lib/course-admin.ts).
function parsePrice(text: string): number | null {
  const value = text.trim();
  if (/^\d+([.,]\d{1,3})?$/.test(value) === false) return null;
  return Number(value.replace(',', '.'));
}

// The link to the file: a web address. "drive.google.com/file/d/abc" gets
// "https://"; any other kind of link (javascript:, ftp:...) is refused.
export function fileLink(text: string): string | null {
  const value = text.trim();
  if (value === '' || /\s/.test(value)) return null;
  const web = /^https?:\/\//i.test(value);
  if (web === false && /^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  const link = web ? value : `https://${value.replace(/^\/+/, '')}`;
  return /^https?:\/\/[^/?#]+\.[^/?#]+/i.test(link) ? link : null;
}

// The values to send (POST or PATCH /products), or the errors to show.
export function readProductForm(values: ProductValues): {
  errors: ProductErrors;
  payload: ProductPayload | null;
} {
  const errors: ProductErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  if (title === '') errors.title = 'Give the product a title.';
  else if (title.length > PRODUCT_TITLE_MAX)
    errors.title = `The title can have at most ${PRODUCT_TITLE_MAX} characters.`;
  if (description.length > PRODUCT_DESCRIPTION_MAX)
    errors.description = `The description can have at most ${PRODUCT_DESCRIPTION_MAX} characters.`;
  const price = parsePrice(values.price);
  if (price === null) errors.price = 'Enter a price in TND, for example 25 or 12.500 (0 for a free product).';
  const link = fileLink(values.fileUrl);
  if (values.fileUrl.trim() === '') errors.fileUrl = 'Paste the link to the file (Google Drive, Dropbox, AWS S3...).';
  else if (link === null) errors.fileUrl = 'Enter a web address, for example https://drive.google.com/file/d/abc.';
  else if (link.length > PRODUCT_LINK_MAX)
    errors.fileUrl = `The link can have at most ${PRODUCT_LINK_MAX} characters.`;
  if (Object.keys(errors).length > 0 || price === null || link === null) return { errors, payload: null };
  return { errors, payload: { title, description, price, fileUrl: link } };
}

export function orderCount(product: AdminProduct): number {
  return product._count?.orderItems ?? 0;
}

export function orderCountLabel(count: number): string {
  if (count === 0) return 'Not ordered yet';
  return count === 1 ? 'Ordered once' : `Ordered ${count} times`;
}

// An ordered product cannot be deleted (its buyers would lose their link):
// it can only be hidden.
export function canDelete(product: AdminProduct): boolean {
  return orderCount(product) === 0;
}
