# Regalalo · Plan del MVP

Marketplace de regalos para festividades y cumpleaños. MVP en React + TypeScript, todo local y estático (el estado vive en memoria: al recargar la página se reinicia).

## Decisiones tomadas

- **Moneda:** Bolivianos (Bs).
- **Comisión:** 10% por venta, configurable en `src/config.ts`.
- **Pago retenido (escrow):** el pago queda retenido en la plataforma hasta que el comprador confirma la recepción; recién ahí se libera al vendedor.
- **Entrega:** cada vendedor define por regalo si ofrece recogida en un punto, envío, o ambas.
- **Calificaciones:** los compradores califican al vendedor al recibir un pedido y cualquiera puede ver la reputación de cada vendedor.
- **Paleta:** ciruela `#4A1D3F`, coral `#FF6B5B`, dorado `#F5B83D`, crema `#FFF8F0`, menta `#BFE6D4`.
- **Tipografía:** Fraunces (títulos) y Plus Jakarta Sans (texto).
- **Iconos:** librería lucide-react. No se usan emojis en la interfaz (solo en la ilustración del hero del Home).
- **Fotos:** cada regalo tiene una galería de fotos, cargadas con `<ProductImage />` (carga diferida, tamaño reservado, respaldo si falla). Las fotos de demostración son de Wikimedia Commons elegidas por regalo (créditos en `PHOTO_CREDITS.md`) y se reemplazan por fotos propias en `public/images`.

## Fases

### Fase 1 · Base del proyecto y datos  ✅
- Vite + React + TypeScript + React Router + Zustand.
- Sistema de diseño (colores, tipografía, botones, tarjetas, chips, toasts, estrellas).
- Datos de ejemplo: festividades, categorías, ~30 regalos, vendedores y reseñas.
- Layout con header, buscador y **switch Comprador / Vendedor**.
- Store global: carrito, favoritos, pedidos, productos y reseñas.
- Home del comprador funcional (hero por festividad, regalos, más vendidos, vendedores destacados).

### Fase 2 · Vista del comprador  ✅
- Catálogo con búsqueda y filtros (festividad, categoría, precio, tipo de entrega, calificación del vendedor, orden).
- Ficha del regalo: galería, stock, opciones de entrega, dedicatoria y **resumen de reseñas del vendedor**.
- **Perfil público del vendedor:** calificación promedio, distribución por estrellas, reseñas y sus regalos.
- Carrito y checkout (recogida o envío, dirección, fecha, pago simulado).
- Pago retenido: queda en escrow hasta confirmar la recepción.
- Mis pedidos con seguimiento, confirmación de recepción y **calificar al vendedor** (estrellas + comentario).
- Lista de deseos.

### Fase 3 · Vista del vendedor  ✅
- Panel con ventas, ingresos, comisión, saldo retenido y saldo liberado, y **su calificación actual con las últimas reseñas**.
- Publicar, editar, pausar y eliminar regalos (fotos, precio, stock, festividades, tipo de entrega).
- Calculadora de comisión: lo que paga el cliente, lo que retiene la plataforma y lo que recibe el vendedor.
- Pedidos recibidos: aceptar, preparar, marcar enviado o listo para recoger.
- Reseñas recibidas.

### Fase 4 · Integración y pulido  ✅
- Notificaciones entre vistas (campana), tour guiado de 8 pasos y página de modelo de negocio con simulador.
- Todo conectado entre vistas: un pedido del comprador aparece al vendedor y al confirmar la recepción se libera el dinero y se habilita la calificación, que actualiza la reputación del vendedor en toda la app.
- Responsive móvil, animaciones, estados vacíos y notificaciones.
- Tour guiado corto para la presentación.
- Notas del modelo de negocio.

## V1 del experimento · Calendario de regalos  ✅
- Un solo flujo agregado al MVP: agregar persona y fecha → aviso simulado → sugerencia con tarjeta de confianza → confirmar → checkout con pago retenido.
- Detalle y guía de prueba en `README.md`.
