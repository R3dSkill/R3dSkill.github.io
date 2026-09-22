(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const select = (selector, context = document) => context.querySelector(selector);
  const selectAll = (selector, context = document) => [...context.querySelectorAll(selector)];

  const services = [
    ['01', 'Pentest', 'Testes de intrusão para validar a segurança de aplicações, APIs, redes e infraestrutura. Evidências contextualizadas e orientação de correção.'],
    ['02', 'Red Team', 'Simulações adversariais com objetivos e limites acordados, para avaliar a capacidade de prevenção, detecção e resposta da organização.'],
    ['03', 'Análise de Vulnerabilidades', 'Mapeamento de exposições e priorização por contexto. Um ponto de partida claro para reduzir a superfície de ataque.'],
    ['04', 'Resposta a Incidentes', 'Investigação técnica, preservação de evidências e apoio à contenção e recuperação. Entenda o ocorrido e os próximos passos.'],
    ['05', 'Treinamento & Conscientização', 'Capacitação técnica e conscientização adaptadas ao papel de cada equipe. Conhecimento aplicável à rotina da sua operação.'],
    ['06', 'Compliance & LGPD', 'Apoio técnico para alinhar práticas de segurança e proteção de dados às exigências do negócio.'],
  ];

  const steps = [
    ['01 / Alinhar', 'Primeiro, contexto.', 'Objetivos, ativos, limites e regras de execução definidos em conjunto com sua equipe.'],
    ['02 / Investigar', 'Olhar de atacante.', 'Mapeamento e validação técnica dos caminhos de ataque dentro do escopo acordado.'],
    ['03 / Traduzir', 'Evidência em decisão.', 'Achados organizados por risco, com contexto de negócio e recomendações práticas.'],
    ['04 / Evoluir', 'Fechar o ciclo.', 'Alinhamento das correções e definição de uma revalidação conforme o engajamento.'],
  ];

  function setupTheme() {
    const button = select('#tgl');
    const storageKey = 'redskill-v26-theme';
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme) root.dataset.theme = savedTheme;
    } catch (_) {}

    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, root.dataset.theme); } catch (_) {}
    });
  }

  function setupTyping() {
    const phrases = [
      'pentest --alvo sua-empresa.com.br',
      'red-team --objetivo validar-defesas',
      'resposta-incidentes --preservar-evidencias',
      'compliance --lgpd --seguranca-aplicada',
    ];
    const output = select('#typed');
    if (reduceMotion.matches) {
      output.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    function typeNext() {
      const phrase = phrases[phraseIndex];
      output.textContent = phrase.slice(0, characterIndex);
      if (!deleting) {
        characterIndex += 1;
        if (characterIndex > phrase.length) {
          deleting = true;
          window.setTimeout(typeNext, 1700);
          return;
        }
      } else {
        characterIndex -= 1;
        if (characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      window.setTimeout(typeNext, deleting ? 26 : 55);
    }
    typeNext();
  }

  function setupTerminal() {
    const terminal = select('#mterm');
    const lines = [
      ['p', '➜', ' pentest --escopo aplicacao'],
      ['d', '', 'superfície mapeada · hipóteses priorizadas'],
      ['p', '➜', ' validar --impacto --seguro'],
      ['ok', '[✓]', ' evidências prontas para decisão'],
    ];

    const appendLine = ([className, prefix, text]) => {
      const row = document.createElement('div');
      const marker = document.createElement('span');
      marker.className = className;
      marker.textContent = prefix;
      row.append(marker, document.createTextNode(text));
      terminal.append(row);
      return row;
    };

    if (reduceMotion.matches) {
      lines.forEach(appendLine);
      return;
    }

    let index = 0;
    function cycle() {
      if (index >= lines.length) {
        window.setTimeout(() => {
          terminal.replaceChildren();
          index = 0;
          cycle();
        }, 2600);
        return;
      }
      const row = appendLine(lines[index]);
      index += 1;
      row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'both' });
      window.setTimeout(cycle, 700);
    }
    cycle();
  }

  function renderContent() {
    select('#grid').innerHTML = services.map(([number, title, description]) => `
      <article class="tc reveal">
        <span class="num">[${number}]</span>
        <h3>${title}</h3>
        <p>${description}</p>
        <span class="ln" aria-hidden="true"><i></i></span>
      </article>`).join('');

    select('#tl').insertAdjacentHTML('beforeend', steps.map(([number, title, description]) => `
      <article class="tli reveal">
        <span class="tn">${number}</span>
        <h4>${title}</h4>
        <p>${description}</p>
      </article>`).join(''));
  }

  function setupCardLighting() {
    if (!finePointer.matches) return;
    selectAll('.tc, .b').forEach((card) => {
      let frame = 0;
      card.addEventListener('pointermove', (event) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const bounds = card.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          card.style.setProperty('--mx', `${x * 100}%`);
          card.style.setProperty('--my', `${y * 100}%`);
          if (card.classList.contains('tc')) {
            card.style.transform = `rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg)`;
          }
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        frame = 0;
        if (card.classList.contains('tc')) card.style.transform = '';
      });
    });
  }

  function setupAimCursor() {
    const cursor = select('.aim-cursor');
    let targetX = 0;
    let targetY = 0;
    let drawX = 0;
    let drawY = 0;
    let frame = 0;
    let visible = false;

    const paint = () => {
      drawX += (targetX - drawX) * .68;
      drawY += (targetY - drawY) * .68;
      cursor.style.transform = `translate3d(${drawX - 24}px, ${drawY - 24}px, 0)`;
      if (visible && (Math.abs(targetX - drawX) > .1 || Math.abs(targetY - drawY) > .1)) {
        frame = requestAnimationFrame(paint);
      } else {
        frame = 0;
      }
    };

    const hide = () => {
      visible = false;
      cursor.classList.remove('is-visible', 'is-link', 'is-down');
      root.classList.remove('aim-enabled');
      cancelAnimationFrame(frame);
      frame = 0;
    };

    document.addEventListener('pointermove', (event) => {
      const editing = event.target.closest('input, textarea, select, label, [contenteditable="true"]');
      if (!finePointer.matches || reduceMotion.matches || event.pointerType === 'touch' || editing) {
        hide();
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        drawX = targetX;
        drawY = targetY;
      }
      visible = true;
      root.classList.add('aim-enabled');
      cursor.classList.add('is-visible');
      cursor.classList.toggle('is-link', Boolean(event.target.closest('a, button')));
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('keydown', (event) => { if (event.key === 'Tab') hide(); });
    window.addEventListener('blur', hide);
    finePointer.addEventListener('change', hide);
    reduceMotion.addEventListener('change', hide);
  }

  function setupScrollEffects() {
    const timeline = select('#tl');
    const fill = select('#tlfill');
    const progress = select('#prog');
    const timelineItems = selectAll('.tli');
    let frame = 0;

    const update = () => {
      frame = 0;
      const pageHeight = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${pageHeight ? scrollY / pageHeight * 100 : 0}%`;
      const timelineBounds = timeline.getBoundingClientRect();
      const timelineProgress = Math.min(Math.max((innerHeight * .6 - timelineBounds.top) / timelineBounds.height, 0), 1);
      fill.style.height = `${timelineProgress * 100}%`;
      timelineItems.forEach((item) => item.classList.toggle('on', item.getBoundingClientRect().top < innerHeight * .6));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  }

  function setupReveals() {
    const elements = selectAll('.reveal');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('in'));
      return;
    }
    root.classList.add('anim');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    elements.forEach((element) => observer.observe(element));
    requestAnimationFrame(() => elements.forEach((element) => {
      if (element.getBoundingClientRect().top < innerHeight * .96) element.classList.add('in');
    }));
  }

  function setupContactForm() {
    const form = select('#contact-form');
    const status = select('#form-status');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const body = [
        `Nome / Empresa: ${data.get('name')}`,
        `E-mail: ${data.get('email')}`,
        `Serviço: ${data.get('service')}`,
        '',
        data.get('message'),
      ].join('\n');
      const href = `mailto:contato@redskill.com.br?subject=${encodeURIComponent(`Novo projeto · ${data.get('service')}`)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Continue no seu aplicativo de e-mail.';
      window.location.href = href;
    });
  }

  renderContent();
  setupTheme();
  setupTyping();
  setupTerminal();
  setupCardLighting();
  setupAimCursor();
  setupScrollEffects();
  setupReveals();
  setupContactForm();
})();
