// Banco de Dados Local
let assets = JSON.parse(localStorage.getItem('forge_assets')) || [];

// SUPORTE AO ENTER NO LOGIN
const loginInput = document.getElementById('pass');
if (loginInput) {
    loginInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") login();
    });
}

// LOGIN & LOGOUT
function login() {
    const p = document.getElementById('pass').value;
    if (p === '2012') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminContent').classList.remove('hidden');
        renderManageList();
    } else {
        alert("Senha incorreta!");
    }
}

function logout() {
    window.location.href = 'index.html'; // Redireciona para a home
}

// NAVEGAÇÃO DE ABAS
function switchTab(tab) {
    const isCreate = tab === 'create';
    document.getElementById('sectionCreate').classList.toggle('hidden', !isCreate);
    document.getElementById('sectionManage').classList.toggle('hidden', isCreate);
    document.getElementById('tabCreate').className = isCreate ? 'px-6 py-3 rounded-xl font-bold bg-blue-600' : 'px-6 py-3 rounded-xl font-bold bg-slate-800';
    document.getElementById('tabManage').className = !isCreate ? 'px-6 py-3 rounded-xl font-bold bg-blue-600' : 'px-6 py-3 rounded-xl font-bold bg-slate-800';
}

// SALVAR NOVO ASSET (TRANSFORMA EM BASE64)
async function saveAsset() {
    const title = document.getElementById('newTitle').value;
    const fail = document.getElementById('newFail').value;
    const imgFile = document.getElementById('newImg').files[0];
    const assetFile = document.getElementById('newFile').files[0];

    if (!title || !imgFile || !assetFile) return alert("Preencha todos os campos e selecione os arquivos!");

    const imgBase64 = await toBase64(imgFile);
    const fileBase64 = await toBase64(assetFile);

    const newAsset = {
        id: Date.now(),
        title,
        fail,
        img: imgBase64,
        file: fileBase64,
        fileName: assetFile.name
    };

    assets.push(newAsset);
    localStorage.setItem('forge_assets', JSON.stringify(assets));
    alert("Asset criado com sucesso!");
    location.reload();
}

// TRANSFORMAR ARQUIVO EM TEXTO (BASE64)
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// LISTAR ASSETS NO ADMIN
function renderManageList() {
    const list = document.getElementById('existingAssetsList');
    if (!list) return;
    list.innerHTML = assets.length === 0 ? '<p class="text-slate-500">Nenhum arquivo criado.</p>' : '';
    
    assets.forEach(asset => {
        list.innerHTML += `
            <div class="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div class="flex items-center gap-4">
                    <img src="${asset.img}" class="w-12 h-12 rounded object-cover">
                    <div>
                        <p class="font-bold">${asset.title}</p>
                        <p class="text-xs text-slate-500">Falha ativa: ${asset.fail}</p>
                    </div>
                </div>
                <button onclick="deleteAsset(${asset.id})" class="text-red-500 hover:bg-red-500/10 p-2 rounded">Excluir</button>
            </div>
        `;
    });
}

function deleteAsset(id) {
    assets = assets.filter(a => a.id !== id);
    localStorage.setItem('forge_assets', JSON.stringify(assets));
    renderManageList();
}

// RENDERIZAR NO SITE PRINCIPAL (INDEX)
if (document.getElementById('assetGrid')) {
    const grid = document.getElementById('assetGrid');
    assets.forEach(asset => {
        grid.innerHTML += `
            <div class="asset-card bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden group">
                <div class="h-48 bg-cover bg-center" style="background-image: url('${asset.img}')"></div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">${asset.title}</h3>
                    <button onclick="handleDownload('${asset.id}')" class="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all active:scale-95">Baixar Asset</button>
                    <p id="msg-${asset.id}" class="mt-2 text-center text-xs font-mono"></p>
                </div>
            </div>
        `;
    });
}

// LÓGICA DE DOWNLOAD
function handleDownload(id) {
    const asset = assets.find(a => a.id == id);
    const msg = document.getElementById(`msg-${id}`);
    
    if (asset.fail === 'none') {
        msg.innerText = "Iniciando download...";
        msg.className = "mt-2 text-center text-xs font-mono text-green-500";
        const link = document.createElement('a');
        link.href = asset.file;
        link.download = asset.fileName;
        link.click();
    } else {
        const errors = {
            '404': 'ERRO 404: Arquivo não encontrado no servidor.',
            'virus': 'PERIGO: Download bloqueado por ameaça detectada.',
            'limit': 'LIMITE: Você já baixou arquivos demais hoje.'
        };
        msg.innerText = errors[asset.fail];
        msg.className = "mt-2 text-center text-xs font-mono text-red-500";
    }
}
