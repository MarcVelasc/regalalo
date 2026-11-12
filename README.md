# Regalalo · MVP

Marketplace de regalos para festividades y cumpleaños. React + TypeScript + Vite.
Todo es local y estático: los datos de ejemplo viven en memoria y se reinician al recargar la página. Las personas que registra el comprador se guardan en el navegador.

## Cómo correrlo

```bash
npm install
npm run dev
```

Se abre en http://localhost:5173. Requiere Node 20 o superior.

Otros comandos: `npm run build` (compila y verifica tipos) y `npm run preview`.

## Estado actual: Fases 1 a 4 (MVP completo)

**Para la presentación:** pulsa **Tour guiado** (botón dorado bajo el header). Recorre 8 pasos cambiando solo entre comprador y vendedor, y termina en la página **Modelo de negocio**.

Para probar el flujo completo: compra un regalo como **Comprador**, cambia a **Vendedor** (switch del header), acepta y prepara el pedido, vuelve a **Comprador** y confirma la recepción: el pago se libera al vendedor y puedes calificarlo.

**Vista del comprador**
- Home con hero por festividad, catálogo con búsqueda y filtros, ficha del regalo, perfil del vendedor con sus reseñas, carrito, checkout, mis pedidos (con confirmación de recepción y calificación) y lista de deseos.

**Vista del vendedor** (el vendedor demo es "Floristería Primavera")
- **Panel:** ventas, saldo retenido, saldo liberado, comisión, retiro de saldo (simulado), pedidos por atender, regalos más vendidos, alertas de stock bajo, su calificación y una calculadora de comisión.
- **Mis regalos:** filtrar, buscar, editar, pausar/reactivar y eliminar.
- **Publicar / editar regalo:** nombre, descripción, precio, stock, categoría, festividades, hasta 4 fotos subidas desde el computador, entrega por recogida y/o envío (con costo y zonas), vista previa y cuánto recibe por venta.
- **Pedidos recibidos:** acepta, prepara y marca como listo o enviado; ve la dedicatoria, los datos del comprador, el desglose del dinero y cuándo se libera el pago.
- **Mis reseñas:** promedio, distribución por estrellas, filtros y orden.

**Fase 4 · Integración y pulido**
- **Notificaciones (campana):** cada vista ve solo las suyas. El vendedor recibe aviso de pedido nuevo, pago liberado y reseña nueva; el comprador, cuando su pedido es aceptado, está en preparación o listo/en camino. Cada aviso lleva a la pantalla correspondiente.
- **Tour guiado** de 8 pasos (flechas del teclado para avanzar, Esc para cerrar).
- **Modelo de negocio** (`/negocio`): flujo del pago retenido, pedido de ejemplo y simulador mensual con supuestos editables (la pasarela de pago y los costos fijos son supuestos, no datos reales).
- Animaciones suaves (campana, favoritos, tarjetas), ajustes para móvil y respeto a "reducir movimiento".

Datos de ejemplo: 8 festividades, 7 categorías, 30 regalos, 6 vendedores, 38 reseñas y 6 pedidos.

Ver `PLAN.md` para las fases completas.

## V1 del experimento: Calendario de regalos

Sobre el MVP completo se agregó **un solo flujo** para probar esta hipótesis: *si la persona guarda a quienes quiere regalar y recibe un aviso con un regalo ya elegido y la tarjeta de confianza del vendedor, lo confirmará en vez de buscar por su cuenta.*

**Core Action:** confirmar (o cambiar) el regalo sugerido desde el aviso.

**Cómo probarlo (5 a 8 personas)**
1. En el menú, **Mi calendario** (o el banner del Inicio) → **Agregar persona**: para quién es, fecha y presupuesto.
2. En la lista, pulsa **Prueba: simular aviso**. Es un control solo para la prueba: simula que llegó el recordatorio previo a la fecha.
3. Abre la **campana** y entra al aviso → pantalla de sugerencia con la **tarjeta de confianza** del vendedor.
4. **Confirmar este regalo** (o **Ver otra sugerencia**) → checkout con la fecha de la persona como fecha de entrega → pedido con pago retenido en **Mis pedidos**.

**Qué observar**
- Cuántas personas y fechas cargan sin que se les insista.
- Ante el aviso: ¿confirman, piden otra, o se van al catálogo?
- Cuántas veces pulsan "Ver otra sugerencia" y si miran la tarjeta del vendedor.
- Por qué aceptaron o no (pregúntales).
- Seguimiento a las 24 o 48 horas por mensaje: la app no puede probar si actúan días después.

**Cómo elige la sugerencia:** regla simple, no IA. Regalos activos, con stock y dentro del presupuesto, ordenados por la calificación del vendedor y luego por ventas (`src/utils/suggest.ts`).

**Simulado u omitido a propósito (V1):** el aviso se generaba solo con el botón de prueba y el calendario se borraba al recargar. Ambas cosas cambiaron en la V2 (ver abajo). Siguen fuera: cuentas de usuario, registro de eventos y compra automática.

## V2 · "¿Para quién es el regalo?" (cambios pedidos por el docente)

En la revisión del 26 de octubre el docente dijo que el MVP se veía "muy supermercado": el cliente que no tiene tiempo no quiere hacer scroll por un catálogo. Pidió centrar todo en la persona que recibe el regalo, sugerir pocos regalos, avisar 1 semana y 3 días antes por WhatsApp y darle más color al regalo del inicio.

**Qué cambió**
- **Registrar a la persona** (`/calendario/nueva`): quién es (papá, mamá, ahijado…), nombre opcional, edad, sexo (se completa solo según la relación), 1 o 2 gustos, ocasión (las fechas fijas como Navidad se completan solas), fecha, presupuesto, cuándo avisar (1 semana y 3 días, solo 1 semana o solo 3 días), cuántas opciones ver (3, 5 o 10) y el WhatsApp del comprador.
- **Pocas sugerencias** (`src/utils/suggest.ts`). Paso 1: se descarta lo que está fuera del presupuesto, lo que es para otro sexo (a papá no se le sugieren rosas) y lo que es para otra edad. Paso 2: puntaje de 0 a 100, con gustos 40, ocasión 20, calificación del vendedor 20, aprovechar el presupuesto 10 y popularidad 10. Paso 3: se muestran solo las N primeras, cada una con sus razones ("Le gusta: autos", "Ideal para papá"). Con "Elegir este" va directo al pago.
- **Regalos clasificados por el vendedor.** Cada regalo indica para quién es: sexo, edades y gustos. El formulario del vendedor tiene la sección "¿Para quién es este regalo?" y los 30 regalos de ejemplo ya vienen clasificados.
- **Avisos.** La app revisa las fechas al abrirse y cada minuto. Cuando llega el día del aviso, sale en la campana y se arma el mensaje de WhatsApp con el enlace directo a las sugerencias. "Enviarlo a mi WhatsApp" abre WhatsApp con el mensaje escrito. Para la demo se mantiene "Prueba: simular aviso".
- **Se guardan las personas** en el navegador: no se pierden al recargar.
- **Inicio**: el botón principal es "¿Para quién es el regalo?", debajo del hero está "Tu regalo en 3 toques" y se quitó la sección de más vendidos para reducir el scroll. El regalo del hero tiene estrellitas y confeti de colores.

**Límites**
- El envío automático por WhatsApp o Telegram necesita un servidor y la API de WhatsApp Business (o un bot de Telegram). En el MVP el mensaje se arma y se abre en WhatsApp con un toque.
- El enlace del aviso funciona en el mismo navegador donde se guardó a la persona, porque todavía no hay cuentas de usuario.
- Las sugerencias usan reglas con puntaje. Entrenar un modelo con datos de compras queda para más adelante, como dijo el docente.

## Subirlo a GitHub y publicarlo

El proyecto ya trae `.gitignore` y un workflow (`.github/workflows/deploy.yml`) que lo publica en GitHub Pages cada vez que se sube un cambio a `main`.

```bash
git init
git add .
git commit -m "Regalalo MVP v2"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/regalalo.git
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Source: GitHub Actions**. En un par de minutos la app queda en `https://TU_USUARIO.github.io/regalalo/`.

## Fotos de los regalos

Las fotos de demostración son fotografías reales de Wikimedia Commons, elegidas por el nombre del archivo para cada regalo (flores, velas, autitos, chocolates, etc.) y cargadas por internet. Algunas manualidades solo tienen una foto parecida, no idéntica. Si no hay conexión o una foto falla, se muestra un fondo con icono.

- En `PHOTO_CREDITS.md` está el enlace a cada foto. **Cada archivo tiene su propia licencia: revísala antes de usar la app de forma pública o comercial.**
- Para usar fotos propias, copia tus imágenes a `public/images/` y en `src/data/products.ts` cambia `images: commons(...)` por `images: ['/images/girasoles-1.jpg', '/images/girasoles-2.jpg']`.

El componente `ProductImage` hace el resto: carga diferida, tamaño reservado para evitar saltos y respaldo si una foto falla.

## Dónde cambiar cosas

- `src/config.ts`: comisión (10%), moneda (Bs) y vendedor demo.
- `src/data/`: festividades, categorías, vendedores, regalos, reseñas y pedidos de ejemplo.
- `src/store/useStore.ts`: toda la lógica de la app.
- `src/components/GuidedTour.tsx`: pasos del tour. `src/pages/Business.tsx`: modelo de negocio y simulador.
- `src/styles/global.css`, `pages.css`, `seller.css` y `phase4.css`: paleta y sistema de diseño.
