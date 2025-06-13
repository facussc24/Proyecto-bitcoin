const treeRoot = document.getElementById('tree-root');
const formArea = document.getElementById('form-area');

let mode = null; // 'create' | 'delete' | 'edit'

const data = {
  clients: [],
};

function renderTree() {
  treeRoot.innerHTML = '';
  data.clients.forEach((c, idx) => {
    const li = document.createElement('li');
    li.textContent = `Cliente: ${c.name}`;
    li.dataset.type = 'client';
    li.dataset.index = idx;
    const prodUl = document.createElement('ul');
    c.products.forEach((p, pIdx) => {
      const pli = document.createElement('li');
      pli.textContent = `Producto: ${p.name}`;
      pli.dataset.type = 'product';
      pli.dataset.client = idx;
      pli.dataset.index = pIdx;
      const subUl = document.createElement('ul');
      p.subs.forEach((s, sIdx) => {
        const sli = document.createElement('li');
        sli.textContent = `Subensamble ${sIdx + 1}`;
        sli.dataset.type = 'sub';
        sli.dataset.client = idx;
        sli.dataset.product = pIdx;
        sli.dataset.index = sIdx;
        const insUl = document.createElement('ul');
        s.insumos.forEach((ins, iIdx) => {
          const ili = document.createElement('li');
          ili.textContent = `Insumo: ${ins.name} (${ins.qty})`;
          ili.dataset.type = 'insumo';
          ili.dataset.client = idx;
          ili.dataset.product = pIdx;
          ili.dataset.sub = sIdx;
          ili.dataset.index = iIdx;
          insUl.appendChild(ili);
        });
        const addIns = document.createElement('button');
        addIns.textContent = '+ Insumo';
        addIns.className = 'btn btn-sm btn-outline-primary add';
        addIns.onclick = () => showInsumoForm(idx, pIdx, sIdx);
        const insLi = document.createElement('li');
        insLi.appendChild(addIns);
        insUl.appendChild(insLi);
        sli.appendChild(insUl);
        subUl.appendChild(sli);
      });
      const addSub = document.createElement('button');
      addSub.textContent = '+ Subensamble';
      addSub.className = 'btn btn-sm btn-outline-primary add';
      addSub.onclick = () => addSubensamble(idx, pIdx);
      const subLi = document.createElement('li');
      subLi.appendChild(addSub);
      subUl.appendChild(subLi);
      pli.appendChild(subUl);
      prodUl.appendChild(pli);
    });
    const addProd = document.createElement('button');
    addProd.textContent = '+ Producto';
    addProd.className = 'btn btn-sm btn-outline-primary add';
    addProd.onclick = () => showProductConfirm(idx);
    const prodLi = document.createElement('li');
    prodLi.appendChild(addProd);
    prodUl.appendChild(prodLi);
    li.appendChild(prodUl);
    treeRoot.appendChild(li);
  });
}

function clearForm() {
  formArea.innerHTML = '';
}

function showCreateMenu() {
  clearForm();
  const div = document.createElement('div');
  div.innerHTML = `
    <button id="add-client" class="btn btn-outline-primary me-2">Agregar cliente</button>
    <button id="add-product" class="btn btn-outline-primary me-2">Agregar producto</button>
    <button id="add-sub" class="btn btn-outline-primary me-2">Agregar subensamble</button>
    <button id="add-insumo" class="btn btn-outline-primary">Agregar insumo</button>
  `;
  formArea.appendChild(div);
  document.getElementById('add-client').onclick = showClientForm;
  document.getElementById('add-product').onclick = () => showProductConfirm();
  document.getElementById('add-sub').onclick = showLooseSubForm;
  document.getElementById('add-insumo').onclick = showLooseInsumoForm;
}

function showClientForm() {
  clearForm();
  const form = document.createElement('form');
  form.innerHTML = `
    <div class="mb-2">
      <label class="form-label">Nombre del cliente</label>
      <input class="form-control" name="name" required>
    </div>
    <button type="submit" class="btn btn-primary">Guardar</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancel">Cancelar</button>
  `;
  form.onsubmit = e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (name) {
      data.clients.push({ name, products: [] });
      renderTree();
      clearForm();
    }
  };
  form.querySelector('#cancel').onclick = clearForm;
  formArea.appendChild(form);
}

function showProductConfirm(clientIndex) {
  clearForm();
  const div = document.createElement('div');
  div.className = 'mb-2';
  div.innerHTML = `
    <p>¿Vas a agregar insumos, subproductos o subensamble a este producto?</p>
    <button id="pc-yes" class="btn btn-primary me-2">Sí, continuar</button>
    <button id="pc-no" class="btn btn-secondary">No, cancelar</button>
  `;
  formArea.appendChild(div);
  document.getElementById('pc-no').onclick = () => { clearForm(); };
  document.getElementById('pc-yes').onclick = () => showProductForm(clientIndex);
}

function showProductForm(clientIndex) {
  clearForm();
  const form = document.createElement('form');
  let clientSelect = '';
  if (clientIndex === undefined) {
    const options = data.clients.map((c, i) => `<option value="${i}">${c.name}</option>`).join('');
    clientSelect = `
      <label class="form-label">Producto asociado</label>
      <select class="form-select mb-2" name="client">${options}</select>
    `;
  }
  form.innerHTML = `
    ${clientSelect}
    <div class="mb-2">
      <label class="form-label">Nombre del producto</label>
      <input class="form-control" name="name" required>
    </div>
    <button type="submit" class="btn btn-primary">Guardar</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancel">Cancelar</button>
  `;
  form.onsubmit = e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const cIdx = clientIndex !== undefined ? clientIndex : Number(form.elements.client.value);
    if (name && data.clients[cIdx]) {
      data.clients[cIdx].products.push({ name, subs: [] });
      renderTree();
      clearForm();
    }
  };
  form.querySelector('#cancel').onclick = clearForm;
  formArea.appendChild(form);
}

function addSubensamble(clientIndex, productIndex) {
  const product = data.clients[clientIndex].products[productIndex];
  product.subs.push({ insumos: [] });
  renderTree();
}

function showLooseSubForm() {
  clearForm();
  if (!data.clients.length) {
    formArea.textContent = 'Debes crear un cliente y producto primero.';
    return;
  }
  const productOptions = data.clients
    .flatMap((c, ci) => c.products.map((p, pi) => `<option value="${ci},${pi}">${c.name} - ${p.name}</option>`))
    .join('');
  const form = document.createElement('form');
  form.innerHTML = `
    <label class="form-label">Producto asociado</label>
    <select class="form-select mb-2" name="prod">${productOptions}</select>
    <button type="submit" class="btn btn-primary">Agregar subensamble</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancel">Cancelar</button>
  `;
  form.onsubmit = e => {
    e.preventDefault();
    const [ci, pi] = form.elements.prod.value.split(',').map(Number);
    addSubensamble(ci, pi);
    clearForm();
  };
  form.querySelector('#cancel').onclick = clearForm;
  formArea.appendChild(form);
}

function showInsumoForm(ci, pi, si) {
  clearForm();
  const form = document.createElement('form');
  const sub = data.clients[ci].products[pi].subs[si];
  form.innerHTML = `
    <div class="mb-2">
      <label class="form-label">Nombre del insumo</label>
      <input class="form-control" name="name" required>
    </div>
    <div class="mb-2">
      <label class="form-label">Cantidad</label>
      <input class="form-control" name="qty" required>
    </div>
    <button type="submit" class="btn btn-primary">Guardar</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancel">Cancelar</button>
  `;
  form.onsubmit = e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const qty = form.elements.qty.value.trim();
    if (name && qty) {
      sub.insumos.push({ name, qty });
      renderTree();
      clearForm();
    }
  };
  form.querySelector('#cancel').onclick = clearForm;
  formArea.appendChild(form);
}

function showLooseInsumoForm() {
  clearForm();
  if (!data.clients.length) {
    formArea.textContent = 'Debes crear un cliente y producto primero.';
    return;
  }
  const subOptions = data.clients
    .flatMap((c, ci) => c.products.flatMap((p, pi) => p.subs.map((s, si) => `<option value="${ci},${pi},${si}">${c.name} - ${p.name} - Sub ${si + 1}</option>`)))
    .join('');
  if (!subOptions) {
    formArea.textContent = 'No hay subensambles disponibles.';
    return;
  }
  const form = document.createElement('form');
  form.innerHTML = `
    <label class="form-label">Subensamble asociado</label>
    <select class="form-select mb-2" name="sub">${subOptions}</select>
    <div class="mb-2">
      <label class="form-label">Nombre del insumo</label>
      <input class="form-control" name="name" required>
    </div>
    <div class="mb-2">
      <label class="form-label">Cantidad</label>
      <input class="form-control" name="qty" required>
    </div>
    <button type="submit" class="btn btn-primary">Guardar</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancel">Cancelar</button>
  `;
  form.onsubmit = e => {
    e.preventDefault();
    const [ci, pi, si] = form.elements.sub.value.split(',').map(Number);
    const name = form.elements.name.value.trim();
    const qty = form.elements.qty.value.trim();
    if (name && qty) {
      data.clients[ci].products[pi].subs[si].insumos.push({ name, qty });
      renderTree();
      clearForm();
    }
  };
  form.querySelector('#cancel').onclick = clearForm;
  formArea.appendChild(form);
}

function setMode(newMode) {
  mode = newMode;
  clearForm();
  if (mode === 'create') showCreateMenu();
  treeRoot.classList.toggle('selectable', mode === 'delete' || mode === 'edit');
}

function deleteNode(li) {
  const { type } = li.dataset;
  if (!confirm(`¿Eliminar ${type} definitivamente?`)) return;
  const ci = Number(li.dataset.client);
  if (type === 'client') {
    data.clients.splice(Number(li.dataset.index), 1);
  } else if (type === 'product') {
    data.clients[ci].products.splice(Number(li.dataset.index), 1);
  } else if (type === 'sub') {
    data.clients[ci].products[Number(li.dataset.product)].subs.splice(Number(li.dataset.index), 1);
  } else if (type === 'insumo') {
    data.clients[ci].products[Number(li.dataset.product)].subs[Number(li.dataset.sub)].insumos.splice(Number(li.dataset.index), 1);
  }
  renderTree();
}

function editNode(li) {
  const { type } = li.dataset;
  clearForm();
  const form = document.createElement('form');
  let fields = '';
  if (type === 'insumo') {
    fields = `
      <div class="mb-2"><label class="form-label">Nombre</label><input class="form-control" name="name" value="${li.textContent.split(':')[1].split('(')[0].trim()}" required></div>
      <div class="mb-2"><label class="form-label">Cantidad</label><input class="form-control" name="qty" value="${li.textContent.match(/\((.*)\)/)[1]}" required></div>`;
  } else {
    fields = `<div class="mb-2"><label class="form-label">Nombre</label><input class="form-control" name="name" value="${li.textContent.split(':')[1]?.trim() || li.textContent}" required></div>`;
  }
  form.innerHTML = `
    ${fields}
    <button type="submit" class="btn btn-primary">Guardar</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancel">Cancelar</button>
  `;
  form.onsubmit = e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const ci = Number(li.dataset.client);
    if (type === 'client') {
      data.clients[Number(li.dataset.index)].name = name;
    } else if (type === 'product') {
      data.clients[ci].products[Number(li.dataset.index)].name = name;
    } else if (type === 'sub') {
      // Only numbering, nothing editable
    } else if (type === 'insumo') {
      const qty = form.elements.qty.value.trim();
      const prod = Number(li.dataset.product);
      const sub = Number(li.dataset.sub);
      data.clients[ci].products[prod].subs[sub].insumos[Number(li.dataset.index)] = { name, qty };
    }
    renderTree();
    clearForm();
  };
  form.querySelector('#cancel').onclick = clearForm;
  formArea.appendChild(form);
}

// Event listeners

document.getElementById('create-btn').onclick = () => setMode('create');
document.getElementById('delete-btn').onclick = () => setMode('delete');
document.getElementById('edit-btn').onclick = () => setMode('edit');

treeRoot.onclick = e => {
  const li = e.target.closest('li');
  if (!li || !treeRoot.contains(li)) return;
  if (mode === 'delete') {
    deleteNode(li);
  } else if (mode === 'edit') {
    editNode(li);
  }
};

renderTree();
