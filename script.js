let db = JSON.parse(localStorage.getItem('BUDGET_FINAL_V27')) || { 
    currentId: 'L1', selectedInSummary: [], 
    lists: { 'L1': { name: 'הרשימה שלי', items: [] } },
    lastActivePage: 'lists'
};

let isLocked = true, activePage = db.lastActivePage || 'lists', currentEditIdx = null, listToDelete = null;
let sortableInstance = null;

function save() { 
    db.lastActivePage = activePage;
    localStorage.setItem('BUDGET_FINAL_V27', JSON.stringify(db)); 
    render(); 
}

function showPage(p) { activePage = p; save(); }

function openModal(id) { 
    const m = document.getElementById(id);
    if(m) {
        m.classList.add('active'); 
        const inputId = id.replace('Modal', 'Input');
        const i = document.getElementById(inputId);
        if(i) { i.value = ''; setTimeout(() => i.focus(), 100); }
        if(id === 'inputForm') {
            document.getElementById('itemName').value = '';
            document.getElementById('itemPrice').value = '';
            setTimeout(() => document.getElementById('itemName').focus(), 100);
        }
    }
}
function closeModal(id) { const m = document.getElementById(id); if(m) m.classList.remove('active'); }

function render() {
    const container = document.getElementById(activePage === 'lists' ? 'itemsContainer' : 'summaryContainer');
    if (!container) return;
    container.innerHTML = '';
    let total = 0, paid = 0;

    document.getElementById('tabLists').className = `tab-btn ${activePage === 'lists' ? 'tab-active' : 'tab-inactive'}`;
    document.getElementById('tabSummary').className = `tab-btn ${activePage === 'summary' ? 'tab-active' : 'tab-inactive'}`;

    if (activePage === 'lists') {
        document.getElementById('pageLists').classList.remove('hidden');
        document.getElementById('pageSummary').classList.add('hidden');
        const list = db.lists[db.currentId];
        document.getElementById('listNameDisplay').innerText = list.name;
        list.items.forEach((item, idx) => {
            const sub = item.price * item.qty; total += sub; if (item.checked) paid += sub;
            const div = document.createElement('div'); div.className = "item-card";
            div.innerHTML = `<div class="flex justify-between items-center mb-4"><div class="flex items-center gap-3 flex-1"><input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleItem(${idx})" class="w-7 h-7 accent-indigo-600"><div class="flex-1 text-2xl font-bold ${item.checked ? 'line-through text-gray-300' : ''} text-right">${item.name}</div></div><button onclick="removeItem(${idx})" class="trash-btn no-print"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke="currentColor"></path></svg></button></div><div class="flex justify-between items-center"><div class="flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1 border no-print"><button onclick="changeQty(${idx}, 1)" class="text-green-500 text-2xl font-bold">+</button><span class="font-bold w-6 text-center">${item.qty}</span><button onclick="changeQty(${idx}, -1)" class="text-red-500 text-2xl font-bold">-</button></div><span onclick="openEditTotalModal(${idx})" class="text-2xl font-black text-indigo-600 cursor-pointer">₪${sub.toFixed(2)}</span></div>`;
            container.appendChild(div);
        });
    } else {
        document.getElementById('pageLists').classList.add('hidden');
        document.getElementById('pageSummary').classList.remove('hidden');
        Object.keys(db.lists).forEach(id => {
            const l = db.lists[id];
            let lT = 0, lP = 0;
            l.items.forEach(i => { const s = i.price*i.qty; lT += s; if(i.checked) lP += s; });
            const isSel = db.selectedInSummary.includes(id); if (isSel) { total += lT; paid += lP; }
            const div = document.createElement('div'); div.className = "item-card p-4";
            div.innerHTML = `<div class="flex justify-between items-center"><div class="flex items-center gap-4"><input type="checkbox" ${isSel ? 'checked' : ''} onchange="toggleSum('${id}')" class="w-7 h-7 accent-indigo-600"><span class="font-bold text-xl cursor-pointer" onclick="db.currentId='${id}'; showPage('lists')">${l.name}</span></div><div class="flex items-center gap-3"><div class="text-indigo-600 font-black text-xl">₪${lT.toFixed(2)}</div><button onclick="prepareDeleteList('${id}')" class="list-del-btn"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke="currentColor"></path></svg></button></div></div>`;
            container.appendChild(div);
        });
    }
    document.getElementById('displayTotal').innerText = total.toFixed(2);
    document.getElementById('displayPaid').innerText = paid.toFixed(2);
    document.getElementById('displayLeft').innerText = (total - paid).toFixed(2);
    initSortable();
}

function addItem() { 
    const n = document.getElementById('itemName').value.trim(), p = parseFloat(document.getElementById('itemPrice').value) || 0; 
    if (n) { db.lists[db.currentId].items.push({ name: n, price: p, qty: 1, checked: false }); closeModal('inputForm'); save(); } 
}
function saveNewList() { 
    const i = document.getElementById('newListNameInput'); const n = i.value.trim(); 
    if(n){ const id = 'L'+Date.now(); db.lists[id] = {name:n, items:[]}; db.currentId = id; activePage = 'lists'; closeModal('newListModal'); save(); } 
}
function executeClear() { db.lists[db.currentId].items = []; save(); closeModal('confirmModal'); }
function prepareDeleteList(id) { listToDelete = id; openModal('deleteListModal'); }
document.getElementById('confirmDeleteListBtn').onclick = function() { 
    if (listToDelete) { delete db.lists[listToDelete]; const keys = Object.keys(db.lists); if (db.currentId === listToDelete) db.currentId = keys[0] || (db.lists['L1']={name:'הרשימה שלי', items:[]}, 'L1'); save(); closeModal('deleteListModal'); } 
};
function initSortable() {
    const el = document.getElementById(activePage === 'lists' ? 'itemsContainer' : 'summaryContainer');
    if (sortableInstance) sortableInstance.destroy();
    if (el && !isLocked) {
        sortableInstance = Sortable.create(el, { animation: 150, onEnd: () => {
            if (activePage === 'lists') { /* handle product sort */ } else { /* handle list sort */ } save();
        }});
    }
}
function preparePrint() { 
    closeModal('settingsModal');
    let content = `<html><head><title>Report</title><style>body{font-family:sans-serif;direction:rtl;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:right;}</style></head><body><h1>דוח קניות</h1>`;
    Object.keys(db.lists).forEach(id => {
        const l = db.lists[id]; content += `<h3>${l.name}</h3><table><thead><tr><th>מוצר</th><th>סה"כ</th></tr></thead><tbody>`;
        l.items.forEach(i => { content += `<tr><td>${i.name}</td><td>₪${(i.price*i.qty).toFixed(2)}</td></tr>`; });
        content += `</tbody></table>`;
    });
    content += `</body></html>`;
    const win = window.open('', '_blank'); win.document.write(content); win.document.close(); win.print();
}
function handleAuthClick() { alert("תשתית ענן מוכנה."); }
function handleAuth(r) { console.log("Success"); }
function toggleLock() { isLocked = !isLocked; render(); }
function toggleItem(i) { db.lists[db.currentId].items[i].checked = !db.lists[db.currentId].items[i].checked; save(); }
function changeQty(i, v) { const item = db.lists[db.currentId].items[i]; if (item.qty + v >= 1) { item.qty += v; save(); } }
function removeItem(i) { db.lists[db.currentId].items.splice(i, 1); save(); }
function saveListName() { const n = document.getElementById('editListNameInput').value.trim(); if(n){ db.lists[db.currentId].name = n; save(); } closeModal('editListNameModal'); }
function openEditTotalModal(idx) { currentEditIdx = idx; openModal('editTotalModal'); }
function saveTotal() { const val = parseFloat(document.getElementById('editTotalInput').value); if (!isNaN(val)) { const item = db.lists[db.currentId].items[currentEditIdx]; item.price = val / item.qty; save(); } closeModal('editTotalModal'); }
function toggleSum(id) { const i = db.selectedInSummary.indexOf(id); if (i > -1) db.selectedInSummary.splice(i, 1); else db.selectedInSummary.push(id); save(); }
function toggleSelectAll(c) { db.selectedInSummary = c ? Object.keys(db.lists) : []; save(); }
function toggleDarkMode() { document.body.classList.toggle('dark-mode'); save(); }
function shareToWhatsApp() { /* Logic */ }
window.onload = function() { render(); };
