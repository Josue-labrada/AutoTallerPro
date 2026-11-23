// Pruebas de CP-08: Transición de estados

import { describe, expect, it } from 'vitest';
import {
  isAllowedTransition,
  isWorkOrderStatus,
  WORK_ORDER_STATUSES,
} from '../../src/modules/work-orders/work-order.model.js';

// CP-08 (US08): la orden solo puede avanzar a la etapa inmediatamente siguiente.
describe('transiciones de una orden', () => {
  it('permite avanzar a la etapa siguiente en toda la secuencia', () => {
    expect(isAllowedTransition('EN_RECEPCION', 'EN_DIAGNOSTICO')).toBe(true);
    expect(isAllowedTransition('EN_DIAGNOSTICO', 'EN_REPARACION')).toBe(true);
    expect(isAllowedTransition('EN_REPARACION', 'LISTO_PARA_ENTREGA')).toBe(true);
  });

  it('no permite saltar etapas', () => {
    expect(isAllowedTransition('EN_RECEPCION', 'EN_REPARACION')).toBe(false);
    expect(isAllowedTransition('EN_RECEPCION', 'LISTO_PARA_ENTREGA')).toBe(false);
    expect(isAllowedTransition('EN_DIAGNOSTICO', 'LISTO_PARA_ENTREGA')).toBe(false);
  });

  it('no permite regresar a una etapa anterior', () => {
    expect(isAllowedTransition('EN_DIAGNOSTICO', 'EN_RECEPCION')).toBe(false);
    expect(isAllowedTransition('LISTO_PARA_ENTREGA', 'EN_REPARACION')).toBe(false);
  });

  it('no permite quedarse en la misma etapa', () => {
    for (const status of WORK_ORDER_STATUSES) {
      expect(isAllowedTransition(status, status)).toBe(false);
    }
  });

  it('la ultima etapa no tiene siguiente', () => {
    for (const status of WORK_ORDER_STATUSES) {
      expect(isAllowedTransition('LISTO_PARA_ENTREGA', status)).toBe(false);
    }
  });
});

describe('isWorkOrderStatus', () => {
  it('reconoce los cuatro estados definidos', () => {
    for (const status of WORK_ORDER_STATUSES) expect(isWorkOrderStatus(status)).toBe(true);
  });

  it.each([['en_recepcion'], ['CERRADA'], [''], [null], [undefined], [42], [{}]])(
    'rechaza %o',
    (value) => {
      expect(isWorkOrderStatus(value)).toBe(false);
    },
  );
});