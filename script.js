import {createPenPreview} from "./pen-preview.js?v=2";
import {createOrderForm} from "./envio-pedido.js";
"use strict";

// Correo que recibe los pedidos mediante FormSubmit; no requiere credenciales SMTP.
// No coloques contraseñas de correo ni claves privadas en JavaScript.
const CONFIG = Object.freeze({ maxCantidad: 999, correoPedidos: "luis_leonleon@hotmail.com" });
const COLORS = Object.freeze({
  black: { name: "Negro ónix", body: "#101213", ink: "#eadba5" },
  silver: { name: "Plata", body: "#b7bcc1", ink: "#293f37" },
  blue: { name: "Azul profundo", body: "#244c72", ink: "#f1dfac" },
  rose: { name: "Rosa cobre", body: "#b77968", ink: "#30241f" }
});
const FONTS = Object.freeze({
  script: { name: "Cursiva elegante", family: '"Segoe Script", "Sabonis Manuscrita", cursive', style: "italic" },
  serif: { name: "Clásica serif", family: 'Georgia, "Times New Roman", serif', style: "normal" },
  sans: { name: "Moderna sans serif", family: 'Arial, Helvetica, sans-serif', style: "normal" },
  mono: { name: "Máquina de escribir", family: '"Courier New", monospace', style: "normal" }
});
const $ = (id) => document.getElementById(id);
const preview = createPenPreview($("canvas3d"));
const textInput = $("engraving-input");
const fontSelect = $("font-select");
const quantityInput = $("quantity");
const designForm = $("design-form");
const orderForm = $("order-form");
const storageKey = "sabonis-pedido-v2";
let cart = [];
let sending = false;
let capturing = false;
let toastTimer;

// Solo se guarda el carrito en este dispositivo, nunca los datos de contacto.
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(saved)) cart = saved.filter((item) => item && typeof item.text === "string" && item.text.trim().length > 0 && [...item.text].length <= 32 && FONTS[item.font] && COLORS[item.color] && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= CONFIG.maxCantidad && typeof item.imageSnapshot === "string" && item.imageSnapshot.startsWith("data:image/png;base64,")).slice(0, 10).map((item) => ({text:item.text, font:item.font, color:item.color, quantity:item.quantity,imageSnapshot:item.imageSnapshot}));
} catch { /* La interfaz funciona incluso sin almacenamiento disponible. */ }

function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* Modo privado o espacio no disponible. */ }
}
function getDesign() {
  return { text: textInput.value.trim(), font: fontSelect.value, color: designForm.elements.color.value, quantity: Number(quantityInput.value) };
}
function notify(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3500);
}
function updatePreview() {
  const design = getDesign();
  const color = COLORS[design.color];
  const font = FONTS[design.font];
  preview.update({...design, body:color.body, ink:color.ink});
  $("font-sample").style.fontFamily = font.family;
  $("font-sample").style.fontStyle = font.style;
  $("font-sample").textContent = design.text || "El arte de escribir";
  $("font-label").textContent = font.name;
  $("color-label").textContent = color.name;
  $("char-count").textContent = `${textInput.value.length} / 32`;
  textInput.setCustomValidity(textInput.value && !design.text ? "Escribe un nombre o mensaje; no solo espacios." : "");
}
function clearStatus() { $("order-status").hidden = true; }
function renderCart() {
  const container = $("cart-items");
  container.replaceChildren();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  $("cart-count").textContent = total;
  $("order-total").textContent = `${total} ${total === 1 ? "lápiz" : "lápices"} · ${cart.length} ${cart.length === 1 ? "diseño" : "diseños"}`;
  $("send-order").disabled = cart.length === 0 || sending;
  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.append("Aún no tienes diseños.", document.createElement("br"));
    const link = document.createElement("a");
    link.href = "#personalizar";
    link.textContent = "Personaliza tu primer lápiz";
    empty.append(link, " y agrégalo aquí.");
    container.append(empty);
    return;
  }
  cart.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "cart-item";
    const marker = document.createElement("span");
    marker.className = "item-color";
    marker.style.setProperty("--item-color", COLORS[item.color].body);
    marker.setAttribute("aria-hidden", "true");
    const details = document.createElement("div");
    details.className = "item-details";
    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = item.text;
    title.style.fontFamily = FONTS[item.font].family;
    title.style.fontStyle = FONTS[item.font].style;
    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = `${COLORS[item.color].name} · ${FONTS[item.font].name}`;
    const actions = document.createElement("div");
    actions.className = "item-actions";
    const label = document.createElement("label");
    label.htmlFor = `cart-quantity-${index}`;
    label.textContent = "Cantidad";
    const quantity = document.createElement("input");
    quantity.id = label.htmlFor;
    quantity.type = "number";
    quantity.min = "1";
    quantity.max = String(CONFIG.maxCantidad);
    quantity.value = item.quantity;
    quantity.required = true;
    quantity.className = "cart-quantity";
    quantity.disabled = sending;
    quantity.addEventListener("change", () => {
      const value = Number(quantity.value);
      if (!Number.isInteger(value) || value < 1 || value > CONFIG.maxCantidad) {
        quantity.value = item.quantity;
        notify(`La cantidad debe ser un entero entre 1 y ${CONFIG.maxCantidad}.`);
        return;
      }
      item.quantity = value;
      saveCart(); clearStatus(); renderCart();
    });
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "text-button";
    edit.textContent = "Usar este diseño";
    edit.disabled = sending;
    edit.setAttribute("aria-label", `Usar el diseño ${item.text} en el personalizador`);
    edit.addEventListener("click", () => {
      textInput.value = item.text; fontSelect.value = item.font; quantityInput.value = item.quantity;
      designForm.elements.color.value = item.color;
      updatePreview(); $("personalizar").scrollIntoView({behavior:"smooth"});
      notify("Diseño cargado. Personalízalo y agrégalo como otro diseño.");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "text-button remove-button";
    remove.textContent = "Eliminar";
    remove.disabled = sending;
    remove.setAttribute("aria-label", `Eliminar el diseño ${item.text}`);
    remove.addEventListener("click", () => { cart.splice(index, 1); saveCart(); clearStatus(); renderCart(); notify("Diseño eliminado."); });
    actions.append(label, quantity, edit, remove);
    details.append(title, meta, actions);
    article.append(marker, details);
    container.append(article);
  });
}

designForm.addEventListener("input", updatePreview);
designForm.addEventListener("change", updatePreview);
$("qty-minus").addEventListener("click", () => { quantityInput.value = Math.max(1, (Number(quantityInput.value) || 1) - 1); });
$("qty-plus").addEventListener("click", () => { quantityInput.value = Math.min(CONFIG.maxCantidad, (Number(quantityInput.value) || 1) + 1); });
$("open-cart").addEventListener("click", () => { $("pedido").scrollIntoView({behavior:"smooth"}); });
designForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sending || capturing) return;
  updatePreview();
  if (!designForm.reportValidity()) return;
  const design = getDesign();
  if (!design.text || !Number.isInteger(design.quantity) || design.quantity < 1 || design.quantity > CONFIG.maxCantidad) return;
  capturing = true;
  const fields = [...designForm.elements];
  fields.forEach(field => field.disabled = true);
  try { design.imageSnapshot = await preview.capture(); }
  catch { notify("No se pudo capturar el diseño. Vuelve a intentarlo."); return; }
  finally { capturing = false; fields.forEach(field => field.disabled = false); }
  const existing = cart.find((item) => item.text === design.text && item.font === design.font && item.color === design.color);
  if (existing) {
    if (existing.quantity + design.quantity > CONFIG.maxCantidad) { notify(`Máximo ${CONFIG.maxCantidad} unidades por diseño.`); return; }
    existing.quantity += design.quantity;
    existing.imageSnapshot = design.imageSnapshot;
  } else {
    if (cart.length >= 10) { notify("Máximo 10 diseños por pedido."); return; }
    cart.push(design);
  }
  saveCart(); clearStatus(); renderCart();
  notify(`${design.quantity === 1 ? "Lápiz añadido" : `${design.quantity} lápices añadidos`}. Puedes agregar otro diseño o revisar tu pedido.`);
});

function setStatus(message, type) {
  const status = $("order-status");
  status.textContent = message;
  status.className = `status-${type}`;
  status.hidden = false;
}
orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (sending || !orderForm.reportValidity()) return;
  if (!cart.length) { setStatus("Agrega al menos un diseño antes de enviar tu pedido.", "error"); return; }
  const customer={name:$("customer-name").value.trim(),email:$("customer-email").value.trim(),phone:$("customer-phone").value.trim(),note:$("customer-note").value.trim()};
  if (!customer.name || !customer.phone) { setStatus("Completa tu nombre y teléfono.", "error"); return; }
  if ($("website").value) return;
  if (location.protocol === "file:") { setStatus("Abre la página publicada en GitHub Pages o usa un servidor local.", "error"); return; }
  const reference=`SB-${Date.now().toString(36).toUpperCase()}`;
  try {
    const form=createOrderForm({order:cart,customer,reference,recipient:CONFIG.correoPedidos,colors:COLORS,fonts:FONTS});
    document.body.append(form);
    // Abrir en otra pestaña conserva la página y el pedido. El servicio confirma allí.
    HTMLFormElement.prototype.submit.call(form);
    setTimeout(()=>form.remove(),10000);
    setStatus(`Completa el envío del pedido ${reference} en la pestaña de FormSubmit que se abrió. Tu carrito sigue guardado. Si no aparece, permite las ventanas emergentes y vuelve a intentarlo. La primera vez, SABONIS debe activar el formulario desde su Hotmail.`, "info");
  } catch(error) {setStatus(`No se pudo preparar el pedido: ${error.message}`, "error");}
});

updatePreview(); renderCart();
if (document.fonts) document.fonts.ready.then(updatePreview);
