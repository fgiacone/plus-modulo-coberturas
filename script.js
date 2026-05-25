const currencies = [
  { id: "EUR", symbol: "\u20AC", name: "Euro", flag: "es", flagSrc: "./flags/ico-ES.svg" },
  { id: "GBP", symbol: "\u00A3", name: "British Pound", flag: "gb", flagSrc: "./flags/ico-GB.svg" },
  { id: "USD", symbol: "$", name: "US Dollar", flag: "us", flagSrc: "./flags/ico-US.svg" },
  { id: "MAD", symbol: "MAD", name: "Dirham", flag: "ma", flagSrc: "./flags/ico-MA.svg" },
  { id: "BAM", symbol: "BAM", name: "Konvertibilna marka", flag: "ba", flagSrc: "./flags/ico-BA.svg" },
  { id: "AED", symbol: "AED", name: "D\u00EDrham Emiratos \u00C1rabes", flag: "ae" },
  { id: "PLN", symbol: "PLN", name: "Zloty polaco", flag: "pl" },
  { id: "NOK", symbol: "NOK", name: "Norwegian Krone", flag: "no" },
  { id: "SEK", symbol: "SEK", name: "Swedish Krona", flag: "se", flagSrc: "./flags/ico-SE.svg" },
  { id: "AUD", symbol: "$", name: "Australian Dollar", flag: "au" },
  { id: "CAD", symbol: "$", name: "Canadian Dollar", flag: "ca" },
  { id: "TRY", symbol: "\u20BA", name: "Turkish Lira", flag: "tr", flagSrc: "./flags/ico-TR.svg" },
  { id: "JPY", symbol: "\u00A5", name: "Japanese Yen", flag: "jp" },
  { id: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "ch" },
  { id: "RUB", symbol: "\u20BD", name: "Russian ruble", flag: "ru" },
  { id: "ARS", symbol: "$", name: "Peso Argentino", flag: "ar" },
];

const currencyState = {
  current: currencies[0],
  switcher: document.querySelector("[data-currency-switcher]"),
  trigger: document.querySelector("[data-currency-trigger]"),
  menu: document.querySelector("[data-currency-menu]"),
  optionsHost: document.querySelector("[data-currency-options]"),
  selectedCode: document.querySelector("[data-selected-currency-code]"),
  selectedName: document.querySelector("[data-selected-currency-name]"),
  selectedFlag: document.querySelector("[data-selected-currency-flag]"),
};

const deviceState = {
  current: "desktop",
  resolution: 390,
  page: document.querySelector(".page"),
  options: document.querySelectorAll("[data-device-option]"),
  views: document.querySelectorAll("[data-device-view]"),
  mobilePreview: document.querySelector(".mobile-preview"),
  mobileContinue: document.querySelector("[data-mobile-continue]"),
  resolutionPanel: document.querySelector("[data-resolution-panel]"),
  resolutionInput: document.querySelector("[data-resolution-input]"),
  resolutionValue: document.querySelector("[data-resolution-value]"),
  resolutionReset: document.querySelector("[data-resolution-reset]"),
  mobileCurrencyFlag: document.querySelector("[data-mobile-currency-flag]"),
  mobileCurrencyId: document.querySelector("[data-mobile-currency-id]"),
};

const reservationModalState = {
  root: document.querySelector("[data-reservation-modal]"),
  dialog: document.querySelector("[data-reservation-modal-dialog]"),
  closeButton: document.querySelector(".reservation-modal__close"),
  lastTrigger: null,
  mode: "desktop",
  homeParent: null,
  homeNextSibling: null,
};

reservationModalState.homeParent = reservationModalState.root?.parentElement ?? null;
reservationModalState.homeNextSibling = reservationModalState.root?.nextSibling ?? null;

const promoModalState = {
  root: document.querySelector("[data-promo-modal]"),
  content: document.querySelector("[data-promo-modal-content]"),
  lastTrigger: null,
  sourceCard: null,
  hasSecondPromo: false,
  status: "default",
  mode: "desktop",
  homeParent: null,
  homeNextSibling: null,
};

promoModalState.homeParent = promoModalState.root?.parentElement ?? null;
promoModalState.homeNextSibling = promoModalState.root?.nextSibling ?? null;

const promoConditionsModalState = {
  root: document.querySelector("[data-promo-conditions-modal]"),
  content: document.querySelector("[data-promo-conditions-modal] .promo-conditions-modal__content"),
  copyParagraphs: document.querySelectorAll("[data-promo-conditions-modal] .promo-conditions-modal__copy p"),
  sections: document.querySelectorAll("[data-promo-conditions-modal] .promo-conditions-modal__section"),
  view: "default",
};

const funnelPromoState = {
  root: document.querySelector("[data-funnel-promo]"),
  isClosing: false,
};

const coverageState = {
  options: document.querySelectorAll("[data-coverage-option]"),
  current: null,
};

const extrasState = {
  cards: document.querySelectorAll("[data-extra-card]"),
  moreToggle: document.querySelector("[data-extras-more-toggle]"),
  morePanel: document.querySelector("[data-extras-more-panel]"),
};

const VALID_PROMO_CODE = "PROMOCODE";
const RESERVATION_MODAL_SECTIONS = ["reservation", "additional", "pricing"];
const MOBILE_PREVIEW_BASE_WIDTH = 390;
const MOBILE_PREVIEW_MIN_WIDTH = 350;
const MOBILE_PREVIEW_MAX_WIDTH = 575;
const FUNNEL_PROMO_CLOSE_DURATION = 280;

function closeFunnelPromo() {
  if (!funnelPromoState.root || funnelPromoState.isClosing || funnelPromoState.root.classList.contains("is-hidden")) {
    return;
  }

  funnelPromoState.isClosing = true;
  funnelPromoState.root.classList.add("is-closing");
  funnelPromoState.root.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    funnelPromoState.root?.classList.add("is-hidden");
    funnelPromoState.root?.classList.remove("is-closing");
    funnelPromoState.isClosing = false;
  }, FUNNEL_PROMO_CLOSE_DURATION);
}

function selectCoverageOption(value) {
  if (!coverageState.options.length) {
    return;
  }

  let matchedOption = null;

  coverageState.options.forEach((option, index) => {
    const isActive = option.dataset.coverageOption === value || (!value && index === 0);
    option.classList.toggle("coverage-card--selected", isActive);
    option.setAttribute("aria-checked", String(isActive));

    const radio = option.querySelector(".coverage-card__radio");
    radio?.classList.toggle("coverage-card__radio--selected", isActive);

    const icon = option.querySelector(".coverage-card__icon");
    if (icon instanceof HTMLImageElement) {
      icon.src = isActive ? icon.dataset.iconSelected ?? icon.src : icon.dataset.iconDefault ?? icon.src;
    }

    if (isActive) {
      matchedOption = option.dataset.coverageOption ?? null;
    }
  });

  coverageState.current = matchedOption;
}

function syncExtraCard(card) {
  const button = card.querySelector("[data-extra-card-toggle]");
  const icon = card.querySelector(".extra-card__button-icon");
  const label = card.querySelector(".extra-card__button-label");
  const isSelected = card.classList.contains("extra-card--selected");

  button?.setAttribute("aria-pressed", String(isSelected));
  button?.classList.toggle("extra-card__button--selected", isSelected);

  if (icon instanceof HTMLImageElement) {
    icon.src = isSelected ? "./assets/ico-check-white.svg" : "./assets/ico-plus-buttom.svg";
  }

  if (label) {
    label.textContent = isSelected ? "A\u00D1ADIDO" : "A\u00F1adir";
  }
}

function toggleExtraCard(card) {
  card.classList.toggle("extra-card--selected");
  syncExtraCard(card);
}

function initExtraCards() {
  extrasState.cards.forEach((card) => {
    syncExtraCard(card);
  });
}

function toggleExtrasMore() {
  if (!extrasState.moreToggle || !extrasState.morePanel) {
    return;
  }

  const isExpanded = extrasState.moreToggle.getAttribute("aria-expanded") === "true";
  const nextExpanded = !isExpanded;
  const label = extrasState.moreToggle.querySelector(".extras-stage__more-label");

  extrasState.moreToggle.setAttribute("aria-expanded", String(nextExpanded));
  extrasState.morePanel.setAttribute("aria-hidden", String(!nextExpanded));
  extrasState.morePanel.classList.toggle("is-expanded", nextExpanded);

  if (label) {
    label.textContent = nextExpanded ? "Mostrar menos" : "Mostrar m\u00E1s";
  }
}

function formatAmountValue(amount, currency) {
  if (currency.id === "MAD" && amount.includes(",")) {
    const [integerPart, decimalPart] = amount.split(",");
    return `${integerPart}.00,${decimalPart}`;
  }

  if (currency.id === "MAD") {
    return `${amount}.00`;
  }

  return amount;
}

function formatCurrencyAmount(amount, currency) {
  return `${formatAmountValue(amount, currency)}${currency.symbol}`;
}

function formatDailyAmount(amount, currency) {
  return `${formatCurrencyAmount(amount, currency)} / d\u00EDa`;
}

function createFlagNode(currency, className) {
  if (currency.flagSrc) {
    const image = document.createElement("img");
    image.className = `${className} currency-flag-image`;
    image.src = currency.flagSrc;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    return image;
  }

  const fallback = document.createElement("span");
  fallback.className = `${className} flag flag--${currency.flag}`;
  fallback.setAttribute("aria-hidden", "true");
  return fallback;
}

function createPromoCardMarkup(state) {
  const isSuccess = state === "success";
  const isError = state === "error";

  const entryMarkup = `
    <div class="promo-row promo-row--entry">
      <label class="promo-field${isError ? " promo-field--error" : ""}">
        <span class="sr-only">Introduce un promocode</span>
        <input type="text" placeholder="Introduce un promocode" data-promo-input />
        ${
          isError
            ? `
              <button class="promo-field__clear" type="button" aria-label="Cerrar" data-promo-reset>
                <svg></use></svg>
              </button>
            `
            : ""
        }
      </label>
      <button class="promo-button" type="button" aria-label="Aplicar código" data-promo-apply>
        <img src="./assets/ico-arrow-right.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const successMarkup = `
    <div class="promo-row promo-row--success">
      <div class="promo-applied">
        <span class="promo-applied__label">${VALID_PROMO_CODE}</span>
        <button class="promo-applied__clear" type="button" aria-label="Cerrar" data-promo-reset>
          <svg><use href="#icon-close"></use></svg>
        </button>
      </div>
      <button class="promo-button promo-button--plus" type="button" aria-label="Añadir otro promocode">+</button>
    </div>
  `;

  const successMessage = `
    <p class="promo-status promo-status--success">
      <span class="promo-status__icon promo-status__icon--success">✓</span>
      <span>¡Descuento aplicado! <strong>Ver condiciones</strong></span>
    </p>
  `;

  const errorMessage = `
    <p class="promo-status promo-status--error">
      i
      <span>¡Código no válido! <strong>Ver condiciones</strong></span>
    </p>
  `;

  return `
    <h3 class="promo-title">PROMOCIONES Y OFERTAS</h3>
    ${isSuccess ? successMarkup : entryMarkup}
    ${isSuccess ? successMessage : ""}
    ${isError ? errorMessage : ""}
  `;
}

function createPromoCardMarkup(state) {
  const isSuccess = state === "success";
  const isError = state === "error";

  const entryMarkup = `
    <div class="promo-row promo-row--entry">
      <label class="promo-field${isError ? " promo-field--error" : ""}">
        <span class="sr-only">Introduce un promocode</span>
        <input type="text" placeholder="Introduce un promocode" data-promo-input />
        ${
          isError
            ? `
              <button class="promo-field__clear" type="button" aria-label="Cerrar" data-promo-reset>
                <img

                  src="./assets/ico-closed-promo.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            `
            : ""
        }
      </label>
      <button class="promo-button" type="button" aria-label="Aplicar código" data-promo-apply>
        <img src="./assets/ico-arrow-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const successMarkup = `
    <div class="promo-row promo-row--success">
      <div class="promo-applied">
        <span class="promo-applied__label">${VALID_PROMO_CODE}</span>
        <button class="promo-applied__clear" type="button" aria-label="Cerrar" data-promo-reset>
          <img
            
            src="./assets/ico-closed-promo.svg"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
      <button
        class="promo-button promo-button--plus"
        type="button"
        aria-label="Añadir otro promocode"
        data-promo-open-modal
      >
        <img src="./assets/ico-plus-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const successMessage = `
    <p class="promo-status promo-status--success">
      
        <img src="./assets/ico-check-promo.svg" alt="" aria-hidden="true" />
      
      <span>¡Descuento aplicado! <strong>Ver condiciones</strong></span>
    </p>
  `;

  const errorMessage = `
    <p class="promo-status promo-status--error">
      
        <img src="./assets/ico-info-promo.svg" alt="" aria-hidden="true" />
      
      <span>¡Código no válido! <strong>Ver condiciones</strong></span>
    </p>
  `;

  return `
    <h3 class="promo-title">PROMOCIONES Y OFERTAS</h3>
    ${isSuccess ? successMarkup : entryMarkup}
    ${isSuccess ? successMessage : ""}
    ${isError ? errorMessage : ""}
  `;
}

function renderPromoCard(card, state = "default") {
  card.dataset.promoState = state;
  card.innerHTML = createPromoCardMarkup(state);
}

function initPromoCards() {
  document.querySelectorAll(".promo-card").forEach((card) => {
    renderPromoCard(card, "default");
  });
}

function submitPromoCode(card) {
  const input = card.querySelector("[data-promo-input]");
  const normalizedValue = input?.value.trim().toUpperCase() ?? "";

  if (normalizedValue === VALID_PROMO_CODE) {
    renderPromoCard(card, "success");
    return;
  }

  renderPromoCard(card, "error");
}

function resetPromoCard(card) {
  const nextState = card.dataset.promoState === "multi" ? "success" : "default";

  renderPromoCard(card, nextState);

  if (nextState === "default") {
    card.querySelector("[data-promo-input]")?.focus();
  }
}

function syncModalLock() {
  const hasOpenModal = [
    reservationModalState.root,
    promoModalState.root,
    promoConditionsModalState.root,
  ].some((modal) => modal && !modal.hidden);

  document.body.classList.toggle("is-modal-open", hasOpenModal);
}

function setMobileContinueDisabled(isDisabled) {
  if (!deviceState.mobileContinue) {
    return;
  }

  deviceState.mobileContinue.disabled = isDisabled;
  deviceState.mobileContinue.classList.toggle("is-disabled", isDisabled);
}

function setMobileResolution(width) {
  const nextWidth = Math.min(
    MOBILE_PREVIEW_MAX_WIDTH,
    Math.max(MOBILE_PREVIEW_MIN_WIDTH, Number(width) || MOBILE_PREVIEW_BASE_WIDTH)
  );

  deviceState.resolution = nextWidth;
  deviceState.page?.style.setProperty("--mobile-preview-width", `${nextWidth}px`);

  if (deviceState.resolutionInput && deviceState.resolutionInput.value !== String(nextWidth)) {
    deviceState.resolutionInput.value = String(nextWidth);
  }

  if (deviceState.resolutionValue) {
    deviceState.resolutionValue.textContent = `${nextWidth}px`;
  }
}

function mountReservationModal(mode) {
  if (!reservationModalState.root) {
    return;
  }

  if (mode === "mobile" && deviceState.mobilePreview) {
    deviceState.mobilePreview.appendChild(reservationModalState.root);
    return;
  }

  if (!reservationModalState.homeParent) {
    return;
  }

  if (reservationModalState.homeNextSibling?.parentNode === reservationModalState.homeParent) {
    reservationModalState.homeParent.insertBefore(
      reservationModalState.root,
      reservationModalState.homeNextSibling
    );
    return;
  }

  reservationModalState.homeParent.appendChild(reservationModalState.root);
}

function mountPromoModal(mode) {
  if (!promoModalState.root) {
    return;
  }

  if (mode === "mobile" && deviceState.mobilePreview) {
    deviceState.mobilePreview.appendChild(promoModalState.root);
    return;
  }

  if (!promoModalState.homeParent) {
    return;
  }

  if (promoModalState.homeNextSibling?.parentNode === promoModalState.homeParent) {
    promoModalState.homeParent.insertBefore(promoModalState.root, promoModalState.homeNextSibling);
    return;
  }

  promoModalState.homeParent.appendChild(promoModalState.root);
}

function createPromoOfferModalMarkup(status, hasSecondPromo) {
  const isError = status === "error";
  const isSuccess = status === "success" && hasSecondPromo;

  return `
    <div class="promo-modal__content">
      <header class="promo-modal__header">
        <h2 class="promo-modal__title" id="promo-modal-title">PROMOCIONES Y OFERTAS</h2>
        <button class="promo-modal__close" type="button" aria-label="Cerrar" data-promo-modal-close>
          <img src="./assets/ico-closed-promo.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      ${
        isSuccess
          ? `
            <div class="promo-modal__alert promo-modal__alert--success">
              <span class="promo-modal__alert-icon">
                <img src="./assets/ico-check.svg" alt="" aria-hidden="true" />
              </span>
              <span>¡Descuentos aplicados correctamente!</span>
            </div>
          `
          : ""
      }

      <div class="promo-modal__offer-list">
          <article class="promo-modal__offer-card">
            <div class="promo-modal__offer-icon">
              <img src="./assets/ico-tag.svg" alt="" aria-hidden="true" />
            </div>
            <div class="promo-modal__offer-copy">
              <strong>PROMOCODE.1</strong>
              <span>10% de descuento en tarifa.</span>
            </div>
          </article>

        ${
          hasSecondPromo
            ? `
              <article class="promo-modal__offer-card">
                <div class="promo-modal__offer-icon">
                  <img src="./assets/ico-tag.svg" alt="" aria-hidden="true" />
                </div>
                <div class="promo-modal__offer-copy">
                  <strong>PROMOCODE.2</strong>
                  <span>15% de descuento en tarifa y extras.</span>
                </div>
                <button
                 
                  type="button"
                  aria-label="Eliminar PROMOCODE.2"
                  data-promo-modal-remove-secondary
                >
                  <img src="./assets/ico-closed-promo.svg" alt="" aria-hidden="true" />
                </button>
              </article>
            `
            : ""
        }
      </div>

      <div class="promo-modal__form">
        <p class="promo-modal__label">¿Tienes otro código promocional?</p>
        <div class="promo-modal__entry">
          <label class="promo-modal__field${isError ? " promo-modal__field--error" : ""}">
            <span class="sr-only">Introduce un promocode</span>
            <input type="text" placeholder="Introduce un promocode" data-promo-modal-input />
            ${
              isError
                ? `
                  <button class="promo-modal__field-clear" type="button" aria-label="Cerrar" data-promo-modal-reset-field>
                    <img src="./assets/ico-closed-promo.svg" alt="" aria-hidden="true" />
                  </button>
                `
                : ""
            }
          </label>
          <button class="promo-modal__apply" type="button" aria-label="Aplicar código" data-promo-modal-apply>
            <img src="./assets/ico-arrow-promo.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        ${
          isError
            ? `
              <p class="promo-modal__error">
                <span class="promo-modal__error-icon">
                  <img src="./assets/ico-info-promo.svg" alt="" aria-hidden="true" />
                </span>
                <span>¡Código no válido! <button class="promo-conditions-link" type="button" data-promo-conditions-open>Ver condiciones</button></span>
              </p>
            `
            : ""
        }
      </div>

      <button class="promo-modal__accept" type="button" data-promo-modal-accept>Aceptar</button>
    </div>
  `;
}

function createPromoCardMarkup(state) {
  const isSuccess = state === "success";
  const isError = state === "error";

  const entryMarkup = `
    <div class="promo-row promo-row--entry">
      <label class="promo-field${isError ? " promo-field--error" : ""}">
        <span class="sr-only">Introduce un promocode</span>
        <input type="text" placeholder="Introduce un promocode" data-promo-input />
        ${
          isError
            ? `
              <button class="promo-field__clear" type="button" aria-label="Cerrar" data-promo-reset>
                <img
                  
                  src="./assets/ico-closed-promo.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            `
            : ""
        }
      </label>
      <button class="promo-button" type="button" aria-label="Aplicar código" data-promo-apply>
        <img src="./assets/ico-arrow-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const successMarkup = `
    <div class="promo-row promo-row--success">
      <div class="promo-applied">
        <span class="promo-applied__label">${VALID_PROMO_CODE}</span>
        <button class="promo-applied__clear" type="button" aria-label="Cerrar" data-promo-reset>
          <img
            
            src="./assets/ico-closed-promo.svg"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
      <button
        class="promo-button promo-button--plus"
        type="button"
        aria-label="Añadir otro promocode"
        data-promo-open-modal
      >
        <img src="./assets/ico-plus-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const successMessage = `
    <p class="promo-status promo-status--success">
      
        <img src="./assets/ico-check-promo.svg" alt="" aria-hidden="true" />
      </span>
      <span>¡Descuento aplicado! <strong>Ver condiciones</strong></span>
    </p>
  `;

  const errorMessage = `
    <p class="promo-status promo-status--error">
      
        <img src="./assets/ico-info-promo.svg" alt="" aria-hidden="true" />
      </span>
      <span>¡Código no válido! <strong>Ver condiciones</strong></span>
    </p>
  `;

  return `
    <h3 class="promo-title">PROMOCIONES Y OFERTAS</h3>
    ${isSuccess ? successMarkup : entryMarkup}
    ${isSuccess ? successMessage : ""}
    ${isError ? errorMessage : ""}
  `;
}

function closeCurrencyMenu() {
  if (!currencyState.switcher || !currencyState.menu || !currencyState.trigger) {
    return;
  }

  currencyState.switcher.classList.remove("is-open");
  currencyState.menu.hidden = true;
  currencyState.trigger.setAttribute("aria-expanded", "false");
}

function renderPromoModal() {
  if (!promoModalState.content) {
    return;
  }

  promoModalState.content.innerHTML =
    promoModalState.mode === "mobile"
      ? createPromoMobileModalMarkup(promoModalState.status)
      : createPromoOfferModalMarkup(promoModalState.status, promoModalState.hasSecondPromo);
}

function openPromoModal(trigger) {
  if (!promoModalState.root) {
    return;
  }

  const modalMode = trigger?.dataset.promoModalMode === "mobile" ? "mobile" : "desktop";
  promoModalState.lastTrigger = trigger;
  promoModalState.sourceCard = trigger.closest(".promo-card");
  promoModalState.status = "default";
  promoModalState.hasSecondPromo = false;
  promoModalState.mode = modalMode;
  mountPromoModal(modalMode);
  promoModalState.root.classList.toggle("promo-modal--mobile", modalMode === "mobile");
  setMobileContinueDisabled(modalMode === "mobile");
  renderPromoModal();
  promoModalState.root.hidden = false;
  syncModalLock();
  closeCurrencyMenu();
}

function closePromoModal() {
  if (!promoModalState.root) {
    return;
  }

  promoModalState.root.hidden = true;
  promoModalState.root.classList.remove("promo-modal--mobile");
  mountPromoModal("desktop");
  setMobileContinueDisabled(false);
  promoModalState.mode = "desktop";
  syncModalLock();
  promoModalState.lastTrigger?.focus();
}

function submitPromoModalCode() {
  if (!promoModalState.content) {
    return;
  }

  const input = promoModalState.content.querySelector("[data-promo-modal-input]");
  const normalizedValue = input?.value.trim().toUpperCase() ?? "";

  if (normalizedValue === VALID_PROMO_CODE) {
    promoModalState.status = "success";
    promoModalState.hasSecondPromo = promoModalState.mode === "mobile" ? false : true;
  } else {
    promoModalState.status = "error";
  }

  renderPromoModal();
}

function resetPromoModalField() {
  promoModalState.status = promoModalState.hasSecondPromo ? "success" : "default";
  renderPromoModal();
}

function removeSecondaryPromoModal() {
  promoModalState.hasSecondPromo = false;
  promoModalState.status = "default";
  renderPromoModal();
}

function acceptPromoModal() {
  if (promoModalState.hasSecondPromo && promoModalState.sourceCard) {
    renderPromoCard(promoModalState.sourceCard, "multi");
  }

  closePromoModal();
}

function openPromoConditionsModal(trigger) {
  if (!promoConditionsModalState.root) {
    return;
  }

  promoConditionsModalState.view = trigger?.closest(".promo-status--success") ? "success" : "default";

  const shouldHideExclusions = promoConditionsModalState.view === "success";
  const exclusionsIntro = promoConditionsModalState.copyParagraphs[4];

  if (exclusionsIntro) {
    exclusionsIntro.hidden = shouldHideExclusions;
  }

  promoConditionsModalState.sections.forEach((section) => {
    section.hidden = shouldHideExclusions;
  });

  let exclusionBlock = exclusionsIntro?.closest(".promo-conditions-modal__copy")?.nextElementSibling ?? null;

  while (
    exclusionBlock &&
    !exclusionBlock.matches(".promo-conditions-modal__accept") &&
    promoConditionsModalState.content?.contains(exclusionBlock)
  ) {
    exclusionBlock.hidden = shouldHideExclusions;
    exclusionBlock = exclusionBlock.nextElementSibling;
  }

  promoConditionsModalState.root.hidden = false;
  syncModalLock();
}

function closePromoConditionsModal() {
  if (!promoConditionsModalState.root) {
    return;
  }

  promoConditionsModalState.root.hidden = true;
  syncModalLock();
}

function createPromoCardMarkup(state) {
  const isSuccess = state === "success";
  const isError = state === "error";
  const isMulti = state === "multi";

  const entryMarkup = `
    <div class="promo-row promo-row--entry">
      <label class="promo-field${isError ? " promo-field--error" : ""}">
        <span class="sr-only">Introduce un promocode</span>
        <input type="text" placeholder="Introduce un promocode" data-promo-input />
        ${
          isError
            ? `
              <button class="promo-field__clear" type="button" aria-label="Cerrar" data-promo-reset>
                <img
                  
                  src="./assets/ico-closed-promo.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            `
            : ""
        }
      </label>
      <button class="promo-button" type="button" aria-label="Aplicar código" data-promo-apply>
        <img src="./assets/ico-arrow-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const successMarkup = `
    <div class="promo-row promo-row--success">
      <div class="promo-applied">
        <span class="promo-applied__label">${VALID_PROMO_CODE}.1</span>
        <button class="promo-applied__clear" type="button" aria-label="Cerrar" data-promo-reset>
          <img
            
            src="./assets/ico-closed-promo.svg"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
      <button
        class="promo-button promo-button--plus"
        type="button"
        aria-label="Añadir otro promocode"
        data-promo-open-modal
      >
        <img src="./assets/ico-plus-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  `;

  const multiMarkup = `
    <div class="promo-row promo-row--success promo-row--multi">
      <div class="promo-applied promo-applied--multi">
        <span class="promo-applied__label">PROMO (x2)</span>
        <button class="promo-applied__clear" type="button" aria-label="Cerrar" data-promo-reset>
          <img
            
            src="./assets/ico-closed-promo.svg"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
      <button
        class="promo-button promo-button--plus"
        type="button"
        aria-label="Añadir otro promocode"
        data-promo-open-modal
      >
        <img src="./assets/ico-plus-promo.svg" alt="" aria-hidden="true" />
      </button>
    </div>
    <div class="promo-chip-list">
      <span class="promo-chip-compact">
        <img src="./assets/ico-promo.svg" alt="" aria-hidden="true" />
        <span>PROMOCODE.1</span>
      </span>
      <span class="promo-chip-compact">
        <img src="./assets/ico-promo.svg" alt="" aria-hidden="true" />
        <span>PROMOCODE.2</span>
      </span>
    </div>
  `;

  const successMessage = `
    <p class="promo-status promo-status--success">
      
        <img src="./assets/ico-check-promo.svg" alt="" aria-hidden="true" />
      
      <span>${isMulti ? "¡Descuentos aplicados!" : "¡Descuento aplicado!"} <button class="promo-conditions-link" type="button" data-promo-conditions-open>Ver condiciones</button></span>
    </p>
  `;

  const errorMessage = `
    <p class="promo-status promo-status--error">
      
        <img src="./assets/ico-info-promo.svg" alt="" aria-hidden="true" />
     
      <span>¡Código no válido! <button class="promo-conditions-link" type="button" data-promo-conditions-open>Ver condiciones</button></span>
    </p>
  `;

  return `
    <h3 class="promo-title">PROMOCIONES Y OFERTAS</h3>
    ${isMulti ? multiMarkup : isSuccess ? successMarkup : entryMarkup}
    ${isSuccess || isMulti ? successMessage : ""}
    ${isError ? errorMessage : ""}
  `;
}

function createPromoMobileModalMarkup(status) {
  const isError = status === "error";
  const isSuccess = status === "success";

  return `
    <div class="promo-mobile-sheet">
      <header class="promo-modal__header promo-mobile-sheet__header">
        <h2 class="promo-modal__title" id="promo-modal-title">PROMOCIONES Y OFERTAS</h2>
        <button class="promo-modal__close" type="button" aria-label="Cerrar" data-promo-modal-close>
          <img src="./assets/ico-closed.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      <div class="promo-mobile-sheet__body">
        <div class="promo-mobile-sheet__entry">
          <label class="promo-mobile-sheet__field${isError ? " promo-mobile-sheet__field--error" : ""}">
            <span class="sr-only">Introduce un promocode</span>
            <input type="text" placeholder="Introduce un promocode" data-promo-modal-input />
          </label>

          <button class="promo-mobile-sheet__apply" type="button" aria-label="Aplicar código" data-promo-modal-apply>
            <img src="./assets/ico-arrow-promo.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        ${
          isSuccess
            ? `
              <p class="promo-mobile-sheet__status promo-mobile-sheet__status--success">
                <img src="./assets/ico-check-promo.svg" alt="" aria-hidden="true" />
                <span>¡Descuento aplicado!</span>
              </p>
            `
            : ""
        }

        ${
          isError
            ? `
              <p class="promo-mobile-sheet__status promo-mobile-sheet__status--error">
                <img src="./assets/ico-info-promo.svg" alt="" aria-hidden="true" />
                <span>¡Código no válido! <button class="promo-conditions-link" type="button" data-promo-conditions-open>Ver condiciones</button></span>
              </p>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function openCurrencyMenu() {
  if (!currencyState.switcher || !currencyState.menu || !currencyState.trigger) {
    return;
  }

  currencyState.switcher.classList.add("is-open");
  currencyState.menu.hidden = false;
  currencyState.trigger.setAttribute("aria-expanded", "true");
}

function toggleCurrencyMenu() {
  if (!currencyState.menu || currencyState.menu.hidden) {
    openCurrencyMenu();
    return;
  }

  closeCurrencyMenu();
}

function updatePriceBlocks() {
  document.querySelectorAll("[data-price-amount]").forEach((node) => {
    node.textContent = formatCurrencyAmount(node.dataset.priceAmount, currencyState.current);
  });

  document.querySelectorAll("[data-price-daily]").forEach((node) => {
    node.textContent = formatDailyAmount(node.dataset.priceDaily, currencyState.current);
  });
}

function syncCurrencySelection() {
  if (currencyState.selectedFlag) {
    currencyState.selectedFlag.replaceChildren(
      createFlagNode(currencyState.current, "currency-switcher__flag")
    );
  }

  if (currencyState.selectedCode) {
    currencyState.selectedCode.textContent = currencyState.current.symbol;
  }

  if (currencyState.selectedName) {
    currencyState.selectedName.textContent = currencyState.current.name;
  }

  if (deviceState.mobileCurrencyFlag) {
    deviceState.mobileCurrencyFlag.replaceChildren(
      createFlagNode(currencyState.current, "mobile-preview__locale-flag")
    );
  }

  if (deviceState.mobileCurrencyId) {
    deviceState.mobileCurrencyId.textContent = currencyState.current.id;
  }

  if (currencyState.optionsHost) {
    currencyState.optionsHost
      .querySelectorAll("[data-currency-option]")
      .forEach((option) => {
        option.setAttribute(
          "aria-selected",
          String(option.dataset.currencyOption === currencyState.current.id)
        );
      });
  }

  updatePriceBlocks();
}

function setDeviceView(view) {
  const nextView = view === "mobile" ? "mobile" : "desktop";
  deviceState.current = nextView;
  deviceState.page?.setAttribute("data-device-view", nextView);

  deviceState.options.forEach((option) => {
    const isActive = option.dataset.deviceOption === nextView;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });

  deviceState.views.forEach((viewNode) => {
    viewNode.hidden = viewNode.dataset.deviceView !== nextView;
  });

  if (deviceState.resolutionPanel) {
    deviceState.resolutionPanel.hidden = nextView !== "mobile";
  }

  closeCurrencyMenu();
}

function buildCurrencyOptions() {
  if (!currencyState.optionsHost) {
    return;
  }

  const fragment = document.createDocumentFragment();

  currencies.forEach((currency) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "currency-switcher__option";
    option.setAttribute("role", "option");
    option.dataset.currencyOption = currency.id;

    const copy = document.createElement("span");
    copy.className = "currency-switcher__option-copy";

    const value = document.createElement("span");
    value.className = "currency-switcher__option-value";
    value.textContent = currency.symbol;

    const name = document.createElement("span");
    name.className = "currency-switcher__option-name";
    name.textContent = currency.name;

    copy.append(value, name);
    option.append(createFlagNode(currency, "currency-switcher__option-flag"), copy);
    fragment.append(option);
  });

  currencyState.optionsHost.replaceChildren(fragment);
}

function initDeliveryPriceCard() {
  const deliveryCard = document.querySelector(".price-card--delivery");

  if (!deliveryCard) {
    return;
  }

  const sections = deliveryCard.querySelectorAll(".price-section");

  if (!sections.length) {
    return;
  }

  const promoSection = sections[0];
  const priceList = promoSection?.querySelector(".price-list");

  if (!promoSection || !priceList || promoSection.querySelector(".price-section-collapsed-row")) {
    return;
  }

  const summaryValue = promoSection.querySelector("[data-price-amount]")?.dataset.priceAmount ?? "000,00";
  const collapsedRow = document.createElement("div");
  collapsedRow.className = "price-section-collapsed-row";

  const count = document.createElement("span");
  count.className = "bullet-copy";
  count.textContent = "4 unidades";

  const priceInline = document.createElement("span");
  priceInline.className = "price-inline";

  const saleChip = document.createElement("span");
  saleChip.className = "sale-chip";
  saleChip.textContent = "-15%";

  const amount = document.createElement("span");
  amount.className = "detail-copy";
  amount.dataset.priceAmount = summaryValue;

  priceInline.append(saleChip, amount);
  collapsedRow.append(count, priceInline);
  promoSection.insertBefore(collapsedRow, priceList);
  syncDeliveryExtrasDaysRow(deliveryCard);
}

function initReservationModal() {
  document.querySelectorAll("[data-modal-accordion-trigger]").forEach((trigger) => {
    const contentId = trigger.getAttribute("aria-controls");
    const content = contentId ? document.getElementById(contentId) : null;

    if (!content) {
      return;
    }

    content.hidden = trigger.getAttribute("aria-expanded") !== "true";
  });

  setReservationSection("reservation");
}

function setReservationSection(sectionName) {
  if (!reservationModalState.root) {
    return;
  }

  const nextSection = RESERVATION_MODAL_SECTIONS.includes(sectionName) ? sectionName : "reservation";

  const triggers = reservationModalState.root.querySelectorAll("[data-reservation-section-trigger]");
  const contents = reservationModalState.root.querySelectorAll("[data-reservation-section-content]");

  triggers.forEach((trigger) => {
    const isActive = trigger.dataset.reservationSectionTrigger === nextSection;
    trigger.classList.toggle("is-active", isActive);
    trigger.classList.toggle("is-collapsed", !isActive);
    trigger.classList.toggle("reservation-modal__panel--open", isActive);
    trigger.classList.toggle("reservation-modal__panel--collapsed", !isActive);
    trigger.setAttribute("aria-expanded", String(isActive));
  });

  contents.forEach((content) => {
    const isActive = content.dataset.reservationSectionContent === nextSection;
    content.hidden = !isActive;
    content.setAttribute("aria-hidden", String(!isActive));
  });
}

function openReservationModal(trigger) {
  if (!reservationModalState.root) {
    return;
  }

  const initialSection = trigger?.dataset.reservationModalSection;
  const modalMode = trigger?.dataset.reservationModalMode === "mobile" ? "mobile" : "desktop";
  reservationModalState.lastTrigger = trigger;
  reservationModalState.mode = modalMode;
  mountReservationModal(modalMode);
  reservationModalState.root.classList.toggle("reservation-modal--mobile", modalMode === "mobile");
  setReservationSection(initialSection || "reservation");
  reservationModalState.root.hidden = false;
  syncModalLock();
  closeCurrencyMenu();
  reservationModalState.closeButton?.focus();
}

function closeReservationModal() {
  if (!reservationModalState.root) {
    return;
  }

  reservationModalState.root.hidden = true;
  reservationModalState.root.classList.remove("reservation-modal--mobile");
  mountReservationModal("desktop");
  reservationModalState.mode = "desktop";
  syncModalLock();
  reservationModalState.lastTrigger?.focus();
}

function toggleReservationAccordion(trigger) {
  const contentId = trigger.getAttribute("aria-controls");
  const content = contentId ? document.getElementById(contentId) : null;

  if (!content) {
    return;
  }

  const isExpanded = trigger.getAttribute("aria-expanded") === "true";
  trigger.setAttribute("aria-expanded", String(!isExpanded));
  content.hidden = isExpanded;
}

function syncDeliveryExtrasDaysRow(card) {
  if (!card?.classList.contains("price-card--delivery")) {
    return;
  }

  const extrasSection = card.querySelector(".price-section:first-of-type");
  const extrasDaysRow = card.querySelector("[data-extras-days-row]");

  if (!extrasSection || !extrasDaysRow) {
    return;
  }

  extrasDaysRow.hidden = !extrasSection.classList.contains("is-collapsed");
}

function selectCurrency(currencyId) {
  const nextCurrency = currencies.find((currency) => currency.id === currencyId);

  if (!nextCurrency) {
    return;
  }

  currencyState.current = nextCurrency;
  syncCurrencySelection();
  closeCurrencyMenu();
}

function togglePriceSections(trigger) {
  const card = trigger.closest(".price-card");

  if (!card) {
    return;
  }

  const sections = card.querySelectorAll(".price-section");

  if (!sections.length) {
    return;
  }

  const shouldCollapse = !Array.from(sections).every((section) =>
    section.classList.contains("is-collapsed")
  );

  sections.forEach((section) => {
    section.classList.toggle("is-collapsed", shouldCollapse);

    const sectionTrigger = section.querySelector(".toggle-section-trigger");

    if (sectionTrigger) {
      sectionTrigger.setAttribute("aria-expanded", String(!shouldCollapse));
    }
  });

  syncDeliveryExtrasDaysRow(card);
}

initReservationModal();
initPromoCards();
buildCurrencyOptions();
initDeliveryPriceCard();
syncCurrencySelection();
setMobileResolution(deviceState.resolution);
setDeviceView(deviceState.current);
selectCoverageOption(
  Array.from(coverageState.options).find((option) => option.classList.contains("coverage-card--selected"))?.dataset.coverageOption
);
initExtraCards();

document.addEventListener("click", (event) => {
  const coverageOptionTrigger = event.target.closest("[data-coverage-option]");

  if (coverageOptionTrigger) {
    selectCoverageOption(coverageOptionTrigger.dataset.coverageOption);
    return;
  }

  const extraCardToggleTrigger = event.target.closest("[data-extra-card-toggle]");

  if (extraCardToggleTrigger) {
    const extraCard = extraCardToggleTrigger.closest("[data-extra-card]");

    if (extraCard) {
      toggleExtraCard(extraCard);
    }

    return;
  }

  const extrasMoreToggleTrigger = event.target.closest("[data-extras-more-toggle]");

  if (extrasMoreToggleTrigger) {
    toggleExtrasMore();
    return;
  }

  const funnelPromoCloseTrigger = event.target.closest("[data-funnel-promo-close]");

  if (funnelPromoCloseTrigger) {
    closeFunnelPromo();
    return;
  }

  const promoConditionsOpenTrigger = event.target.closest("[data-promo-conditions-open]");

  if (promoConditionsOpenTrigger) {
    openPromoConditionsModal(promoConditionsOpenTrigger);
    return;
  }

  const promoConditionsCloseTrigger = event.target.closest("[data-promo-conditions-close]");

  if (promoConditionsCloseTrigger) {
    closePromoConditionsModal();
    return;
  }

  const promoOpenModalTrigger = event.target.closest("[data-promo-open-modal]");

  if (promoOpenModalTrigger) {
    openPromoModal(promoOpenModalTrigger);
    return;
  }

  const promoModalCloseTrigger = event.target.closest("[data-promo-modal-close]");

  if (promoModalCloseTrigger) {
    closePromoModal();
    return;
  }

  const promoModalAcceptTrigger = event.target.closest("[data-promo-modal-accept]");

  if (promoModalAcceptTrigger) {
    acceptPromoModal();
    return;
  }

  const promoModalApplyTrigger = event.target.closest("[data-promo-modal-apply]");

  if (promoModalApplyTrigger) {
    submitPromoModalCode();
    return;
  }

  const promoModalRemoveSecondaryTrigger = event.target.closest("[data-promo-modal-remove-secondary]");

  if (promoModalRemoveSecondaryTrigger) {
    removeSecondaryPromoModal();
    return;
  }

  const promoModalResetTrigger = event.target.closest("[data-promo-modal-reset-field]");

  if (promoModalResetTrigger) {
    resetPromoModalField();
    return;
  }

  const promoApplyTrigger = event.target.closest("[data-promo-apply]");

  if (promoApplyTrigger) {
    const promoCard = promoApplyTrigger.closest(".promo-card");

    if (promoCard) {
      submitPromoCode(promoCard);
    }

    return;
  }

  const promoResetTrigger = event.target.closest("[data-promo-reset]");

  if (promoResetTrigger) {
    const promoCard = promoResetTrigger.closest(".promo-card");

    if (promoCard) {
      resetPromoCard(promoCard);
    }

    return;
  }

  const modalOpenTrigger = event.target.closest("[data-reservation-modal-open]");

  if (modalOpenTrigger) {
    openReservationModal(modalOpenTrigger);
    return;
  }

  const modalCloseTrigger = event.target.closest("[data-reservation-modal-close]");

  if (modalCloseTrigger) {
    closeReservationModal();
    return;
  }

  const reservationSectionTrigger = event.target.closest("[data-reservation-section-trigger]");

  if (reservationSectionTrigger) {
    setReservationSection(reservationSectionTrigger.dataset.reservationSectionTrigger);
    return;
  }

  const modalAccordionTrigger = event.target.closest("[data-modal-accordion-trigger]");

  if (modalAccordionTrigger) {
    toggleReservationAccordion(modalAccordionTrigger);
    return;
  }

  const currencyOption = event.target.closest("[data-currency-option]");

  if (currencyOption) {
    selectCurrency(currencyOption.dataset.currencyOption);
    return;
  }

  const currencyTrigger = event.target.closest("[data-currency-trigger]");

  if (currencyTrigger) {
    toggleCurrencyMenu();
    return;
  }

  const deviceOption = event.target.closest("[data-device-option]");

  if (deviceOption) {
    setDeviceView(deviceOption.dataset.deviceOption);
    return;
  }

  const sectionTrigger = event.target.closest(".toggle-section-trigger");

  if (sectionTrigger) {
    togglePriceSections(sectionTrigger);
    return;
  }

  if (currencyState.switcher && !event.target.closest("[data-currency-switcher]")) {
    closeCurrencyMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches("[data-promo-modal-input]")) {
    event.preventDefault();
    submitPromoModalCode();
    return;
  }

  if (event.key === "Enter" && event.target.matches("[data-promo-input]")) {
    const promoCard = event.target.closest(".promo-card");

    if (promoCard) {
      event.preventDefault();
      submitPromoCode(promoCard);
      return;
    }
  }

  if (event.key === "Escape") {
    if (promoConditionsModalState.root && !promoConditionsModalState.root.hidden) {
      closePromoConditionsModal();
      return;
    }

    if (promoModalState.root && !promoModalState.root.hidden) {
      closePromoModal();
      return;
    }

    if (reservationModalState.root && !reservationModalState.root.hidden) {
      closeReservationModal();
      return;
    }

    closeCurrencyMenu();
  }
});

deviceState.resolutionInput?.addEventListener("input", (event) => {
  setMobileResolution(event.target.value);
});

deviceState.resolutionReset?.addEventListener("click", () => {
  setMobileResolution(MOBILE_PREVIEW_BASE_WIDTH);
});
