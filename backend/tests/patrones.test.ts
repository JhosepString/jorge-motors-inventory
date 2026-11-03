import { describe, expect, it } from 'vitest';
import { estadoDe } from '../src/modules/alertas/estados.ts';
import { bandejaSalida, estrategiaPara } from '../src/modules/alertas/canales.ts';
import { HttpError } from '../src/utils/errores.ts';

describe('State: ciclo de vida de la alerta', () => {
  it('PENDIENTE solo puede enviarse y pasa a ENVIADA con canal y fecha', () => {
    const cambio = estadoDe('PENDIENTE').enviar('WHATSAPP');
    expect(cambio.estado).toBe('ENVIADA');
    expect(cambio.canal).toBe('WHATSAPP');
    expect(cambio.fechaEnviada).toBeInstanceOf(Date);
    expect(() => estadoDe('PENDIENTE').atender()).toThrow(HttpError);
  });

  it('ENVIADA solo puede atenderse', () => {
    expect(estadoDe('ENVIADA').atender().estado).toBe('ATENDIDA');
    expect(() => estadoDe('ENVIADA').enviar('CORREO')).toThrow(HttpError);
  });

  it('ATENDIDA no permite ninguna acción', () => {
    expect(estadoDe('ATENDIDA').acciones).toEqual([]);
    expect(() => estadoDe('ATENDIDA').enviar('SMS')).toThrow(/no se puede enviar/);
    expect(() => estadoDe('ATENDIDA').atender()).toThrow(/no se puede marcar/);
  });
});

describe('Strategy: canal de aviso según el proveedor', () => {
  const aviso = {
    alertaId: 7,
    proveedor: { razonSocial: 'Lubricantes Ica E.I.R.L.', email: null, telefono: '956123402' },
    producto: { sku: 'LUB-0001', nombre: 'Aceite de motor 20W-50' },
    stockDetectado: 3,
    stockMinimo: 6,
  };

  it('elige la estrategia correcta para cada canal', () => {
    expect(estrategiaPara('CORREO').constructor.name).toBe('CorreoStrategy');
    expect(estrategiaPara('SMS').constructor.name).toBe('SmsStrategy');
    expect(estrategiaPara('WHATSAPP').constructor.name).toBe('WhatsAppStrategy');
    expect(() => estrategiaPara('PALOMA')).toThrow(HttpError);
  });

  it('WhatsApp envía al teléfono y deja el mensaje en la bandeja', async () => {
    const m = await estrategiaPara('WHATSAPP').enviar(aviso);
    expect(m.destino).toBe('+51 956123402');
    expect(m.texto).toContain('LUB-0001');
    expect(bandejaSalida[0]).toEqual(m);
  });

  it('Correo exige que el proveedor tenga correo', async () => {
    await expect(estrategiaPara('CORREO').enviar(aviso)).rejects.toThrow(/no tiene correo/);
  });
});
