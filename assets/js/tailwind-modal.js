/* 
Name                 : CuraPanel - Free Tailwind CSS Healthcare Admin Dashboard Template
Author               : TemplateRise
Url                  : https://www.templaterise.com/template/curapanel-free-tailwind-css-healthcare-admin-dashboard-template 
*/

class TailwindModal {
  constructor(selector) {
    this.modal = document.querySelector(selector);
    this.dialog = this.modal.querySelector(".tw-modal-dialog");
    this.isOpen = false;
    this.isStatic = this.modal.hasAttribute("data-modal-backdrop") &&
                    this.modal.getAttribute("data-modal-backdrop") === "static";

    // Background click
    this.modal.addEventListener("click", (e) => {
      if (!this.isStatic && e.target === this.modal) {
        this.hide();
      }
    });

    // ESC key
    document.addEventListener("keydown", (e) => {
      if (!this.isStatic && this.isOpen && e.key === "Escape") {
        this.hide();
      }
    });
  }

  show() {
    this.isOpen = true;
    this.modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    // Animate
    requestAnimationFrame(() => {
      this.dialog.classList.remove("scale-95", "opacity-0");
      this.dialog.classList.add("scale-100", "opacity-100");
    });
  }

  hide() {
    this.isOpen = false;
    this.dialog.classList.remove("scale-100", "opacity-100");
    this.dialog.classList.add("scale-95", "opacity-0");

    // Wait for transition before hiding completely
    setTimeout(() => {
      if (!this.isOpen) {
        this.modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }
    }, 150);
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }
}

/* ======================================
   Modal Manager (Global API)
   ====================================== */
const Modal = (() => {
  const modals = {};

  function getModal(id) {
    if (!modals[id]) {
      const el = document.getElementById(id);
      if (el) modals[id] = new TailwindModal(`#${id}`);
    }
    return modals[id];
  }

  // Auto-init buttons
  document.querySelectorAll("[data-modal-target]").forEach((btn) => {
    const target = btn.getAttribute("data-modal-target");
    getModal(target);

    btn.addEventListener("click", () => {
      modals[target]?.toggle();
    });
  });

  // Auto-init close buttons
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalEl = btn.closest(".tw-modal");
      if (modalEl) {
        modals[modalEl.id]?.hide();
      }
    });
  });

  // ✅ Public API
  return {
    show: (id) => getModal(id)?.show(),
    hide: (id) => getModal(id)?.hide(),
    toggle: (id) => getModal(id)?.toggle(),
  };
})();
