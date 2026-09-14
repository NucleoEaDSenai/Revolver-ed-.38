/* =============================================================
   CONFIGURAÇÃO
   -------------------------------------------------------------
   CALIBRATION_ENABLED:
     - true  -> mostra o botão "Calibração" e permite ajustar os
                pontos e as posições de câmera (use isso enquanto
                estiver preparando o material).
     - false -> esconde totalmente o modo calibração. Use este
                valor antes de publicar/incorporar no Storyline
                (modo aluno "limpo").

   HOTSPOTS:
     - Lista das peças a identificar, na ordem em que aparecem no
       menu lateral. "position" e "normal" são as coordenadas 3D
       ancoradas no modelo (preservadas do projeto original do
       revólver — não foram recalculadas). "desc" é o texto
       exibido no card do modo aluno.
     - Para reposicionar um hotspot: abra o Modo Calibração,
       selecione a peça, clique sobre o ponto correspondente no
       modelo e exporte o array atualizado.

   CAMERA_PRESETS:
     - Posição de câmera "ideal" para cada peça (para onde o
       revólver gira automaticamente ao selecionar o item no menu
       ou clicar no hotspot).
     - theta/phi em graus, radius em metros (ou null para usar o
       raio da posição inicial) e fov em graus (ou null para usar
       o campo de visão inicial).
     - Os valores abaixo são um ponto de partida. Para calibrar de
       verdade: no Modo Calibração, posicione o modelo e o zoom
       manualmente, selecione a peça e clique em
       "Capturar posição da câmera". Depois exporte os valores e
       cole aqui.
   ============================================================= */

const CALIBRATION_ENABLED = true;

const HOTSPOTS = [
  { id: "cao",               label: "Cão",                   position: "-0.1993 0.5610 -0.0035", normal: "-0.5296 0.8391 -0.1239",
    desc: "Componente localizado na parte traseira do revólver e integrante do mecanismo responsável pelo acionamento do disparo." },
  { id: "alca-mira",         label: "Alça de mira",          position: "-0.0763 0.5909 -0.0000",  normal: "-0.0298 0.9996 0.0002",
    desc: "Elemento traseiro do sistema de mira, utilizado em conjunto com a massa de mira para estabelecer a referência visual de alinhamento." },
  { id: "tambor",            label: "Tambor",                position: "0.0403 0.5002 -0.0848",  normal: "0.0044 0.2141 -0.9768",
    desc: "Peça cilíndrica giratória que possui as câmaras destinadas a alojar os cartuchos do revólver." },
  { id: "vareta-extrator",   label: "Vareta do extrator",    position: "0.3019 0.4749 -0.0086",  normal: "0.0031 -0.6980 -0.7161",
    desc: "Componente ligado ao sistema de extração, utilizado para retirar simultaneamente os estojos ou cartuchos das câmaras do tambor." },
  { id: "cano",               label: "Cano",                  position: "0.3983 0.5343 -0.0378",  normal: "0.0006 0.0343 -0.9994",
    desc: "Estrutura tubular por onde o projétil percorre seu trajeto após o disparo, direcionando sua saída da arma." },
  { id: "massa-mira",         label: "Massa de mira",         position: "0.5612 0.5761 -0.0209",  normal: "-0.0039 0.8416 -0.5402",
    desc: "Elemento frontal do sistema de mira, que funciona em conjunto com a alça de mira como referência visual." },
  { id: "boca-cano",          label: "Boca do cano",          position: "0.5974 0.5231 -0.0351",  normal: "0.0022 -0.5127 -0.8585",
    desc: "Extremidade frontal do cano, correspondendo ao ponto de saída do projétil após percorrer seu interior." },
  { id: "dedal-serrilhado",   label: "Dedal Serrilhado",      position: "-0.1581 0.4125 -0.0401", normal: "-0.0998 -0.1144 -0.9884",
    desc: "Peça de acionamento associada ao mecanismo de abertura e liberação do tambor, com superfície serrilhada para facilitar o contato." },
  { id: "gatilho",             label: "Gatilho",                position: "-0.0000 0.3017 -0.0162", normal: "-0.0117 -0.0033 -0.9999",
    desc: "Componente do mecanismo de disparo que, quando acionado, inicia a sequência mecânica responsável pelo funcionamento da arma." },
  { id: "guarda-mato",         label: "Guarda-mato",            position: "-0.0439 0.2212 -0.0206", normal: "0.4833 0.7359 -0.4743",
    desc: "Estrutura que envolve e protege o gatilho, ajudando a reduzir o contato acidental com esse componente." },
  { id: "cabo",                 label: "Cabo",                    position: "-0.3260 0.1483 -0.0600", normal: "-0.0528 -0.1160 -0.9918",
    desc: "Parte destinada à empunhadura do revólver, oferecendo superfície de apoio para que a arma seja segurada." },
];

const CAMERA_PRESETS = {
  "cao":              { theta: 195,    phi: 70,     radius: 0.9,    fov: null },
  "alca-mira":        { theta: 246.15, phi: 58.46,  radius: 1.4143, fov: 26.26 },
  "tambor":           { theta: 183,    phi: 67.14,  radius: 1.4143, fov: 26.26 },
  "vareta-extrator":  { theta: 133.59, phi: 81.87,  radius: 1.2586, fov: 22.98 },
  "cano":             { theta: 127.38, phi: 68.3,   radius: 1.4997, fov: 26.26 },
  "massa-mira":       { theta: 110.05, phi: 56.73,  radius: 1.7336, fov: 22.98 },
  "boca-cano":        { theta: 102.68, phi: 75.67,  radius: 1.6982, fov: 22.98 },
  "dedal-serrilhado": { theta: 231.64, phi: 61.53,  radius: 1.0747, fov: 20.11 },
  "gatilho":          { theta: 195,    phi: 90,     radius: 0.8,    fov: null },
  "guarda-mato":      { theta: 201.93, phi: 115.37, radius: 0.85,   fov: 30 },
  "cabo":             { theta: 230.54, phi: 100,    radius: 1.67,   fov: 30 },
};

/* ============================================================= */

(function () {
  "use strict";

  const viewer = document.getElementById("viewer");
  const stage = document.getElementById("stage");
  const emptyState = document.getElementById("empty-state");
  const btnOpenCalibFromEmpty = document.getElementById("btn-open-calib-from-empty");

  const infoPanel = document.getElementById("info-panel");
  const infoNumber = document.getElementById("info-number");
  const infoTitle = document.getElementById("info-title");
  const infoDesc = document.getElementById("info-desc");
  const infoClose = document.getElementById("info-close");

  const navList = document.getElementById("nav-list");

  const btnReset = document.getElementById("btn-reset");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnToggleCalib = document.getElementById("btn-toggle-calib");

  const calibPanel = document.getElementById("calib-panel");
  const selectPart = document.getElementById("select-part");
  const calibStatus = document.getElementById("calib-status");
  const calibList = document.getElementById("calib-list");
  const btnCaptureCamera = document.getElementById("btn-capture-camera");
  const btnExport = document.getElementById("btn-export");
  const btnCloseCalib = document.getElementById("btn-close-calib");
  const exportBox = document.getElementById("export-box");
  const exportText = document.getElementById("export-text");
  const btnCopy = document.getElementById("btn-copy");
  const btnExportCamera = document.getElementById("btn-export-camera");
  const exportCameraBox = document.getElementById("export-camera-box");
  const exportCameraText = document.getElementById("export-camera-text");
  const btnCopyCamera = document.getElementById("btn-copy-camera");

  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;

  let mode = "aluno"; // "aluno" | "calibracao"
  let selectedPartId = HOTSPOTS[0].id;

  // Resolvidos após o modelo carregar (radianos / metros / graus)
  let INITIAL_THETA = 0, INITIAL_PHI = 0, INITIAL_RADIUS = 0, INITIAL_FOV = 0;

  let animToken = 0; // invalida animações anteriores em andamento

  /* -----------------------------------------------------------
     Utilidades
     ----------------------------------------------------------- */
  function findHotspot(id) {
    return HOTSPOTS.find((h) => h.id === id);
  }

  function vecToString(v) {
    return [v.x, v.y, v.z].map((n) => n.toFixed(4)).join(" ");
  }

  function hasAnyCalibrated() {
    return HOTSPOTS.some((h) => h.position);
  }

  function normalizeAngle(rad) {
    // devolve o ângulo equivalente no intervalo (-PI, PI]
    let a = rad % (2 * Math.PI);
    if (a > Math.PI) a -= 2 * Math.PI;
    if (a < -Math.PI) a += 2 * Math.PI;
    return a;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* -----------------------------------------------------------
     Câmera: animação suave até uma posição-alvo (~1s)
     ----------------------------------------------------------- */
  function resolveTarget(partId) {
    const preset = CAMERA_PRESETS[partId] || {};
    return {
      theta: (preset.theta != null ? preset.theta : 0) * DEG,
      phi: (preset.phi != null ? preset.phi : INITIAL_PHI * RAD) * DEG,
      radius: preset.radius != null ? preset.radius : INITIAL_RADIUS,
      fov: preset.fov != null ? preset.fov : INITIAL_FOV,
    };
  }

  function animateCameraTo(target, duration) {
    duration = duration || 1000;
    const myToken = ++animToken;

    const start = viewer.getCameraOrbit();
    const startFov = viewer.getFieldOfView();
    const startTheta = start.theta;
    const startPhi = start.phi;
    const startRadius = start.radius;

    let dTheta = normalizeAngle(target.theta - startTheta);
    const dPhi = target.phi - startPhi;
    const dRadius = target.radius - startRadius;
    const dFov = target.fov - startFov;

    const hadControls = viewer.hasAttribute("camera-controls");
    viewer.removeAttribute("camera-controls");

    const t0 = performance.now();

    function frame(now) {
      if (myToken !== animToken) return; // outra animação assumiu o controle

      const t = Math.min(1, (now - t0) / duration);
      const e = easeInOutCubic(t);

      const theta = startTheta + dTheta * e;
      const phi = startPhi + dPhi * e;
      const radius = startRadius + dRadius * e;
      const fov = startFov + dFov * e;

      viewer.cameraOrbit = theta + "rad " + phi + "rad " + radius + "m";
      viewer.fieldOfView = fov + "deg";
      viewer.jumpCameraToGoal();

      if (t < 1) {
        requestAnimationFrame(frame);
      } else if (hadControls) {
        viewer.setAttribute("camera-controls", "");
      }
    }

    requestAnimationFrame(frame);
  }

  function animateToPart(partId) {
    animateCameraTo(resolveTarget(partId), 1000);
  }

  /* -----------------------------------------------------------
     Renderização dos hotspots dentro do <model-viewer>
     (slots "hotspot-<id>", atributos data-position / data-normal)
     ----------------------------------------------------------- */
  function renderHotspots() {
    viewer.querySelectorAll(".hotspot").forEach((el) => el.remove());

    HOTSPOTS.forEach((h) => {
      if (!h.position) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hotspot";
      btn.slot = "hotspot-" + h.id;
      btn.dataset.partId = h.id;
      btn.setAttribute("data-position", h.position);
      btn.setAttribute("data-normal", h.normal || "0 1 0");
      btn.setAttribute("aria-label", h.label);
      btn.title = mode === "calibracao" ? h.label : "";

      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onHotspotClick(h.id);
      });

      viewer.appendChild(btn);
    });

    updateEmptyState();
    syncSelectionVisuals();
  }

  function updateEmptyState() {
    const calibrated = hasAnyCalibrated();
    emptyState.hidden = calibrated || mode === "calibracao";
    btnOpenCalibFromEmpty.hidden = !CALIBRATION_ENABLED;
  }

  /* -----------------------------------------------------------
     Sincronização: hotspot 3D + menu lateral + card de info
     ----------------------------------------------------------- */
  function syncSelectionVisuals() {
    viewer.querySelectorAll(".hotspot").forEach((el) => {
      el.classList.toggle("selected", el.dataset.partId === selectedPartId && mode === "aluno");
      el.classList.toggle("calib-target", el.dataset.partId === selectedPartId && mode === "calibracao");
    });

    navList.querySelectorAll(".nav-item").forEach((li) => {
      li.classList.toggle("selected", li.dataset.partId === selectedPartId);
    });
  }

  function renderInfoCard(partId) {
    const h = findHotspot(partId);
    if (!h) return;
    const idx = HOTSPOTS.indexOf(h) + 1;
    infoNumber.textContent = String(idx).padStart(2, "0");
    infoTitle.textContent = h.label.toUpperCase();
    infoDesc.textContent = h.desc || "";
  }

  /* -----------------------------------------------------------
     Modo aluno: selecionar peça (via hotspot ou menu)
     ----------------------------------------------------------- */
  function selectPartAluno(partId, opts) {
    opts = opts || {};
    selectedPartId = partId;
    syncSelectionVisuals();
    renderInfoCard(partId);
    infoPanel.hidden = false;

    if (!opts.skipAnimate) {
      animateToPart(partId);
    }
  }

  function clearSelectionAluno() {
    infoPanel.hidden = true;
    selectedPartId = null;
    syncSelectionVisuals();
  }

  function onHotspotClick(id) {
    if (mode === "calibracao") {
      selectPart.value = id;
      selectedPartId = id;
      syncSelectionVisuals();
      updateCalibStatus();
      renderCalibList();
      return;
    }
    selectPartAluno(id);
  }

  infoClose.addEventListener("click", clearSelectionAluno);

  /* -----------------------------------------------------------
     Navegação vertical numerada (menu lateral)
     ----------------------------------------------------------- */
  function buildNav() {
    navList.innerHTML = "";
    HOTSPOTS.forEach((h, i) => {
      const li = document.createElement("li");
      li.className = "nav-item";
      li.dataset.partId = h.id;

      const nodeBtn = document.createElement("button");
      nodeBtn.type = "button";
      nodeBtn.className = "nav-node";
      nodeBtn.textContent = String(i + 1).padStart(2, "0");
      nodeBtn.setAttribute("aria-label", h.label);

      const labelBtn = document.createElement("button");
      labelBtn.type = "button";
      labelBtn.className = "nav-label";
      labelBtn.textContent = h.label;

      function onClickNav() {
        if (mode === "calibracao") {
          selectPart.value = h.id;
          selectedPartId = h.id;
          syncSelectionVisuals();
          updateCalibStatus();
          renderCalibList();
          return;
        }
        selectPartAluno(h.id);
      }

      nodeBtn.addEventListener("click", onClickNav);
      labelBtn.addEventListener("click", onClickNav);

      li.appendChild(nodeBtn);
      li.appendChild(labelBtn);
      navList.appendChild(li);
    });
  }

  /* -----------------------------------------------------------
     Câmera: reset (suave) e zoom controlado
     ----------------------------------------------------------- */
  btnReset.addEventListener("click", () => {
    animateCameraTo({ theta: INITIAL_THETA, phi: INITIAL_PHI, radius: INITIAL_RADIUS, fov: INITIAL_FOV }, 1000);
  });

  function stepZoom(factor) {
    const orbit = viewer.getCameraOrbit();
    if (!orbit) return;
    animToken++; // cancela qualquer animação automática em curso
    const nextRadius = orbit.radius * factor;
    viewer.cameraOrbit = orbit.theta + "rad " + orbit.phi + "rad " + nextRadius + "m";
  }
  btnZoomIn.addEventListener("click", () => stepZoom(0.85));
  btnZoomOut.addEventListener("click", () => stepZoom(1.18));

  /* -----------------------------------------------------------
     Alternância de modo (aluno / calibração)
     ----------------------------------------------------------- */
  function setMode(newMode) {
    mode = newMode;
    const isCalib = mode === "calibracao";

    calibPanel.hidden = !isCalib;
    infoPanel.hidden = isCalib || !selectedPartId;
    btnToggleCalib.classList.toggle("active", isCalib);

    viewer.classList.toggle("calib-cursor", isCalib);
    updateEmptyState();
    renderHotspots();

    if (isCalib) {
      if (!selectedPartId) selectedPartId = HOTSPOTS[0].id;
      selectPart.value = selectedPartId;
      syncSelectionVisuals();
      updateCalibStatus();
      renderCalibList();
    } else if (selectedPartId) {
      renderInfoCard(selectedPartId);
      infoPanel.hidden = false;
    }
  }

  if (CALIBRATION_ENABLED) {
    btnToggleCalib.hidden = false;
    btnToggleCalib.addEventListener("click", () => {
      setMode(mode === "calibracao" ? "aluno" : "calibracao");
    });
    btnOpenCalibFromEmpty.addEventListener("click", () => setMode("calibracao"));
  }
  btnCloseCalib.addEventListener("click", () => setMode("aluno"));

  /* -----------------------------------------------------------
     Painel de calibração: lista de peças
     ----------------------------------------------------------- */
  function buildSelect() {
    selectPart.innerHTML = "";
    HOTSPOTS.forEach((h) => {
      const opt = document.createElement("option");
      opt.value = h.id;
      opt.textContent = h.label;
      selectPart.appendChild(opt);
    });
    selectPart.value = selectedPartId;
  }

  selectPart.addEventListener("change", () => {
    selectedPartId = selectPart.value;
    syncSelectionVisuals();
    updateCalibStatus();
    renderCalibList();
  });

  function updateCalibStatus() {
    const h = findHotspot(selectedPartId);
    if (!h) return;
    const hotspotDone = !!h.position;
    calibStatus.textContent = hotspotDone
      ? `"${h.label}": hotspot calibrado. Clique novamente no modelo para reposicionar, ou ajuste a câmera e capture a posição.`
      : `Clique no modelo no local correspondente a "${h.label}" para fixar o hotspot.`;
  }

  function renderCalibList() {
    calibList.innerHTML = "";
    HOTSPOTS.forEach((h) => {
      const preset = CAMERA_PRESETS[h.id];
      const cameraDone = !!(preset && preset.theta != null && preset.captured);
      const li = document.createElement("li");
      li.className = (h.position ? "hotspot-done " : "") + (h.id === selectedPartId ? "selected" : "");
      li.innerHTML =
        `<span class="dot" title="Hotspot"></span>` +
        `<span class="name">${h.label}</span>` +
        `<span class="flags"><span class="dot-camera" title="Posição de câmera capturada"></span></span>`;
      if (cameraDone) {
        li.querySelector(".dot-camera").style.background = "var(--green-strong)";
      }
      li.addEventListener("click", () => {
        selectPart.value = h.id;
        selectedPartId = h.id;
        syncSelectionVisuals();
        updateCalibStatus();
        renderCalibList();
      });
      calibList.appendChild(li);
    });
  }

  /* -----------------------------------------------------------
     Captura de clique sobre a superfície do modelo (hotspot)
     ----------------------------------------------------------- */
  viewer.addEventListener("click", (ev) => {
    if (mode !== "calibracao") return;
    if (ev.target.classList && ev.target.classList.contains("hotspot")) return;

    const hit = viewer.positionAndNormalFromPoint(ev.offsetX, ev.offsetY);
    if (!hit) {
      calibStatus.textContent = "Não foi possível capturar um ponto ali. Clique diretamente sobre a superfície do modelo.";
      return;
    }

    const h = findHotspot(selectedPartId);
    h.position = vecToString(hit.position);
    h.normal = vecToString(hit.normal);

    renderHotspots();
    renderCalibList();
    updateCalibStatus();
  });

  /* -----------------------------------------------------------
     Captura da posição de câmera ideal para a peça selecionada
     ----------------------------------------------------------- */
  btnCaptureCamera.addEventListener("click", () => {
    const h = findHotspot(selectedPartId);
    if (!h) return;

    const orbit = viewer.getCameraOrbit();
    const fov = viewer.getFieldOfView();

    CAMERA_PRESETS[selectedPartId] = {
      theta: +(orbit.theta * RAD).toFixed(2),
      phi: +(orbit.phi * RAD).toFixed(2),
      radius: +orbit.radius.toFixed(4),
      fov: +fov.toFixed(2),
      captured: true,
    };

    calibStatus.textContent = `Posição de câmera capturada para "${h.label}".`;
    renderCalibList();
  });

  /* -----------------------------------------------------------
     Exportar coordenadas dos hotspots
     ----------------------------------------------------------- */
  function buildExportText() {
    const lines = HOTSPOTS.map((h) => {
      const pos = h.position ? `"${h.position}"` : "null";
      const nor = h.normal ? `"${h.normal}"` : "null";
      const desc = (h.desc || "").replace(/"/g, '\\"');
      return `  { id: "${h.id}", label: "${h.label}", position: ${pos}, normal: ${nor},\n    desc: "${desc}" },`;
    });
    return "const HOTSPOTS = [\n" + lines.join("\n") + "\n];";
  }

  btnExport.addEventListener("click", () => {
    exportText.value = buildExportText();
    exportBox.hidden = false;
  });

  btnCopy.addEventListener("click", async () => {
    await copyToClipboard(exportText, btnCopy);
  });

  /* -----------------------------------------------------------
     Exportar posições de câmera calibradas
     ----------------------------------------------------------- */
  function buildCameraExportText() {
    const lines = HOTSPOTS.map((h) => {
      const p = CAMERA_PRESETS[h.id] || {};
      const theta = p.theta != null ? p.theta : 0;
      const phi = p.phi != null ? p.phi : 80;
      const radius = p.radius != null ? p.radius : "null";
      const fov = p.fov != null ? p.fov : "null";
      return `  "${h.id}": { theta: ${theta}, phi: ${phi}, radius: ${radius}, fov: ${fov} },`;
    });
    return "const CAMERA_PRESETS = {\n" + lines.join("\n") + "\n};";
  }

  btnExportCamera.addEventListener("click", () => {
    exportCameraText.value = buildCameraExportText();
    exportCameraBox.hidden = false;
  });

  btnCopyCamera.addEventListener("click", async () => {
    await copyToClipboard(exportCameraText, btnCopyCamera);
  });

  async function copyToClipboard(textarea, btn) {
    try {
      await navigator.clipboard.writeText(textarea.value);
      btn.textContent = "Copiado!";
    } catch (e) {
      textarea.select();
      document.execCommand("copy");
      btn.textContent = "Copiado!";
    }
    setTimeout(() => (btn.textContent = "Copiar"), 1500);
  }

  /* -----------------------------------------------------------
     Inicialização
     ----------------------------------------------------------- */
  function init() {
    const orbit = viewer.getCameraOrbit();
    INITIAL_THETA = orbit.theta;
    INITIAL_PHI = orbit.phi;
    INITIAL_RADIUS = orbit.radius;
    INITIAL_FOV = viewer.getFieldOfView();

    buildSelect();
    buildNav();
    renderCalibList();
    renderHotspots();
    updateEmptyState();

    // Seleciona a primeira peça por padrão, sem animar (já é a vista inicial)
    selectPartAluno(HOTSPOTS[0].id, { skipAnimate: true });
  }

  if (viewer.loaded) {
    init();
  } else {
    viewer.addEventListener("load", init, { once: true });
  }
})();
