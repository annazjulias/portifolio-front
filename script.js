
const container = document.getElementById('particles');
for (let i = 0; i < 20; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.cssText = `
    left: ${Math.random() * 100}%;
    animation-duration: ${8 + Math.random() * 12}s;
    animation-delay: ${Math.random() * 10}s;
    width: ${1 + Math.random() * 2}px;
    height: ${1 + Math.random() * 2}px;
    background: ${Math.random() > 0.5 ? '#00f5ff' : '#ff00e5'};
    box-shadow: 0 0 4px currentColor;
  `;
  container.appendChild(p);
}

// ── MENU MOBILE ───────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── SCROLL REVEAL ──────────────────────
const revealEls = document.querySelectorAll('.reveal');

// pequeno delay escalonado para elementos vizinhos (cards na mesma grade)
revealEls.forEach((el) => {
  const siblings = Array.from(el.parentElement.children).filter((s) =>
    s.classList.contains('reveal')
  );
  const idx = siblings.indexOf(el);
  el.style.transitionDelay = `${Math.min(idx * 0.08, 0.32)}s`;
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  // fallback: navegadores sem suporte simplesmente mostram tudo
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

const sobre = document.querySelector('.sobre');

if (window.innerWidth <= 600) {
  sobre.textContent = 'Sobre';
}
// ── FORMULÁRIO DE CONTATO COM VALIDAÇÃO + FORMSPREE ──────────────

const form        = document.getElementById('contactForm');
const btnEnviar   = document.getElementById('btnEnviar');
const btnTexto    = document.getElementById('btnTexto');
const feedback    = document.getElementById('formFeedback');

// Regex de e-mail
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida um campo e exibe mensagem de erro
function validarCampo(id, erroId, mensagem, condicao) {
  const campo = document.getElementById(id);
  const erro  = document.getElementById(erroId);
  if (condicao) {
    campo.classList.add('invalido');
    erro.textContent = mensagem;
    return false;
  }
  campo.classList.remove('invalido');
  erro.textContent = '';
  return true;
}

// Remove marcação de erro ao digitar
['nome','email','assunto','mensagem'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    document.getElementById(id).classList.remove('invalido');
    document.getElementById('erro' + id.charAt(0).toUpperCase() + id.slice(1)).textContent = '';
  });
});

// Submit
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const assunto  = document.getElementById('assunto').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    // Validações
    const v1 = validarCampo('nome',     'erroNome',     'Por favor, informe seu nome.',           nome.length < 2);
    const v2 = validarCampo('email',    'erroEmail',    'Informe um e-mail válido.',              !regexEmail.test(email));
    const v3 = validarCampo('assunto',  'erroAssunto',  'Informe o assunto da mensagem.',         assunto.length < 3);
    const v4 = validarCampo('mensagem', 'erroMensagem', 'A mensagem deve ter ao menos 10 caracteres.', mensagem.length < 10);

    if (!v1 || !v2 || !v3 || !v4) return; // para aqui se tiver erro

    // Envia para o Formspree
    btnEnviar.disabled = true;
    btnTexto.textContent = 'Enviando...';
    feedback.className = 'form-feedback';
    feedback.textContent = '';

    try {
      const resposta = await fetch('https://formspree.io/f/mkolgbnj', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, assunto, mensagem })
      });

      if (resposta.ok) {
        feedback.textContent = '✓ Mensagem enviada com sucesso! Entrarei em contato em breve.';
        feedback.className = 'form-feedback sucesso';
        form.reset();
      } else {
        throw new Error('Falha no envio');
      }
    } catch {
      feedback.textContent = '✗ Erro ao enviar. Tente novamente ou use o e-mail diretamente.';
      feedback.className = 'form-feedback erro';
    } finally {
      btnEnviar.disabled = false;
      btnTexto.textContent = 'Enviar Mensagem';
    }
  });
}

async function carregarProjeto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch("projects.json");
  const projetos = await res.json();

  const projeto = projetos.find(p => p.id === id);


  document.getElementById("img").src = projeto.imagem;
  document.getElementById("titulo").textContent = projeto.titulo;
  document.getElementById("descricao").textContent = projeto.descricao;

  document.getElementById("site").href = projeto.site;

  document.getElementById("github").href = Array.isArray(projeto.github)
    ? projeto.github[0]
    : projeto.github;

  const techs = document.getElementById("techs");
  techs.innerHTML = projeto.tecnologias
    .map(t => `<span class="tech">${t}</span>`)
    .join("");
}

carregarProjeto();


const PROJETOS = [
  {
    id: "devmovies",
    titulo: "DevMovies",
    tag: "Consumo de API",
    descricao: "Aplicação web de catálogo de filmes desenvolvida em React, consumindo dados em tempo real por meio de uma API externa. O sistema permite visualizar filmes, explorar categorias e acessar informações detalhadas de cada título através de uma interface moderna, responsiva e construída com componentes reutilizáveis.",
    imagem: "src/devmoviies.png",
    tecnologias: ["React", "Axios", "Styled Components"],
    site: "https://dev-movies-r39h.vercel.app/",
    github: "https://github.com/annazjulias/devMovies2.git"
  },
  {
    id: "devburger",
    titulo: "DevBurger",
    tag: "Full Stack 🚀",
    descricao: "Plataforma de delivery desenvolvida com foco em escalabilidade e gestão eficiente de pedidos. O projeto inclui autenticação e autorização de usuários, gerenciamento de produtos e categorias, upload de imagens, integração com APIs de pagamento e recursos administrativos para controle completo da operação.",
    imagem: "src/devBurguer.png",
    tecnologias: ["Express", "PostgreSQL", "Sequelize", "Node", "JWT", "Bcrypt", "Cloudinary", "Multer", "Stripe", "Yup"],
    site: "https://devburguerinterface.onrender.com/",
    github: [
      "https://github.com/annazjulias/aplica-oDevBurger.git",
      "https://github.com/annazjulias/devBurguerInterface.git"
    ]
  },
  {
    id: "agente-cotacao",
    titulo: "Agente de Cotação",
    tag: "Backend",
    descricao: "Aplicação desenvolvida em Python para automação de processos de cotação. O sistema realiza leitura e padronização de planilhas de fornecedores, compara valores de produtos, identifica melhores ofertas e gera relatórios automatizados, reduzindo tempo de análise e aumentando precisão.",
    imagem: "src/agente.png",
    tecnologias: ["Python"],
    site: "https://github.com/annazjulias/agente-de-cotacao.git",
    github: "https://github.com/annazjulias/agente-de-cotacao.git"
  },
  {
    id: "entregas",
    titulo: "Controle de Entregas",
    tag: "Frontend + Planilhas",
    descricao: "Sistema de gestão de entregas desenvolvido inicialmente em C e evoluído para interface web com HTML, CSS e JavaScript. Permite controle de entregas, cálculo de taxas, acompanhamento de faturamento, geração de relatórios e manipulação de arquivos CSV.",
    imagem: "src/entrega.png",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    site: "entregas.html",
    github: "https://github.com/annazjulias/entregas.git"
  },
  {
    id: "farmacia-online",
    titulo: "Sistema de Cadastro para Tele-Entrega",
    tag: "Frontend",
    descricao: "Sistema web para gerenciamento de dados de tele-entrega em farmácias. Substitui registros manuais em papel, permitindo cadastro e organização digital das informações de entrega de forma segura e eficiente.",
    imagem: "src/ficha.png",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    site: "https://farmacia-online-production.up.railway.app/",
    github: "https://github.com/atakadofarmabalcao-oss/farmacia-online.git"
  }
];

/* ── HELPERS ─────────────────────────────────────────── */
const githubIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
</svg>`;

const externalIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  <polyline points="15 3 21 3 21 9"/>
  <line x1="10" y1="14" x2="21" y2="3"/>
</svg>`;

/* conta tecnologias para montar o meta-card */
function techCount(techs) { return techs.length; }

/* determina rótulo do tipo de projeto */
function tipoLabel(tag) {
  if (tag.toLowerCase().includes('full stack')) return 'Full Stack';
  if (tag.toLowerCase().includes('backend')) return 'Backend';
  if (tag.toLowerCase().includes('frontend')) return 'Frontend';
  if (tag.toLowerCase().includes('api')) return 'Consumo de API';
  return tag;
}

/* ── RENDER ──────────────────────────────────────────── */
function renderProjeto(p) {
  document.title = `${p.titulo} · Ana Julia`;

  /* github: pode ser string ou array */
  const githubLinks = Array.isArray(p.github) ? p.github : [p.github];
  const ghBtns = githubLinks.map((url, i) => `
    <a href="${url}" target="_blank" rel="noopener" class="btn-gh">
      ${githubIcon}
      ${githubLinks.length > 1 ? (i === 0 ? 'API' : 'Interface') : 'GitHub'}
    </a>
  `).join('');

  /* tech badges (reutiliza .tech do style.css) */
  const techBadges = p.tecnologias.map(t => `<span class="tech">${t}</span>`).join('');

  /* meta cards */
  const isAgente = p.site === p.github || (Array.isArray(p.github) && p.site === p.github[0]);
  const siteLink = isAgente
    ? `<a href="${p.github}" target="_blank" rel="noopener" class="btn-gh">${githubIcon} Repositório</a>`
    : `<a href="${p.site}" target="_blank" rel="noopener" class="btn-primary"><span>${externalIcon}&nbsp; Ver Projeto</span></a>`;

  document.getElementById('detailRoot').innerHTML = `
    <!-- HERO DO DETALHE -->
    <section class="detail-hero">
      <div class="orb-d1"></div>
      <div class="orb-d2"></div>

      <div class="detail-hero-inner">

        <!-- Imagem -->
        <div class="detail-img-wrap reveal">
          <div class="detail-img-frame">
            <img src="${p.imagem}" alt="Preview de ${p.titulo}" loading="lazy">
          </div>
        </div>

        <!-- Info -->
        <div class="detail-info reveal">
          <span class="detail-tag">${p.tag}</span>
          <h1 class="detail-title">${p.titulo}</h1>
          <p class="detail-desc">${p.descricao}</p>

          <div>
            <p class="detail-stack-label">// Stack</p>
            <div class="detail-stack" style="margin-top:10px">
              ${techBadges}
            </div>
          </div>

          <div class="detail-actions">
            ${siteLink}
            ${ghBtns}
          </div>
        </div>

      </div>
    </section>

  

    <!-- FOOTER simples -->
    <footer class="footer">
      <span class="footer-mono">ana_julia <span style="color:var(--magenta)">©️</span></span>
    </footer>
  `;

  /* dispara scroll-reveal nos novos elementos */
  initReveal();
}

function renderErro() {
  document.getElementById('detailRoot').innerHTML = `
    <div class="detail-state">
      <span class="state-icon">🔍</span>
      <span class="state-msg">Projeto não encontrado</span>
      <a href="index.html" class="btn-secondary" style="margin-top:12px">Voltar ao portfólio</a>
    </div>
  `;
}

/* ── SCROLL REVEAL (replica lógica do script.js) ──────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* ── INIT ─────────────────────────────────────────────── */
(function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const projeto = PROJETOS.find(p => p.id === id);

  if (projeto) renderProjeto(projeto);
  else renderErro();
})();
