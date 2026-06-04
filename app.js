import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5UBkxm8WkVwHwH0ew8wUdvP-gZC0KoKo",
  authDomain: "erp-v14.firebaseapp.com",
  projectId: "erp-v14",
  storageBucket: "erp-v14.firebasestorage.app",
  messagingSenderId: "258665981288",
  appId: "1:258665981288:web:dc159ebbff740d9a26a2dd",
  measurementId: "G-NF08TF0C58"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function get(chave){
    return JSON.parse(localStorage.getItem(chave) || "[]");
}

function set(chave, valor){
    localStorage.setItem(chave, JSON.stringify(valor));
}

async function cadastrar(){
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if(!usuario || !senha){
        alert("Preencha email e senha");
        return;
    }

    try{
        await createUserWithEmailAndPassword(
            auth,
            usuario,
            senha
        );

        alert("Conta criada com sucesso!");
    }catch(erro){
        alert(erro.message);
    }
}

async function login(){
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    try{
        await signInWithEmailAndPassword(
            auth,
            usuario,
            senha
        );

        document.getElementById("login").style.display = "none";
        document.getElementById("sistema").style.display = "block";

        abrirTela("dashboard");

    }catch(erro){
        alert("Usuário ou senha incorretos");
    }
}

window.cadastrar = cadastrar;
window.login = login;

function abrirTela(nome){
    document.querySelectorAll(".tela").forEach(t => {
        t.style.display = "none";
    });

    document.getElementById(nome).style.display = "block";
}

async function salvarCliente(){
    const empresa = document.getElementById("empresa").value;
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const cpf = document.getElementById("cpf").value;

    if(!nome || !email){
        alert("Preencha nome e email");
        return;
    }

    await addDoc(collection(db, "clientes"), {
        empresa,
        nome,
        email,
        telefone,
        cpf,
        dataCadastro: new Date().toISOString()
    });

    alert("Cliente salvo na nuvem!");

    document.getElementById("empresa").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("cpf").value = "";

    carregarClientes();
}

async function carregarClientes(){
    const lista = document.getElementById("listaClientes");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "clientes"));
    let total = 0;

    querySnapshot.forEach((doc) => {
        const c = doc.data();
        total++;

        lista.innerHTML += `
    <p>
        <strong>${c.nome}</strong> - ${c.email}<br>
        Empresa: ${c.empresa || "-"} |
        CPF/CNPJ: ${c.cpf || "-"} |
        Telefone: ${c.telefone || "-"}<br><br>

        <button onclick="editarCliente('${doc.id}')">Editar</button>
        <button onclick="excluirCliente('${doc.id}')">Excluir</button>
    </p>
`;
    });

    document.getElementById("kCli").textContent = total;
}
async function excluirCliente(id){
    if(confirm("Deseja excluir este cliente?")){
        await deleteDoc(doc(db, "clientes", id));
        alert("Cliente excluído!");
        carregarClientes();
    }
}

async function editarCliente(id){
    const novoNome = prompt("Novo nome:");
    const novoEmail = prompt("Novo email:");

    if(!novoNome || !novoEmail){
        alert("Nome e email são obrigatórios");
        return;
    }

    await updateDoc(doc(db, "clientes", id), {
        nome: novoNome,
        email: novoEmail
    });

    alert("Cliente atualizado!");
    carregarClientes();
}
async function filtrarClientes(){
    const termo = document.getElementById("buscarCliente").value.toLowerCase();
    const lista = document.getElementById("listaClientes");

    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "clientes"));

    let total = 0;

    querySnapshot.forEach((docItem) => {
        const c = docItem.data();

        if(c.nome.toLowerCase().includes(termo)){
            total++;

            lista.innerHTML += `
                <p>
                    <strong>${c.nome}</strong> - ${c.email}<br>
                    Empresa: ${c.empresa || "-"} |
                    CPF/CNPJ: ${c.cpf || "-"} |
                    Telefone: ${c.telefone || "-"}<br><br>

                    <button onclick="editarCliente('${docItem.id}')">Editar</button>
                    <button onclick="excluirCliente('${docItem.id}')">Excluir</button>
                </p>
            `;
        }
    });

    document.getElementById("kCli").textContent = total;
}


let faturasCache = [];

async function salvarFatura(){
    const cliente = document.getElementById("clienteFatura").value;
    const valor = Number(document.getElementById("valorFatura").value);
    const vencimento = document.getElementById("vencimento").value;
    const formaPagamento = document.getElementById("formaPagamento").value;

    if(!cliente || valor <= 0){
        alert("Preencha cliente e valor");
        return;
    }

    await addDoc(collection(db, "faturas"), {
        cliente,
        valor,
        vencimento,
        formaPagamento,
        status: "Pendente",
        data: new Date().toISOString()
    });

    alert("Fatura salva na nuvem!");

    document.getElementById("clienteFatura").value = "";
    document.getElementById("valorFatura").value = "";
    document.getElementById("vencimento").value = "";

    carregarFaturas();
}

async function pagarFatura(id){
    await updateDoc(doc(db, "faturas", id), {
        status: "Pago",
        dataPagamento: new Date().toISOString()
    });

    carregarFaturas();
    
}

async function carregarFaturas(){
    const lista = document.getElementById("listaFaturas");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "faturas"));

    let receita = 0;
    let recebido = 0;
    let pendente = 0;
    faturasCache = [];

    querySnapshot.forEach((docItem) => {
        const f = docItem.data();
        f.id = docItem.id;
        faturasCache.push(f);

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

                ${f.status !== "Pago"
? `<button onclick="pagarFatura('${f.id}')">Pagar</button>`
: `<button onclick="pendenteFatura('${f.id}')">Pendente</button>`
}

<button onclick="editarFatura('${f.id}')">Editar</button>
<button onclick="excluirFatura('${f.id}')">Excluir</button>

                
            </p>
        `;
    });

    document.getElementById("kFat").textContent = faturasCache.length;
    document.getElementById("kRec").textContent = "R$ " + receita.toFixed(2);

    const media = faturasCache.length ? receita / faturasCache.length : 0;
    document.getElementById("kMedia").textContent = "R$ " + media.toFixed(2);

    document.getElementById("recebido").textContent = "R$ " + recebido.toFixed(2);
    document.getElementById("pendente").textContent = "R$ " + pendente.toFixed(2);
    document.getElementById("totalFaturas").textContent = faturasCache.length;

    criarGrafico();
}

function criarGrafico(){
    let pagas = 0;
    let pendentes = 0;

    faturasCache.forEach(f => {
        if(f.status === "Pago"){
            pagas++;
        }else{
            pendentes++;
        }
    });

    const ctx = document.getElementById("grafico");

    if(window.graficoERP){
        window.graficoERP.destroy();
    }

    window.graficoERP = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:["Pagas","Pendentes"],
            datasets:[{
                data:[pagas, pendentes],
                backgroundColor:["#22c55e", "#ef4444"],
                borderWidth:0
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}
async function pendenteFatura(id){
    await updateDoc(doc(db, "faturas", id), {
        status: "Pendente"
    });

    carregarFaturas();
}

async function excluirFatura(id){
    if(confirm("Deseja excluir esta fatura?")){
        await deleteDoc(doc(db, "faturas", id));
        carregarFaturas();
    }
}

async function editarFatura(id){
    const novoCliente = prompt("Novo cliente:");
    const novoValor = Number(prompt("Novo valor:"));

    if(!novoCliente || novoValor <= 0){
        alert("Cliente e valor são obrigatórios");
        return;
    }

    await updateDoc(doc(db, "faturas", id), {
        cliente: novoCliente,
        valor: novoValor
    });

    carregarFaturas();
}
function gerarPDF(){

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Relatório de Faturas", 20, 20);

    let y = 40;

    faturasCache.forEach((f, i) => {

        pdf.setFontSize(11);

        pdf.text(
            `${i + 1}. ${f.cliente} | R$ ${f.valor.toFixed(2)} | ${f.status}`,
            20,
            y
        );

        y += 10;

        if(y > 270){
            pdf.addPage();
            y = 20;
        }
    });

    pdf.save("faturas.pdf");
}
function gerarRelatorioMensal(){

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    let total = 0;
    let quantidade = 0;

    faturasCache.forEach(f => {

        const data = new Date(f.data);

        if(
            data.getMonth() === mesAtual &&
            data.getFullYear() === anoAtual
        ){
            total += f.valor;
            quantidade++;
        }
    });

    alert(
        `Relatório Mensal\n\n` +
        `Faturas: ${quantidade}\n` +
        `Total: R$ ${total.toFixed(2)}`
    );
}


function atualizarHorario(){
    const campo = document.getElementById("ultimaAtualizacao");

    if(campo){
        campo.textContent =
            "Última atualização: " +
            new Date().toLocaleString("pt-BR");
    }
}

/* COLE AQUI 👇 */

window.abrirTela = abrirTela;
window.salvarCliente = salvarCliente;
window.filtrarClientes = filtrarClientes;
window.salvarFatura = salvarFatura;
window.pagarFatura = pagarFatura;
window.pendenteFatura = pendenteFatura;
window.gerarPDF = gerarPDF;
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;
window.editarFatura = editarFatura;
window.excluirFatura = excluirFatura;
window.gerarRelatorioMensal = gerarRelatorioMensal;


/* ATÉ AQUI 👆 */
function iniciarDashboardTempoReal(){
    onSnapshot(collection(db, "faturas"), () => {
        carregarFaturas();
        atualizarHorario();
    });

    onSnapshot(collection(db, "clientes"), () => {
        carregarClientes();
        atualizarHorario();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarHorario();
    iniciarDashboardTempoReal();
    setInterval(atualizarHorario, 1000);
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {
            console.log("PWA instalada");
        });
}
