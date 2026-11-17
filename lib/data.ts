/* Datos estáticos de la plataforma (réplica del diseño "Plataforma Tickets DMC").
   Cuando exista la base SQL Server, solo cambia lib/repo.ts: el resto de la app
   consume el repositorio y no estos arreglos directamente. */

export const AHORA = "31/08/2026 08:45";
export const AHORA_ACCION = "31/08/2026 08:52";
export const SLA_HORAS = 48;

export const MESES = ["sep", "oct", "nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago"];
export const CREADOS = [18, 22, 19, 27, 15, 17, 21, 24, 20, 26, 23, 29];
export const RESUELTOS = [16, 20, 21, 24, 17, 15, 19, 22, 21, 24, 25, 26];
export const SEMANAS = [58, 54, 61, 49, 52, 44, 47, 41, 45, 38, 36, 34];

export const TECNICOS = ["Rodrigo Cáceres", "Camila Fuentes", "Jorge Millán", "Patricia Soto", "Iván Reyes", "Matías Zúñiga"];

export const RANKING: [string, number][] = [
  ["Falabella Parque Arauco", 24],
  ["Líder Maipú", 19],
  ["Paris Alto Las Condes", 16],
  ["Sodimac Puente Alto", 14],
  ["Preunic Providencia", 11],
  ["100% Fútbol Costanera", 9],
  ["Salcobrand Ñuñoa", 7],
  ["Tricot Estación Central", 5],
];

export const TIPOS_FALLA: [string, number, string][] = [
  ["Conectividad", 38, "#9184d9"],
  ["Falsa alarma", 29, "#5a92c9"],
  ["No detecta etiquetas", 22, "#d99b45"],
  ["Daño físico", 14, "#e0645e"],
  ["Energía", 11, "#58b483"],
  ["Sincronización TX/RX", 7, "#a7a1db"],
  ["Otros", 5, "#75798c"],
];

export const SUBCATEGORIAS: Record<string, string[]> = {
  Conectividad: ["Sin señal Ethernet", "Sin señal WiFi", "Puerto 8810 bloqueado", "IP duplicada"],
  "Falsa alarma": ["Alarma sin mercadería", "Interferencia de equipos", "Etiqueta mal desactivada"],
  "No detecta etiquetas": ["Solo etiquetas duras", "Solo etiquetas blandas", "Alcance reducido"],
  "Daño físico": ["Carcasa suelta o rota", "Golpe de carro o vehículo", "Cableado expuesto"],
  Energía: ["No enciende", "Se reinicia solo", "Transformador dañado"],
  "Sincronización TX/RX": ["Pórtico desalineado", "Fuera de fase", "Cambio de ubicación"],
  Otros: ["Consulta técnica", "Capacitación", "Traslado de equipo"],
};

export const MODELOS = ["SD-8088", "SD-601", "SD-602", "RF4210 TX", "RF4210 RX"] as const;
export const ESTADOS = ["Nuevo", "Asignado", "En terreno", "En espera cliente", "Resuelto", "Cerrado"] as const;
export const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"] as const;

export type Estado = (typeof ESTADOS)[number];
export type Prioridad = (typeof PRIORIDADES)[number];

export type Equipo = { s: string; m: string; u: string; on: boolean; sig: string; inst: string; mant: string };
export type Tienda = {
  id: string; n: string; dir: string; com: string; cont: string; cargo: string; tel: string; hor: string;
  inc: number[]; eq: Equipo[];
};
export type Evento = { t: string; a: string; d: string; k: "crea" | "asig" | "nota" | "visita" | "est" | "res" | "cierre" };
export type Comentario = { a: string; r: "Cliente" | "Soporte DMC"; d: string; x: string; adj?: string[] };
export type Ticket = {
  id: string; ti: string; eq: string; tipo: string; prio: Prioridad; est: Estado; cre: string; hrs: number;
  act: string; tec: string; desc: string; adj: number; tl?: Evento[]; co?: Comentario[]; valoracion?: number;
};

export const TIENDAS: Tienda[] = [
  { id: "t1", n: "Falabella Parque Arauco", dir: "Av. Pdte. Kennedy 5413, local 2140", com: "Las Condes", cont: "Marcela Ortiz", cargo: "Jefa de prevención de pérdidas", tel: "+56 9 8214 5507", hor: "Lun a Dom · 10:00 – 21:00", inc: [2, 3, 1, 4, 2, 3, 1, 2, 3, 1, 2, 4], eq: [
    { s: "SD8088-24-0417", m: "SD-8088", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:42", inst: "14/03/2024", mant: "12/05/2026" },
    { s: "SD8088-24-0418", m: "SD-8088", u: "Pórtico entrada principal", on: false, sig: "29/08/2026 22:07", inst: "14/03/2024", mant: "12/05/2026" },
    { s: "RF4210-23-1120", m: "RF4210 TX", u: "Acceso mall nivel -1", on: true, sig: "31/08/2026 08:41", inst: "02/08/2023", mant: "18/04/2026" },
    { s: "RF4210-23-1121", m: "RF4210 RX", u: "Acceso mall nivel -1", on: true, sig: "31/08/2026 08:41", inst: "02/08/2023", mant: "18/04/2026" },
    { s: "SD601-25-0033", m: "SD-601", u: "Caja 3", on: true, sig: "31/08/2026 08:40", inst: "21/01/2025", mant: "21/07/2026" },
    { s: "SD602-25-0210", m: "SD-602", u: "Salida norte", on: true, sig: "31/08/2026 08:39", inst: "21/01/2025", mant: "21/07/2026" }] },
  { id: "t2", n: "Líder Maipú", dir: "Av. Américo Vespucio 1001", com: "Maipú", cont: "Cristián Bustos", cargo: "Jefe de local", tel: "+56 9 7745 1188", hor: "Lun a Dom · 08:30 – 22:00", inc: [3, 2, 4, 3, 1, 2, 2, 3, 4, 2, 3, 3], eq: [
    { s: "SD8088-22-0902", m: "SD-8088", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:38", inst: "09/06/2022", mant: "03/03/2026" },
    { s: "SD8088-22-0903", m: "SD-8088", u: "Pórtico salida cajas", on: true, sig: "31/08/2026 08:38", inst: "09/06/2022", mant: "03/03/2026" },
    { s: "SD601-24-0776", m: "SD-601", u: "Caja 12", on: false, sig: "30/08/2026 19:52", inst: "11/11/2024", mant: "11/05/2026" },
    { s: "SD602-24-0451", m: "SD-602", u: "Bodega recepción", on: true, sig: "31/08/2026 08:37", inst: "11/11/2024", mant: "11/05/2026" }] },
  { id: "t3", n: "100% Fútbol Costanera", dir: "Av. Andrés Bello 2425, nivel 3", com: "Providencia", cont: "Nicolás Vergara", cargo: "Encargado de operaciones", tel: "+56 9 6612 4409", hor: "Lun a Dom · 10:00 – 21:00", inc: [1, 0, 2, 1, 1, 0, 1, 2, 1, 0, 1, 1], eq: [
    { s: "RF4210-25-0088", m: "RF4210 TX", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:36", inst: "04/02/2025", mant: "04/08/2026" },
    { s: "RF4210-25-0089", m: "RF4210 RX", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:36", inst: "04/02/2025", mant: "04/08/2026" }] },
  { id: "t4", n: "Preunic Providencia", dir: "Av. Providencia 2124", com: "Providencia", cont: "Daniela Rojas", cargo: "Jefa de local", tel: "+56 9 5580 3321", hor: "Lun a Sáb · 09:00 – 20:30", inc: [2, 1, 1, 3, 2, 1, 2, 1, 1, 2, 1, 2], eq: [
    { s: "SD601-23-0512", m: "SD-601", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:35", inst: "27/07/2023", mant: "15/01/2026" },
    { s: "SD601-23-0513", m: "SD-601", u: "Caja 1", on: true, sig: "31/08/2026 08:35", inst: "27/07/2023", mant: "15/01/2026" },
    { s: "SD602-23-0140", m: "SD-602", u: "Salida secundaria", on: true, sig: "31/08/2026 08:34", inst: "27/07/2023", mant: "15/01/2026" }] },
  { id: "t5", n: "Paris Alto Las Condes", dir: "Av. Pdte. Kennedy 9001, local 3020", com: "Las Condes", cont: "Felipe Aravena", cargo: "Subgerente de tienda", tel: "+56 9 9032 7714", hor: "Lun a Dom · 10:00 – 21:00", inc: [2, 2, 3, 2, 1, 3, 2, 2, 1, 3, 2, 2], eq: [
    { s: "SD8088-24-0620", m: "SD-8088", u: "Pórtico entrada mall", on: true, sig: "31/08/2026 08:33", inst: "19/09/2024", mant: "20/06/2026" },
    { s: "SD8088-24-0621", m: "SD-8088", u: "Pórtico entrada calle", on: true, sig: "31/08/2026 08:33", inst: "19/09/2024", mant: "20/06/2026" },
    { s: "SD602-24-0333", m: "SD-602", u: "Probadores nivel 2", on: true, sig: "31/08/2026 08:32", inst: "19/09/2024", mant: "20/06/2026" }] },
  { id: "t6", n: "Sodimac Puente Alto", dir: "Av. Concha y Toro 2500", com: "Puente Alto", cont: "Jorge Peña", cargo: "Jefe de prevención", tel: "+56 9 4419 6650", hor: "Lun a Dom · 08:00 – 21:00", inc: [3, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1, 2], eq: [
    { s: "SD8088-21-0310", m: "SD-8088", u: "Pórtico salida principal", on: true, sig: "31/08/2026 08:31", inst: "12/04/2021", mant: "08/02/2026" },
    { s: "SD601-21-0455", m: "SD-601", u: "Caja 7", on: true, sig: "31/08/2026 08:31", inst: "12/04/2021", mant: "08/02/2026" },
    { s: "SD601-21-0456", m: "SD-601", u: "Patio constructor", on: false, sig: "28/08/2026 14:19", inst: "12/04/2021", mant: "08/02/2026" }] },
  { id: "t7", n: "Tricot Estación Central", dir: "Alameda 3470, local 118", com: "Estación Central", cont: "Paula Lagos", cargo: "Jefa de local", tel: "+56 9 3327 8804", hor: "Lun a Dom · 10:00 – 20:00", inc: [1, 1, 0, 2, 1, 1, 0, 1, 1, 1, 0, 1], eq: [
    { s: "SD602-22-0077", m: "SD-602", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:30", inst: "30/05/2022", mant: "22/12/2025" },
    { s: "SD602-22-0078", m: "SD-602", u: "Salida a galería", on: true, sig: "31/08/2026 08:30", inst: "30/05/2022", mant: "22/12/2025" }] },
  { id: "t8", n: "Salcobrand Ñuñoa", dir: "Av. Irarrázaval 3300", com: "Ñuñoa", cont: "Andrés Miranda", cargo: "Encargado de turno", tel: "+56 9 8890 2213", hor: "Lun a Dom · 08:00 – 23:00", inc: [1, 2, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1], eq: [
    { s: "SD601-25-0901", m: "SD-601", u: "Pórtico entrada principal", on: true, sig: "31/08/2026 08:29", inst: "16/03/2025", mant: "16/07/2026" },
    { s: "SD601-25-0902", m: "SD-601", u: "Caja 2", on: true, sig: "31/08/2026 08:29", inst: "16/03/2025", mant: "16/07/2026" }] },
];

export const TICKETS_INICIALES: Ticket[] = [
  { id: "TKT-2026-0142", ti: "t1", eq: "SD8088-24-0418", tipo: "Conectividad", prio: "Crítica", est: "En terreno", cre: "27/08/2026 09:14", hrs: 95, act: "31/08/2026 08:20", tec: "Rodrigo Cáceres", adj: 2,
    desc: "El pórtico derecho de la entrada principal perdió conexión con eas-data.net el jueves después de un corte de energía. El equipo enciende pero la luz de red queda ámbar fija y no aparece en el monitoreo. Ocurre de forma permanente, no intermitente.",
    tl: [
      { t: "Solicitud ingresada", a: "Marcela Ortiz · Falabella Parque Arauco", d: "27/08/2026 09:14", k: "crea" },
      { t: "Ticket asignado a Rodrigo Cáceres", a: "Mesa de ayuda DMC", d: "27/08/2026 10:02", k: "asig" },
      { t: "Diagnóstico remoto: sin respuesta en puerto 8810", a: "Rodrigo Cáceres", d: "27/08/2026 15:40", k: "nota" },
      { t: "Visita en terreno agendada para el 31/08 a las 11:00", a: "Rodrigo Cáceres", d: "28/08/2026 09:12", k: "visita" },
      { t: "Estado cambiado a En terreno", a: "Rodrigo Cáceres", d: "31/08/2026 08:20", k: "est" }],
    co: [
      { a: "Marcela Ortiz", r: "Cliente", d: "27/08/2026 09:20", x: "Adjunto dos fotos del tablero: la luz de red queda ámbar fija. El switch del local fue revisado por nuestro proveedor de TI y el puerto está operativo.", adj: ["tablero-antena-2.jpg", "luz-red-ambar.jpg"] },
      { a: "Rodrigo Cáceres", r: "Soporte DMC", d: "27/08/2026 15:44", x: "Gracias Marcela. Desde nuestro lado el equipo no responde en el puerto 8810, lo que descarta un problema de plataforma. Probablemente la tarjeta de red del RX quedó dañada con el corte. Llevo repuesto a la visita del lunes." },
      { a: "Marcela Ortiz", r: "Cliente", d: "28/08/2026 10:05", x: "Perfecto. El lunes hay recepción de mercadería desde las 08:00, así que a las 11:00 está bien para no interferir." }] },
  { id: "TKT-2026-0141", ti: "t2", eq: "SD601-24-0776", tipo: "Falsa alarma", prio: "Alta", est: "Asignado", cre: "28/08/2026 16:40", hrs: 64, act: "30/08/2026 12:05", tec: "Camila Fuentes", adj: 1,
    desc: "La antena de la caja 12 emite alarma sin que pase mercadería, sobre todo en horario punta. Es intermitente y empeoró desde que se instaló un lector de códigos nuevo en la caja vecina.",
    co: [
      { a: "Cristián Bustos", r: "Cliente", d: "28/08/2026 16:45", x: "Suena unas 15 veces por hora entre las 18:00 y 20:00. Ya movimos el carro de bolsas reutilizables por si era eso, pero sigue igual." },
      { a: "Camila Fuentes", r: "Soporte DMC", d: "30/08/2026 12:05", x: "Recibido. Vamos a medir interferencia en terreno; el lector nuevo puede estar emitiendo en una frecuencia cercana. Necesito confirmar si podemos apagar la caja 12 unos 20 minutos." }] },
  { id: "TKT-2026-0140", ti: "t6", eq: "SD601-21-0456", tipo: "Conectividad", prio: "Alta", est: "En espera cliente", cre: "26/08/2026 11:05", hrs: 118, act: "29/08/2026 17:30", tec: "Jorge Millán", adj: 0, desc: "La antena del patio constructor aparece offline en el monitoreo desde el 28/08. No hay daño visible en el equipo." },
  { id: "TKT-2026-0139", ti: "t5", eq: "SD8088-24-0621", tipo: "No detecta etiquetas", prio: "Media", est: "Asignado", cre: "29/08/2026 10:22", hrs: 46, act: "30/08/2026 09:14", tec: "Patricia Soto", adj: 1, desc: "El pórtico de entrada por calle dejó de detectar etiquetas duras. Las etiquetas blandas sí las detecta. No hubo cortes de energía ni obras recientes." },
  { id: "TKT-2026-0138", ti: "t4", eq: "SD601-23-0513", tipo: "Daño físico", prio: "Media", est: "En terreno", cre: "29/08/2026 15:48", hrs: 41, act: "31/08/2026 07:55", tec: "Iván Reyes", adj: 3, desc: "Un carro de reposición golpeó la base de la antena de la caja 1 y la carcasa quedó suelta. El equipo sigue funcionando pero se mueve al abrir la puerta." },
  { id: "TKT-2026-0137", ti: "t3", eq: "RF4210-25-0089", tipo: "Sincronización TX/RX", prio: "Media", est: "Resuelto", cre: "24/08/2026 09:30", hrs: 167, act: "25/08/2026 18:10", tec: "Matías Zúñiga", adj: 0, desc: "Desajuste de sincronización entre TX y RX después de mover el pórtico por remodelación del acceso." },
  { id: "TKT-2026-0136", ti: "t1", eq: "SD601-25-0033", tipo: "Energía", prio: "Baja", est: "Resuelto", cre: "21/08/2026 12:15", hrs: 236, act: "22/08/2026 14:40", tec: "Rodrigo Cáceres", adj: 1, desc: "La antena de la caja 3 se reinicia sola dos o tres veces al día. Se sospecha del transformador." },
  { id: "TKT-2026-0135", ti: "t2", eq: "SD8088-22-0903", tipo: "Falsa alarma", prio: "Alta", est: "Cerrado", cre: "18/08/2026 08:05", hrs: 313, act: "20/08/2026 16:22", tec: "Camila Fuentes", adj: 2, desc: "Alarma constante en el pórtico de salida de cajas desde la apertura del local." },
  { id: "TKT-2026-0134", ti: "t7", eq: "SD602-22-0078", tipo: "No detecta etiquetas", prio: "Media", est: "Cerrado", cre: "14/08/2026 17:20", hrs: 399, act: "17/08/2026 11:05", tec: "Patricia Soto", adj: 0, desc: "La antena de salida a galería detecta solo a menos de 30 cm." },
  { id: "TKT-2026-0133", ti: "t8", eq: "SD601-25-0902", tipo: "Otros", prio: "Baja", est: "Cerrado", cre: "11/08/2026 09:44", hrs: 479, act: "12/08/2026 10:02", tec: "Iván Reyes", adj: 0, desc: "Solicitud de capacitación al personal nuevo sobre uso del desactivador y lectura de indicadores." },
  { id: "TKT-2026-0132", ti: "t5", eq: "SD602-24-0333", tipo: "Daño físico", prio: "Baja", est: "Cerrado", cre: "07/08/2026 14:02", hrs: 571, act: "10/08/2026 09:30", tec: "Matías Zúñiga", adj: 1, desc: "Tapa de la antena de probadores rayada y con un tornillo faltante." },
  { id: "TKT-2026-0131", ti: "t6", eq: "SD8088-21-0310", tipo: "Conectividad", prio: "Crítica", est: "Cerrado", cre: "03/08/2026 07:50", hrs: 673, act: "04/08/2026 15:12", tec: "Jorge Millán", adj: 2, desc: "Pórtico de salida principal fuera de línea durante todo el fin de semana largo." },
  { id: "TKT-2026-0130", ti: "t4", eq: "SD602-23-0140", tipo: "Energía", prio: "Media", est: "Cerrado", cre: "29/07/2026 16:35", hrs: 784, act: "31/07/2026 12:00", tec: "Rodrigo Cáceres", adj: 0, desc: "La antena de la salida secundaria no enciende después del cambio del tablero eléctrico del local." },
  { id: "TKT-2026-0129", ti: "t1", eq: "RF4210-23-1120", tipo: "Sincronización TX/RX", prio: "Alta", est: "Cerrado", cre: "22/07/2026 10:10", hrs: 959, act: "24/07/2026 19:20", tec: "Camila Fuentes", adj: 1, desc: "Pérdida de sincronía del pórtico del nivel -1 tras corte programado de energía del mall." },
];

export const NOTIFICACIONES = [
  { t: "TKT-2026-0142 pasó a “En terreno”. Rodrigo Cáceres llega hoy a las 11:00.", d: "Hace 25 minutos", c: "#d99b45" },
  { t: "SD8088-24-0418 sigue sin señal desde el 29/08 a las 22:07.", d: "Hace 3 horas", c: "#e0645e" },
  { t: "TKT-2026-0137 fue resuelto. Puedes valorar la atención.", d: "Ayer · 18:10", c: "#58b483" },
];

export const USUARIO = {
  nombre: "Marcela Ortiz", iniciales: "MO", cargo: "Jefa de prevención de pérdidas", rol: "Prevención · Falabella",
  correo: "m.ortiz@falabella.cl", tel: "+56 9 8214 5507",
};

export const USUARIOS_CUENTA = [
  { n: "Marcela Ortiz", c: "m.ortiz@falabella.cl", perfil: "Administrador de cuenta", acento: true, tiendas: "Todas (8)", ult: "31/08/2026 08:31" },
  { n: "Cristián Bustos", c: "c.bustos@lider.cl", perfil: "Jefe de local", acento: false, tiendas: "Líder Maipú", ult: "30/08/2026 19:12" },
  { n: "Daniela Rojas", c: "d.rojas@preunic.cl", perfil: "Jefe de local", acento: false, tiendas: "Preunic Providencia", ult: "29/08/2026 11:40" },
  { n: "Felipe Aravena", c: "f.aravena@paris.cl", perfil: "Operaciones", acento: false, tiendas: "Paris Alto Las Condes", ult: "28/08/2026 16:05" },
];

export const TIEMPO_PROMEDIO_TIENDA = ["1d 22h", "2d 4h", "2d 11h", "1d 15h", "2d 20h", "1d 8h", "2d 2h", "1d 4h"];
export const CUMPLIMIENTO_TIENDA = [96, 91, 88, 94, 83, 97, 90, 99];
