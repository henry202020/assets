// === BANCO DE DADOS LOCAL ===
let assets = JSON.parse(localStorage.getItem('forge_assets')) || [];

// === LOGICA PARA A PÁGINA INICIAL (INDEX.HTML) ===
if (document.getElementById('assetGrid')) {
    renderHomeAssets();
}

function renderHomeAssets() {
    const grid = document.getElementById('assetGrid');
    if (!grid) return;
    grid.innerHTML = ""; // Limpa antes de renderizar

    if (assets.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-center col-span-full">Nenhum asset cadastrado ainda.</p>';
        return;
    }

    assets.forEach(asset => {
        grid.innerHTML += `
            <div class="asset-card bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden group animate__animated animate__fadeIn">
                <div class="h-48 bg-cover bg-center" style="background-image: url('${asset.img}')"></div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">${asset.title}</h3>
                    <button onclick="handleDownload('${asset.id}')" class="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all active:scale-95">
                        Baixar Asset
                    </button>
                    <p id="msg-${asset.id}" class="mt-2 text-center text-xs font-mono min-h-[1rem]"></p>
                </div>
            </div>
        `;
    });
}

function handleDownload(id) {
    const asset = assets.find(a => a.id == id);
    const msg = document.getElementById(`msg-${id}`);
    
    if (!asset) return;

    if (asset.fail === 'none') {
        msg.innerText = "Iniciando download...";
        msg.className = "mt-2 text-center text-xs font-mono text-green-500";
        
        const link = document.createElement('a');
        link.href = asset.file;
        link.download = asset.fileName || "asset-download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        const errors = {
            '404': 'ERRO 404: Arquivo não encontrado no servidor.',
            'virus': 'PERIGO: Download bloqueado por ameaça detectada.',
            'limit': 'LIMITE: Você já baixou arquivos demais hoje.'
        };
        msg.innerText = errors[asset.fail] || "Erro no download.";
        msg.className = "mt-2 text-center text-xs font-mono text-red-500";
    }
}

// === LOGICA PARA O PAINEL ADMIN (ADMIN.HTML) ===
const loginInput = document.getElementById('pass');
if (loginInput) {
    // Permite dar Enter na senha
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
    } else {
        alert("Senha incorreta!");
    }
}

function logout() {
    // Redireciona para a home e garante que não volte para a senha
    window.location.href = 'index.html';
}

function switchTab(tab) {
    const isCreate = tab === 'create';
    document.getElementById('sectionCreate').classList.toggle('hidden', !isCreate);
    document.getElementById('sectionManage').classList.toggle('hidden', isCreate);
    
    document.getElementById('tabCreate').className = isCreate ? 'px-6 py-3 rounded-xl font-bold bg-blue-600' : 'px-6 py-3 rounded-xl font-bold bg-slate-800';
    document.getElementById('tabManage').className = !isCreate ? 'px-6 py-3 rounded-xl font-bold bg-blue-600' : 'px-6 py-3 rounded-xl font-bold bg-slate-800';
}

// FUNÇÃO PARA SALVAR ASSET CORRIGIDA
async function saveAsset() {
    try {
        const title = document.getElementById('newTitle').value;
        const fail = document.getElementById('newFail').value;
        const imgInput = document.getElementById('newImg');
        const fileInput = document.getElementById('newFile');

        if (!title || !imgInput.files[0] || !fileInput.files[0]) {
            alert("Erro: Preencha o título e selecione a IMAGEM e o ARQUIVO.");
            return;
        }

        const imgBase64 = await toBase64(imgInput.files[0]);
        const fileBase64 = await toBase64(fileInput.files[0]);

        const newAsset = {
            id: Date.now(),
            title: title,
            fail: fail,
            img: imgBase64,
            file: fileBase64,
            fileName: fileInput.files[0].name
        };

        assets.push(newAsset);
        localStorage.setItem('forge_assets', JSON.stringify(assets));
        
        alert("Asset salvo com sucesso!");
        
        // Limpa os campos
        document.getElementById('newTitle').value = "";
        imgInput.value = "";
        fileInput.value = "";
        
        renderManageList();
        switchTab('manage'); // Vai para a lista após salvar
    } catch (err) {
        console.error(err);
        alert("Erro ao processar arquivos. Tente arquivos menores.");
    }
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function renderManageList() {
    const list = document.getElementById('existingAssetsList');
    if (!list) return;
    
    list.innerHTML = assets.length === 0 ? '<p class="text-slate-500">Nenhum arquivo no banco de dados.</p>' : '';
    
    assets.forEach(asset => {
        list.innerHTML += `
            <div class="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 animate__animated animate__fadeIn">
                <div class="flex items-center gap-4">
                    <img src="${asset.img}" class="w-12 h-12 rounded object-cover border border-white/10">
                    <div>
                        <p class="font-bold">${asset.title}</p>
                        <p class="text-xs text-slate-500">Falha: ${asset.fail} | Arq: ${asset.fileName}</p>
                    </div>
                </div>
                <button onclick="deleteAsset(${asset.id})" class="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition">Excluir</button>
            </div>
        `;
    });
}

function deleteAsset(id) {
    if (confirm("Tem certeza que deseja excluir este asset?")) {
        assets = assets.filter(a => a.id !== id);
        localStorage.setItem('forge_assets', JSON.stringify(assets));
        renderManageList();
    }
}
