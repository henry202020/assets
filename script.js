// CONFIGURAÇÕES PADRÃO
const config = {
    title: localStorage.getItem('asset_title') || "Cyber City Pack 3D",
    img: localStorage.getItem('asset_img') || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=500",
    fail: localStorage.getItem('asset_fail') || "none"
};

// APLICAR NO FRONT-END
if (document.getElementById('assetTitle')) {
    document.getElementById('assetTitle').innerText = config.title;
    document.getElementById('assetImage').style.backgroundImage = `url('${config.img}')`;
}

// LOGICA DE DOWNLOAD COM FALHAS
const btn = document.getElementById('btnMainDownload');
if (btn) {
    btn.addEventListener('click', () => {
        const msg = document.getElementById('statusMsg');
        btn.innerHTML = "Iniciando...";
        msg.className = "mt-3 text-center text-xs font-mono text-blue-400";

        setTimeout(() => {
            switch (config.fail) {
                case '404':
                    msg.innerText = "ERRO: FILE_NOT_FOUND (404) - Servidor instável.";
                    msg.classList.add('text-red-500');
                    break;
                case 'limit':
                    msg.innerText = "LIMITE ALCANÇADO: Aguarde 24h para baixar novamente.";
                    msg.classList.add('text-orange-500');
                    break;
                case 'virus':
                    msg.innerText = "ALERTA: O sistema detectou uma assinatura corrompida.";
                    msg.classList.add('text-red-600');
                    break;
                case 'login':
                    msg.innerText = "ERRO: Acesso permitido apenas para membros GOLD.";
                    msg.classList.add('text-yellow-500');
                    break;
                default:
                    msg.innerText = "DOWNLOAD CONCLUÍDO COM SUCESSO!";
                    msg.classList.add('text-green-500');
            }
            btn.innerHTML = "Tentar Novamente";
        }, 2000);
    });
}

// FUNÇÕES DO ADMIN
function login() {
    const p = document.getElementById('pass').value;
    if (p === '2012') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminContent').classList.remove('hidden');
        loadAdminFields();
    } else {
        alert("Acesso negado.");
    }
}

function loadAdminFields() {
    document.getElementById('editTitle').value = config.title;
    document.getElementById('editImg').value = config.img;
    document.getElementById('editFail').value = config.fail;
}

function saveAll() {
    localStorage.setItem('asset_title', document.getElementById('editTitle').value);
    localStorage.setItem('asset_img', document.getElementById('editImg').value);
    localStorage.setItem('asset_fail', document.getElementById('editFail').value);
    alert("Dados sincronizados com o site!");
    location.reload();
}

function logout() {
    location.reload();
}
