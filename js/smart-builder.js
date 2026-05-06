/**
 * smart-builder.js
 * AI-powered contract generation from a project brief.
 * Uses the Anthropic API to intelligently parse briefs
 * and populate contract fields.
 * ContractSpark — Beautiful Contracts That Protect You
 */

// ═══════════════════════════════════════════════════════
// SMART BUILDER CORE
// ═══════════════════════════════════════════════════════

/**
 * Generate a complete contract from a free-form project brief.
 * Calls the Anthropic API to extract structured data and
 * generate professional legal language.
 *
 * @param {string} brief - Raw project description or client email
 * @param {string} templateId - Contract template to use
 * @param {string} partyA - Service provider / contractor name
 * @param {string} partyB - Client name
 * @returns {Promise<object>} - Populated contract data object
 */
async function generateContractFromBrief(brief, templateId, partyA, partyB) {
  const template = CONTRACT_TEMPLATES.find(t => t.id === templateId) || CONTRACT_TEMPLATES[0];

  // ── Build the AI prompt ──────────────────────────────
  const systemPrompt = `You are an expert legal contract writer specializing in ${template.name} agreements. You extract precise, professional information from project briefs and generate complete contract data.

Always respond with valid JSON only — no markdown, no backticks, no explanation.

Your output must match this exact structure:
{
  "title": "string — professional contract title",
  "partyA": {
    "name": "string — service provider full name or company",
    "email": "string or empty",
    "phone": "string or empty",
    "address": "string or empty"
  },
  "partyB": {
    "name": "string — client full name or company",
    "email": "string or empty",
    "phone": "string or empty",
    "address": "string or empty"
  },
  "effectiveDate": "YYYY-MM-DD — today if not mentioned",
  "endDate": "YYYY-MM-DD or empty string",
  "governingLaw": "string — jurisdiction extracted from brief, or guess based on location clues",
  "refNumber": "string — auto-generated reference like CS-2024-001",
  "scopeOfWork": "string — clear, professional 2-4 paragraph description of work and deliverables",
  "payment": {
    "total": "number as string — extracted or estimated amount",
    "currency": "USD or detected currency code",
    "dueTerm": "net15|net30|net45|net60|upon-completion|upfront",
    "milestones": [
      {"description": "string", "percentage": number}
    ]
  },
  "clauses": [
    {
      "id": "unique-id",
      "title": "clause title",
      "enabled": true,
      "content": "3-5 sentence professional legal clause content specific to this project"
    }
  ]
}

Rules for clauses:
- Generate 6-10 relevant clauses for this contract type
- Make clause content SPECIFIC to the project details in the brief
- Use formal, professional legal language
- Include payment amounts, dates, deliverables where mentioned
- If info is not in the brief, use professional placeholders in [brackets]`;

  const userPrompt = `Parse this project brief and generate a complete ${template.name} contract.

Service Provider: ${partyA || '[Not specified]'}
Client: ${partyB || '[Not specified]'}

Project Brief:
${brief}

Generate a professional, complete contract with all required clauses. Make the scope of work clear, specific, and professional. Use information from the brief to populate all fields.`;

  // ── Call Anthropic API ───────────────────────────────
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || '{}';

  // ── Parse JSON safely ────────────────────────────────
  let parsed;
  try {
    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    console.error('Failed to parse AI response:', rawText);
    throw new Error('Could not parse contract data from AI response.');
  }

  // ── Override party names if user provided them ───────
  if (partyA && partyA.trim()) parsed.partyA = { ...parsed.partyA, name: partyA };
  if (partyB && partyB.trim()) parsed.partyB = { ...parsed.partyB, name: partyB };

  // ── Ensure ref number ────────────────────────────────
  if (!parsed.refNumber) parsed.refNumber = generateRefNumber();

  // ── Build final contract data ────────────────────────
  return {
    meta: {
      type: templateId,
      title: parsed.title || template.meta.title,
      savedAt: null,
    },
    partyA: parsed.partyA || { name: partyA || '', email: '', phone: '', address: '' },
    partyB: parsed.partyB || { name: partyB || '', email: '', phone: '', address: '' },
    effectiveDate: parsed.effectiveDate || new Date().toISOString().split('T')[0],
    endDate: parsed.endDate || '',
    governingLaw: parsed.governingLaw || '',
    refNumber: parsed.refNumber,
    scopeOfWork: parsed.scopeOfWork || '',
    payment: {
      total: parsed.payment?.total || '',
      currency: parsed.payment?.currency || 'USD',
      dueTerm: parsed.payment?.dueTerm || 'net30',
      milestones: parsed.payment?.milestones || [
        { description: 'Project deposit', percentage: 50 },
        { description: 'Final delivery', percentage: 50 },
      ]
    },
    clauses: (parsed.clauses || []).map((c, i) => ({
      id: c.id || `clause-${i}`,
      title: c.title || 'Clause',
      enabled: c.enabled !== false,
      content: c.content || '',
    })),
    style: {
      logoUrl: '',
      headerStyle: 'minimal',
      fontStyle: 'serif',
    }
  };
}

// ═══════════════════════════════════════════════════════
// FALLBACK: LOCAL GENERATION (no API key needed demo)
// ═══════════════════════════════════════════════════════

/**
 * Local fallback that generates a contract without the API.
 * Parses the brief with simple heuristics and fills in templates.
 */
function generateContractLocally(brief, templateId, partyA, partyB) {
  const template = CONTRACT_TEMPLATES.find(t => t.id === templateId) || CONTRACT_TEMPLATES[0];
  const today = new Date().toISOString().split('T')[0];

  // Extract money amounts
  const moneyMatch = brief.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  const amount = moneyMatch ? moneyMatch[1].replace(/,/g, '') : '';

  // Extract dates / durations
  const weekMatch = brief.match(/(\d+)\s*week/i);
  let endDate = '';
  if (weekMatch) {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(weekMatch[1]) * 7);
    endDate = d.toISOString().split('T')[0];
  }

  // Detect payment split
  let milestones = [
    { description: 'Project deposit (upfront)', percentage: 50 },
    { description: 'Final delivery', percentage: 50 },
  ];
  const splitMatch = brief.match(/(\d+)%\s*(?:upfront|deposit)/i);
  if (splitMatch) {
    const pct = parseInt(splitMatch[1]);
    milestones = [
      { description: 'Upfront deposit', percentage: pct },
      { description: 'Balance upon delivery', percentage: 100 - pct },
    ];
  }

  // Detect jurisdiction
  const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington',
    'Massachusetts', 'Colorado', 'Oregon', 'Georgia', 'Ohio', 'Michigan'];
  let governingLaw = '';
  for (const state of states) {
    if (brief.includes(state)) { governingLaw = `State of ${state}, USA`; break; }
  }

  // Build scope from brief
  const scopeOfWork = brief.length > 200
    ? brief.substring(0, 400).trim() + (brief.length > 400 ? '...' : '')
    : brief;

  // Get template clauses
  const data = {
    scopeOfWork,
    governingLaw,
    payment: { total: amount, currency: 'USD', dueTerm: 'net30' },
    effectiveDate: today,
    endDate,
    partyA: { name: partyA || '' },
    partyB: { name: partyB || '' },
  };

  const clauses = template.getClauses(data);

  return {
    meta: { type: templateId, title: template.meta.title, savedAt: null },
    partyA: { name: partyA || '', email: '', phone: '', address: '' },
    partyB: { name: partyB || '', email: '', phone: '', address: '' },
    effectiveDate: today,
    endDate,
    governingLaw,
    refNumber: generateRefNumber(),
    scopeOfWork,
    payment: { total: amount, currency: 'USD', dueTerm: 'net30', milestones },
    clauses,
    style: { logoUrl: '', headerStyle: 'minimal', fontStyle: 'serif' }
  };
}
