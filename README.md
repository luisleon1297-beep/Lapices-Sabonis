# SABONIS — Diseño aprobado para GitHub Pages

Conserva la distribución clara y verde de dos columnas. Los cuatro modelos se eligen mediante tarjetas con miniaturas reales del visor 3D: Dorado, Brillante, Mate y Delgado. Al seleccionar una tarjeta, la vista principal muestra ese modelo.

Todos permiten negro, azul profundo, rojo y blanco cálido. La iluminación y el material tienen reflejos más suaves; el acabado mate es diferente del brillante. El modelo delgado lleva el grabado en la cara opuesta al clip, visible por defecto. Los otros modelos conservan el grabado frontal bajo el clip.

## Actualizar tu página

Descomprime este ZIP y sube su contenido al repositorio con `Add file > Upload files > Commit changes`.

Reemplaza `index.html`, `style.css`, `script.js`, `pen-preview.js` y `envio-pedido.js`. Sube también la nueva carpeta `assets/modelos` con sus cuatro PNG. Mantén los recursos existentes de `assets` y `vendor`. `index.html` debe estar en la raíz.

Para publicar desde cero, crea un repositorio público, sube todo el contenido descomprimido y configura `Settings > Pages > Deploy from a branch > main > /(root) > Save`.

Esta versión estática no necesita npm ni Node.js cuando está publicada. Para probar en el PC, abre la carpeta con Live Server; abrir el HTML con doble clic no carga correctamente los módulos.

## Pedido y correo

El cliente elige modelo, color, texto, tipografía y cantidad. El pedido distingue productos con diferente modelo aunque tengan el mismo texto. El carrito puede restaurarse en este navegador cuando su almacenamiento está disponible.

Al añadir un producto se guarda una captura del visor con el diseño, ángulo y zoom actuales. FormSubmit recibe los datos del cliente, el detalle de cada producto y sus PNG exactos como adjuntos; los envía a `luis_leonleon@hotmail.com`.

Pulsa Enviar solicitud de pedido y completa la verificación de FormSubmit en la pestaña que se abre. Si recibes un correo de activación, pulsa Activate Form en Hotmail; revisa también Correo no deseado y envía otro pedido de prueba tras activar.

La página mantiene el carrito porque no puede confirmar la recepción desde la pestaña externa. Revisa el correo antes de reenviar para evitar duplicados. No necesitas Azure, contraseñas ni configuración SMTP. Los datos y archivos del pedido pasan por FormSubmit para su entrega.

## Límites y pruebas

Hasta 10 diseños, 999 unidades por diseño y 6 MB combinados de imágenes. No procesa pagos ni guarda los pedidos en una base de datos.

Se comprobó la selección de tarjetas, las 16 combinaciones de modelo/color, la separación de cuatro modelos con el mismo texto, restauración y edición del carrito, el detalle del correo y PNG idénticos en un envío interceptado, y la vista móvil. No se enviaron correos reales durante la prueba.

Los modelos 3D aproximan las fotografías aportadas, sin dimensiones de fabricación. Se utiliza una versión nueva del carrito para evitar que diseños antiguos con otra cara de grabado envíen imágenes incorrectas. Vuelve a añadir los productos anteriores.
