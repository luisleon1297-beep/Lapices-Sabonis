# SABONIS — GitHub Pages

Página estática lista para subir a GitHub. Incluye Three.js, fuentes y personalizador. No necesita npm ni servidor Node.js al publicarse.

## Publicar

1. Crea un repositorio público llamado `sabonis` y marca la opción de agregar README.
2. En `Add file > Upload files`, arrastra TODO el contenido de esta carpeta, incluyendo `assets` y `vendor`. `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta. No subas el ZIP.
3. Confirma con `Commit changes`.
4. En `Settings > Pages`, elige `Deploy from a branch`, rama `main` y carpeta `/(root)`. Pulsa `Save`.
5. Cuando termine el despliegue, abre la dirección que aparece en Pages. Será similar a `https://TU_USUARIO.github.io/sabonis/`.

## Correo

El destinatario es `luis_leonleon@hotmail.com`. Crea un pedido de prueba y completa el envío en la pestaña de FormSubmit. Si llega un correo de activación, pulsa `Activate Form`; revisa también Correo no deseado. Envía otro pedido después de activar.

El correo contiene datos del cliente, cantidades, especificaciones de cada diseño y PNG adjuntos iguales a las capturas del visor al añadirlos. La tabla del correo la genera FormSubmit. Los datos y archivos se transmiten a ese servicio para entregarlos.

El carrito permanece guardado: la página no puede confirmar la recepción del correo desde la pestaña externa. Revisa el correo antes de volver a enviar para evitar duplicados.

No subas `.env`, contraseñas, tokens ni `node_modules` del proyecto anterior. Este paquete solo contiene los archivos públicos necesarios.

Se verificó en un servidor estático con ruta de subcarpeta y envío interceptado; no se publicó en una cuenta GitHub ni se enviaron correos reales durante estas pruebas.
