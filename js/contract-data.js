/**
 * contract-data.js
 * All contract templates, clauses, and default data structures.
 * ContractSpark — Beautiful Contracts That Protect You
 */

// ═══════════════════════════════════════════════════════
// CONTRACT TEMPLATES
// ═══════════════════════════════════════════════════════

const CONTRACT_TEMPLATES = [
  {
    id: 'freelance',
    name: 'Freelance Agreement',
    description: 'For independent contractors delivering a defined project or service.',
    tags: ['Popular', 'Freelance'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L4 7V20H18V7L11 2Z" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 20V13H14V20" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    meta: { type: 'freelance', title: 'Freelance Services Agreement' },
    getClauses: (data) => [
      {
        id: 'services', title: 'Services', enabled: true,
        content: `The Contractor agrees to provide the following services to the Client as described in this Agreement. The Contractor shall perform the Services in a professional and workmanlike manner, consistent with industry standards.\n\n${data.scopeOfWork || '[Describe the services and deliverables here]'}`
      },
      {
        id: 'payment', title: 'Compensation', enabled: true,
        content: `In consideration for the Services, the Client agrees to pay the Contractor the total sum of ${formatCurrency(data.payment?.total, data.payment?.currency)} in accordance with the payment schedule set forth herein. All invoices are due ${formatPaymentTerm(data.payment?.dueTerm)}.`
      },
      {
        id: 'timeline', title: 'Project Timeline', enabled: true,
        content: `The Contractor shall commence work on the Effective Date${data.endDate ? ` and shall complete the Services no later than ${formatDate(data.endDate)}` : ''}. Any changes to the project scope that may affect timeline shall be documented in a written amendment signed by both parties.`
      },
      {
        id: 'ownership', title: 'Intellectual Property', enabled: true,
        content: `Upon receipt of full payment, the Contractor assigns to the Client all right, title, and interest in and to the work product created under this Agreement, including all intellectual property rights therein. Prior to full payment, the Contractor retains all rights in the work product.`
      },
      {
        id: 'revisions', title: 'Revisions & Modifications', enabled: true,
        content: `This Agreement includes up to three (3) rounds of revisions. Additional revisions or work beyond the agreed scope will be billed at the Contractor's standard hourly rate and must be agreed upon in writing before proceeding.`
      },
      {
        id: 'confidentiality', title: 'Confidentiality', enabled: true,
        content: `Both parties agree to keep confidential any proprietary or sensitive information disclosed during the course of this project. This obligation shall survive the termination of this Agreement for a period of two (2) years.`
      },
      {
        id: 'independent', title: 'Independent Contractor Status', enabled: true,
        content: `The Contractor is an independent contractor and not an employee of the Client. The Contractor is responsible for all taxes, insurance, and benefits related to the Contractor's work. Nothing in this Agreement shall be construed to create an employer-employee relationship.`
      },
      {
        id: 'termination', title: 'Termination', enabled: true,
        content: `Either party may terminate this Agreement with fourteen (14) days written notice. Upon termination, the Client shall pay for all work completed up to the termination date. Any deposits paid are non-refundable unless the Client terminates due to a material breach by the Contractor.`
      },
      {
        id: 'limitation', title: 'Limitation of Liability', enabled: true,
        content: `The Contractor's total liability under this Agreement shall not exceed the total fees paid by the Client. In no event shall either party be liable for indirect, incidental, special, or consequential damages.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement shall be governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}, without regard to its conflict of law provisions. Any disputes arising from this Agreement shall be resolved through binding arbitration or in the courts of ${data.governingLaw || '[Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'service',
    name: 'Service Contract',
    description: 'A formal agreement for ongoing or one-time service delivery.',
    tags: ['Services', 'B2B'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--accent)" stroke-width="1.5"/><path d="M7 11L10 14L15 8" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    meta: { type: 'service', title: 'Service Agreement' },
    getClauses: (data) => [
      {
        id: 'scope', title: 'Scope of Services', enabled: true,
        content: `The Service Provider agrees to provide the following services ("Services") to the Client:\n\n${data.scopeOfWork || '[Describe services in detail]'}\n\nAny services beyond this scope require a written change order signed by both parties.`
      },
      {
        id: 'fees', title: 'Fees and Payment', enabled: true,
        content: `The Client agrees to pay the Service Provider ${formatCurrency(data.payment?.total, data.payment?.currency)} for the Services described herein. Payment shall be made ${formatPaymentTerm(data.payment?.dueTerm)}. Late payments shall accrue interest at 1.5% per month.`
      },
      {
        id: 'performance', title: 'Performance Standards', enabled: true,
        content: `The Service Provider shall perform all Services in a professional manner consistent with industry standards. The Service Provider warrants that it has the necessary skills, experience, and resources to perform the Services as described.`
      },
      {
        id: 'confidentiality', title: 'Confidentiality & Data Protection', enabled: true,
        content: `The Service Provider shall maintain strict confidentiality of all Client information, data, and materials. The Service Provider shall implement appropriate security measures to protect Client data and comply with applicable data protection regulations.`
      },
      {
        id: 'ownership', title: 'Ownership of Work Product', enabled: true,
        content: `All deliverables created specifically for the Client under this Agreement shall become the property of the Client upon full payment. Pre-existing intellectual property of the Service Provider remains the property of the Service Provider.`
      },
      {
        id: 'warranties', title: 'Warranties', enabled: true,
        content: `Each party represents and warrants that: (a) it has the authority to enter into this Agreement; (b) it will comply with all applicable laws; and (c) the execution of this Agreement does not violate any other agreement to which it is a party.`
      },
      {
        id: 'termination', title: 'Termination', enabled: true,
        content: `Either party may terminate this Agreement upon thirty (30) days written notice. The Client shall pay for all Services rendered up to the date of termination. Either party may terminate immediately upon a material breach that remains uncured after ten (10) days written notice.`
      },
      {
        id: 'dispute', title: 'Dispute Resolution', enabled: true,
        content: `In the event of any dispute arising from this Agreement, the parties agree to first attempt resolution through good-faith negotiation. If unresolved within thirty (30) days, the dispute shall be submitted to binding arbitration in ${data.governingLaw || '[Jurisdiction]'}.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement is governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Protect confidential information shared between parties.',
    tags: ['Legal', 'Privacy'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3C11 3 5 6 5 11V16L11 19L17 16V11C17 6 11 3 11 3Z" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 11L10.5 12.5L13 10" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    meta: { type: 'nda', title: 'Non-Disclosure Agreement' },
    getClauses: (data) => [
      {
        id: 'definition', title: 'Definition of Confidential Information', enabled: true,
        content: `"Confidential Information" means any and all non-public information disclosed by one party ("Disclosing Party") to the other ("Receiving Party"), including but not limited to: business plans, financial information, technical data, trade secrets, customer lists, product roadmaps, software, and any other proprietary information that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.`
      },
      {
        id: 'obligations', title: 'Obligations of Receiving Party', enabled: true,
        content: `The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence using no less than the same degree of care used to protect its own confidential information; (b) not disclose Confidential Information to any third party without prior written consent; (c) use Confidential Information solely for evaluating a potential business relationship between the parties; and (d) limit access to Confidential Information to those employees or advisors with a need to know.`
      },
      {
        id: 'exclusions', title: 'Exclusions', enabled: true,
        content: `This Agreement does not apply to information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was rightfully in the Receiving Party's possession before disclosure; (c) is independently developed by the Receiving Party without use of Confidential Information; or (d) is required to be disclosed by law, regulation, or court order, provided the Receiving Party gives prompt written notice to the Disclosing Party.`
      },
      {
        id: 'term', title: 'Term', enabled: true,
        content: `This Agreement shall commence on the Effective Date and shall remain in effect for a period of two (2) years, unless earlier terminated by mutual written agreement. The obligations of confidentiality shall survive termination for an additional three (3) years.`
      },
      {
        id: 'return', title: 'Return of Information', enabled: true,
        content: `Upon request or upon termination of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information in its possession, including all copies, notes, and summaries. The Receiving Party shall certify in writing that all such materials have been returned or destroyed.`
      },
      {
        id: 'remedies', title: 'Remedies', enabled: true,
        content: `The parties acknowledge that breach of this Agreement would cause irreparable harm for which monetary damages may be an inadequate remedy. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction, in addition to all other remedies available at law or in equity.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement shall be governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'consulting',
    name: 'Consulting Agreement',
    description: 'Expert advisory services with defined deliverables and compensation.',
    tags: ['Consulting', 'Advisory'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke="var(--accent)" stroke-width="1.5"/><path d="M3 20C3 16.134 6.686 13 11 13C15.314 13 19 16.134 19 20" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    meta: { type: 'consulting', title: 'Consulting Agreement' },
    getClauses: (data) => [
      {
        id: 'services', title: 'Consulting Services', enabled: true,
        content: `The Consultant agrees to provide consulting services ("Services") to the Client as follows:\n\n${data.scopeOfWork || '[Describe consulting scope, deliverables, and objectives]'}\n\nThe Consultant shall make themselves reasonably available for meetings, calls, and reviews as needed.`
      },
      {
        id: 'fees', title: 'Fees & Expenses', enabled: true,
        content: `The Client shall pay the Consultant ${formatCurrency(data.payment?.total, data.payment?.currency)} for the Services. Payment is due ${formatPaymentTerm(data.payment?.dueTerm)}. Reasonable pre-approved expenses shall be reimbursed within thirty (30) days of submission.`
      },
      {
        id: 'independent', title: 'Independent Contractor', enabled: true,
        content: `The Consultant is an independent contractor. This Agreement does not create an employment, partnership, or joint venture relationship. The Consultant retains the right to provide services to other clients, provided they do not conflict with obligations under this Agreement.`
      },
      {
        id: 'confidentiality', title: 'Confidentiality', enabled: true,
        content: `The Consultant agrees to maintain strict confidentiality regarding all Client business information, strategies, and data encountered during the engagement. This obligation shall continue for two (2) years following the termination of this Agreement.`
      },
      {
        id: 'noncompete', title: 'Non-Solicitation', enabled: true,
        content: `During the term of this Agreement and for twelve (12) months thereafter, neither party shall solicit or hire the other party's employees or contractors without prior written consent.`
      },
      {
        id: 'ip', title: 'Intellectual Property', enabled: true,
        content: `All work product and deliverables created specifically for the Client shall become the property of the Client upon full payment. The Consultant retains ownership of all pre-existing methodologies, frameworks, and intellectual property.`
      },
      {
        id: 'termination', title: 'Termination', enabled: true,
        content: `Either party may terminate this Agreement with thirty (30) days written notice. The Client shall pay for all Services rendered through the termination date.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement is governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'retainer',
    name: 'Client Retainer',
    description: 'Monthly retainer for ongoing services and availability.',
    tags: ['Retainer', 'Monthly'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="var(--accent)" stroke-width="1.5"/><path d="M11 7V11L14 13" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    meta: { type: 'retainer', title: 'Client Retainer Agreement' },
    getClauses: (data) => [
      {
        id: 'retainer', title: 'Retainer & Services', enabled: true,
        content: `The Service Provider shall make available up to the agreed hours per month for services including:\n\n${data.scopeOfWork || '[Describe retainer scope and services]'}\n\nUnused hours shall not carry over to the following month unless otherwise agreed in writing.`
      },
      {
        id: 'fees', title: 'Monthly Retainer Fee', enabled: true,
        content: `The Client agrees to pay a monthly retainer fee of ${formatCurrency(data.payment?.total, data.payment?.currency)}, payable in advance on the first of each month. This fee secures the Service Provider's availability and covers the agreed scope of services.`
      },
      {
        id: 'billing', title: 'Additional Work', enabled: true,
        content: `Work beyond the retainer scope will be billed at the Service Provider's standard rate, invoiced separately, and due within thirty (30) days.`
      },
      {
        id: 'termination', title: 'Termination', enabled: true,
        content: `Either party may terminate this retainer with thirty (30) days written notice. Retainer fees already paid are non-refundable for the current month.`
      },
      {
        id: 'confidentiality', title: 'Confidentiality', enabled: true,
        content: `Both parties shall maintain strict confidentiality of all proprietary and sensitive information shared during this engagement.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement is governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'partnership',
    name: 'Partnership Agreement',
    description: 'Define terms and responsibilities between business partners.',
    tags: ['Business', 'Partnership'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 11C3 7.134 6.686 4 11 4C15.314 4 19 7.134 19 11" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/><path d="M7 20L7 15M15 20V15" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/><path d="M5 15H17" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    meta: { type: 'partnership', title: 'Partnership Agreement' },
    getClauses: (data) => [
      {
        id: 'formation', title: 'Formation of Partnership', enabled: true,
        content: `The parties agree to form a business partnership ("Partnership") for the purpose of:\n\n${data.scopeOfWork || '[Describe partnership purpose and business activities]'}`
      },
      {
        id: 'contributions', title: 'Capital Contributions', enabled: true,
        content: `Each partner's initial capital contribution shall be as agreed by the partners. Additional capital contributions may be required by mutual written agreement.`
      },
      {
        id: 'profitloss', title: 'Profit and Loss Distribution', enabled: true,
        content: `Profits and losses of the Partnership shall be allocated equally between the partners unless otherwise agreed in writing. Distributions shall be made at intervals agreed upon by the partners.`
      },
      {
        id: 'management', title: 'Management & Decision Making', enabled: true,
        content: `Major business decisions require unanimous consent of all partners. Day-to-day operational decisions may be made by either partner acting within their designated responsibilities.`
      },
      {
        id: 'dissolution', title: 'Dissolution', enabled: true,
        content: `The Partnership may be dissolved by mutual written agreement, or by either partner upon ninety (90) days written notice. Upon dissolution, assets shall be distributed after payment of all debts and obligations.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement is governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'employment',
    name: 'Employment Offer Letter',
    description: 'Formal offer of employment with role, compensation, and terms.',
    tags: ['HR', 'Employment'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="6" width="16" height="12" rx="2" stroke="var(--accent)" stroke-width="1.5"/><path d="M15 6V5C15 3.89543 14.1046 3 13 3H9C7.89543 3 7 3.89543 7 5V6" stroke="var(--accent)" stroke-width="1.5"/><path d="M11 11V14M11 11H8M11 11H14" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    meta: { type: 'employment', title: 'Employment Offer Letter' },
    getClauses: (data) => [
      {
        id: 'offer', title: 'Offer of Employment', enabled: true,
        content: `We are pleased to offer you employment with ${data.partyA?.name || '[Company Name]'} in the position of [Job Title], reporting to [Manager Title]. This is a [full-time/part-time] position commencing on ${formatDate(data.effectiveDate) || '[Start Date]'}.`
      },
      {
        id: 'compensation', title: 'Compensation', enabled: true,
        content: `Your base compensation will be ${formatCurrency(data.payment?.total, data.payment?.currency)} per [year/hour], paid [bi-weekly/monthly]. You will be eligible for the company's standard benefits package, subject to eligibility requirements.`
      },
      {
        id: 'atwill', title: 'At-Will Employment', enabled: true,
        content: `Your employment with ${data.partyA?.name || 'the Company'} is at-will, meaning either you or the Company may terminate the employment relationship at any time, with or without cause or advance notice.`
      },
      {
        id: 'duties', title: 'Duties & Responsibilities', enabled: true,
        content: `${data.scopeOfWork || '[Describe key responsibilities and duties of the role]'}`
      },
      {
        id: 'confidentiality', title: 'Confidentiality & IP Assignment', enabled: true,
        content: `As a condition of employment, you will be required to sign the Company's standard Confidentiality and Intellectual Property Assignment Agreement.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement is governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },

  {
    id: 'website',
    name: 'Website Design Contract',
    description: 'Comprehensive agreement for web design and development projects.',
    tags: ['Web', 'Design', 'Dev'],
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="18" height="14" rx="2" stroke="var(--accent)" stroke-width="1.5"/><path d="M2 8H20" stroke="var(--accent)" stroke-width="1.5"/><circle cx="5" cy="6" r="0.8" fill="var(--accent)"/><circle cx="8" cy="6" r="0.8" fill="var(--accent)"/><path d="M7 12L9.5 14.5L15 11" stroke="var(--accent)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    meta: { type: 'website', title: 'Website Design & Development Agreement' },
    getClauses: (data) => [
      {
        id: 'project', title: 'Project Scope', enabled: true,
        content: `The Designer/Developer agrees to design and develop a website for the Client with the following specifications:\n\n${data.scopeOfWork || '[Describe website requirements, pages, features, and deliverables]'}`
      },
      {
        id: 'payment', title: 'Payment Schedule', enabled: true,
        content: `The total project fee is ${formatCurrency(data.payment?.total, data.payment?.currency)}. Payment shall be made according to the agreed milestone schedule. Work will not commence until the initial deposit is received.`
      },
      {
        id: 'revisions', title: 'Revisions', enabled: true,
        content: `This project includes three (3) rounds of design revisions and two (2) rounds of development revisions. Revisions are defined as changes within the original agreed scope. Scope changes will be estimated and billed separately.`
      },
      {
        id: 'content', title: 'Client Responsibilities', enabled: true,
        content: `The Client is responsible for providing all content (text, images, logos, documents) within five (5) business days of request. Delays in providing content may affect the project timeline.`
      },
      {
        id: 'ownership', title: 'Ownership & Licensing', enabled: true,
        content: `Upon receipt of full payment, all custom design work and code created for this project transfers to the Client. Third-party assets, fonts, and plugins remain subject to their respective licenses.`
      },
      {
        id: 'hosting', title: 'Hosting & Maintenance', enabled: true,
        content: `Ongoing hosting, maintenance, and support beyond the project scope are not included in this Agreement unless separately specified. The Designer/Developer is available for ongoing support under a separate retainer arrangement.`
      },
      {
        id: 'confidentiality', title: 'Confidentiality', enabled: true,
        content: `Both parties agree to maintain confidentiality regarding all proprietary business information shared during the project.`
      },
      {
        id: 'governing', title: 'Governing Law', enabled: true,
        content: `This Agreement is governed by the laws of ${data.governingLaw || '[Governing Law Jurisdiction]'}.`
      },
    ]
  },
];

// ═══════════════════════════════════════════════════════
// DEFAULT CONTRACT DATA STRUCTURE
// ═══════════════════════════════════════════════════════

function getDefaultContractData(templateId = 'freelance') {
  const today = new Date().toISOString().split('T')[0];
  return {
    meta: {
      type: templateId,
      title: '',
      savedAt: null,
    },
    partyA: { name: '', email: '', phone: '', address: '', title: '' },
    partyB: { name: '', email: '', phone: '', address: '', title: '' },
    effectiveDate: today,
    endDate: '',
    governingLaw: '',
    refNumber: generateRefNumber(),
    scopeOfWork: '',
    payment: {
      total: '',
      currency: 'USD',
      dueTerm: 'net30',
      milestones: [
        { description: 'Project kickoff / Deposit', percentage: 50 },
        { description: 'Final delivery', percentage: 50 },
      ]
    },
    clauses: [],
    style: {
      logoUrl: '',
      headerStyle: 'minimal',
      fontStyle: 'serif',
    }
  };
}

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

function formatCurrency(amount, currency = 'USD') {
  if (!amount || amount === '') return '[Amount]';
  const num = parseFloat(amount);
  if (isNaN(num)) return '[Amount]';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toLocaleString()}`;
  }
}

function formatPaymentTerm(term) {
  const terms = {
    'net15': 'within fifteen (15) days of invoice',
    'net30': 'within thirty (30) days of invoice',
    'net45': 'within forty-five (45) days of invoice',
    'net60': 'within sixty (60) days of invoice',
    'upon-completion': 'upon completion of the project',
    'upfront': 'upfront, prior to commencement of work',
  };
  return terms[term] || 'as agreed upon by the parties';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}

function generateRefNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `CS-${year}-${rand}`;
}
