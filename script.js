// BANCO DE DATOS
let assets = JSON.parse(localStorage.getItem('forge_assets')) || [];

// FUNÇÃO DE FEEDBACK (NOTIFICAÇÃO INTERNA)
function showNotify(text, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-green-600' : (type === 'error' ? 'bg-red-600' : 'bg-blue-600');
    
    toast.className = `${color} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate__animated animate__fadeInRight mb-2 font-bold`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${text}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// LOGIN COM ENTER
const loginInput = document.getElementById('pass');
if (loginInput) {
    loginInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") login();
    });
}

function login() {
    const p = document.getElementById('pass').value;
    if (p === '2012') {
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');
        renderManageList();
        showNotify("Acesso master autorizado!");
    } else {
        showNotify("Senha incorreta!", "error");
    }
}

// SALVAR ASSET
async function saveAsset() {
    const title = document.getElementById('newTitle').value;
    const fail = document.getElementById('newFail').value;
    const imgFile = document.getElementById('newImg').files[0];
    const assetFile = document.getElementById('newFile').files[0];

    if (!title || !imgFile || !assetFile) {
        showNotify("Preencha todos os campos!", "error");
        return;
    }

    try {
        const imgBase64 = await toBase64(imgFile);
        const fileBase64 = await toBase64(assetFile);

        const newAsset = {
            id: Date.now(),
            title, fail,
            img: imgBase64,
            file: fileBase64,
            fileName: assetFile.name
        };

        assets.push(newAsset);
        localStorage.setItem('forge_assets', JSON.stringify(assets));
        
        showNotify("Asset salvo com sucesso!");
        setTimeout(() => location.reload(), 1000);
    } catch (err) {
        showNotify("Arquivo muito grande para a memória local!", "error");
    }
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// LISTAR NA HOME
if (document.getElementById('assetGrid')) {
    const grid = document.getElementById('assetGrid');
    if (assets.length === 0) grid.innerHTML = "<p class='col-span-full text-center text-slate-500'>Nenhum asset na loja.</p>";
    
    assets.forEach(asset => {
        grid.innerHTML += `
            <div class="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500 transition-all group">
                <div class="h-52 bg-cover bg-center transition-transform group-hover:scale-105" style="background-image: url('${asset.img}')"></div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-6">${asset.title}</h3>
                    <button onclick="downloadAsset('${asset.id}')" class="w-full bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 active:scale-95">BAIXAR AGORA</button>
                </div>
            </div>
        `;
    });
}

function downloadAsset(id) {
    const asset = assets.find(a => a.id == id);
    if (!asset) return;

    if (asset.fail === 'none') {
        showNotify("Seu download está começando...");
        const a = document.createElement('a');
        a.href = asset.file;
        a.download = asset.fileName;
        a.click();
    } else {
        const errs = { '404': "ERRO 404: Servidor Offline", 'virus': "RISCO DETECTADO: Arquivo Corrompido", 'limit': "LIMITE EXCEDIDO: Tente amanhã" };
        showNotify(errs[asset.fail], "error");
    }
}

// GERENCIAMENTO NO ADMIN
function switchTab(tab) {
    document.getElementById('sectionCreate').classList.toggle('hidden', tab !== 'create');
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
                    <span class="font-bold">${asset.title}</span>
                </div>
                <button onclick="deleteAsset(${asset.id})" class="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition">Deletar</button>
            </div>
        `;
    });
}

function deleteAsset(id) {
    assets = assets.filter(a => a.id !== id);
    localStorage.setItem('forge_assets', JSON.stringify(assets));
    showNotify("Asset removido!");
    renderManageList();
}
