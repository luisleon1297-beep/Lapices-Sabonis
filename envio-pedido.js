// Envío nativo multipart: FormSubmit admite campos de texto y archivos adjuntos.
export function createOrderForm({order,customer,reference,recipient,colors,fonts}) {
  if (!order.length) throw new Error('El carrito está vacío.');
  const form=document.createElement('form');
  form.method='POST';form.action=`https://formsubmit.co/${encodeURIComponent(recipient)}`;
  form.enctype='multipart/form-data';form.target='_blank';form.hidden=true;
  const field=(name,value)=>{const input=document.createElement('input');input.type='hidden';input.name=name;input.value=String(value);form.append(input);};
  field('_subject',`SABONIS | Pedido ${reference} | ${order.reduce((n,item)=>n+item.quantity,0)} lápices`);
  field('_template','table');
  field('Referencia',reference);field('Cliente',customer.name);field('email',customer.email);
  field('Teléfono',customer.phone);field('Comentarios',customer.note || 'Sin comentarios');
  field('Cantidad total',order.reduce((n,item)=>n+item.quantity,0));field('Diseños diferentes',order.length);
  field('Imágenes','Los archivos PNG adjuntos muestran cada diseño tal como se añadió al carrito. Su número corresponde al detalle del pedido.');
  let totalBytes=0;
  order.forEach((item,index)=>{
    const number=index+1;
    field(`Diseño ${number} — Producto`,'Bolígrafo ejecutivo personalizado SABONIS');
    field(`Diseño ${number} — Texto exacto`,item.text);
    field(`Diseño ${number} — Tipografía`,fonts[item.font].name);
    field(`Diseño ${number} — Color`,colors[item.color].name);
    field(`Diseño ${number} — Color del grabado`,colors[item.color].ink);
    field(`Diseño ${number} — Cantidad`,item.quantity);
    if(!/^data:image\/png;base64,/.test(item.imageSnapshot || '')) throw new Error('Falta la imagen de un diseño. Elimínalo y vuelve a añadirlo.');
    const binary=atob(item.imageSnapshot.split(',')[1]);
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));totalBytes+=bytes.length;
    const file=new File([bytes],`${reference}-diseno-${number}.png`,{type:'image/png'});
    const transfer=new DataTransfer();transfer.items.add(file);
    const input=document.createElement('input');input.type='file';input.name=index===0?'attachment':`attachment${number}`;input.files=transfer.files;form.append(input);
  });
  if(totalBytes>6*1024*1024)throw new Error('Las imágenes superan 6 MB. Divide el pedido para enviarlo.');
  return form;
}
