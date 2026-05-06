/**
 * pdf-export.js
 * High-quality PDF export using jsPDF.
 * Renders the contract as a professional, print-ready document.
 * ContractSpark — Beautiful Contracts That Protect You
 */

// ═══════════════════════════════════════════════════════
// PDF EXPORT CORE
// ═══════════════════════════════════════════════════════

/**
 * Export the contract data to a beautifully formatted PDF.
 * @param {object} contractData - Full contract data object
 * @param {string} accentColor - Hex color (e.g., '#c9a96e')
 */
async function exportContractToPDF(contractData, accentColor = '#c9a96e') {
  const { jsPDF } = window.jspdf;

  // ── Init PDF ─────────────────────────────────────────
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // A4 dimensions: 210mm × 297mm
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN_L = 20;
  const MARGIN_R = 20;
  const MARGIN_T = 20;
  const MARGIN_B = 20;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

  // Parse accent color to RGB
  const accent = hexToRgb(accentColor) || { r: 201, g: 169, b: 110 };
  const accentLight = {
    r: Math.min(255, accent.r + 40),
    g: Math.min(255, accent.g + 40),
    b: Math.min(255, accent.b + 40),
  };

  let y = MARGIN_T; // Current Y position cursor
  let pageNum = 1;

  // ── Color helpers ────────────────────────────────────
  const setAccent = () => doc.setTextColor(accent.r, accent.g, accent.b);
  const setDark = () => doc.setTextColor(26, 26, 23);
  const setMed = () => doc.setTextColor(58, 56, 48);
  const setLight = () => doc.setTextColor(107, 106, 101);
  const setMuted = () => doc.setTextColor(140, 137, 126);

  // ── Page break helper ────────────────────────────────
  function checkPageBreak(neededSpace) {
    if (y + neededSpace > PAGE_H - MARGIN_B) {
      addFooter();
      doc.addPage();
      pageNum++;
      y = MARGIN_T;
      return true;
    }
    return false;
  }

  // ── Footer on each page ──────────────────────────────
  function addFooter() {
    const footerY = PAGE_H - 12;
    setMuted();
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    const leftText = contractData.refNumber
      ? `Ref: ${contractData.refNumber}   ·   Confidential`
      : 'Confidential';
    const rightText = `Page ${pageNum}   ·   ContractSpark`;

    doc.text(leftText, MARGIN_L, footerY);
    doc.text(rightText, PAGE_W - MARGIN_R, footerY, { align: 'right' });

    // Footer line
    doc.setDrawColor(230, 227, 220);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_L, footerY - 4, PAGE_W - MARGIN_R, footerY - 4);
  }

  // ── Draw accent rule ─────────────────────────────────
  function drawAccentRule(x, ruleY, width, thickness = 0.8) {
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.setLineWidth(thickness);
    doc.line(x, ruleY, x + width, ruleY);
  }

  // ── Draw light rule ──────────────────────────────────
  function drawLightRule(ruleY) {
    doc.setDrawColor(230, 227, 220);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_L, ruleY, PAGE_W - MARGIN_R, ruleY);
  }

  // ── Logo (if uploaded) ───────────────────────────────
  if (contractData.style?.logoUrl) {
    try {
      const imgData = contractData.style.logoUrl;
      // Detect format from data URL
      const fmt = imgData.includes('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(imgData, fmt, MARGIN_L, y, 36, 14, undefined, 'FAST');
      y += 18;
    } catch (e) {
      console.warn('Could not add logo to PDF:', e);
    }
  }

  // ═══════════════════════════════════════════════════
  // HEADER SECTION
  // ═══════════════════════════════════════════════════

  const headerStyle = contractData.style?.headerStyle || 'minimal';

  if (headerStyle === 'bold') {
    // Dark header background
    doc.setFillColor(26, 26, 23);
    doc.rect(0, 0, PAGE_W, 68, 'F');

    doc.setTextColor(245, 243, 238);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      contractData.effectiveDate ? formatDate(contractData.effectiveDate).toUpperCase() : 'EFFECTIVE UPON EXECUTION',
      MARGIN_L, MARGIN_T + 8
    );

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(contractData.meta.title || 'Services Agreement', MARGIN_L, MARGIN_T + 18);

    if (contractData.refNumber) {
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.setTextColor(180, 175, 165);
      doc.text(`REF: ${contractData.refNumber}`, MARGIN_L, MARGIN_T + 25);
    }
    y = MARGIN_T + 35;

  } else if (headerStyle === 'classic') {
    // Classic style: centered with double rule
    drawAccentRule(MARGIN_L, y, CONTENT_W, 2);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setMuted();
    doc.text(
      contractData.effectiveDate ? formatDate(contractData.effectiveDate) : 'Effective Upon Execution',
      PAGE_W / 2, y, { align: 'center' }
    );
    y += 6;

    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    setDark();
    doc.text(contractData.meta.title || 'Services Agreement', PAGE_W / 2, y + 5, { align: 'center' });
    y += 14;

    if (contractData.refNumber) {
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      setMuted();
      doc.text(`Ref: ${contractData.refNumber}`, PAGE_W / 2, y, { align: 'center' });
      y += 5;
    }

    drawAccentRule(MARGIN_L, y + 3, CONTENT_W, 2);
    y += 10;

  } else {
    // Minimal style (default)
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    setMuted();
    doc.text(
      contractData.effectiveDate ? formatDate(contractData.effectiveDate) : 'Effective Upon Execution',
      MARGIN_L, y
    );
    y += 7;

    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    setDark();
    const titleLines = doc.splitTextToSize(contractData.meta.title || 'Services Agreement', CONTENT_W);
    doc.text(titleLines, MARGIN_L, y);
    y += titleLines.length * 9 + 2;

    if (contractData.refNumber) {
      doc.setFontSize(7.5);
      doc.setFont('courier', 'normal');
      setMuted();
      doc.text(`Ref: ${contractData.refNumber}`, MARGIN_L, y);
      y += 5;
    }

    drawAccentRule(MARGIN_L, y + 2, CONTENT_W, 1.2);
    y += 7;
  }

  // ═══════════════════════════════════════════════════
  // PARTIES GRID
  // ═══════════════════════════════════════════════════

  const partyBlockW = (CONTENT_W - 8) / 2;
  const partyBlockH = 28;

  // Party A block
  doc.setFillColor(248, 246, 241);
  doc.roundedRect(MARGIN_L, y, partyBlockW, partyBlockH, 2, 2, 'F');
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_L, y + 2, MARGIN_L, y + partyBlockH - 2);

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  setMuted();
  doc.text('SERVICE PROVIDER', MARGIN_L + 4, y + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setDark();
  const partyAName = contractData.partyA.name || '[Provider Name]';
  doc.text(partyAName, MARGIN_L + 4, y + 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setLight();
  let partyADetail = [];
  if (contractData.partyA.email) partyADetail.push(contractData.partyA.email);
  if (contractData.partyA.phone) partyADetail.push(contractData.partyA.phone);
  if (contractData.partyA.address) partyADetail.push(contractData.partyA.address);
  doc.text(partyADetail.slice(0, 2).join('  |  '), MARGIN_L + 4, y + 17);

  // Party B block
  const partyBX = MARGIN_L + partyBlockW + 8;
  doc.setFillColor(248, 246, 241);
  doc.roundedRect(partyBX, y, partyBlockW, partyBlockH, 2, 2, 'F');
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.line(partyBX, y + 2, partyBX, y + partyBlockH - 2);

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  setMuted();
  doc.text('CLIENT', partyBX + 4, y + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setDark();
  const partyBName = contractData.partyB.name || '[Client Name]';
  doc.text(partyBName, partyBX + 4, y + 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setLight();
  let partyBDetail = [];
  if (contractData.partyB.email) partyBDetail.push(contractData.partyB.email);
  if (contractData.partyB.phone) partyBDetail.push(contractData.partyB.phone);
  if (contractData.partyB.address) partyBDetail.push(contractData.partyB.address);
  doc.text(partyBDetail.slice(0, 2).join('  |  '), partyBX + 4, y + 17);

  y += partyBlockH + 8;

  // ═══════════════════════════════════════════════════
  // META ROW (dates, jurisdiction, value)
  // ═══════════════════════════════════════════════════

  const metaItems = [];
  if (contractData.effectiveDate) metaItems.push({ label: 'EFFECTIVE DATE', value: formatDate(contractData.effectiveDate) });
  if (contractData.endDate) metaItems.push({ label: 'END DATE', value: formatDate(contractData.endDate) });
  if (contractData.governingLaw) metaItems.push({ label: 'GOVERNING LAW', value: contractData.governingLaw });
  if (contractData.payment.total && contractData.meta.type !== 'nda') {
    metaItems.push({ label: 'CONTRACT VALUE', value: formatCurrency(contractData.payment.total, contractData.payment.currency) });
  }

  if (metaItems.length > 0) {
    const colW = CONTENT_W / Math.min(metaItems.length, 4);
    metaItems.slice(0, 4).forEach((item, i) => {
      const itemX = MARGIN_L + i * colW;
      doc.setFontSize(7);
      doc.setFont('courier', 'normal');
      setMuted();
      doc.text(item.label, itemX, y + 4);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setDark();
      doc.text(item.value, itemX, y + 10);
    });
    y += 16;
    drawLightRule(y);
    y += 6;
  }

  // ═══════════════════════════════════════════════════
  // PREAMBLE
  // ═══════════════════════════════════════════════════

  const templateName = CONTRACT_TEMPLATES.find(t => t.id === contractData.meta.type)?.name || 'Services Agreement';
  const providerName = contractData.partyA.name || '[Service Provider]';
  const clientName = contractData.partyB.name || '[Client]';
  const dateStr = contractData.effectiveDate ? `as of ${formatDate(contractData.effectiveDate)}` : 'as of the date last signed below';
  const preambleText = `This ${templateName} ("Agreement") is entered into ${dateStr} between ${providerName} ("Service Provider") and ${clientName} ("Client"). This Agreement sets forth the complete and exclusive terms governing the relationship between the parties with respect to the services described herein.`;

  checkPageBreak(20);
  doc.setFillColor(248, 246, 241);
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);

  const preambleLines = doc.splitTextToSize(preambleText, CONTENT_W - 14);
  const preambleH = preambleLines.length * 5 + 8;
  doc.rect(MARGIN_L, y, CONTENT_W, preambleH, 'F');
  doc.line(MARGIN_L + 0.3, y + 2, MARGIN_L + 0.3, y + preambleH - 2);

  doc.setFontSize(9.5);
  doc.setFont('times', 'italic');
  setMed();
  doc.text(preambleLines, MARGIN_L + 6, y + 6);
  y += preambleH + 8;

  // ═══════════════════════════════════════════════════
  // SCOPE OF WORK
  // ═══════════════════════════════════════════════════

  let sectionNum = 1;

  if (contractData.scopeOfWork) {
    checkPageBreak(16);
    y = renderPDFSection(doc, '§ ' + sectionNum, 'Scope of Work', contractData.scopeOfWork,
      y, MARGIN_L, CONTENT_W, PAGE_H - MARGIN_B, accent, checkPageBreak, drawLightRule);
    sectionNum++;
  }

  // ═══════════════════════════════════════════════════
  // PAYMENT SECTION
  // ═══════════════════════════════════════════════════

  if (contractData.meta.type !== 'nda' && contractData.payment.total) {
    checkPageBreak(16);
    setAccent();
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text('§ ' + sectionNum, MARGIN_L, y);
    y += 5;

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    setDark();
    doc.text('Compensation & Payment Terms', MARGIN_L, y);
    y += 7;

    // Payment table using autoTable
    const total = parseFloat(contractData.payment.total);
    if (!isNaN(total) && contractData.payment.milestones?.length > 0) {
      const tableBody = contractData.payment.milestones.map(m => [
        m.description,
        `${m.percentage}%`,
        formatCurrency(total * m.percentage / 100, contractData.payment.currency)
      ]);
      tableBody.push(['Total', '', formatCurrency(total, contractData.payment.currency)]);

      doc.autoTable({
        startY: y,
        head: [['Milestone', '%', 'Amount']],
        body: tableBody,
        margin: { left: MARGIN_L, right: MARGIN_R },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica',
          textColor: [44, 44, 40],
          lineColor: [230, 227, 220],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [248, 246, 241],
          textColor: [140, 137, 126],
          fontSize: 7.5,
          fontStyle: 'normal',
          font: 'courier',
        },
        alternateRowStyles: { fillColor: [252, 251, 248] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
        },
      });
      y = doc.lastAutoTable.finalY + 6;
    } else {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      setMed();
      doc.text(`Total: ${formatCurrency(contractData.payment.total, contractData.payment.currency)}. Payment due ${formatPaymentTerm(contractData.payment.dueTerm)}.`, MARGIN_L, y);
      y += 10;
    }

    drawLightRule(y);
    y += 6;
    sectionNum++;
  }

  // ═══════════════════════════════════════════════════
  // CONTRACT CLAUSES
  // ═══════════════════════════════════════════════════

  const enabledClauses = (contractData.clauses || []).filter(c => c.enabled);
  for (const clause of enabledClauses) {
    checkPageBreak(20);
    y = renderPDFSection(doc, '§ ' + sectionNum, clause.title, clause.content,
      y, MARGIN_L, CONTENT_W, PAGE_H - MARGIN_B, accent, checkPageBreak, drawLightRule);
    sectionNum++;
  }

  // ═══════════════════════════════════════════════════
  // SIGNATURE BLOCK
  // ═══════════════════════════════════════════════════

  checkPageBreak(70);
  y += 6;
  drawLightRule(y);
  y += 8;

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  setMuted();
  doc.text('IN WITNESS WHEREOF', MARGIN_L, y);
  y += 7;

  doc.setFontSize(9.5);
  doc.setFont('times', 'italic');
  setMed();
  const witnessText = `The parties have executed this Agreement as of the date first written above. By signing below, each party acknowledges that they have read, understood, and agree to all terms and conditions of this Agreement.`;
  const witnessLines = doc.splitTextToSize(witnessText, CONTENT_W);
  doc.text(witnessLines, MARGIN_L, y);
  y += witnessLines.length * 5 + 12;

  // Signature blocks
  const sigW = (CONTENT_W - 12) / 2;
  const sigXA = MARGIN_L;
  const sigXB = MARGIN_L + sigW + 12;

  // Provider sig
  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  setMuted();
  doc.text('SERVICE PROVIDER', sigXA, y);
  doc.text('CLIENT', sigXB, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setDark();
  doc.text(contractData.partyA.name || '[Provider Name]', sigXA, y);
  doc.text(contractData.partyB.name || '[Client Name]', sigXB, y);
  y += 14;

  // Signature lines
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.8);
  doc.line(sigXA, y, sigXA + sigW, y);
  doc.line(sigXB, y, sigXB + sigW, y);
  y += 4;

  doc.setFontSize(7.5);
  doc.setFont('courier', 'normal');
  setMuted();
  doc.text('Signature & Date', sigXA, y);
  doc.text('Signature & Date', sigXB, y);
  y += 10;

  doc.setFontSize(7.5);
  doc.setFont('courier', 'normal');
  setMuted();
  doc.text('Printed Name', sigXA, y);
  doc.text('Printed Name', sigXB, y);
  doc.setDrawColor(220, 217, 210);
  doc.setLineWidth(0.3);
  doc.line(sigXA, y + 6, sigXA + sigW, y + 6);
  doc.line(sigXB, y + 6, sigXB + sigW, y + 6);

  // ── Add footer to last page ──────────────────────────
  addFooter();

  // ── Save ─────────────────────────────────────────────
  const fileName = sanitizeFilename(contractData.meta.title || 'Contract') + '.pdf';
  doc.save(fileName);
}

// ═══════════════════════════════════════════════════════
// SECTION RENDERER FOR PDF
// ═══════════════════════════════════════════════════════

function renderPDFSection(doc, number, title, content, y, marginL, contentW, maxY, accent, checkPageBreak, drawLightRule) {
  // Section number
  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text(number, marginL, y);

  // Short rule after number
  doc.setDrawColor(230, 227, 220);
  doc.setLineWidth(0.3);
  doc.line(marginL + 8, y - 1, marginL + 20, y - 1);

  y += 5;

  // Title
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.setTextColor(26, 26, 23);
  doc.text(title, marginL, y);
  y += 7;

  // Content
  doc.setFontSize(9.5);
  doc.setFont('times', 'normal');
  doc.setTextColor(58, 56, 48);

  const paragraphs = content.split(/\n\n+/);
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para.replace(/\n/g, ' '), contentW);
    checkPageBreak(lines.length * 5.2 + 4);
    doc.text(lines, marginL, y);
    y += lines.length * 5.2 + 3;
  }

  y += 2;
  drawLightRule(y);
  y += 6;

  return y;
}

// ═══════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_').substring(0, 60);
}
