import api from './api';

const brandCategoryService = {
  // Brand endpoints
  getBrands: () => api.get('/brands'),
  createBrand: (data: any) => api.post('/brands', data),
  updateBrand: (id: string, data: any) => api.put(`/brands/${id}`, data),
  deleteBrand: (id: string) => api.delete(`/brands/${id}`),

  // Category endpoints
  getCategories: () => api.get('/categories'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

export default brandCategoryService;