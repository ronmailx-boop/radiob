let db = JSON.parse(localStorage.getItem('BUDGET_FINAL_V27')) || { currentId: 'L1', selectedInSummary: [], lists: { 'L1': { name: 'הרשימה שלי', items: [] } } };
let isLocked = true, activePage = 'lists', currentEditIdx = null, listToDelete = null;
let sortableInstance = null;
let isCloudSynced = false;

function save() { 
    localStorage.setItem('BUDGET_FINAL_V27', JSON.stringify(db)); 
    render(); 
}

function showPage(p) { activePage = p; render(); }

function openModal(id) { 
    const modal = document.getElementById(id);
    modal.classList.add('active'); 
    if(['editListNameModal', 'editTotalModal', 'newListModal'].includes(id)) {
        const inputId = id.replace('Modal', 'Input');
        document.getElementById(inputId).value = '';
        setTimeout(() => document.getElementById(inputId).focus(), 100);
    }
    if(id === 'inputForm') setTimeout(() => document.getElementById('itemName').focus(), 100);
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function switchSTab(n) {
    document.getElementById('sc1').classList.toggle('hidden', n !== 1);
    document.getElementById('sc2').classList.toggle('hidden', n !== 2);
    document.getElementById('st1').classList.toggle('active', n === 1);
    document.getElementById('st2').classList.toggle('active', n === 2);
}

function render() {
    const container = document.getElementById(activePage === 'lists' ? 'itemsContainer' : 'summaryContainer');
    if (!container) return;
    container.innerHTML = '';
    let total = 0, paid = 0;

    if (activePage === 'lists') {
        const list = db.lists[db.currentId];
        document.getElementById('listNameDisplay').innerText = list.name;
        document.getElementById('pageLists').classList.remove('hidden');
        document.getElementById('pageSummary').classList.add('hidden');
        list.items.forEach((item, idx) => {
            const sub = item.price * item.qty; total += sub; if (item.checked) paid += sub;
            const div = document.createElement('div');
            div.className = "item-card";
            div.innerHTML = `<div class="flex justify-between items-center mb-4"><div class="flex items-center gap-3 flex-1"><input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleItem(${idx})" class="w-7 h-7 accent-indigo-600 flex-shrink-0"><div class="flex-1 text-2xl font-bold ${item.checked ? 'line-through text-gray-300' : ''} text-right">${item.name}</div></div><button onclick="removeItem(${idx})" class="trash-btn no-print"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke="currentColor"></path></svg></button></div><div class="flex justify-between items-center"><div class="flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1 border no-print"><button onclick="changeQty(${idx}, 1)" class="text-green-500 text-2xl font-bold">+</button><span class="font-bold w-6 text-center">${item.qty}</span><button onclick="changeQty(${idx}, -1)" class="text-red-500 text-2xl font-bold">-</button></div><span onclick="openEditTotalModal(${idx})" class="text-2xl font-black text-indigo-600 cursor-pointer">₪${sub.toFixed(2)}</span></div>`;
            container.appendChild(div);
        });
    } else {
        document.getElementById('pageLists').classList.add('hidden');
        document.getElementById('pageSummary').classList.remove('hidden');
        Object.keys(db.lists).forEach(id => {
            const l = db.lists[id];
            let lTotal = 0, lPaidInd = 0;
            l.items.forEach(i => { const s = i.price * i.qty; lTotal += s; if(i.checked) lPaidInd += s; });
            const isSel = db.selectedInSummary.includes(id); if (isSel) { total += lTotal; paid += lPaidInd; }
            const div = document.createElement('div'); div.className = "item-card p-4";
            div.innerHTML = `<div class="flex justify-between items-center"><div class="flex items-center gap-4"><input type="checkbox" ${isSel ? 'checked' : ''} onchange="toggleSum('${id}')" class="w-7 h-7 accent-indigo-600"><span class="font-bold text-xl cursor-pointer" onclick="db.currentId='${id}'; showPage('lists')">${l.name}</span></div><div class="text-indigo-600 font-black text-xl ml-2">₪${lTotal.toFixed(2)}</div></div><div class="text-xs text-green-500 font-bold mt-2">שולם ברשימה: ₪${lPaidInd.toFixed(2)}</div>`;
            container.appendChild(div);
        });
        const sa = document.getElementById('selectAllLists'); if(sa) sa.checked = Object.keys(db.lists).length > 0 && Object.keys(db.lists).every(id => db.selectedInSummary.includes(id));
    }
    document.getElementById('displayTotal').innerText = total.toFixed(2);
    document.getElementById('displayPaid').innerText = paid.toFixed(2);
    document.getElementById('displayLeft').innerText = (total - paid).toFixed(2);
    document.getElementById('tabLists').className = `tab-btn ${activePage === 'lists' ? 'tab-active' : 'tab-inactive'}`;
    document.getElementById('tabSummary').className = `tab-btn ${activePage === 'summary' ? 'tab-active' : 'tab-inactive'}`;
    initSortable();
}

function initSortable() {
    if (sortableInstance) sortableInstance.destroy();
    if (!isLocked && activePage === 'lists') {
        sortableInstance = Sortable.create(document.getElementById('itemsContainer'), { animation: 150, onEnd: (e) => { const items = db.lists[db.currentId].items; items.splice(e.newIndex, 0, items.splice(e.oldIndex, 1)[0]); save(); }});
    }
}

function toggleLock() { isLocked = !isLocked; document.getElementById('lockBtn').className = `w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 text-white transition-all ${isLocked ? 'bg-blue-600' : 'bg-orange-400'}`; document.getElementById('lockIconPath').setAttribute('d', isLocked ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' : 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z'); document.getElementById('statusTag').innerText = isLocked ? "נעול" : "עריכה"; initSortable(); }
function addItem() { const n = document.getElementById('itemName').value.trim(), p = parseFloat(document.getElementById('itemPrice').value) || 0; if (n) { db.lists[db.currentId].items.push({ name: n, price: p, qty: 1, checked: false }); save(); closeModal('inputForm'); document.getElementById('itemName').value = ''; document.getElementById('itemPrice').value = ''; } }
function toggleItem(i) { db.lists[db.currentId].items[i].checked = !db.lists[db.currentId].items[i].checked; save(); }
function changeQty(i, v) { const item = db.lists[db.currentId].items[i]; if (item.qty + v >= 1) { item.qty += v; save(); } }
function removeItem(i) { db.lists[db.currentId].items.splice(i, 1); save(); }
function saveNewList() { const n = document.getElementById('newListNameInput').value.trim(); if(n){ const id = 'L'+Date.now(); db.lists[id] = {name:n, items:[]}; db.currentId = id; save(); closeModal('newListModal'); } }
function saveListName() { const n = document.getElementById('editListNameInput').value.trim(); if(n){ db.lists[db.currentId].name = n; save(); } closeModal('editListNameModal'); }
function openEditTotalModal(idx) { currentEditIdx = idx; openModal('editTotalModal'); }
function saveTotal() { const val = parseFloat(document.getElementById('editTotalInput').value); if (!isNaN(val)) { const item = db.lists[db.currentId].items[currentEditIdx]; item.price = val / item.qty; save(); } closeModal('editTotalModal'); }
function toggleSum(id) { const i = db.selectedInSummary.indexOf(id); if (i > -1) db.selectedInSummary.splice(i, 1); else db.selectedInSummary.push(id); save(); }
function toggleSelectAll(c) { db.selectedInSummary = c ? Object.keys(db.lists) : []; save(); }
function executeClear() { db.lists[db.currentId].items = []; save(); closeModal('confirmModal'); }
function toggleDarkMode() { document.body.classList.toggle('dark-mode'); localStorage.setItem('THEME', document.body.classList.contains('dark-mode')?'dark':'light'); }
function prepareNewListModal() { openModal('newListModal'); }
function prepareDeleteList(id) { listToDelete = id; openModal('deleteListModal'); }
document.getElementById('confirmDeleteListBtn').onclick = function() { if (listToDelete) { delete db.lists[listToDelete]; if (db.currentId === listToDelete) db.currentId = Object.keys(db.lists)[0] || (db.lists['L1']={name:'הרשימה שלי', items:[]}, 'L1'); save(); closeModal('deleteListModal'); } };
function shareToWhatsApp() { const list = db.lists[db.currentId]; if (list.items.length === 0) return; let text = `🛒 *${list.name}:*\n\n`; list.items.forEach(i => text += `${i.checked ? '✅' : '⬜'} *${i.name}* (x${i.qty}) - ₪${(i.price * i.qty).toFixed(2)}\n`); text += `\n💰 *סה"כ: ₪${document.getElementById('displayTotal').innerText}*`; window.open("https://wa.me/?text=" + encodeURIComponent(text)); }
function preparePrint() { closeModal('settingsModal'); window.print(); }

function handleAuthClick() { alert("תשתית ענן מוכנה."); }
function handleAuth(r) { console.log("Success"); }

window.onload = function() { 
    if (localStorage.getItem('THEME') === 'dark') document.body.classList.add('dark-mode'); 
    render(); 
};
