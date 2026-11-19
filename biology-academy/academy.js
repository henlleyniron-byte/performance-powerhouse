(() => {
  'use strict';
  const catalogue = globalThis.PowerhouseBiologyAcademy;
  const unitFilter = document.getElementById('unit');
  const tracks = document.getElementById('tracks');
  const count = document.getElementById('count');
  const lesson = document.getElementById('lesson');

  function syncDestinations() {
    const shared = new URL(location.href).searchParams.get('share') === '1';
    for (const link of document.querySelectorAll('[data-academy-destination]')) {
      const destination = new URL(link.dataset.academyDestination, location.href);
      if (shared) destination.searchParams.set('share', '1');
      link.href = destination.href;
    }
  }

  syncDestinations();
  for (const name of ['popstate', 'pageshow']) window.addEventListener(name, syncDestinations);
  for (const name of ['click', 'auxclick', 'contextmenu']) document.addEventListener(name, syncDestinations, true);

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function list(items, tag = 'ul') {
    const result = element(tag);
    for (const item of items) result.append(element('li', item));
    return result;
  }

  if (!catalogue) {
    count.textContent = 'The learning tracks could not load. Reload this page or use the syllabus link below.';
    return;
  }

  const { units, modules } = catalogue;
  const unitNames = new Map(units.map(({ id, title }) => [id, title]));
  const lessonViews = new Map();
  let activeId;

  for (const { id, title } of units) {
    const option = element('option', id + ' · ' + title);
    option.value = id;
    unitFilter.append(option);
  }

  function card(title) {
    const cardNode = element('section', undefined, 'card');
    cardNode.append(element('h3', title));
    return cardNode;
  }

  function radioGroup(name, prompt, options) {
    const group = element('fieldset');
    group.append(element('legend', prompt));
    const controls = options.map((option) => {
      const label = element('label', undefined, 'choice');
      const input = element('input');
      input.type = 'radio';
      input.name = name;
      label.append(input, element('span', option));
      group.append(label);
      return input;
    });
    return { group, controls };
  }

  function attemptCard(title, name, prompt, options, showResult, buttonText) {
    const section = card(title);
    const { group, controls } = radioGroup(name, prompt, options);
    const button = element('button', buttonText);
    button.type = 'button';
    const status = element('div', undefined, 'callout');
    status.setAttribute('role', 'status');
    status.hidden = true;
    const reveal = element('div');
    reveal.hidden = true;
    controls.forEach((control) => {
      control.addEventListener('change', () => {
        status.hidden = true;
        reveal.hidden = true;
      });
    });
    button.addEventListener('click', () => {
      const chosen = controls.findIndex((control) => control.checked);
      status.hidden = false;
      if (chosen < 0) {
        status.textContent = 'Choose an answer first.';
        return;
      }
      showResult(chosen, status, reveal);
      reveal.hidden = !reveal.childElementCount;
    });
    section.append(group, button, status, reveal);
    return section;
  }

  function writtenCard(title, id, prompt, answerLabel, answer) {
    const section = card(title);
    const label = element('label', prompt);
    label.htmlFor = id;
    const input = element('textarea');
    input.id = id;
    input.autocomplete = 'off';
    const details = element('details');
    details.append(element('summary', answerLabel), Array.isArray(answer) ? list(answer) : element('p', answer));
    section.append(label, input, details);
    return section;
  }

  function buildLesson(module) {
    const view = element('div', undefined, 'lesson-content');
    const heading = element('h2', module.title);
    heading.tabIndex = -1;
    const overview = element('section', undefined, 'card');
    const mapping = module.units.map((id) => id + ' · ' + unitNames.get(id)).join(' / ');
    const concepts = element('details');
    concepts.append(element('summary', 'Review key ideas'), list(module.concepts));
    overview.append(heading, element('p', mapping, 'quiet'), element('p', module.objective), concepts);
    const scenario = module.scenario;
    const model = attemptCard('Predict and check', module.id + '-model', scenario.prompt,
      scenario.options.map(({ label }) => label), (chosen, status, reveal) => {
        status.textContent = scenario.options[chosen].observation;
        reveal.replaceChildren(element('p', scenario.prediction), element('p', scenario.explanation));
      }, 'Check prediction');
    const question = module.mcq;
    const mcq = attemptCard('Closed-book MCQ', module.id + '-mcq', question.prompt,
      question.options, (chosen, status, reveal) => {
        status.textContent = chosen === question.answer ? 'Correct.' : 'Review the reasoning below before reattempting.';
        reveal.replaceChildren(element('p', 'Correct answer: ' + question.options[question.answer], 'callout'),
          list(question.options.map((option, index) => option + ' — ' + question.explanations[index]), 'ol'));
      }, 'Mark answer');
    const retry = element('button', 'Reattempt MCQ');
    retry.type = 'button';
    retry.addEventListener('click', () => {
      const options = mcq.querySelectorAll('input');
      for (const option of options) option.checked = false;
      for (const panel of mcq.querySelectorAll(':scope > div')) panel.hidden = true;
      options[0].focus();
    });
    mcq.append(retry);
    const structured = writtenCard('Structured response', module.id + '-structured', module.structured.prompt,
      'Compare with the marking points', module.structured.points);
    const transfer = writtenCard('Fresh transfer', module.id + '-transfer', module.transfer.prompt,
      'Check the transfer answer', module.transfer.answer);
    transfer.append(element('p', 'For a delayed retest, note the track name and revisit it in a later study session.', 'quiet'));
    view.append(overview, model, mcq, structured, transfer);
    return { view, heading };
  }

  function renderTracks() {
    const visible = modules.filter((module) => !unitFilter.value || module.units.includes(unitFilter.value));
    count.textContent = visible.length + (visible.length === 1 ? ' track' : ' tracks');
    tracks.replaceChildren();
    for (const module of visible) {
      const link = element('a', module.title);
      link.href = '#' + module.id;
      if (module.id === activeId) link.setAttribute('aria-current', 'true');
      link.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        renderLesson(module, true);
      });
      tracks.append(link);
    }
  }

  function renderLesson(module, focus) {
    if (!lessonViews.has(module.id)) lessonViews.set(module.id, buildLesson(module));
    const { view, heading } = lessonViews.get(module.id);
    activeId = module.id;
    if (lesson.firstElementChild !== view) lesson.replaceChildren(view);
    renderTracks();
    if (focus) heading.focus();
  }

  function selectFromHash() {
    const id = location.hash.slice(1);
    const module = modules.find((entry) => entry.id === id);
    if (module) {
      if (unitFilter.value && !module.units.includes(unitFilter.value)) unitFilter.value = '';
      renderLesson(module, false);
    } else if (!id || !activeId) {
      renderLesson(modules[0], false);
    }
  }

  unitFilter.addEventListener('change', renderTracks);
  window.addEventListener('hashchange', selectFromHash);
  selectFromHash();
})();
