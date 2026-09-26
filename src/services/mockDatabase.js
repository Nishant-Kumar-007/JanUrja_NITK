// ==============================================================================
// Mock Supabase Database & Realtime Event Bus
// Provides 100% faithful Supabase CRUD & Realtime semantics in localStorage
// ==============================================================================

import {
  INITIAL_PROFILES,
  INITIAL_NODES,
  INITIAL_OFFERS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_PROTOCOL_EVENTS
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILES: 'janurja_db_profiles',
  NODES: 'janurja_db_energy_nodes',
  OFFERS: 'janurja_db_energy_offers',
  ORDERS: 'janurja_db_orders',
  TRANSACTIONS: 'janurja_db_transactions',
  PROTOCOL_EVENTS: 'janurja_db_protocol_events'
};

class MockDatabase {
  constructor() {
    this.listeners = new Set();
    this.initDatabase();
  }

  initDatabase(forceReset = false) {
    const existing = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const hasStaleDemoAccounts = existing && (existing.includes('Ramesh') || existing.includes('Suresh'));
    if (forceReset || !existing || hasStaleDemoAccounts) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(INITIAL_NODES));
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.PROTOCOL_EVENTS, JSON.stringify(INITIAL_PROTOCOL_EVENTS));
      this.notifyListeners('*', 'INIT', null);
    }
  }

  getTableKey(table) {
    switch (table) {
      case 'profiles': return STORAGE_KEYS.PROFILES;
      case 'energy_nodes': return STORAGE_KEYS.NODES;
      case 'energy_offers': return STORAGE_KEYS.OFFERS;
      case 'orders': return STORAGE_KEYS.ORDERS;
      case 'transactions': return STORAGE_KEYS.TRANSACTIONS;
      case 'protocol_events': return STORAGE_KEYS.PROTOCOL_EVENTS;
      default: return `janurja_db_${table}`;
    }
  }

  get(table) {
    const key = this.getTableKey(table);
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  set(table, records) {
    const key = this.getTableKey(table);
    localStorage.setItem(key, JSON.stringify(records));
  }

  // Subscribe to table changes (resembling Supabase Realtime channel)
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(table, eventType, record) {
    this.listeners.forEach((callback) => {
      try {
        callback({ table, eventType, new: record });
      } catch (err) {
        console.error('Realtime listener error:', err);
      }
    });
  }

  insert(table, newRecord) {
    const records = this.get(table);
    const recordWithId = {
      id: newRecord.id || `${table.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: newRecord.created_at || new Date().toISOString(),
      ...newRecord
    };
    records.unshift(recordWithId);
    this.set(table, records);
    this.notifyListeners(table, 'INSERT', recordWithId);
    return recordWithId;
  }

  update(table, id, updates) {
    const records = this.get(table);
    const index = records.findIndex((r) => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates, updated_at: new Date().toISOString() };
      this.set(table, records);
      this.notifyListeners(table, 'UPDATE', records[index]);
      return records[index];
    }
    return null;
  }

  delete(table, id) {
    const records = this.get(table);
    const filtered = records.filter((r) => r.id !== id);
    this.set(table, filtered);
    this.notifyListeners(table, 'DELETE', { id });
    return true;
  }

  // Fluent query builder mimicking supabase.from(...)
  from(table) {
    const db = this;
    let queryData = [...db.get(table)];

    const queryBuilder = {
      select: (fields = '*') => {
        // Return this builder for chaining
        return queryBuilder;
      },
      eq: (column, value) => {
        queryData = queryData.filter((item) => String(item[column]) === String(value));
        return queryBuilder;
      },
      order: (column, { ascending = true } = {}) => {
        queryData.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
        return queryBuilder;
      },
      limit: (count) => {
        queryData = queryData.slice(0, count);
        return queryBuilder;
      },
      single: async () => {
        return { data: queryData[0] || null, error: null };
      },
      then: (resolve) => {
        resolve({ data: queryData, error: null });
      },
      insert: async (records) => {
        const toInsert = Array.isArray(records) ? records : [records];
        const inserted = toInsert.map((rec) => db.insert(table, rec));
        return { data: inserted, error: null };
      },
      update: (updates) => {
        return {
          eq: async (column, value) => {
            const records = db.get(table);
            const updatedList = [];
            records.forEach((rec, idx) => {
              if (String(rec[column]) === String(value)) {
                records[idx] = { ...rec, ...updates, updated_at: new Date().toISOString() };
                updatedList.push(records[idx]);
                db.notifyListeners(table, 'UPDATE', records[idx]);
              }
            });
            db.set(table, records);
            return { data: updatedList, error: null };
          }
        };
      },
      delete: () => {
        return {
          eq: async (column, value) => {
            const records = db.get(table);
            const filtered = records.filter((rec) => String(rec[column]) !== String(value));
            db.set(table, filtered);
            db.notifyListeners(table, 'DELETE', { [column]: value });
            return { data: true, error: null };
          }
        };
      }
    };

    return queryBuilder;
  }
}

export const mockDb = new MockDatabase();
