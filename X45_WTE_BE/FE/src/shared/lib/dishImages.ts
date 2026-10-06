// Curated realistic culinary photography for Vietnamese home dishes
export function getDishImageUrl(dishName: string, mealType?: string): string {
  const name = (dishName || '').toLowerCase();

  if (name.includes('cá') || name.includes('tôm') || name.includes('hải sản') || name.includes('mực')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('canh') || name.includes('súp') || name.includes('lẩu')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('trứng')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('bò')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('gà')) {
    return 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('thịt') || name.includes('heo') || name.includes('kho')) {
    return 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('chay') || name.includes('đậu') || name.includes('nấm') || name.includes('rau') || name.includes('salad')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('xào') || name.includes('chiên') || name.includes('cơm')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80';
  }
  if (mealType === 'do_uong') {
    return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80';
  }
  if (mealType === 'an_vat') {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80';
  }

  // High quality default home-cooking dish image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
}
