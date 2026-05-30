let assets = JSON.parse(localStorage.getItem('forge_assets')) || [];

function showNotify(text, type = 'success') {
    const container = document.getElementById('notification-container');
    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    toast.className = `${color} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate__animated animate__fadeInRight mb-2 font-bold`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${text}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.replace('animate__fadeInRight', 'animate__fadeOutRight'); setTimeout(() => toast.remove(), 500); }, 3000);
}

function login() {
    if (document.getElementById('pass').value === '2012') {
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');
        showNotify("Acesso master!");
    } else { showNotify("Senha incorreta!", "error"); }
}

// SALVAR / ATUALIZAR
async function saveAsset() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('assetTitle').value;
    const status = document.getElementById('assetStatus').value;
    const fail = document.getElementById('assetFail').value;
    const imgInput = document.getElementById('assetImg');
    const fileInput = document.getElementById('assetFile');

    if (!title) return showNotify("Título obrigatório!", "error");

    try {
        let assetData;
        
        if (id) {
            // MODO EDIÇÃO
            assetData = assets.find(a => a.id == id);
            assetData.title = title;
            assetData.status = status;
            assetData.fail = fail;
            if (imgInput.files[0]) assetData.img = await toBase64(imgInput.files[0]);
            if (fileInput.files[0]) {
                assetData.file = await toBase64(fileInput.files[0]);
                assetData.fileName = fileInput.files[0].name;
            }
            showNotify("Asset atualizado!");
        } else {
            // MODO CRIAÇÃO
            if (!imgInput.files[0] || !fileInput.files[0]) return showNotify("Selecione os arquivos!", "error");
            assetData = {
                id: Date.now(),
                title, status, fail,
                img: await toBase64(imgInput.files[0]),
                file: await toBase64(fileInput.files[0]),
                fileName: fileInput.files[0].name
            };
            assets.push(assetData);
            showNotify("Asset criado!");
        }

        localStorage.setItem('forge_assets', JSON.stringify(assets));
        resetForm();
        renderManageList();
        switchTab('manage');
        if(!id) setTimeout(() => location.reload(), 1000);
    } catch (err) {
        showNotify("Erro: Arquivo muito pesado!", "error");
    }
}

// CARREGAR PARA EDITAR
function prepareEdit(id) {
    const asset = assets.find(a => a.id == id);
    document.getElementById('editId').value = asset.id;
    document.getElementById('assetTitle').value = asset.title;
    document.getElementById('assetStatus').value = asset.status || 'nenhum';
    document.getElementById('assetFail').value = asset.fail || 'none';
    
    document.getElementById('panelTitle').innerText = "CONFIGURAR ASSET";
    document.getElementById('mainBtn').innerText = "SALVAR ALTERAÇÕES";
    document.getElementById('cancelBtn').classList.remove('hidden');
    switchTab('create');
}

function resetForm() {
    document.getElementById('editId').value = "";
    document.getElementById('assetTitle').value = "";
    document.getElementById('panelTitle').innerText = "CRIAR NOVO ASSET";
    document.getElementById('mainBtn').innerText = "SALVAR ASSET";
    document.getElementById('cancelBtn').classList.add('hidden');
    document.getElementById('assetImg').value = "";
    document.getElementById('assetFile').value = "";
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// LISTAR NA HOME (INDEX)
if (document.getElementById('assetGrid')) {
    const grid = document.getElementById('assetGrid');
    assets.forEach(asset => {
        const statusBadge = asset.status && asset.status !== 'nenhum' 
            ? `<span class="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg badge-${asset.status}">${asset.status}</span>` 
            : '';

        grid.innerHTML += `
            <div class="relative bg-slate-900 border border-white/5 rounded-3xl overflow-hidden group hover:border-blue-500 transition-all animate__animated animate__fadeIn">
                ${statusBadge}
                <div class="h-52 bg-cover bg-center" style="background-image: url('${asset.img}')"></div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-6">${asset.title}</h3>
                    <button onclick="downloadAsset('${asset.id}')" class="w-full bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 active:scale-95">BAIXAR</button>
                </div>
            </div>
        `;
    });
}

function downloadAsset(id) {
    const asset = assets.find(a => a.id == id);
    if (asset.fail === 'none') {
        showNotify("Baixando...");
        const a = document.createElement('a'); a.href = asset.file; a.download = asset.fileName; a.click();
    } else {
        const errs = { '404': "ERRO 404", 'virus': "VÍRUS DETECTADO", 'limit': "LIMITE EXCEDIDO" };
        showNotify(errs[asset.fail], "error");
    }
}

// ADMIN TABS
function switchTab(tab) {
    document.getElementById('sectionForm').classList.toggle('hidden', tab !== 'create');
    document.getElementById('sectionManage').classList.toggle('hidden', tab !== 'manage');
    document.getElementById('tabCreate').className = tab === 'create' ? 'px-6 py-3 rounded-xl font-bold bg-blue-600' : 'px-6 py-3 rounded-xl font-bold bg-slate-800';
    document.getElementById('tabManage').className = tab === 'manage' ? 'px-6 py-3 rounded-xl font-bold bg-blue-600' : 'px-6 py-3 rounded-xl font-bold bg-slate-800';
    if(tab === 'manage') renderManageList();
}

function renderManageList() {
    const list = document.getElementById('existingAssetsList');
    list.innerHTML = "";
    assets.forEach(asset => {
        list.innerHTML += `
            <div class="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
                <div class="flex items-center gap-4">
                    <img src="${asset.img}" class="w-12 h-12 rounded-lg object-cover">
                    <div>
                        <p class="font-bold">${asset.title}</p>
                        <p class="text-[10px] uppercase text-blue-400">${asset.status || 'Sem Status'}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="prepareEdit(${asset.id})" class="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition">Configurar</button>
                    <button onclick="deleteAsset(${asset.id})" class="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition">X</button>
                </div>
            </div>
        `;
    });
}

function deleteAsset(id) {
    if(confirm("Excluir?")) {
        assets = assets.filter(a => a.id !== id);
        localStorage.setItem('forge_assets', JSON.stringify(assets));
        renderManageList();
        showNotify("Removido!");
    }
}
