import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories, createCategory, updateCategory, deleteCategory, seedDefaultCategories, Category } from '../../data/supabase/categories';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchCategories(user.id);
      setCategories(data);
      if (data.length === 0) {
        await seedDefaultCategories(user.id);
        const refreshed = await fetchCategories(user.id);
        setCategories(refreshed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (name: string, color: string, icon: string) => {
    if (!user) return;
    await createCategory(user.id, name, color, icon);
    await load();
  }, [user, load]);

  const update = useCallback(async (id: string, name: string, color: string, icon: string) => {
    await updateCategory(id, name, color, icon);
    await load();
  }, [user, load]);

  const remove = useCallback(async (id: string) => {
    await deleteCategory(id);
    await load();
  }, [user, load]);

  return { categories, loading, create, update, remove, refetch: load };
}