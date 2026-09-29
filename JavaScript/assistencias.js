const assistencias = {
  smartfix: {
    nome: 'SmartFix', logo: 'img/smart-fix.png', local: 'Planaltina, DF', rating: '4,7', total: 128,
    tags: ['Celulares','Tablets','Telas'],
    servicos: ['Troca de tela','Troca de bateria','Conector de carga','Manutenção de software'],
    horario: 'Seg — Sex · 08:00 — 18:00', endereco: 'Planaltina, Brasília - DF',
    contato: 'https://wa.me/5561999999999',
    reviews: [['Carlos M.','★★★★★','Atendimento rápido e orçamento justo.'],['Ana P.','★★★★★','Resolveram meu celular no mesmo dia.']]
  },
  theoff: {
    nome: 'The OFF', logo: 'img/the-off.png', local: 'Setor Comercial Sul, DF', rating: '4,8', total: 96,
    tags: ['Smartphones','Software','Manutenção'],
    servicos: ['Diagnóstico de aparelho','Formatação','Atualização de sistema','Recuperação de software'],
    horario: 'Seg — Sáb · 09:00 — 18:00', endereco: 'Setor Comercial Sul, Brasília - DF',
    contato: 'https://wa.me/5561988888888',
    reviews: [['Lucas R.','★★★★★','Muito atenciosos e explicaram o problema.'],['Marina S.','★★★★☆','Serviço bem feito e dentro do prazo.']]
  },
  smartphone: {
    nome: 'SmartPhone', logo: 'img/smartphone.png', local: 'Setor Comercial Norte, DF', rating: '4,9', total: 154,
    tags: ['Celulares','Telas','Acessórios'],
    servicos: ['Troca de tela','Troca de bateria','Câmera','Conector de carga'],
    horario: 'Seg — Sex · 08:30 — 18:30', endereco: 'Setor Comercial Norte, Brasília - DF',
    contato: 'https://wa.me/5561977777777',
    reviews: [['João V.','★★★★★','Excelente serviço e atendimento.'],['Beatriz L.','★★★★★','Preço justo e entrega rápida.']]
  },
  concertpro: {
    nome: 'Concert PRO', logo: 'img/concert-pro.png', local: 'Taguatinga, DF', rating: '5,0', total: 72,
    tags: ['Computadores','Notebooks','Hardware'],
    servicos: ['Formatação','Limpeza interna','Upgrade de memória','Montagem e manutenção'],
    horario: 'Seg — Sex · 08:00 — 18:00', endereco: 'Taguatinga, Brasília - DF',
    contato: 'https://wa.me/5561966666666',
    reviews: [['Rafael G.','★★★★★','Resolveram meu computador muito rápido.'],['Pedro A.','★★★★★','Ótimo atendimento e explicação técnica.']]
  }
};

function abrirAssistencia(id) {
  const a = assistencias[id];
  if (!a) return;
  document.getElementById('modal-logo').src = a.logo;
  document.getElementById('modal-logo').alt = a.nome;
  document.getElementById('modal-nome').textContent = a.nome;
  document.getElementById('modal-local').textContent = '📍 ' + a.local;
  document.getElementById('modal-rating').textContent = `⭐ ${a.rating} · ${a.total} avaliações`;
  document.getElementById('modal-tags').innerHTML = a.tags.map(t => `<span class="tag">${t}</span>`).join('');
  document.getElementById('modal-servicos').innerHTML = a.servicos.map(s => `<li>✓ ${s}</li>`).join('');
  document.getElementById('modal-horario').textContent = a.horario;
  document.getElementById('modal-avaliacoes').textContent = `${a.total} avaliações · nota ${a.rating}`;
  document.getElementById('modal-endereco').textContent = a.endereco;
  document.getElementById('modal-contato').href = a.contato;
  document.getElementById('modal-reviews').innerHTML = `<h3>O que os clientes dizem</h3>` + a.reviews.map(r => `<div class="modal-review"><strong>${r[0]}</strong><span>${r[1]}</span><p>“${r[2]}”</p></div>`).join('');
  const modal = document.getElementById('assistencia-modal');
  modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
function fecharAssistencia() {
  const modal = document.getElementById('assistencia-modal');
  modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharAssistencia(); });
