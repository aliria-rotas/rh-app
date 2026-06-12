import { supabase } from './supabase'

export async function cleanDuplicates() {
  try {
    // Delete ALL campaigns first
    const { data: all } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id')

    if (all && all.length > 0) {
      const ids = all.map(c => c.id)
      await supabase
        .from('rh_endomarketing_campaigns')
        .delete()
        .in('id', ids)
      console.log(`Deleted ${ids.length} campaigns`)
    }

    console.log('Clean complete')
  } catch (error) {
    console.error('Error cleaning duplicates:', error)
  }
}
