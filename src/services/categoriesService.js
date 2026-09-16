import {supabase} from '../supabase';

export async function getCategories() {
    const {data, error} = await supabase
     .from('categories')
     .select(`
        id,
        name,
        slug
     `)
     .order("name", {ascending: true});

    if (error) {
        throw error;
    }

    return data ?? [];
}