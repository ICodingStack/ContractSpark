/**
 * main.js
 * Alpine.js application controller for ContractSpark.
 * Wires together all modules into the reactive UI.
 * ContractSpark — Beautiful Contracts That Protect You
 */

// ═══════════════════════════════════════════════════════
// ALPINE.JS APP DEFINITION
// ═══════════════════════════════════════════════════════

// Store debounced updater outside Alpine's reactive proxy so
// it is never wrapped/re-wrapped by Alpine's Proxy machinery.
let _previewDebounced = null;

function contractSpark() {
  return {
    // ── View State ────────────────────────────────────
    currentView: "home", // 'home' | 'templates' | 'smart-builder' | 'builder'
    editorTab: "details", // 'details' | 'clauses' | 'style'
    showPreviewMobile: false,
    showSavedPanel: false,

    // ── Theme ─────────────────────────────────────────
    isDark: true,

    // ── Accent Color ─────────────────────────────────
    accentColor: "#c9a96e",
    accentRgb: "201, 169, 110",

    // ── Smart Builder State ───────────────────────────
    smartBuilderBrief: "",
    smartBuilderType: "freelance",
    smartBuilderPartyA: "",
    smartBuilderPartyB: "",
    isGenerating: false,

    // ── Contract Data ─────────────────────────────────
    contractData: getDefaultContractData("freelance"),

    // ── Preview ───────────────────────────────────────
    previewHTML: "",
    previewZoom: 0.72,

    // ── Saved Contracts ───────────────────────────────
    savedContracts: [],

    // ── Toast ─────────────────────────────────────────
    toast: { visible: false, message: "", type: "success", timer: null },

    // ── Color Swatches ────────────────────────────────
    colorSwatches: [
      { name: "Gold", value: "#c9a96e" },
      { name: "Slate Blue", value: "#6e8ec9" },
      { name: "Forest", value: "#6ec9a0" },
      { name: "Rose", value: "#c96e8e" },
      { name: "Violet", value: "#9a6ec9" },
      { name: "Coral", value: "#c97a6e" },
      { name: "Sage", value: "#7ec96e" },
      { name: "Steel", value: "#6eadc9" },
    ],

    // ─────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────

    init() {
      // Load theme preference
      const savedTheme = localStorage.getItem("cs_theme");
      this.isDark = savedTheme !== "light";
      this.applyTheme();

      // Load accent color
      const savedAccent = localStorage.getItem("cs_accent");
      if (savedAccent) this.setAccentColor(savedAccent, false);

      // Load saved contracts
      this.savedContracts = loadSavedContracts();

      // Default smart builder type
      this.smartBuilderType = "freelance";

      // Debounced preview updater — stored outside Alpine proxy to avoid Proxy wrapping issues
      _previewDebounced = debounce(() => this._doUpdatePreview(), 120);

      console.log(
        "%c ContractSpark v1.0 ",
        "background:#c9a96e;color:#0e0c08;font-weight:bold;padding:4px 8px;border-radius:4px;",
      );
    },

    // ─────────────────────────────────────────────────
    // THEME
    // ─────────────────────────────────────────────────

    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
    },

    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("cs_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("cs_theme", "light");
      }
    },

    // ─────────────────────────────────────────────────
    // ACCENT COLOR
    // ─────────────────────────────────────────────────

    setAccentColor(hex, save = true) {
      this.accentColor = hex;
      this.accentRgb = hexToRgbString(hex);
      document.documentElement.style.setProperty("--accent", hex);
      document.documentElement.style.setProperty(
        "--accent-rgb",
        this.accentRgb,
      );
      if (save) localStorage.setItem("cs_accent", hex);
      this.updatePreview();
    },

    // ─────────────────────────────────────────────────
    // NAVIGATION
    // ─────────────────────────────────────────────────

    resetToHome() {
      this.currentView = "home";
    },

    // ─────────────────────────────────────────────────
    // TEMPLATE SELECTION
    // ─────────────────────────────────────────────────

    get featuredTemplates() {
      return CONTRACT_TEMPLATES.slice(0, 4);
    },

    get allTemplates() {
      return CONTRACT_TEMPLATES;
    },

    selectTemplate(template) {
      // Build fresh contract data from template
      this.contractData = getDefaultContractData(template.id);
      this.contractData.meta.title = template.meta.title;
      this.contractData.meta.type = template.id;

      // Generate initial clauses
      this.contractData.clauses = template.getClauses(this.contractData);

      this.editorTab = "details";
      this.currentView = "builder";
      this.$nextTick(() => this.updatePreview());
    },

    // ─────────────────────────────────────────────────
    // SMART BUILDER
    // ─────────────────────────────────────────────────

    startSmartBuilder() {
      this.currentView = "smart-builder";
    },

    async runSmartBuilder() {
      if (this.smartBuilderBrief.trim().length < 20) {
        this.showToast("Please enter more detail about your project.", "error");
        return;
      }

      this.isGenerating = true;

      try {
        let generated;

        // Try the Anthropic API first
        try {
          generated = await generateContractFromBrief(
            this.smartBuilderBrief,
            this.smartBuilderType,
            this.smartBuilderPartyA,
            this.smartBuilderPartyB,
          );
        } catch (apiError) {
          // API unavailable or no key — fall back to local generation
          console.warn(
            "API unavailable, using local generation:",
            apiError.message,
          );
          generated = generateContractLocally(
            this.smartBuilderBrief,
            this.smartBuilderType,
            this.smartBuilderPartyA,
            this.smartBuilderPartyB,
          );
          this.showToast(
            "Generated using templates. Connect API for AI generation.",
            "info",
          );
        }

        // Apply generated data
        this.contractData = generated;
        this.editorTab = "details";
        this.currentView = "builder";

        await this.$nextTick();
        this.updatePreview();
        this.showToast("Contract generated successfully!", "success");
      } catch (err) {
        console.error("Smart builder error:", err);
        this.showToast("Something went wrong. Please try again.", "error");
      } finally {
        this.isGenerating = false;
      }
    },

    // ─────────────────────────────────────────────────
    // PREVIEW
    // ─────────────────────────────────────────────────

    updatePreview() {
      if (_previewDebounced) {
        _previewDebounced();
      } else {
        // Fallback if called before init completes
        this._doUpdatePreview();
      }
    },

    _doUpdatePreview() {
      try {
        this.previewHTML = renderContractPreview(
          this.contractData,
          this.accentColor,
        );
      } catch (e) {
        console.error("Preview render error:", e);
      }
    },

    zoomPreview(delta) {
      this.previewZoom = Math.max(0.4, Math.min(1.2, this.previewZoom + delta));
    },

    // ─────────────────────────────────────────────────
    // CLAUSES
    // ─────────────────────────────────────────────────

    addClause() {
      this.contractData.clauses.push({
        id: `custom-${Date.now()}`,
        title: "Custom Clause",
        content: "Enter your clause content here.",
        enabled: true,
      });
      this.updatePreview();
    },

    removeClause(index) {
      this.contractData.clauses.splice(index, 1);
      this.updatePreview();
    },

    // ─────────────────────────────────────────────────
    // PAYMENT MILESTONES
    // ─────────────────────────────────────────────────

    addMilestone() {
      this.contractData.payment.milestones.push({
        description: "Milestone",
        percentage: 0,
      });
      this.updatePreview();
    },

    removeMilestone(index) {
      this.contractData.payment.milestones.splice(index, 1);
      this.updatePreview();
    },

    get milestonesTotal() {
      return this.contractData.payment.milestones.reduce(
        (sum, m) => sum + (parseInt(m.percentage) || 0),
        0,
      );
    },

    // ─────────────────────────────────────────────────
    // LOGO UPLOAD
    // ─────────────────────────────────────────────────

    async handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        this.showToast("Logo file must be under 2MB.", "error");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        this.contractData.style.logoUrl = base64;
        this.updatePreview();
        this.showToast("Logo uploaded!", "success");
      } catch (e) {
        this.showToast("Failed to upload logo.", "error");
      }
    },

    async handleLogoDrop(event) {
      const file = event.dataTransfer?.files[0];
      if (!file || !file.type.startsWith("image/")) return;
      try {
        const base64 = await fileToBase64(file);
        this.contractData.style.logoUrl = base64;
        this.updatePreview();
        this.showToast("Logo uploaded!", "success");
      } catch (e) {
        this.showToast("Failed to upload logo.", "error");
      }
    },

    // ─────────────────────────────────────────────────
    // SAVE & LOAD
    // ─────────────────────────────────────────────────

    saveContract() {
      const clone = deepClone(this.contractData);
      clone.meta.savedAt = new Date().toISOString();

      // Find existing save for this contract (by refNumber)
      const existingIdx = this.savedContracts.findIndex(
        (c) => c.refNumber === clone.refNumber,
      );

      if (existingIdx >= 0) {
        this.savedContracts[existingIdx] = clone;
      } else {
        this.savedContracts.unshift(clone);
        // Keep max 20 saves
        if (this.savedContracts.length > 20) {
          this.savedContracts = this.savedContracts.slice(0, 20);
        }
      }

      saveContractsToStorage(this.savedContracts);
      this.showToast("Contract saved!", "success");
    },

    loadContract(index) {
      const saved = this.savedContracts[index];
      if (!saved) return;
      this.contractData = deepClone(saved);
      this.currentView = "builder";
      this.showSavedPanel = false;
      this.$nextTick(() => this.updatePreview());
      this.showToast("Contract loaded!", "success");
    },

    deleteContract(index) {
      this.savedContracts.splice(index, 1);
      saveContractsToStorage(this.savedContracts);
    },

    formatDate(isoStr) {
      return formatSavedDate(isoStr);
    },

    // ─────────────────────────────────────────────────
    // PDF EXPORT
    // ─────────────────────────────────────────────────

    async exportPDF() {
      try {
        this.showToast("Generating PDF…", "info");
        // Small delay so toast appears before blocking PDF work
        await new Promise((r) => setTimeout(r, 80));
        await exportContractToPDF(this.contractData, this.accentColor);
        this.showToast("PDF exported successfully!", "success");
      } catch (err) {
        console.error("PDF export error:", err);
        this.showToast("PDF export failed. Please try again.", "error");
      }
    },

    // ─────────────────────────────────────────────────
    // TOAST NOTIFICATIONS
    // ─────────────────────────────────────────────────

    showToast(message, type = "success") {
      clearTimeout(this.toast.timer);
      this.toast.message = message;
      this.toast.type = type;
      this.toast.visible = true;
      this.toast.timer = setTimeout(() => {
        this.toast.visible = false;
      }, 3200);
    },
  };
}
