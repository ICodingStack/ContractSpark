/**
 * preview-renderer.js
 * Renders contract data as a beautiful HTML preview
 * that closely mirrors the exported PDF layout.
 * ContractSpark — Beautiful Contracts That Protect You
 */

// ═══════════════════════════════════════════════════════
// MAIN RENDER FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Render the full contract HTML for the live preview pane.
 * @param {object} data - Full contract data object
 * @param {string} accentColor - Hex color for accent
 * @returns {string} - HTML string for innerHTML
 */
function renderContractPreview(data, accentColor = '#c9a96e') {
  const { partyA, partyB, effectiveDate, endDate, refNumber, governingLaw,
          scopeOfWork, payment, clauses, style, meta } = data;

  const fontClass = style.fontStyle === 'sans' ? 'font-sans' : '';
  const accentHex = accentColor;

  // ── Inject accent color into preview ────────────────
  const accentStyle = `
    .preview-party-block { border-color: ${accentHex}; }
    .preview-section-number { color: ${accentHex}; }
    .preview-sig-line { border-color: ${accentHex}; }
    .preview-preamble { border-color: ${accentHex}; }
  `;

  // ── Header ───────────────────────────────────────────
  const header = renderHeader(data, accentHex);

  // ── Meta Row ─────────────────────────────────────────
  const metaRow = renderMetaRow(data);

  // ── Preamble ─────────────────────────────────────────
  const preamble = renderPreamble(data);

  // ── Scope of Work Section ────────────────────────────
  const scopeSection = scopeOfWork
    ? renderSection('Scope of Work', scopeOfWork, '1', true)
    : '';

  // ── Payment Section ──────────────────────────────────
  const paymentSection = meta.type !== 'nda' && (payment.total || payment.milestones.length > 0)
    ? renderPaymentSection(payment, accentHex)
    : '';

  // ── Dynamic Clauses ──────────────────────────────────
  const enabledClauses = clauses.filter(c => c.enabled);
  const startIdx = scopeSection ? 2 : 1;
  const clauseSections = enabledClauses.map((clause, idx) =>
    renderSection(clause.title, clause.content, String(startIdx + idx + (paymentSection ? 1 : 0)), false)
  ).join('');

  // ── Signature Block ──────────────────────────────────
  const signatures = renderSignatureBlock(data, accentHex);

  // ── Footer ───────────────────────────────────────────
  const footer = renderFooter(data);

  return `
    <div class="${fontClass}" style="min-height:1123px;">
      <style>${accentStyle}</style>
      ${header}
      ${metaRow}
      ${preamble}
      ${scopeSection}
      ${paymentSection}
      ${clauseSections}
      ${signatures}
      ${footer}
    </div>
  `;
}

// ─────────────────────────────────────────
// HEADER RENDERERS
// ─────────────────────────────────────────

function renderHeader(data, accentHex) {
  const { partyA, partyB, style, meta, refNumber, effectiveDate } = data;
  const headerStyle = style.headerStyle || 'minimal';
  const contractTitle = data.meta.title || getTemplateById(meta.type)?.meta.title || 'Services Agreement';

  const logoHtml = style.logoUrl
    ? `<img src="${style.logoUrl}" class="preview-logo" alt="Logo" />`
    : '';

  const titleBlock = `
    <div class="preview-subtitle">${formatDateShort(effectiveDate) || 'Effective Upon Execution'}</div>
    <h1 class="preview-title">${escapeHtml(contractTitle)}</h1>
    ${refNumber ? `<div class="preview-ref">Ref: ${escapeHtml(refNumber)}</div>` : ''}
  `;

  const partiesGrid = `
    <div class="preview-parties-grid">
      <div class="preview-party-block">
        <div class="preview-party-label">Service Provider</div>
        <div class="preview-party-name">${escapeHtml(partyA.name || '[Provider Name]')}</div>
        <div class="preview-party-details">
          ${partyA.email ? escapeHtml(partyA.email) + '<br/>' : ''}
          ${partyA.phone ? escapeHtml(partyA.phone) + '<br/>' : ''}
          ${partyA.address ? escapeHtml(partyA.address) : ''}
        </div>
      </div>
      <div class="preview-party-block">
        <div class="preview-party-label">Client</div>
        <div class="preview-party-name">${escapeHtml(partyB.name || '[Client Name]')}</div>
        <div class="preview-party-details">
          ${partyB.email ? escapeHtml(partyB.email) + '<br/>' : ''}
          ${partyB.phone ? escapeHtml(partyB.phone) + '<br/>' : ''}
          ${partyB.address ? escapeHtml(partyB.address) : ''}
        </div>
      </div>
    </div>
  `;

  if (headerStyle === 'bold') {
    return `
      <div class="preview-header preview-header--bold">
        ${logoHtml}
        ${titleBlock}
        ${partiesGrid}
      </div>
    `;
  }

  if (headerStyle === 'classic') {
    return `
      <div class="preview-header preview-header--classic">
        ${logoHtml}
        ${titleBlock}
        ${partiesGrid}
      </div>
    `;
  }

  // Default: minimal
  return `
    <div class="preview-header preview-header--minimal">
      ${logoHtml}
      ${titleBlock}
      ${partiesGrid}
    </div>
  `;
}

// ─────────────────────────────────────────
// META ROW
// ─────────────────────────────────────────

function renderMetaRow(data) {
  const items = [];

  if (data.effectiveDate) {
    items.push({ label: 'Effective Date', value: formatDate(data.effectiveDate) });
  }
  if (data.endDate) {
    items.push({ label: 'End Date', value: formatDate(data.endDate) });
  }
  if (data.governingLaw) {
    items.push({ label: 'Governing Law', value: escapeHtml(data.governingLaw) });
  }
  if (data.payment.total && data.meta.type !== 'nda') {
    items.push({ label: 'Contract Value', value: formatCurrency(data.payment.total, data.payment.currency) });
  }

  if (items.length === 0) return '';

  return `
    <div class="preview-meta-row">
      ${items.map(item => `
        <div class="preview-meta-item">
          <div class="preview-meta-label">${item.label}</div>
          <div class="preview-meta-value">${item.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────
// PREAMBLE
// ─────────────────────────────────────────

function renderPreamble(data) {
  const { partyA, partyB, effectiveDate, meta } = data;
  const templateName = getTemplateById(meta.type)?.name || 'Services Agreement';
  const dateStr = effectiveDate ? `as of ${formatDate(effectiveDate)}` : 'as of the date last signed below';
  const providerName = partyA.name || '[Service Provider]';
  const clientName = partyB.name || '[Client]';

  const preambleText = `This ${templateName} ("Agreement") is entered into ${dateStr} between <strong>${escapeHtml(providerName)}</strong> ("Service Provider") and <strong>${escapeHtml(clientName)}</strong> ("Client"). This Agreement sets forth the complete and exclusive terms governing the relationship between the parties with respect to the services described herein.`;

  return `
    <div class="preview-preamble">
      ${preambleText}
    </div>
  `;
}

// ─────────────────────────────────────────
// SECTION RENDERER
// ─────────────────────────────────────────

function renderSection(title, content, number, isScopeSection = false) {
  // Convert plain text newlines to <br> for display
  const formattedContent = escapeHtml(content).replace(/\n\n/g, '</p><p style="margin-top:10px;">').replace(/\n/g, '<br/>');

  return `
    <div class="preview-section">
      <div class="preview-section-number">§ ${number}</div>
      <div class="preview-section-title">${escapeHtml(title)}</div>
      <div class="preview-section-body">
        <p>${formattedContent}</p>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// PAYMENT SECTION
// ─────────────────────────────────────────

function renderPaymentSection(payment, accentHex) {
  const total = parseFloat(payment.total);
  const hasValidTotal = !isNaN(total) && total > 0;

  let tableRows = '';

  if (payment.milestones && payment.milestones.length > 0 && hasValidTotal) {
    tableRows = payment.milestones.map(m => {
      const amount = total * (m.percentage / 100);
      return `
        <tr>
          <td>${escapeHtml(m.description)}</td>
          <td style="text-align:center">${m.percentage}%</td>
          <td style="text-align:right">${formatCurrency(amount, payment.currency)}</td>
        </tr>
      `;
    }).join('');

    tableRows += `
      <tr>
        <td><strong>Total</strong></td>
        <td></td>
        <td style="text-align:right"><strong>${formatCurrency(payment.total, payment.currency)}</strong></td>
      </tr>
    `;
  }

  const termText = payment.dueTerm
    ? `<p>Payment is due <strong>${formatPaymentTerm(payment.dueTerm)}</strong>. Late payments shall accrue interest at a rate of 1.5% per month.</p>`
    : '';

  const tableHtml = tableRows ? `
    <table class="preview-payment-table">
      <thead>
        <tr>
          <th>Milestone</th>
          <th style="text-align:center">%</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  ` : hasValidTotal
    ? `<p>Total amount: <strong>${formatCurrency(payment.total, payment.currency)}</strong></p>`
    : '';

  return `
    <div class="preview-section">
      <div class="preview-section-number">§ 2</div>
      <div class="preview-section-title">Compensation & Payment Terms</div>
      <div class="preview-section-body">
        ${tableHtml}
        ${termText}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// SIGNATURE BLOCK
// ─────────────────────────────────────────

function renderSignatureBlock(data, accentHex) {
  const { partyA, partyB } = data;

  return `
    <div class="preview-signature-section">
      <div class="preview-signature-title">In Witness Whereof</div>
      <p style="font-size:10.5pt; color:#4a4840; margin-bottom:28px; line-height:1.8;">
        The parties have executed this Agreement as of the date first written above. By signing below, each party acknowledges that they have read, understood, and agree to all terms and conditions of this Agreement.
      </p>
      <div class="preview-signature-grid">
        <div class="preview-sig-block">
          <div class="preview-sig-party">Service Provider</div>
          <div class="preview-sig-name">${escapeHtml(partyA.name || '[Provider Name]')}</div>
          ${partyA.title ? `<div class="preview-sig-title">${escapeHtml(partyA.title)}</div>` : '<div class="preview-sig-title">&nbsp;</div>'}
          <div class="preview-sig-line"></div>
          <div class="preview-sig-label">Signature &amp; Date</div>
        </div>
        <div class="preview-sig-block">
          <div class="preview-sig-party">Client</div>
          <div class="preview-sig-name">${escapeHtml(partyB.name || '[Client Name]')}</div>
          ${partyB.title ? `<div class="preview-sig-title">${escapeHtml(partyB.title)}</div>` : '<div class="preview-sig-title">&nbsp;</div>'}
          <div class="preview-sig-line"></div>
          <div class="preview-sig-label">Signature &amp; Date</div>
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────

function renderFooter(data) {
  const ref = data.refNumber ? `Ref: ${escapeHtml(data.refNumber)} · ` : '';
  const date = data.effectiveDate ? `${formatDate(data.effectiveDate)} · ` : '';
  return `
    <div class="preview-footer">
      <div class="preview-footer-text">${ref}${date}Confidential</div>
      <div class="preview-watermark">Created with ContractSpark</div>
    </div>
  `;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function getTemplateById(id) {
  return CONTRACT_TEMPLATES.find(t => t.id === id);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}
