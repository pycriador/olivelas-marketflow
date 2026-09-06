import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { InventoryItem, Lot, InventoryMovement } from '../../types';

export const inventoryService = {
  async fetchInventory(companyId?: string): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('inventory_items').select('*');
      if (companyId) query = query.eq('company_id', companyId);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchInventory warning:', error.message);
        return [];
      }
      return (data || []) as InventoryItem[];
    } catch (err) {
      console.warn('Supabase fetchInventory error:', err);
      return [];
    }
  },

  async fetchLots(companyId?: string): Promise<Lot[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('lots').select('*').order('expiration_date', { ascending: true });
      if (companyId) query = query.eq('company_id', companyId);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchLots warning:', error.message);
        return [];
      }
      return (data || []) as Lot[];
    } catch (err) {
      console.warn('Supabase fetchLots error:', err);
      return [];
    }
  },

  async fetchMovements(companyId?: string): Promise<InventoryMovement[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });
      if (companyId) query = query.eq('company_id', companyId);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchMovements warning:', error.message);
        return [];
      }
      return (data || []) as InventoryMovement[];
    } catch (err) {
      console.warn('Supabase fetchMovements error:', err);
      return [];
    }
  },

  async saveLot(lot: Lot): Promise<Lot> {
    if (!isSupabaseConfigured()) return lot;

    try {
      const { data, error } = await supabase
        .from('lots')
        .upsert({
          id: lot.id,
          company_id: lot.company_id,
          product_id: lot.product_id,
          supplier_id: lot.supplier_id || null,
          lot_number: lot.lot_number,
          manufacturing_date: lot.manufacturing_date || null,
          expiration_date: lot.expiration_date,
          initial_quantity: lot.initial_quantity,
          current_quantity: lot.current_quantity,
          cost_price: lot.cost_price || 0,
          status: (lot as any).status || 'active',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase saveLot warning:', error.message);
        return lot;
      }
      return data as Lot;
    } catch (err) {
      console.warn('Supabase saveLot error:', err);
      return lot;
    }
  },

  async addMovement(movement: InventoryMovement): Promise<InventoryMovement> {
    if (!isSupabaseConfigured()) return movement;

    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert({
          id: movement.id,
          company_id: movement.company_id,
          product_id: movement.product_id,
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason || null,
          document_reference: (movement as any).document_reference || movement.reference_id || null,
          created_at: movement.created_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase addMovement warning:', error.message);
        return movement;
      }
      return data as InventoryMovement;
    } catch (err) {
      console.warn('Supabase addMovement error:', err);
      return movement;
    }
  },
};
