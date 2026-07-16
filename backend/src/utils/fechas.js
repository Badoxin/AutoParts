import { DIAS_ANTICIPACION_MAX } from '../config/constants.js';

export function hhmmToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minToHHMM(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}:00`;
}

export function seOverlapan(inicioA, finA, inicioB, finB) {
  return inicioA < finB && finA > inicioB;
}

export function diaSemanaDe(fecha) {
  // 0 = Domingo ... 6 = Sábado (igual que Date.getDay())
  return new Date(`${fecha}T00:00:00`).getDay();
}

export function fechaHoyStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function fechaMaximaStr() {
  const d = new Date();
  d.setDate(d.getDate() + DIAS_ANTICIPACION_MAX);
  return d.toISOString().slice(0, 10);
}
