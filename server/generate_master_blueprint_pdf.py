"""
HireX: The Truth-in-Hiring Placement Protocol
Master Architecture Blueprint, Competitive Innovation Matrix & Strategic Pivot Dossier
Generates a comprehensive publication-grade PDF covering:
- Old vs New Problem Statement Analysis
- The Three-Sided Placement Breakdown (Student, TPO, Recruiter)
- 4-Tier Evidence Ledger Architecture (Tiers 1 to 4)
- 8 Core Functional Modules & Flagship Capabilities
- Competitive Innovation Matrix (What we borrowed vs what we radically improved from Superset, Rezi, Handshake, etc.)
- 100% Unique HireX Innovations (Our True Moat: AST Manifest Auditor, Resume Defence Viva, Scan-to-Verify QR)
- System Design, Matching Formula (0.7 required + 0.3 preferred), and Tech Stack
- Stakeholder Value Matrix & Emotional ROI
- Screen-by-Screen UI Implementation Map (Codebase files & components)
- The Winning 4-Minute Hackathon Pitch Script
- 4-Wave Phased Execution Plan
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw headers and footers with total page count.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        page_w, page_h = A4
        
        # Don't draw header on cover/first page
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(40, page_h - 26, "HIREX™ | The Truth-in-Hiring Placement Protocol")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(page_w - 40, page_h - 26, "Master Architecture Blueprint & Strategic Pivot Dossier")
            
            # Header rule
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(40, page_h - 32, page_w - 40, page_h - 32)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 36, page_w - 40, 36)
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 24, "CONFIDENTIAL & PROPRIETARY | Team Dominator (JSPM RSCOE) | CraftVerse National Hackathon")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(page_w - 40, 24, page_str)
        self.restoreState()


def build_pdf(filename="HireX_Truth_in_Hiring_Master_Dossier.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=38,
        rightMargin=38,
        topMargin=44,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette (Executive Navy, Verified Emerald, Signal Amber, Blocked Red, Slate)
    c_primary = colors.HexColor("#0F172A")    # Deep Slate 900
    c_secondary = colors.HexColor("#1E293B")  # Slate 800
    c_accent = colors.HexColor("#0284C7")     # Sky Blue
    c_emerald = colors.HexColor("#059669")    # Verified Emerald
    c_amber = colors.HexColor("#D97706")      # Warning Amber
    c_rose = colors.HexColor("#E11D48")       # Flagged Red
    c_muted = colors.HexColor("#64748B")      # Muted Slate 500
    c_bg_light = colors.HexColor("#F8FAFC")   # Surface Porcelain
    c_border = colors.HexColor("#E2E8F0")     # Hairline Border

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_primary,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_muted,
        spaceAfter=12
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=5
    )
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor("#1E293B")
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=c_primary
    )
    table_cell_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    story = []

    # =========================================================================
    # HEADER / COVER TITLE SECTION
    # =========================================================================
    story.append(Paragraph("HIREX™ : THE TRUTH-IN-HIRING PROTOCOL", title_style))
    story.append(Paragraph("<b>Master Architecture Blueprint, Competitive Innovation Matrix & Strategic Pivot Dossier</b>", subtitle_style))
    
    meta_data = [
        [
            Paragraph("<b>Institution:</b> JSPM RSCOE, Pune", table_cell),
            Paragraph("<b>Hackathon:</b> CraftVerse National (PCCOER)", table_cell),
            Paragraph("<b>Team:</b> Team Dominator", table_cell),
            Paragraph("<b>Version:</b> 3.2.0 (Master Blueprint)", table_cell)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[130, 140, 120, 129])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 1. EXECUTIVE SUMMARY & THE STRATEGIC PIVOT
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & The Problem Statement Pivot", h1_style))
    story.append(Paragraph(
        "Our previous platform (originally titled <i>SkillBridge</i>) was engineered for broad, macro-level academic syllabus desynchronization. That problem was mathematically sound but lacked operational urgency. The new problem statement (<b>Placement Hub</b>) presents a high-leverage pivot: it attacks the <b>acute trust deficit in campus recruitment</b>. Freshers spray unverified resumes full of claims they cannot back up (e.g. <i>'experienced in Redis'</i>), placement cells forward jobs blindly across WhatsApp groups with duplicate listings, and recruiters waste 80% of Round 1 interviews on false claims.",
        body_style
    ))
    
    pivot_table_data = [
        [
            Paragraph("Parameter", table_cell_header),
            Paragraph("Old Focus (SkillBridge v1.0)", table_cell_header),
            Paragraph("New Focus (HireX Placement Protocol)", table_cell_header)
        ],
        [
            Paragraph("<b>Core Problem</b>", table_cell_bold),
            Paragraph("University curricula lag behind national industry hiring demand.", table_cell),
            Paragraph("Freshers spray generic resumes with unbacked buzzwords; TPOs forward duplicate jobs over WhatsApp; recruiters drown in fake resumes.", table_cell)
        ],
        [
            Paragraph("<b>Primary User</b>", table_cell_bold),
            Paragraph("Academician / HOD analyzing syllabus gaps.", table_cell),
            Paragraph("Three-sided operational network: <b>Student</b> (anxious, resume spamming) + <b>TPO</b> (overwhelmed by WhatsApp/Excel) + <b>Recruiter</b> (exhausted by fake claims).", table_cell)
        ],
        [
            Paragraph("<b>Resume Handling</b>", table_cell_bold),
            Paragraph("Basic keyword density counter measuring frequency.", table_cell),
            Paragraph("<b>Claim X-Ray (The Lie Detector):</b> Cross-checks resume claims against real evidence; <b>hard-blocks unverified claims</b>; generates truthful 1-page tailored ATS resumes with QR proof.", table_cell)
        ],
        [
            Paragraph("<b>Opening Ingestion</b>", table_cell_bold),
            Paragraph("Static list of campus placement drives.", table_cell),
            Paragraph("<b>Multi-Source Ingestion & Fuzzy Deduplicator:</b> Ingests from Partner Portals, WhatsApp Alumni Referrals, and Job APIs; merges duplicates into a single canonical opening.", table_cell)
        ],
        [
            Paragraph("<b>TPO Capability</b>", table_cell_bold),
            Paragraph("Viewing departmental skill gap analytics.", table_cell),
            Paragraph("<b>Interactive Batch Ranker:</b> TPO pastes any unexpected JD text and instantly ranks 50+ students by evidence-backed fit score in 200ms with 1-click shortlist export.", table_cell)
        ],
        [
            Paragraph("<b>Headline Moat</b>", table_cell_bold),
            Paragraph("Curriculum desynchronization percentage curve.", table_cell),
            Paragraph("<b>'The Resume That Survives a Technical Round':</b> Live smartphone scan of resume QR code showing AST code proof + interview grilling defense simulator.", table_cell)
        ]
    ]
    t_pivot = Table(pivot_table_data, colWidths=[95, 205, 219])
    t_pivot.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_pivot)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 2. THE THREE-SIDED PLACEMENT CRISIS
    # =========================================================================
    story.append(Paragraph("2. The Three-Sided Placement Breakdown", h1_style))
    crisis_boxes = [
        [
            Paragraph("<b>1. THE STUDENT CRISIS: 'The Spray & Pray'</b><br/>Facing an 80% ATS rejection rate, students panic and use ChatGPT to inflate resumes with unbacked buzzwords (<i>'experienced with microservices, proficient in Redis'</i>). When shortlisted, they are humiliated and exposed within 5 minutes of their first technical interview, destroying their confidence and damaging their college's standing.", table_cell),
            Paragraph("<b>2. THE TPO CRISIS: 'WhatsApp & Excel Hell'</b><br/>Job openings trickle in asynchronously via alumni WhatsApp chats, company HR emails, and external web boards. TPOs accidentally broadcast the same opening 3 times under different titles, track applicants on fragmented Google Sheets, and lack any objective way to rank 200 students when a recruiter asks for 20 candidates by tomorrow morning.", table_cell),
            Paragraph("<b>3. THE RECRUITER CRISIS: 'Noise Fatigue'</b><br/>Enterprise recruiters receive 800 resumes that all look identical. They cannot distinguish a student who actually architected a multi-threaded system from one who simply copy-pasted the keyword. Engineering teams waste 40+ expensive hours per hire weeding out false positives during Round 1 viva.", table_cell)
        ]
    ]
    t_crisis = Table(crisis_boxes, colWidths=[172, 173, 174])
    t_crisis.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_crisis)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 3. CORE ARCHITECTURE: THE 4-TIER EVIDENCE LEDGER
    # =========================================================================
    story.append(Paragraph("3. Technical Architecture: The 4-Tier Evidence Ledger", h1_style))
    story.append(Paragraph(
        "To replace self-claims with mathematical certainty, HireX implements a centralized <b>Evidence Ledger</b>. Every claim is assigned to a strict tier based on objective auditability. <b>Tier 4 claims are strictly blocked from export</b>.",
        body_style
    ))

    tier_data = [
        [
            Paragraph("Evidence Tier", table_cell_header),
            Paragraph("Verification Source & Methodology", table_cell_header),
            Paragraph("Proof Artifact Generated", table_cell_header),
            Paragraph("Resume Status", table_cell_header)
        ],
        [
            Paragraph("<b>TIER 1:<br/>Proctored Assessment</b>", table_cell_bold),
            Paragraph("Proctored algorithmic coding challenge or cognitive neuroscience test session with fullscreen lock and face-tracking telemetry.", table_cell),
            Paragraph("Proctoring session ID, timestamped violation log, percentile score, test hash.", table_cell),
            Paragraph("<font color='#059669'><b>VERIFIED<br/>(Full Weight)</b></font>", table_cell)
        ],
        [
            Paragraph("<b>TIER 2:<br/>Code Lab / GitHub Audit</b>", table_cell_bold),
            Paragraph("In-browser AST syntax parser analyzing loop depth, recursion trees, cyclomatic complexity + real dependency manifests (<code>requirements.txt</code>, <code>package.json</code>).", table_cell),
            Paragraph("SHA-256 cryptographic proof of work, commit cadence timeline, AST cyclomatic grade.", table_cell),
            Paragraph("<font color='#059669'><b>VERIFIED<br/>(Full Weight)</b></font>", table_cell)
        ],
        [
            Paragraph("<b>TIER 3:<br/>Evaluated Project / QR</b>", table_cell_bold),
            Paragraph("Mentor-evaluated capstone repository, NPTEL / AICTE course certificate with verifiable public QR signature registry.", table_cell),
            Paragraph("Registry credential token, faculty evaluation rubric score, project repository link.", table_cell),
            Paragraph("<font color='#D97706'><b>SUPPORTED<br/>(Partial Weight)</b></font>", table_cell)
        ],
        [
            Paragraph("<b>TIER 4:<br/>Self-Reported Claim</b>", table_cell_bold),
            Paragraph("Keywords extracted from student resume or profile text with zero corresponding commits, test scores, or certificates.", table_cell),
            Paragraph("None. Unbacked textual claim.", table_cell),
            Paragraph("<font color='#E11D48'><b>HARD-BLOCKED<br/>(Export Denied)</b></font>", table_cell)
        ]
    ]
    t_tier = Table(tier_data, colWidths=[90, 160, 169, 100])
    t_tier.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_tier)

    # =========================================================================
    # 4. COMPETITIVE INNOVATION MATRIX (WHAT WE BORROWED VS IMPROVED)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Competitive Innovation Matrix (Market Research vs. HireX Upgrades)", h1_style))
    story.append(Paragraph(
        "We dissected existing commercial platforms (JoinSuperset, Rezi, Job Aggregators, HackerRank, Glassdoor). Here is what we borrowed, what we radically upgraded, and what is 100% our own proprietary innovation.",
        body_style
    ))

    comp_data = [
        [
            Paragraph("Commercial Standard", table_cell_header),
            Paragraph("What They Do Well", table_cell_header),
            Paragraph("The Fatal Flaw / Industry Blindspot", table_cell_header),
            Paragraph("The HireX Radical Upgrade", table_cell_header)
        ],
        [
            Paragraph("<b>JoinSuperset</b><br/>(Indian Campus Leader)", table_cell_bold),
            Paragraph("Automates student registration and college placement gatekeeping rules.", table_cell),
            Paragraph("Relies entirely on unverified uploaded PDFs and CGPA cutoffs. Zero skill proof; recruiters receive 500 identical resumes.", table_cell),
            Paragraph("<b>4-Tier Evidence Ledger:</b> Replaces self-reported claims with AST code audits and proctored challenge proof.", table_cell)
        ],
        [
            Paragraph("<b>Rezi / Teal / ChatGPT</b><br/>(AI Resume Builders)", table_cell_bold),
            Paragraph("Generates ATS-compliant 1-page resume layouts and extracts keywords.", table_cell),
            Paragraph("Encourages resume fraud by hallucinating unbacked buzzwords (<i>'Redis expert'</i>) to trick ATS parsers.", table_cell),
            Paragraph("<b>Claim X-Ray (Lie Detector):</b> Audits every claim against real evidence; hard-blocks unverified claims from export.", table_cell)
        ],
        [
            Paragraph("<b>Job Aggregators</b><br/>(LinkedIn / Indeed)", table_cell_bold),
            Paragraph("Aggregates jobs from hundreds of corporate portals.", table_cell),
            Paragraph("The <i>'One Job, Ten Listings'</i> issue: floods users with duplicate cards for the exact same opening.", table_cell),
            Paragraph("<b>Fuzzy Deduplicator:</b> Merges WhatsApp forwards, alumni referrals, and APIs into 1 canonical card with <code>sources[]</code>.", table_cell)
        ],
        [
            Paragraph("<b>HackerRank / Mettl</b><br/>(Assessment Platforms)", table_cell_bold),
            Paragraph("Standardized proctored coding assessments.", table_cell),
            Paragraph("Isolated testing widgets disconnected from the student's resume, campus drives, or portfolio.", table_cell),
            Paragraph("<b>Direct Ledger Feeding:</b> Every test directly unlocks verified claims on the student's tailored resume.", table_cell)
        ],
        [
            Paragraph("<b>Glassdoor / LeetCode</b><br/>(Interview Forums)", table_cell_bold),
            Paragraph("Crowdsourced real interview questions.", table_cell),
            Paragraph("Unverified claims submitted anonymously by anyone on the internet.", table_cell),
            Paragraph("<b>Gated Interview Debriefs:</b> Only candidates whose live pipeline status reached 'Technical Round' can submit debriefs.", table_cell)
        ]
    ]
    t_comp = Table(comp_data, colWidths=[90, 115, 154, 160])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 5. WHAT IS 100% UNIQUE TO HIREX (OUR TRUE MOAT)
    # =========================================================================
    story.append(Paragraph("5. What is 100% Unique to HireX (Our Proprietary Moat)", h1_style))
    story.append(Paragraph(
        "No platform currently integrates these three capabilities. This is where HireX leaves competitors behind:",
        body_style
    ))

    moat_boxes = [
        [
            Paragraph("<b>1. IN-BROWSER AST COMPLEXITY & MANIFEST AUDITOR</b><br/>HireX parses Python/JavaScript code syntax trees directly in the browser: measuring loop nesting depth, recursion, and cyclomatic complexity. It inspects actual dependency manifests (<code>requirements.txt</code>, <code>package.json</code>) so 'Redis' only counts if the repo genuinely imports and configures it.", table_cell),
            Paragraph("<b>2. RESUME DEFENCE MODE (THE GRILLING SIMULATOR)</b><br/>Simulates a technical interviewer grilling the student on their own code facts: <i>'In your repo cache.py, you chose a 300s TTL. What happens during a cache stampede if 10,000 requests hit an expired key simultaneously?'</i> Evaluates student responses and rates exposure risk: <code>[Safe]</code> / <code>[Shaky]</code> / <code>[Will Be Exposed]</code>.", table_cell),
            Paragraph("<b>3. LIVE PHONE SCAN-TO-VERIFY QR DOSSIER</b><br/>Every generated 1-page resume embeds a cryptographic QR code in the header. When scanned with any smartphone camera, it opens a mobile-optimized public page displaying live AST complexity scores, passing pytests, and GitHub commit diffs for every single bullet on that resume.", table_cell)
        ]
    ]
    t_moat = Table(moat_boxes, colWidths=[172, 173, 174])
    t_moat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_moat)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 6. SYSTEM DESIGN, MATCHING FORMULA & TECH STACK
    # =========================================================================
    story.append(Paragraph("6. System Design, Deterministic Matching Formula & Tech Stack", h1_style))
    story.append(Paragraph(
        "HireX strictly rejects non-deterministic black-box scoring. Matching uses an explainable weighted coverage formula:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Deterministic Fit Formula:</b> &nbsp; <code>Fit Score = 0.70 × (Verified Must-Have / Total Must-Have) + 0.30 × (Verified Nice-To-Have / Total Nice-To-Have)</code><br/>"
        "• If any <code>MUST_HAVE</code> skill has zero evidence, the verdict is capped at <code>PARTIAL_FIT</code> with a transparent explanation. Zero AI hallucination.<br/>"
        "• <b>Fuzzy Job Deduplication Metric:</b> <code>BlockingKey = Normalize(Company) + ':' + Normalize(Title) + ':' + Normalize(Location)</code>. Candidate pairs sharing a blocking key with <code>Jaccard(Skills_A, Skills_B) ≥ 0.75</code> are automatically merged into a single canonical record.",
        body_style
    ))

    stack_data = [
        [
            Paragraph("Frontend Architecture", table_cell_header),
            Paragraph("Backend Engine", table_cell_header),
            Paragraph("Real-Time Sync & Persistence", table_cell_header)
        ],
        [
            Paragraph("• React 18 + TypeScript + Vite (Fast HMR, 0 type errors)<br/>• Tailwind CSS (Porcelain aesthetic, dark/light mode)<br/>• Native CSS <code>@media print</code> 1-page ATS layout<br/>• Mobile-friendly QR proof dossier route (<code>/verify/:id</code>)", table_cell),
            Paragraph("• Python 3.12 + FastAPI (High-throughput async)<br/>• Pydantic v2 (Strict schema validation)<br/>• Python AST static analyzer + Sandboxed runner<br/>• RapidFuzz & token Jaccard for job deduplication", table_cell),
            Paragraph("• SSE (Server-Sent Events) ring-buffer broker (<code>sync_service.py</code>)<br/>• Atomic JSON persistence (<code>canonical_store.py</code>)<br/>• Monotonic versioning & Optimistic Concurrency Control<br/>• Comprehensive audit log journaling", table_cell)
        ]
    ]
    t_stack = Table(stack_data, colWidths=[172, 173, 174])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_stack)

    # =========================================================================
    # 7. STAKEHOLDER VALUE MATRIX
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("7. Stakeholder Value Proposition (Why Everyone Wins)", h1_style))
    story.append(Paragraph(
        "HireX aligns incentives across all three actors in the campus placement ecosystem:",
        body_style
    ))

    value_data = [
        [
            Paragraph("Stakeholder", table_cell_header),
            Paragraph("Current Status Quo (Without HireX)", table_cell_header),
            Paragraph("Transformed Reality (With HireX)", table_cell_header),
            Paragraph("The Emotional Impact", table_cell_header)
        ],
        [
            Paragraph("<b>The Student</b>", table_cell_bold),
            Paragraph("Spams 200 generic resumes; suffers imposter syndrome; gets humiliated in Round 1 technical viva.", table_cell),
            Paragraph("Applies with tailored 1-page resumes backed by verified proof; practices defending code in Defence Mode.", table_cell),
            Paragraph("<b>Confidence & Pride:</b><br/><i>'I can defend every single word on this paper.'</i>", table_cell)
        ],
        [
            Paragraph("<b>The Placement Team (TPO)</b>", table_cell_bold),
            Paragraph("Drowns in WhatsApp messages; manages 10 messy Excel sheets; forwards duplicates; manually shortlists candidates.", table_cell),
            Paragraph("1-click Batch Ranker for any JD; automated job deduplication; live shared pipeline tracking every student.", table_cell),
            Paragraph("<b>Control & Sanity:</b><br/><i>'I can deliver a verified shortlist of 20 students in 5 minutes.'</i>", table_cell)
        ],
        [
            Paragraph("<b>The Corporate Recruiter</b>", table_cell_bold),
            Paragraph("Wastes 40+ engineering hours per hire interviewing candidates who lied about skills on ChatGPT resumes.", table_cell),
            Paragraph("Receives trustworthy shortlists where every bullet point has a mobile-scannable QR link to real code proof.", table_cell),
            Paragraph("<b>Trust & Relief:</b><br/><i>'Every candidate we interview actually knows how to code.'</i>", table_cell)
        ]
    ]
    t_val = Table(value_data, colWidths=[80, 150, 159, 130])
    t_val.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_val)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 8. SCREEN-BY-SCREEN UI IMPLEMENTATION MAP
    # =========================================================================
    story.append(Paragraph("8. Screen-by-Screen UI Implementation Map (Code Architecture)", h1_style))
    story.append(Paragraph(
        "Outlines exactly where each capability lives in our codebase, ensuring clean modular separation without regressions:",
        body_style
    ))

    ui_map_data = [
        [
            Paragraph("Platform View / File", table_cell_header),
            Paragraph("User Role", table_cell_header),
            Paragraph("UI Placement & Components", table_cell_header),
            Paragraph("Underlying Service / Engine", table_cell_header)
        ],
        [
            Paragraph("<b>Opportunities View</b><br/><code>OpportunitiesView.tsx</code>", table_cell_bold),
            Paragraph("Student", table_cell),
            Paragraph("• Multi-source origin badges & merged duplicate chips on cards.<br/>• Alumni Referral drawer ('Request Referral Packet').<br/>• Tab 2: <b>Truthful Resume Studio & Claim X-Ray</b>.<br/>• Tab 3: <b>Resume Defence Simulator</b>.", table_cell),
            Paragraph("<code>job_deduplicator.py</code><br/><code>resume_scanner.py</code><br/><code>jd_skill_analysis.py</code>", table_cell)
        ],
        [
            Paragraph("<b>Placement Cell Hub</b><br/><code>AcademicianPortalView.tsx</code>", table_cell_bold),
            Paragraph("TPO / Placement Officer", table_cell),
            Paragraph("• New Tab: <b>TPO 'Paste-a-JD' Batch Ranker</b> with raw JD paste input, batch leaderboard, and CSV export.<br/>• New Tab: <b>Shared Live Application Pipeline</b> (Kanban).<br/>• Company-wise Interview Question Bank.", table_cell),
            Paragraph("<code>jd_skill_analysis.py</code><br/><code>sync_service.py</code><br/><code>canonical_store.py</code>", table_cell)
        ],
        [
            Paragraph("<b>Skill Passport</b><br/><code>VerifiedSkillPassport.tsx</code>", table_cell_bold),
            Paragraph("Student", table_cell),
            Paragraph("• Unified <b>4-Tier Evidence Ledger</b> visual matrix.<br/>• Real GitHub dependency manifest & commit inspection.<br/>• Instant 'Verify Claim' trigger for unbacked skills.", table_cell),
            Paragraph("<code>evidence_ledger.py</code><br/><code>code_auditor.py</code><br/><code>skill_intelligence.py</code>", table_cell)
        ],
        [
            Paragraph("<b>Public Proof Dossier</b><br/><code>PublicVerifyView.tsx</code>", table_cell_bold),
            Paragraph("Recruiter / Public (QR Scan)", table_cell),
            Paragraph("• Standalone mobile-friendly public verification route opened by scanning resume QR code.<br/>• Displays verified bullet-by-bullet proof, AST cyclomatic depth, and test scores.", table_cell),
            Paragraph("<code>canonical_store.py</code><br/>(Public endpoint without authentication wall)", table_cell)
        ]
    ]
    t_ui_map = Table(ui_map_data, colWidths=[115, 70, 214, 120])
    t_ui_map.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_ui_map)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 9. THE 4-MINUTE WINNING PITCH SCRIPT
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("9. The Winning 4-Minute Hackathon Pitch Script", h1_style))
    story.append(Paragraph(
        "A choreographed live demonstration narrative designed to hook technical judges within 30 seconds and secure 1st place:",
        body_style
    ))

    script_data = [
        [
            Paragraph("Time", table_cell_header),
            Paragraph("Stage Action & Visual Screen", table_cell_header),
            Paragraph("Spoken Pitch Script (Verbatim)", table_cell_header)
        ],
        [
            Paragraph("<b>0:00 - 0:45<br/>(The Hook)</b>", table_cell_bold),
            Paragraph("<b>Screen:</b> Claim X-Ray in Resume Studio.<br/>Upload typical student resume claiming Redis & Microservices.", table_cell),
            Paragraph("<i>'Judges, every fresher in India today is spraying resumes padded with buzzwords they cannot defend. Watch what happens when we upload this resume into HireX Claim X-Ray. Notice that Redis and Kubernetes instantly turn bright RED: 0 commits, 0 test cases found. On any other platform, this fake claim reaches Barclays and wastes 45 minutes of a senior engineer's time. On HireX, unsupported claims are flagged and blocked from employer export.'</i>", table_cell)
        ],
        [
            Paragraph("<b>0:45 - 2:00<br/>(The Truthful Resume)</b>", table_cell_bold),
            Paragraph("<b>Screen:</b> 1-Page Tailored Resume Studio with live QR code.", table_cell),
            Paragraph("<i>'Instead of guessing, the student clicks Barclays Full-Stack Drive. HireX synthesizes a clean, 1-page tailored ATS resume where EVERY bullet point has an immutable evidence citation. Judges, please point your phone cameras at this QR code right now. You are seeing live AST code cyclomatic depth, passing pytests, and GitHub commit diffs on your personal phones. HireX produces the only resume that can survive a technical round.'</i>", table_cell)
        ],
        [
            Paragraph("<b>2:00 - 3:00<br/>(The TPO Superpower)</b>", table_cell_bold),
            Paragraph("<b>Screen:</b> TPO Portal ➔ Paste-a-JD Batch Ranker.<br/>Paste raw text JD ➔ Click 'Rank Batch'.", table_cell),
            Paragraph("<i>'Now let's switch to the College Placement Office. Barclays calls the TPO: \"We need 20 backend candidates by 9 AM.\" Instead of frantic WhatsApp chats and Excel spreadsheets, the TPO pastes the raw JD text into HireX. In 200 milliseconds, our deterministic matcher evaluates the entire 2026 batch. The TPO gets an evidence-ranked leaderboard with confidence bands and 1-click shortlist export.'</i>", table_cell)
        ],
        [
            Paragraph("<b>3:00 - 4:00<br/>(The Close & Moat)</b>", table_cell_bold),
            Paragraph("<b>Screen:</b> Multi-Source Merged Cards + Resume Defence Grilling Mode.", table_cell),
            Paragraph("<i>'Notice how our deduplication engine collapsed 3 duplicate WhatsApp, alumni, and API postings into one canonical card. And before stepping into the interview, the student practices in Resume Defence Mode, where AI grills them on their own repo facts. HireX turns campus hiring from a game of resume inflation into a verified meritocracy. Thank you.'</i>", table_cell)
        ]
    ]
    t_script = Table(script_data, colWidths=[65, 170, 284])
    t_script.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_script)
    story.append(Spacer(1, 8))

    # =========================================================================
    # 10. PHASED IMPLEMENTATION WAVES
    # =========================================================================
    story.append(Paragraph("10. Phased Implementation Waves (The Path to Done)", h1_style))
    story.append(Paragraph(
        "We execute in 4 clean, non-breaking waves, maintaining our 61-test regression safety net at each step:",
        body_style
    ))

    waves_data = [
        [
            Paragraph("Wave", table_cell_header),
            Paragraph("Core Deliverables", table_cell_header),
            Paragraph("Verification Criteria", table_cell_header)
        ],
        [
            Paragraph("<b>Wave 1:<br/>Evidence Ledger & Real Proof</b>", table_cell_bold),
            Paragraph("• Implement 4-tier Evidence Ledger data model (Tiers 1–4).<br/>• Real GitHub manifest checking (<code>requirements.txt</code>, <code>package.json</code>) so 'Redis' only counts if implemented in code.<br/>• Unified taxonomy with strict UNKNOWN fallback.", table_cell),
            Paragraph("Unit tests verifying that skills with 0 commits report <code>UNSUPPORTED</code>, while skills with AST commits report <code>TIER_2_VERIFIED</code>.", table_cell)
        ],
        [
            Paragraph("<b>Wave 2:<br/>Job Deduplicator & Ingestion</b>", table_cell_bold),
            Paragraph("• Ingestion pipeline tagging sources: Partner, Alumni WhatsApp, Job API.<br/>• Fuzzy deduplication engine using normalized blocking keys + skill Jaccard similarity.<br/>• Merged canonical opening card with <code>sources[]</code> provenance chips.", table_cell),
            Paragraph("Test cases proving duplicate postings with varying titles collapse into 1 canonical opening with multiple sources.", table_cell)
        ],
        [
            Paragraph("<b>Wave 3:<br/>Claim X-Ray & 1-Page Resume</b>", table_cell_bold),
            Paragraph("• Claim X-Ray parser auditing resume text against evidence ledger (Green/Amber/Red).<br/>• Hard-block guardrail preventing export of unbacked claims.<br/>• Truthful 1-page ATS Tailored Resume Builder with live Scan-to-Verify QR code and public mobile verification route.", table_cell),
            Paragraph("End-to-end verification of resume upload claim detection + responsive 1-page print CSS layout + public QR URL route.", table_cell)
        ],
        [
            Paragraph("<b>Wave 4:<br/>TPO Ranker & Resume Defence</b>", table_cell_bold),
            Paragraph("• TPO 'Paste-a-JD' batch ranker evaluating 35+ students in under 300ms.<br/>• Shared live application Kanban pipeline with real-time SSE updates.<br/>• Resume Defence Mode interview grilling simulator + company interview debrief bank.", table_cell),
            Paragraph("Batch ranking benchmark under 300ms + live Kanban event broadcast test + complete end-to-end user journey walkthrough.", table_cell)
        ]
    ]
    t_waves = Table(waves_data, colWidths=[90, 249, 180])
    t_waves.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_waves)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated publication-grade PDF: {filename}")


if __name__ == "__main__":
    out_path = "HireX_Truth_in_Hiring_Master_Dossier.pdf"
    build_pdf(out_path)
