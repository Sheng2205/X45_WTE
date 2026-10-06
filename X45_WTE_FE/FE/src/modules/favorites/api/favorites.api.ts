import { http } from '@/shared/api/http';

export const favoritesApi = {
  getAll: () => http.get('/favorites'),
  add: (dishId: string) => http.post('/favorites', { dishId }),
  remove: (dishId: string) => http.delete(`/favorites/${dishId}`),
};
