function get(chave){
    return JSON.parse(localStorage.getItem(chave) || "[]");
}

function set(chave, valor){
    localStorage.setItem(chave, JSON.stringify(valor));
}

function login(){
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if(usuario === "jg" && senha === "12345678"){
        document.getElementById("login").style.display = "none";
        document.getElementById("sistema").style.display = "block";
        abrirTela("dashboard");
    }else{
        alert("Usuário ou senha incorretos");
    }
}

function abrirTela(nome){
    document.querySelectorAll(".tela").forEach(t => {
        t.style.display = "none";
    });

    document.getElementById(nome).style.display = "block";
}

function salvarCliente(){
    const empresa = document.getElementById("empresa").value;
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const cpf = document.getElementById("cpf").value;

    if(!nome || !email){
        alert("Preencha nome e email");
        return;
    }

    const clientes = get("clientes");

    clientes.push({
        id: Date.now(),
        empresa,
        nome,
        email,
        telefone,
        cpf,
        dataCadastro: new Date().toISOString()
    });

    set("clientes", clientes);

    document.getElementById("empresa").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("cpf").value = "";

    carregarClientes();
}

function carregarClientes(){
    const clientes = get("clientes");
    const lista = document.getElementById("listaClientes");

    lista.innerHTML = "";

    clientes.forEach(c => {
        lista.innerHTML += `
            <p>
                <strong>${c.nome}</strong> - ${c.email}<br>
                Empresa: ${c.empresa || "-"} |
                CPF/CNPJ: ${c.cpf || "-"} |
                Telefone: ${c.telefone || "-"}
            </p>
        `;
    });

    document.getElementById("kCli").textContent = clientes.length;
}

function filtrarClientes(){
    const termo = document.getElementById("buscarCliente").value.toLowerCase();
    const clientes = get("clientes");
    const lista = document.getElementById("listaClientes");

    lista.innerHTML = "";

    clientes
        .filter(c => c.nome.toLowerCase().includes(termo))
        .forEach(c => {
            lista.innerHTML += `<p>${c.nome} - ${c.email}</p>`;
        });
}

function salvarFatura(){
    const cliente = document.getElementById("clienteFatura").value;
    const valor = Number(document.getElementById("valorFatura").value);
    const vencimento = document.getElementById("vencimento").value;
    const formaPagamento = document.getElementById("formaPagamento").value;

    if(!cliente || valor <= 0){
        alert("Preencha cliente e valor");
        return;
    }

    const faturas = get("faturas");

    faturas.push({
        id: Date.now(),
        cliente,
        valor,
        vencimento,
        formaPagamento,
        status: "Pendente",
        data: new Date().toISOString()
    });

    set("faturas", faturas);

    document.getElementById("clienteFatura").value = "";
    document.getElementById("valorFatura").value = "";
    document.getElementById("vencimento").value = "";

    carregarFaturas();
    criarGrafico();
}

function pagarFatura(id){
    const faturas = get("faturas");
    const historico = get("historico");

    faturas.forEach(f => {
        if(f.id === id && f.status !== "Pago"){
            f.status = "Pago";

            historico.push({
                cliente: f.cliente,
                valor: f.valor,
                dataPagamento: new Date().toISOString()
            });
        }
    });

    set("faturas", faturas);
    set("historico", historico);

    carregarFaturas();
    criarGrafico();
}

function carregarFaturas(){
    const faturas = get("faturas");
    const lista = document.getElementById("listaFaturas");

    lista.innerHTML = "";

    let receita = 0;
    let recebido = 0;
    let pendente = 0;

    faturas.forEach(f => {
        receita += f.valor;

        if(f.status === "Pago"){
            recebido += f.valor;
        }else{
            pendente += f.valor;
        }

        lista.innerHTML += `
            <p>
                <strong>${f.cliente}</strong>
                - R$ ${f.valor.toFixed(2)}
                - ${f.formaPagamento || "-"}
                - Vencimento: ${f.vencimento || "-"}
                - 
                <span class="${f.status === "Pago" ? "status-pago" : "status-pendente"}">
                    ${f.status === "Pago" ? "✔ Pago" : "Pendente"}
                </span>

                ${
                    f.status !== "Pago"
                    ? `
                    <button onclick="pagarFatura(${f.id})">
                        Pagar
                    </button>
                    `
                    : ""
                }
            </p>
        `;
    });

    document.getElementById("kFat").textContent = faturas.length;
    document.getElementById("kRec").textContent = "R$ " + receita.toFixed(2);

    const media = faturas.length ? receita / faturas.length : 0;
    document.getElementById("kMedia").textContent = "R$ " + media.toFixed(2);

    document.getElementById("recebido").textContent = "R$ " + recebido.toFixed(2);
    document.getElementById("pendente").textContent = "R$ " + pendente.toFixed(2);
    document.getElementById("totalFaturas").textContent = faturas.length;
}
    

function criarGrafico(){

    const faturas = get("faturas");

    let pagas = 0;
    let pendentes = 0;

    faturas.forEach(f => {

        if(f.status === "Pago"){
            pagas++;
        }else{
            pendentes++;
        }

    });

    const ctx =
    document.getElementById("grafico");

    if(window.graficoERP){
        window.graficoERP.destroy();
    }

    window.graficoERP = new Chart(ctx,{
        type:"doughnut",

        data:{
            labels:["Pagas","Pendentes"],

            datasets:[{
                data:[pagas,pendentes],

                backgroundColor:[
                    "#22c55e",
                    "#ef4444"
                ],

                borderWidth:0
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

function gerarPDF(){
    alert("PDF em desenvolvimento");
}

function atualizarHorario(){
    const campo = document.getElementById("ultimaAtualizacao");

    if(campo){
        campo.textContent =
            "Última atualização: " +
            new Date().toLocaleString("pt-BR");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarFaturas();
    atualizarHorario();
    criarGrafico();

    setInterval(atualizarHorario, 1000);
});