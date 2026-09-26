// ==============================================================================
// Beckn Unified Energy Interface (UEI) Protocol Simulation Engine
// Implements: discover -> quote -> order -> authorize -> allocate -> settle -> status
// Persists every protocol handshake and state transition to Supabase tables.
// ==============================================================================

import { db } from './supabaseClient';
import { mockDb } from './mockDatabase';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const BECKN_STATES = {
  DISCOVERED: 'DISCOVERED',
  QUOTED: 'QUOTED',
  AUTHORIZED: 'AUTHORIZED',
  ALLOCATED: 'ALLOCATED',
  SETTLED: 'SETTLED',
  FAILED: 'FAILED'
};

export const PROTOCOL_VERSION = 'UEI/Beckn-v1.1.0';

/**
 * Log a Beckn Protocol Handshake event to the database
 */
export async function logProtocolEvent({ orderId, action, senderId, recipientId, payload }) {
  const event = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    order_id: orderId,
    action,
    sender_id: senderId,
    recipient_id: recipientId,
    message_id: `msg-${Date.now()}-${action}`,
    protocol_version: PROTOCOL_VERSION,
    payload,
    timestamp: new Date().toLocaleTimeString()
  };

  try {
    if (db.isLive()) {
      await db.from('protocol_events').insert([event]);
    } else {
      mockDb.insert('protocol_events', event);
    }
  } catch (err) {
    console.error('Failed to log protocol event:', err);
    mockDb.insert('protocol_events', event);
  }

  return event;
}

/**
 * Step 1: DISCOVER (Beckn search / on_search)
 */
export async function becknDiscover({ buyer, zone = 'S2-East', requiredKwh = 3.2 }) {
  await delay(600); // Artificial network round-trip

  const orderId = `ord-${Date.now()}`;
  const bapId = `janurja.bap.${buyer.id.substring(0, 6)}`;
  const bgId = 'gateway.uei.karnataka.gov.in';

  // 1. Log Buyer search intent
  await logProtocolEvent({
    orderId,
    action: 'search',
    senderId: `BAP:${bapId}`,
    recipientId: `BG:${bgId}`,
    payload: {
      context: { domain: 'uei:energy:p2p', action: 'search', version: PROTOCOL_VERSION, timestamp: new Date().toISOString() },
      message: {
        intent: {
          item: { descriptor: { name: 'P2P Clean Solar Energy' }, energy_type: 'SOLAR_PHOTOVOLTAIC' },
          fulfillment: { stops: [{ location: { zone_code: zone } }] },
          quantity: { count: requiredKwh, unit: 'kWh' }
        }
      }
    }
  });

  await delay(500);

  // 2. Fetch matched offers from DB
  let offers = [];
  try {
    const res = await db.from('energy_offers').select('*').eq('status', 'active');
    offers = res.data || [];
  } catch {
    offers = mockDb.get('energy_offers');
  }

  const bppId = 'janurja.bpp.node1042';

  // Log Provider response
  await logProtocolEvent({
    orderId,
    action: 'on_search',
    senderId: `BPP:${bppId}`,
    recipientId: `BAP:${bapId}`,
    payload: {
      context: { domain: 'uei:energy:p2p', action: 'on_search', version: PROTOCOL_VERSION },
      message: {
        catalog: {
          bpp_descriptor: { name: 'Surathkal P2P Clean Energy Registry' },
          providers_count: offers.length,
          best_match_node: 'NODE-2010 (NITK Microgrid Hub)',
          available_capacity_kwh: 15.00,
          base_price_inr: 5.80
        }
      }
    }
  });

  return { orderId, bapId, bppId, offers };
}

/**
 * Step 2: QUOTE (Beckn select / on_select)
 */
export async function becknQuote({ orderId, bapId, bppId, buyer, seller, node, offer, quantityKwh = 3.2 }) {
  await delay(600);

  const pricePerKwh = Number(offer.price_per_kwh || 6.20);
  const energyAmount = Number((quantityKwh * pricePerKwh).toFixed(2));
  const wheelingCharge = Number((quantityKwh * 0.15).toFixed(2)); // ₹0.15/kWh MESCOM wheeling
  const discomFee = 0.05; // Regulatory cess
  const totalAmount = Number((energyAmount + wheelingCharge + discomFee).toFixed(2));
  const co2AvoidedKg = Number((quantityKwh * 0.82).toFixed(2)); // 0.82 kg CO2 per kWh solar vs Indian thermal grid

  // Log select
  await logProtocolEvent({
    orderId,
    action: 'select',
    senderId: `BAP:${bapId}`,
    recipientId: `BPP:${bppId}`,
    payload: {
      order: {
        provider: { id: node.id, smart_meter_id: node.smart_meter_id },
        items: [{ id: offer.id, quantity: { selected: { count: quantityKwh, unit: 'kWh' } } }]
      }
    }
  });

  await delay(500);

  // Log on_select (Itemized Tariff Quote)
  await logProtocolEvent({
    orderId,
    action: 'on_select',
    senderId: `BPP:${bppId}`,
    recipientId: `BAP:${bapId}`,
    payload: {
      order: {
        quote: {
          price: { currency: 'INR', value: totalAmount.toFixed(2) },
          breakup: [
            { title: `Solar Energy Charge (${quantityKwh} kWh @ ₹${pricePerKwh}/unit)`, price: { value: energyAmount.toFixed(2) } },
            { title: 'MESCOM Grid Wheeling Fee (DPI Infrastructure)', price: { value: wheelingCharge.toFixed(2) } },
            { title: 'State Regulatory Solar Cess', price: { value: discomFee.toFixed(2) } }
          ],
          ttl: 'PT15M'
        }
      }
    }
  });

  // Create initial order in DB with state QUOTED
  const orderRecord = {
    id: orderId,
    transaction_id: `TXN-UEI-${Date.now().toString().slice(-6)}`,
    buyer_id: buyer.id,
    buyer_name: buyer.full_name,
    seller_id: seller.id,
    seller_name: seller.full_name,
    offer_id: offer.id,
    node_id: node.id,
    quantity_kwh: quantityKwh,
    price_per_kwh: pricePerKwh,
    total_amount: totalAmount,
    wheeling_charge: wheelingCharge,
    discom_fee: discomFee,
    co2_avoided_kg: co2AvoidedKg,
    protocol_state: BECKN_STATES.QUOTED,
    bap_id: bapId,
    bpp_id: bppId
  };

  try {
    if (db.isLive()) {
      await db.from('orders').insert([orderRecord]);
    } else {
      mockDb.insert('orders', orderRecord);
    }
  } catch {
    mockDb.insert('orders', orderRecord);
  }

  return {
    orderRecord,
    breakup: {
      energyAmount,
      wheelingCharge,
      discomFee,
      totalAmount,
      co2AvoidedKg
    }
  };
}

/**
 * Step 3: ORDER / INIT (Beckn init / on_init)
 */
export async function becknInit({ orderId, bapId, bppId, buyer, totalAmount }) {
  await delay(500);

  const buyerUpi = buyer?.upi_id || 'priya@okhdfcbank';
  const upiDomain = (buyerUpi.includes('@') ? buyerUpi.split('@')[1] : 'OKSBI').toUpperCase();
  const upiMandateId = `UPI-MAND-${Date.now().toString().slice(-6)}-${upiDomain}`;

  // Log init
  await logProtocolEvent({
    orderId,
    action: 'init',
    senderId: `BAP:${bapId}`,
    recipientId: `BPP:${bppId}`,
    payload: {
      order: {
        billing: {
          name: buyer?.full_name || buyer?.name || 'Priya Nayak',
          phone: buyer?.phone || '+91 98765 43210',
          upi_vpa: buyerUpi
        },
        payment: { type: 'UPI_COLLECT', collected_by: 'BAP', amount: totalAmount }
      }
    }
  });

  await delay(400);

  // Log on_init
  await logProtocolEvent({
    orderId,
    action: 'on_init',
    senderId: `BPP:${bppId}`,
    recipientId: `BAP:${bapId}`,
    payload: {
      order: {
        payment: {
          mandate_id: upiMandateId,
          status: 'PENDING_AUTHORIZATION',
          qr_string: `upi://pay?pa=janurja.escrow@rbi&pn=JanUrja_UEI&am=${totalAmount}&tr=${orderId}`
        }
      }
    }
  });

  return { upiMandateId };
}

/**
 * Step 4: AUTHORIZE (Mock UPI PIN Confirmation & Beckn Confirm)
 */
export async function becknAuthorize({ orderId, bapId, bppId, buyer, seller, totalAmount, upiMandateId, pin = '1234' }) {
  await delay(800); // Simulate UPI Bank Switch

  const upiTxnRef = `UPI/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Date.now().toString().slice(-8)}`;

  // Log confirm (Payment Authorized)
  await logProtocolEvent({
    orderId,
    action: 'confirm',
    senderId: `BAP:${bapId}`,
    recipientId: `BPP:${bppId}`,
    payload: {
      order: {
        id: orderId,
        payment: {
          status: 'PAID',
          type: 'UPI-AUTOPAY',
          params: {
            mandate_id: upiMandateId,
            upi_ref: upiTxnRef,
            payer_vpa: buyer?.upi_id || 'priya@okhdfcbank',
            payee_vpa: seller?.upi_id || 'nitksolar@icici',
            amount: totalAmount,
            auth_mode: 'MPIN_VERIFIED'
          }
        }
      }
    }
  });

  // Update order protocol_state to AUTHORIZED in DB
  try {
    if (db.isLive()) {
      await db.from('orders').update({ protocol_state: BECKN_STATES.AUTHORIZED, upi_mandate_id: upiMandateId }).eq('id', orderId);
    } else {
      mockDb.update('orders', orderId, { protocol_state: BECKN_STATES.AUTHORIZED, upi_mandate_id: upiMandateId });
    }
  } catch {
    mockDb.update('orders', orderId, { protocol_state: BECKN_STATES.AUTHORIZED, upi_mandate_id: upiMandateId });
  }

  return { upiTxnRef };
}

/**
 * Step 5: ALLOCATE (Smart Meter Telemetry Handshake & Microgrid Bus Balancing)
 */
export async function becknAllocate({ orderId, bapId, bppId, node, quantityKwh }) {
  await delay(800); // Simulate smart meter RTU telemetry handshake

  await logProtocolEvent({
    orderId,
    action: 'allocate',
    senderId: 'SMART_METER:DISCOM_BUS',
    recipientId: `BPP:${bppId}`,
    payload: {
      telemetry: {
        smart_meter_id: node?.smart_meter_id || 'SM-SUR-2010-P2P',
        grid_frequency_hz: 49.98,
        inverter_power_factor: 0.99,
        allocated_surplus_kwh: quantityKwh,
        line_congestion_index: 'OPTIMAL_GREEN',
        status: 'DISPATCHING_ELECTRON_FLOW'
      }
    }
  });

  // Update order protocol_state to ALLOCATED in DB
  try {
    if (db.isLive()) {
      await db.from('orders').update({ protocol_state: BECKN_STATES.ALLOCATED }).eq('id', orderId);
    } else {
      mockDb.update('orders', orderId, { protocol_state: BECKN_STATES.ALLOCATED });
    }
  } catch {
    mockDb.update('orders', orderId, { protocol_state: BECKN_STATES.ALLOCATED });
  }

  return { status: 'ALLOCATED' };
}

/**
 * Step 6: SETTLE (Instant Settlement & Financial Transfer & Receipt Persistence)
 */
export async function becknSettle({ orderId, bapId, bppId, buyer, seller, totalAmount, co2AvoidedKg = 1.62, upiTxnRef, quantityKwh, pricePerKwh }) {
  await delay(700);

  const settlementTime = new Date().toISOString();
  const buyerName = buyer?.full_name || buyer?.name || 'Priya Nayak (Consumer)';
  const sellerName = seller?.full_name || seller?.name || 'NITK Solar Research Park';
  const finalTxnRef = upiTxnRef || `UPI/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Date.now().toString().slice(-8)}`;

  // 1. Log on_confirm / settle protocol event
  await logProtocolEvent({
    orderId,
    action: 'on_confirm',
    senderId: `BPP:${bppId}`,
    recipientId: `BAP:${bapId}`,
    payload: {
      order: {
        id: orderId,
        state: BECKN_STATES.SETTLED,
        fulfillment: {
          state: { descriptor: { code: 'ENERGY_DISPATCHED_VERIFIED' } },
          smart_meter_handshake: 'ACK_SYNCHRONIZED',
          co2_avoided_kg: co2AvoidedKg,
          settled_at: settlementTime
        }
      }
    }
  });

  // 2. Persist transaction record
  const transactionRecord = {
    id: `txn-${Date.now()}`,
    order_id: orderId,
    buyer_name: buyerName,
    seller_name: sellerName,
    amount: totalAmount,
    upi_txn_ref: finalTxnRef,
    payer_vpa: buyer?.upi_id || 'priya@okhdfcbank',
    payee_vpa: seller?.upi_id || 'nitksolar@icici',
    co2_avoided_kg: co2AvoidedKg,
    status: 'SUCCESS',
    created_at: settlementTime
  };

  try {
    if (db.isLive()) {
      await db.from('transactions').insert([transactionRecord]);
      await db.from('orders').update({
        protocol_state: BECKN_STATES.SETTLED,
        settled_at: settlementTime
      }).eq('id', orderId);
    } else {
      mockDb.insert('transactions', transactionRecord);
      mockDb.update('orders', orderId, {
        protocol_state: BECKN_STATES.SETTLED,
        settled_at: settlementTime
      });
    }
  } catch {
    mockDb.insert('transactions', transactionRecord);
    mockDb.update('orders', orderId, {
      protocol_state: BECKN_STATES.SETTLED,
      settled_at: settlementTime
    });
  }

  return {
    ...transactionRecord,
    id: orderId,
    transaction_id: finalTxnRef,
    quantity_kwh: quantityKwh,
    price_per_kwh: pricePerKwh,
    total_amount: totalAmount,
    co2_avoided_kg: co2AvoidedKg,
    seller_name: sellerName,
    buyer_name: buyerName,
    wheeling_charge: (Number(quantityKwh || 3.2) * 0.15).toFixed(2),
    settled_at: settlementTime,
    transactionRecord
  };
}
