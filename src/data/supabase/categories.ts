import {supabase} from './client';

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
};

export async function fetchCategories(userId: string) {
  const {data, error} = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data as Category[];
}

export async function createCategory(
  userId: string,
  name: string,
  color: string,
  icon: string
) {
  const {error} = await supabase
    .from('categories')
    .insert([{user_id: userId, name, color, icon}]);
  if (error) throw error;
}

export async function updateCategory(
  id: string,
  name: string,
  color: string,
  icon: string
) {
  const {error} = await supabase
    .from('categories')
    .update({name, color, icon})
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const {error} = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function seedDefaultCategories(userId: string) {
  const defaults = [
    {name: 'Alimentação', color: '#EF4444', icon: 'egg'},
    {name: 'Transporte', color: '#F97316', icon: 'car-outline'},
    {name: 'Moradia', color: '#8B5CF6', icon: 'home'},
    {name: 'Saúde', color: '#10B981', icon: 'heart'},
    {name: 'Lazer', color: '#EC4899', icon: 'film'},
    {name: 'Educação', color: '#6366F1', icon: 'book'},
    {name: 'Renda extra', color: '#06B6D4', icon: 'briefcase'},
    {name: 'Outros', color: '#6B7280', icon: 'dots-horizontal'},
  ];
  const {error} = await supabase
    .from('categories')
    .insert(defaults.map(c => ({...c, user_id: userId})));
  if (error && error.code !== '23505') throw error; // ignore duplicate key
}
