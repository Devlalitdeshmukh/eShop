export const parsePagination = (query, defaults = {}) => {
  const defaultPage = Number(defaults.page || 1);
  const defaultLimit = Number(defaults.limit || 10);
  const maxLimit = Number(defaults.maxLimit || 100);

  const hasPagination =
    query.page !== undefined || query.limit !== undefined || query.paginate === "true";

  const page = Math.max(Number(query.page || defaultPage), 1);
  const requestedLimit = Math.max(Number(query.limit || defaultLimit), 1);
  const limit = Math.min(requestedLimit, maxLimit);
  const offset = (page - 1) * limit;

  return { hasPagination, page, limit, offset };
};

export const buildPaginatedResponse = ({ rows, total, page, limit }) => ({
  items: rows,
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});
