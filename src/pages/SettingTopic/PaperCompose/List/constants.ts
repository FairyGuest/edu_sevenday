export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_INDEX = 1;

export const DEFAULT_PAPER_ORDERS = [
  {
    column: "update_time",
    asc: false,
  },
];

export const isApiSuccess = (code: unknown) => code === 200 || code === 0;
