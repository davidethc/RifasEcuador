
### 2. SECTION: RESUMEN DE PREMIOS

Debajo del hero, muestra en formato horizontal o grid simple un resumen rápido de los premios:

- Card 1:
  - Título: "Primer Premio"
  - Subtítulo: "KIA Rio Hatchback"
  - Texto breve: "Premio mayor del sorteo. Entrega con traspaso en Pichincha."

- Card 2:
  - Título: "Segundo Premio"
  - Subtítulo: "Yamaha MT-07 Street"
  - Texto breve: "Moto naked deportiva, ideal para ciudad y carretera."

- Card 3:
  - Título: "Tercer Premio"
  - Subtítulo: "Kove 321R Sport"
  - Texto breve: "Moto deportiva carenada con estilo agresivo."

Deja las imágenes como props o placeholders; no es necesario conectar nada todavía, sólo estructura el espacio.

---

### 3. SECTION: SELECCIÓN DE BOLETOS (COMBOS)

Esta es la parte más importante de la página a nivel de conversión.

Crea un componente en esta misma página (o separado) para seleccionar la cantidad de boletos, con una UI clara basada en “combos” + opción personalizada.

Requisitos:

- Mostrar varias opciones predefinidas, tipo cards seleccionables:

  1 boleto — $1.00  
  5 boletos — $5.00  
  10 boletos — $10.00 (con mensaje tipo: "Más chances de ganar")  
  20 boletos — $20.00 (con mensaje tipo: "Máximo valor por tu dinero")

- Cada card debe incluir:
  - Título: "1 Boleto", "Combo 5", "Combo 10", "Combo 20"
  - Precio
  - Línea de ayuda/opcional, por ejemplo:
    - "Participa con una sola oportunidad."
    - "Ideal para empezar."
    - "Aumenta tus chances."
    - "Paquete recomendado."

- Permitir también una **cantidad personalizada** (input numérico) si lo deseas, pero que los combos sean lo principal visualmente.

Desde el punto de vista de datos, el componente debe exponer o manejar:
- `selectedTickets` (cantidad de boletos)
- `totalAmount` (selectedTickets * 1)

Puedes manejarlo mediante estado local en el componente principal de la página:
- Estado: `const [selectedTickets, setSelectedTickets] = useState<number>(10);` (por ejemplo, 1 o 5 por defecto)
- `totalAmount = selectedTickets * 1;`

---

### 4. SECTION: RESUMEN DE PEDIDO + MÉTODOS DE PAGO

A un lado (en desktop) o debajo (en mobile) de la selección de boletos, crea un bloque tipo “card de resumen” con:

- Título: "Resumen de tu participación"
- Línea: "Boletos seleccionados: {selectedTickets}"
- Línea: "Total a pagar: ${totalAmount}"

Debajo, mostrar los métodos de pago con iconos o texto:

- Subtítulo: "Métodos de pago disponibles:"
- Listado:
  - Payphone
  - Tarjeta
  - Transferencia bancaria

Botón principal de acción:

- Texto: "Confirmar compra"
- Este botón debe:
  - Llamar a la función actual de checkout si ya existe.
  - Si todavía no está implementada la lógica, deja un `TODO` o una función vacía, pero deja el botón preparado para conectar la lógica.

Debajo del botón, un texto pequeño de confianza:

- "Tu pago es procesado de forma segura. Al continuar aceptas los términos del sorteo."

---

### 5. SECTION: INFORMACIÓN CLAVE DEL SORTEO

Crea un bloque informativo sencillo con texto estático (por ahora) que refuerce la claridad:

Contenido:

- Título: "Información del sorteo"
- Lista de puntos:

  - "Sorteo realizado con Lotería Nacional."
  - "Resultados públicos y verificables."
  - "Entrega de los premios en Pichincha."
  - "Participación válida en todo el Ecuador."
  - "Se notifica al ganador por WhatsApp y correo."

Este bloque es puramente de texto y debe ser visualmente limpio y fácil de leer.

---

### 6. SECTION: PROGRESO DEL SORTEO (BARRA)

Aquí mostramos el avance de boletos vendidos como elemento psicológico de escasez.

Crea un bloque con:

- Título: "Avance de boletos vendidos"
- Texto descriptivo:
  - "Cuando se complete la emisión de boletos, se realiza el sorteo junto con Lotería Nacional."

- Muestra:
  - "Boletos vendidos: {soldTickets}"
  - Una barra de progreso visual basada en un porcentaje.

`soldTickets` y `percentage` pueden ser, por ahora, valores mockeados o provenientes de props. Ejemplo:

```ts
const soldTickets = 12540;
const percentage = 0.21; // 21%