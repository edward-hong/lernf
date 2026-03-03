// src/pages/mindset/GripCompass.tsx
// Interactive GRIP Compass visualization using D3.js
// The compass is the core diagnostic visual for the GRIP framework —
// a model of human-AI power dynamics built from 13 historical case studies.

import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as d3 from 'd3'

// ─── Case Study Data ───────────────────────────────────────────────

interface CaseStudy {
  id: number
  label: string
  shortLabel: string
  ring: number | 'trajectory'
  quadrant: string
  pattern: string
  type: 'parasitic' | 'transition' | 'generative' | 'recovery'
  oneLiner: string
  color: string
  description: string
  arrowTo?: number
  arrowLabel?: string
  arrowType?: 'recovery' | 'deterioration'
  arrowFrom?: number
}

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    label: 'Wei Zhongxian / Tianqi',
    shortLabel: 'Tianqi',
    ring: 1,
    quadrant: 'G',
    pattern: 'Total Displacement',
    type: 'parasitic',
    oneLiner: 'The emperor who preferred his workshop to his throne lost both.',
    color: '#dc2626',
    description:
      'Principal disengages entirely; subordinate fills the governance vacuum. AI parallel: automation complacency, delegating all operational work to AI.',
  },
  {
    id: 2,
    label: 'Sejanus / Tiberius',
    shortLabel: 'Sejanus',
    ring: 1,
    quadrant: 'I',
    pattern: 'Information Filter',
    type: 'parasitic',
    oneLiner:
      "The most dangerous information filter is the one you don't know is filtering.",
    color: '#dc2626',
    description:
      "Sole information channel constructs principal's reality. AI parallel: single AI source curating all analysis, no independent verification.",
  },
  {
    id: 3,
    label: 'Qin Hui / Gaozong',
    shortLabel: 'Qin Hui',
    ring: 1,
    quadrant: 'R-I',
    pattern: 'Insecurity Weaponised',
    type: 'parasitic',
    oneLiner: 'Perhaps is enough when fear is doing the reasoning.',
    color: '#dc2626',
    description:
      'Advisor reframes information to exploit pre-existing fears. AI parallel: confirmation bias amplification, AI validating what you already believe.',
  },
  {
    id: 4,
    label: 'Rasputin / Romanovs',
    shortLabel: 'Rasputin',
    ring: 1,
    quadrant: 'R',
    pattern: 'Emotional Dependency',
    type: 'parasitic',
    oneLiner:
      'Access to expertise is worthless without the emotional capacity to accept it.',
    color: '#dc2626',
    description:
      'Emotional need overrides institutional information. AI parallel: emotional attachment to AI companions overriding professional advice.',
  },
  {
    id: 5,
    label: 'Al-Mansur / Hisham II',
    shortLabel: 'Al-Mansur',
    ring: 2,
    quadrant: 'R-G',
    pattern: 'Competent Replacement',
    type: 'parasitic',
    oneLiner:
      'The most dangerous satisficer delivers everything while ensuring you never do without them.',
    color: '#ea580c',
    description:
      'Brilliant subordinate produces excellent outcomes while replacing institutional capacity. AI parallel: AI handling junior work so well the talent pipeline is severed.',
  },
  {
    id: 6,
    label: 'Fouché / Napoleon',
    shortLabel: 'Fouché',
    ring: 2,
    quadrant: 'I-G',
    pattern: 'Structural Dependency',
    type: 'parasitic',
    oneLiner: 'The AI you cannot leave is the AI that owns you.',
    color: '#ea580c',
    description:
      'Proprietary knowledge creates dependency independent of psychology. AI parallel: vendor lock-in through accumulated institutional knowledge in proprietary platforms.',
  },
  {
    id: 7,
    label: 'Early Mao-Zhou',
    shortLabel: 'Early Mao-Zhou',
    ring: 3,
    quadrant: 'P',
    pattern: 'Sycophancy Equilibrium (Pre-Cultural Revolution)',
    type: 'transition',
    oneLiner:
      'Limited but real debate within the CCP — Peng Dehuai could challenge Mao at the 1959 Lushan Conference.',
    color: '#ca8a04',
    description:
      "Early People's Republic (1949-1966) featured limited but real debate within the CCP. The Hundred Flowers Campaign (1956) invited intellectual criticism. At the 1959 Lushan Conference, Defense Minister Peng Dehuai directly criticized Mao's Great Leap Forward policies, demonstrating that high-level dissent was still possible within party structures, though increasingly risky.",
    arrowTo: 14,
    arrowLabel: 'Cultural Revolution (1966)',
    arrowType: 'deterioration',
  },
  {
    id: 8,
    label: 'Elizabeth / Cecil',
    shortLabel: 'Elizabeth-Cecil',
    ring: 5,
    quadrant: 'G',
    pattern: 'Gold Standard',
    type: 'generative',
    oneLiner:
      'The best AI partnership is the one that disagrees with you best.',
    color: '#16a34a',
    description:
      '40-year partnership with sustained productive friction across all four GRIP dimensions. AI parallel: centaur model where process trumps raw capability.',
  },
  {
    id: 9,
    label: 'Taizong / Wei Zheng',
    shortLabel: 'Taizong',
    ring: 5,
    quadrant: 'P',
    pattern: 'Institutionalised Remonstrance',
    type: 'generative',
    oneLiner:
      "The AI that tells you what you don't want to hear is the one you cannot afford to lose.",
    color: '#16a34a',
    description:
      'Disagreement institutionalised as state function. Meta-remonstrance: criticising the criticism-receiving process itself. AI parallel: Constitutional AI, multi-agent debate.',
  },
  {
    id: 10,
    label: 'Lincoln / Seward',
    shortLabel: 'Lincoln-Seward',
    ring: 4,
    quadrant: 'G-P',
    pattern: 'Rivals to Partners',
    type: 'generative',
    oneLiner:
      "The first time you use AI without questioning its output, you've established the norm.",
    color: '#22c55e',
    description:
      'Single non-humiliating boundary-setting moment defines entire partnership. AI parallel: onboarding norms determine long-term human-AI relationship.',
  },
  {
    id: 11,
    label: 'Lennon / McCartney',
    shortLabel: 'Lennon-McCartney',
    ring: 4,
    quadrant: 'P',
    pattern: 'Lateral Creative Tension',
    type: 'generative',
    oneLiner:
      'Creative AI makes you individually better and collectively the same.',
    color: '#22c55e',
    description:
      'Peer creative partnership requiring mediating structures. AI parallel: creative human-AI collaboration needs Epstein (governance), Martin (arbitration), enforced proximity.',
  },
  {
    id: 12,
    label: 'Jobs / Wozniak',
    shortLabel: 'Jobs-Wozniak',
    ring: 3,
    quadrant: 'G',
    pattern: 'Fusion → Extraction',
    type: 'generative',
    oneLiner:
      "The AI collaboration that works in a pilot won't survive enterprise scaling without structural evolution.",
    color: '#22c55e',
    description:
      "Complementarity deteriorates when governance doesn't evolve with scale. AI parallel: pilot-to-enterprise scaling without governance adaptation.",
  },
  {
    id: 13,
    label: 'Kangxi / Aobai',
    shortLabel: 'Kangxi',
    ring: 'trajectory',
    quadrant: 'R',
    pattern: 'Recovery',
    type: 'recovery',
    oneLiner:
      'Like any regency, it will only end when you build the strength to end it yourself.',
    color: '#8b5cf6',
    description:
      'Recovery trajectory from Ring 1 to Ring 5. Concealed capability-building, decisive restructuring. AI parallel: breaking free from AI dependency through the Kangxi Protocol.',
  },
  {
    id: 14,
    label: 'Late Mao-Zhou',
    shortLabel: 'Late Mao-Zhou',
    ring: 2,
    quadrant: 'I',
    pattern: 'Institutional Collapse',
    type: 'parasitic',
    oneLiner:
      "Even Lin Biao, Mao's designated successor, was purged for suspected dissent — any questioning meant political death.",
    color: '#ea580c',
    description:
      "The Cultural Revolution (1966-76) dismantled institutional checks entirely. Red Guards enforced ideological purity through struggle sessions. Even Lin Biao, Mao's designated successor, was purged when suspected of questioning the Chairman. Information flow collapsed — famine deaths were hidden, ideology trumped reality, and any form of dissent became politically fatal. A one-ring deterioration from Early Mao-Zhou in 17 years.",
    arrowFrom: 7,
  },
]

// ─── Color Constants ───────────────────────────────────────────────

const COLORS = {
  bg: '#f9fafb',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  quadrantLine: '#94a3b8',
  ringBorder: '#64748b',
  parasitic: '#dc2626',
  dangerous: '#ea580c',
  transition: '#ca8a04',
  generative: '#16a34a',
  recovery: '#8b5cf6',
  deterioration: '#ef4444',
}

const RING_TINTS = ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#4ade80']

const RING_LABELS = [
  'Ring 1: Parasitic',
  'Ring 2: Dangerous',
  'Ring 3: At Risk',
  'Ring 4: Functional',
  'Ring 5: Generative',
]

// ─── Legend items ──────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { type: 'parasitic', color: COLORS.parasitic, label: 'Parasitic' },
  { type: 'dangerous', color: COLORS.dangerous, label: 'Dangerous' },
  { type: 'transition', color: COLORS.transition, label: 'Transition' },
  { type: 'generative', color: COLORS.generative, label: 'Generative' },
  { type: 'recovery', color: COLORS.recovery, label: 'Recovery' },
] as const

// ─── Quadrant angle mapping ───────────────────────────────────────
// G = top-left (90-180°), R = top-right (0-90°),
// I = bottom-left (180-270°), P = bottom-right (270-360°)

function quadrantAngle(quadrant: string): number {
  const angles: Record<string, number> = {
    G: 135,
    R: 45,
    I: 225,
    P: 315,
    'R-I': 270, // boundary between R (top-right) and I (bottom-left) = left axis
    'R-G': 90, // boundary between R and G = top
    'I-G': 180, // boundary between I and G = left
    'G-P': 180 + 45, // between G and P — actually this is boundary...
    ALL: 0, // center
  }
  // G-P boundary: G is 90-180, P is 270-360. The boundary is at the vertical axis.
  // But G-P doesn't share a boundary directly. Let's interpret it as between the two = roughly 225 or we place it at a specific angle.
  // Lincoln-Seward (G-P) — place between G (top-left) and P (bottom-right) on the vertical center-left
  angles['G-P'] = 160 // slightly into G territory near the G-P midpoint
  // R-I: Qin Hui — boundary between R (top-right) and I (bottom-left)
  // The direct boundary doesn't exist as they're diagonal. Place on the right axis.
  angles['R-I'] = 0 // right axis, between R above and I-ish below... Actually let's use 350 to put it slightly into R
  // Re-think: R is 0-90 (top-right), I is 180-270 (bottom-left). R-I means it spans both. Place at the boundary between them on the vertical axis.
  angles['R-I'] = 360 - 10 // near P-R boundary, but let's place at ~355 to be in the R side near I
  // Actually the simplest interpretation: R-I means it's on the line between R and I quadrants.
  // R goes from 0-90, I goes from 180-270. The midpoint in "angle space" would be near 135 or 315.
  // But those are G and P centers. Let's just offset to make visual sense.
  // Qin Hui: Insecurity Weaponised — involves both Resilience and Information Integrity
  // Place at 270° (bottom of compass, between I and P) — no, that's I-P boundary.
  // R(0-90) and I(180-270): place at their average = (45 + 225)/2 = 135... that's G center.
  // Better approach: place R-I cases near 0° (right side) which is between R(above) and P(below), offset toward R-I meaning.
  // Let's just place it at a visually distinctive angle:
  angles['R-I'] = 15 // near R, slightly tilted toward the R-I boundary interpretation
  angles['R-G'] = 90 // top, boundary between R and G
  angles['I-G'] = 180 // left, boundary between I and G
  angles['G-P'] = 145 // between G center (135) and the G-P semantic space
  return angles[quadrant] ?? 0
}

function casePosition(
  c: CaseStudy,
  outerRadius: number,
  innerRadius: number
): { x: number; y: number } {
  if (c.quadrant === 'ALL') return { x: 0, y: 0 }

  const ringWidth = (outerRadius - innerRadius) / 5
  const ring = typeof c.ring === 'number' ? c.ring : 1
  // Ring 1 = outermost, Ring 5 = innermost
  const ringRadius = outerRadius - (ring - 0.5) * ringWidth
  const angleDeg = quadrantAngle(c.quadrant)
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: ringRadius * Math.cos(angleRad),
    y: -ringRadius * Math.sin(angleRad), // SVG y is inverted
  }
}

// ─── Main Component ───────────────────────────────────────────────

export function GripCompass() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null)
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 })

  // Responsive resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: Math.max(600, window.innerHeight - 80),
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const drawCompass = useCallback(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const detailPanelWidth = selectedCase ? 360 : 0
    const availableWidth = width - detailPanelWidth
    const cx = availableWidth / 2
    const cy = height / 2
    const outerRadius = Math.min(availableWidth, height) * 0.38
    const innerRadius = outerRadius * 0.12
    const ringWidth = (outerRadius - innerRadius) / 5

    svg.attr('width', width).attr('height', height)

    // Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', COLORS.bg)

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`)

    // ─── Defs: gradients, filters, markers ─────────────────────

    const defs = svg.append('defs')

    // Glow filter for hover
    const glow = defs.append('filter').attr('id', 'glow')
    glow
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur')
    glow
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d)

    // Arrow marker for Kangxi trajectory
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', COLORS.recovery)

    // Arrow marker for parasitic drift
    defs
      .append('marker')
      .attr('id', 'drift-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', COLORS.textSecondary)
      .attr('opacity', 0.3)

    // Arrow marker for deterioration trajectory
    defs
      .append('marker')
      .attr('id', 'arrowhead-deterioration')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', COLORS.deterioration)

    // ─── Concentric Rings ──────────────────────────────────────

    for (let i = 0; i < 5; i++) {
      const rOuter = outerRadius - i * ringWidth
      const rInner = outerRadius - (i + 1) * ringWidth

      // Ring fill with tint
      g.append('path')
        .attr(
          'd',
          d3.arc()({
            innerRadius: rInner,
            outerRadius: rOuter,
            startAngle: 0,
            endAngle: 2 * Math.PI,
          })
        )
        .attr('fill', RING_TINTS[i])
        .attr('opacity', 0.35 + i * 0.05)
        .attr('class', `ring-fill ring-${i + 1}`)
        .on('mouseenter', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.5 + i * 0.05)
          // Show ring label tooltip
          const rMid = (rOuter + rInner) / 2
          g.append('text')
            .attr('class', 'ring-tooltip')
            .attr('x', 0)
            .attr('y', -rMid)
            .attr('text-anchor', 'middle')
            .attr('fill', COLORS.textPrimary)
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .attr('paint-order', 'stroke')
            .attr('stroke', COLORS.bg)
            .attr('stroke-width', 4)
            .text(RING_LABELS[i])
        })
        .on('mouseleave', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.35 + i * 0.05)
          g.selectAll('.ring-tooltip').remove()
        })

      // Ring border
      g.append('circle')
        .attr('r', rOuter)
        .attr('fill', 'none')
        .attr('stroke', COLORS.ringBorder)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 1)
    }

    // Innermost circle border
    g.append('circle')
      .attr('r', innerRadius)
      .attr('fill', 'none')
      .attr('stroke', COLORS.ringBorder)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1)

    // ─── Ring labels (subtle, along the right side) ────────────

    for (let i = 0; i < 5; i++) {
      const rMid = outerRadius - (i + 0.5) * ringWidth
      g.append('text')
        .attr('x', 8)
        .attr('y', -rMid + 4)
        .attr('fill', COLORS.textSecondary)
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('opacity', 0.7)
        .text(`R${i + 1}`)
    }

    // ─── Quadrant Lines ────────────────────────────────────────

    // Horizontal line
    g.append('line')
      .attr('x1', -outerRadius - 10)
      .attr('y1', 0)
      .attr('x2', outerRadius + 10)
      .attr('y2', 0)
      .attr('stroke', COLORS.quadrantLine)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.8)

    // Vertical line
    g.append('line')
      .attr('x1', 0)
      .attr('y1', -outerRadius - 10)
      .attr('x2', 0)
      .attr('y2', outerRadius + 10)
      .attr('stroke', COLORS.quadrantLine)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.8)

    // ─── Quadrant Labels ───────────────────────────────────────

    const quadrantLabels = [
      {
        letter: 'G',
        name: 'Governance',
        x: -outerRadius * 0.55,
        y: -outerRadius - 28,
        quadrant: 'G',
      },
      {
        letter: 'R',
        name: 'Resilience',
        x: outerRadius * 0.55,
        y: -outerRadius - 28,
        quadrant: 'R',
      },
      {
        letter: 'I',
        name: 'Information Integrity',
        x: -outerRadius * 0.55,
        y: outerRadius + 22,
        quadrant: 'I',
      },
      {
        letter: 'P',
        name: 'Productive Friction',
        x: outerRadius * 0.55,
        y: outerRadius + 22,
        quadrant: 'P',
      },
    ]

    quadrantLabels.forEach((ql) => {
      const qGroup = g
        .append('g')
        .attr('class', 'quadrant-label')
        .style('cursor', 'pointer')
        .on('click', () => {
          setActiveQuadrant((prev) =>
            prev === ql.quadrant ? null : ql.quadrant
          )
        })

      qGroup
        .append('text')
        .attr('x', ql.x)
        .attr('y', ql.y)
        .attr('text-anchor', 'middle')
        .attr(
          'fill',
          activeQuadrant === ql.quadrant ? '#60a5fa' : COLORS.textPrimary
        )
        .attr('font-size', '20px')
        .attr('font-weight', '700')
        .text(ql.letter)

      qGroup
        .append('text')
        .attr('x', ql.x)
        .attr('y', ql.y + 16)
        .attr('text-anchor', 'middle')
        .attr(
          'fill',
          activeQuadrant === ql.quadrant ? '#60a5fa' : COLORS.textSecondary
        )
        .attr('font-size', '10px')
        .text(ql.name)
    })

    // ─── Parasitic Drift Arrow (outer edge) ────────────────────

    const driftRadius = outerRadius + 22

    g.append('path')
      .attr(
        'd',
        d3.arc()({
          innerRadius: driftRadius - 1,
          outerRadius: driftRadius + 1,
          startAngle: -Math.PI * 0.75,
          endAngle: Math.PI * 0.75,
        })
      )
      .attr('fill', 'none')
      .attr('stroke', COLORS.textSecondary)
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#drift-arrow)')

    // Drift stage labels along the arc
    const driftStages = [
      'Engagement',
      'Reliance',
      'Delegation',
      'Displacement',
      'Collapse',
    ]
    driftStages.forEach((stage, i) => {
      const angle =
        -Math.PI * 0.65 + (i / (driftStages.length - 1)) * Math.PI * 1.3
      const lx = (driftRadius + 14) * Math.sin(angle)
      const ly = -(driftRadius + 14) * Math.cos(angle)
      g.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.textSecondary)
        .attr('font-size', '8px')
        .attr('font-weight', '500')
        .attr('opacity', 0.5)
        .text(stage)
    })

    // ─── Kangxi Recovery Trajectory (Case 13) ─────────────────
    // Trajectory connects Rasputin (Ring 1, R) to Kangxi (Ring 5, R)

    const kangxiCase = caseStudies.find((c) => c.id === 13)!
    const rasputinCase = caseStudies.find((c) => c.id === 4)!
    const kangxiRing = 5
    const kangxiAngleDeg = quadrantAngle(kangxiCase.quadrant)
    const kangxiAngleRad = (kangxiAngleDeg * Math.PI) / 180
    const kangxiRadius = outerRadius - (kangxiRing - 0.5) * ringWidth
    const kangxiPos = {
      x: kangxiRadius * Math.cos(kangxiAngleRad),
      y: -kangxiRadius * Math.sin(kangxiAngleRad),
    }
    const recoveryDimmed = isDimmed({
      quadrant: 'R',
      type: 'recovery',
    } as CaseStudy)

    // Create a curved path from Rasputin to Kangxi with a sinusoidal sweep
    const trajectoryPoints: [number, number][] = []
    const steps = 40
    const rasputinAngleRad =
      (quadrantAngle(rasputinCase.quadrant) * Math.PI) / 180
    const trajectoryStartR = outerRadius - 0.5 * ringWidth // Ring 1 radius
    const trajectoryEndR = kangxiRadius // Ring 5 radius
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const r = trajectoryStartR + (trajectoryEndR - trajectoryStartR) * t
      const angleOffset = Math.sin(t * Math.PI) * 0.3
      const angle = rasputinAngleRad + angleOffset
      trajectoryPoints.push([r * Math.cos(angle), -r * Math.sin(angle)])
    }

    const lineGen = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis)

    // Trajectory path
    g.append('path')
      .attr('d', lineGen(trajectoryPoints))
      .attr('fill', 'none')
      .attr('stroke', COLORS.recovery)
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', recoveryDimmed ? 0.1 : 0.6)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('class', 'recovery-trajectory')

    // Animated traveling dot along the trajectory
    const travelDot = g
      .append('circle')
      .attr('r', 3)
      .attr('fill', COLORS.recovery)
      .attr('opacity', recoveryDimmed ? 0.1 : 0.9)

    function animateTravelDot() {
      const pathNode = g
        .select('.recovery-trajectory')
        .node() as SVGPathElement | null
      if (!pathNode) return
      const totalLength = pathNode.getTotalLength()

      travelDot
        .attr('opacity', recoveryDimmed ? 0.1 : 0.9)
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attrTween('cx', () => (t: number) => {
          const pt = pathNode.getPointAtLength(t * totalLength)
          return String(pt.x)
        })
        .attrTween('cy', () => (t: number) => {
          const pt = pathNode.getPointAtLength(t * totalLength)
          return String(pt.y)
        })
        .on('end', () => {
          travelDot
            .transition()
            .duration(800)
            .attr('opacity', 0)
            .transition()
            .duration(200)
            .on('end', animateTravelDot)
        })
    }
    animateTravelDot()

    // Trajectory label
    const labelR = (trajectoryStartR + trajectoryEndR) / 2
    const labelAngle = rasputinAngleRad + 0.15
    g.append('text')
      .attr('x', (labelR + 20) * Math.cos(labelAngle + 0.25))
      .attr('y', -(labelR + 20) * Math.sin(labelAngle + 0.25))
      .attr('fill', COLORS.recovery)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-style', 'italic')
      .attr('opacity', recoveryDimmed ? 0.1 : 0.8)
      .text('Recovery Trajectory')

    // ─── Mao Deterioration Trajectory ────────────────────────
    // Trajectory connects Early Mao-Zhou (Ring 3, P) to Late Mao-Zhou (Ring 2, I)

    const earlyMaoCase = caseStudies.find((c) => c.id === 7)!
    const lateMaoCase = caseStudies.find((c) => c.id === 14)!

    const deteriorationDimmed = isDimmed(earlyMaoCase) && isDimmed(lateMaoCase)

    // Create curved path from Early Mao-Zhou (P, 315°) to Late Mao-Zhou (I, 225°)
    // sweeping through the bottom of the compass (270°)
    const detPoints: [number, number][] = []
    const detSteps = 30
    const earlyAngleRad = (quadrantAngle(earlyMaoCase.quadrant) * Math.PI) / 180
    const lateAngleRad = (quadrantAngle(lateMaoCase.quadrant) * Math.PI) / 180
    const earlyRingRadius = outerRadius - 2.5 * ringWidth // Ring 3
    const lateRingRadius = outerRadius - 1.5 * ringWidth // Ring 2

    for (let i = 0; i <= detSteps; i++) {
      const t = i / detSteps
      // Interpolate angle from Early Mao-Zhou to Late Mao-Zhou
      const angle = earlyAngleRad + (lateAngleRad - earlyAngleRad) * t
      // Interpolate radius from ring 3 to ring 2 (outward)
      const radius = earlyRingRadius + (lateRingRadius - earlyRingRadius) * t
      // Add slight outward curve for visual distinction
      const curveOffset = Math.sin(t * Math.PI) * ringWidth * 0.3
      const r = radius + curveOffset
      detPoints.push([r * Math.cos(angle), -r * Math.sin(angle)])
    }

    // Deterioration trajectory path
    g.append('path')
      .attr('d', lineGen(detPoints))
      .attr('fill', 'none')
      .attr('stroke', COLORS.deterioration)
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '8,4')
      .attr('opacity', deteriorationDimmed ? 0.1 : 0.6)
      .attr('marker-end', 'url(#arrowhead-deterioration)')
      .attr('class', 'deterioration-trajectory')

    // Animated traveling dot along the deterioration trajectory
    const detTravelDot = g
      .append('circle')
      .attr('r', 3)
      .attr('fill', COLORS.deterioration)
      .attr('opacity', deteriorationDimmed ? 0.1 : 0.9)

    function animateDetTravelDot() {
      const pathNode = g
        .select('.deterioration-trajectory')
        .node() as SVGPathElement | null
      if (!pathNode) return
      const totalLength = pathNode.getTotalLength()

      detTravelDot
        .attr('opacity', deteriorationDimmed ? 0.1 : 0.9)
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attrTween('cx', () => (t: number) => {
          const pt = pathNode.getPointAtLength(t * totalLength)
          return String(pt.x)
        })
        .attrTween('cy', () => (t: number) => {
          const pt = pathNode.getPointAtLength(t * totalLength)
          return String(pt.y)
        })
        .on('end', () => {
          detTravelDot
            .transition()
            .duration(800)
            .attr('opacity', 0)
            .transition()
            .duration(200)
            .on('end', animateDetTravelDot)
        })
    }
    animateDetTravelDot()

    // Deterioration trajectory label
    const detLabelT = 0.5
    const detLabelAngle =
      earlyAngleRad + (lateAngleRad - earlyAngleRad) * detLabelT
    const detLabelRadius =
      earlyRingRadius +
      (lateRingRadius - earlyRingRadius) * detLabelT +
      ringWidth * 0.3 +
      18

    g.append('text')
      .attr('x', detLabelRadius * Math.cos(detLabelAngle))
      .attr('y', -detLabelRadius * Math.sin(detLabelAngle))
      .attr('fill', COLORS.deterioration)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-style', 'italic')
      .attr('text-anchor', 'middle')
      .attr('opacity', deteriorationDimmed ? 0.1 : 0.8)
      .text('Cultural Revolution (1966)')

    // ─── Kangxi/Aobai Dot (Case 13) — placed at Ring 5, R ───

    const kangxiDotGroup = g
      .append('g')
      .attr('class', 'case-dot case-13')
      .attr('transform', `translate(${kangxiPos.x},${kangxiPos.y})`)
      .style('cursor', 'pointer')
      .attr('opacity', recoveryDimmed ? 0.12 : 1)

    kangxiDotGroup
      .append('circle')
      .attr('r', 18)
      .attr('fill', COLORS.recovery)
      .attr('opacity', 0)
      .attr('class', 'glow-ring')

    kangxiDotGroup
      .append('circle')
      .attr('r', 10)
      .attr('fill', COLORS.recovery)
      .attr('opacity', 1)
      .attr('stroke', COLORS.bg)
      .attr('stroke-width', 2)

    kangxiDotGroup
      .append('text')
      .attr('x', 15)
      .attr('y', 4)
      .attr('fill', COLORS.textPrimary)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('paint-order', 'stroke')
      .attr('stroke', COLORS.bg)
      .attr('stroke-width', 3)
      .text(kangxiCase.shortLabel)

    kangxiDotGroup
      .on('mouseenter', function () {
        if (recoveryDimmed) return
        g.selectAll('.tooltip-group').remove()
        d3.select(this).raise()
        d3.select(this)
          .select('.glow-ring')
          .transition()
          .duration(200)
          .attr('opacity', 0.25)
          .attr('r', 22)
        d3.select(this)
          .select('circle:nth-child(2)')
          .transition()
          .duration(200)
          .attr('r', 13)

        const tooltipG = g
          .append('g')
          .attr('class', 'tooltip-group')
          .attr('transform', `translate(${kangxiPos.x},${kangxiPos.y})`)
          .style('pointer-events', 'none')

        const tooltipY = -30
        const padding = 10
        const lineHeight = 16

        const tooltipBg = tooltipG
          .append('rect')
          .attr('rx', 6)
          .attr('ry', 6)
          .attr('fill', '#ffffff')
          .attr('stroke', COLORS.recovery)
          .attr('stroke-width', 1)
          .attr('opacity', 0.95)

        const nameText = tooltipG
          .append('text')
          .attr('y', tooltipY)
          .attr('text-anchor', 'middle')
          .attr('fill', COLORS.textPrimary)
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .text(kangxiCase.label)

        tooltipG
          .append('text')
          .attr('y', tooltipY + lineHeight)
          .attr('text-anchor', 'middle')
          .attr('fill', COLORS.recovery)
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(kangxiCase.pattern)

        const maxChars = 45
        const oneLinerLines: string[] = []
        const words = kangxiCase.oneLiner.split(' ')
        let currentLine = ''
        words.forEach((word) => {
          if ((currentLine + ' ' + word).trim().length > maxChars) {
            oneLinerLines.push(currentLine.trim())
            currentLine = word
          } else {
            currentLine = (currentLine + ' ' + word).trim()
          }
        })
        if (currentLine) oneLinerLines.push(currentLine.trim())

        oneLinerLines.forEach((line, li) => {
          tooltipG
            .append('text')
            .attr('y', tooltipY + lineHeight * 2 + 4 + li * 13)
            .attr('text-anchor', 'middle')
            .attr('fill', COLORS.textSecondary)
            .attr('font-size', '10px')
            .attr('font-style', 'italic')
            .text(line)
        })

        const nameBox = (nameText.node() as SVGTextElement).getBBox()
        const totalHeight =
          lineHeight * 2 + 4 + oneLinerLines.length * 13 + padding
        const tooltipWidth = Math.max(nameBox.width + padding * 2, 200)

        tooltipBg
          .attr('x', -tooltipWidth / 2)
          .attr('y', tooltipY - padding - 4)
          .attr('width', tooltipWidth)
          .attr('height', totalHeight + padding)
      })
      .on('mouseleave', function () {
        d3.select(this)
          .select('.glow-ring')
          .transition()
          .duration(200)
          .attr('opacity', 0)
          .attr('r', 18)
        d3.select(this)
          .select('circle:nth-child(2)')
          .transition()
          .duration(200)
          .attr('r', 10)
        g.selectAll('.tooltip-group').remove()
      })
      .on('click', () => {
        if (!recoveryDimmed)
          setSelectedCase((prev) =>
            prev?.id === kangxiCase.id ? null : kangxiCase
          )
      })

    // ─── Case Study Dots ───────────────────────────────────────

    const pointCases = caseStudies.filter((c) => c.ring !== 'trajectory')

    pointCases.forEach((c) => {
      const pos = casePosition(c, outerRadius, innerRadius)
      const dimmed = isDimmed(c)
      const dotGroup = g
        .append('g')
        .attr('class', `case-dot case-${c.id}`)
        .attr('transform', `translate(${pos.x},${pos.y})`)
        .style('cursor', 'pointer')
        .attr('opacity', dimmed ? 0.12 : 1)

      // Outer glow ring (visible on hover)
      dotGroup
        .append('circle')
        .attr('r', 18)
        .attr('fill', c.color)
        .attr('opacity', 0)
        .attr('class', 'glow-ring')

      // Main dot
      dotGroup
        .append('circle')
        .attr('r', 10)
        .attr('fill', c.color)
        .attr('opacity', 1)
        .attr('stroke', COLORS.bg)
        .attr('stroke-width', 2)

      // Short label
      dotGroup
        .append('text')
        .attr('x', 15)
        .attr('y', 4)
        .attr('fill', COLORS.textPrimary)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('paint-order', 'stroke')
        .attr('stroke', COLORS.bg)
        .attr('stroke-width', 3)
        .text(c.shortLabel)

      // ─── Hover interaction ───────────────────────

      dotGroup
        .on('mouseenter', function () {
          if (dimmed) return
          g.selectAll('.tooltip-group').remove()
          d3.select(this).raise()
          d3.select(this)
            .select('.glow-ring')
            .transition()
            .duration(200)
            .attr('opacity', 0.25)
            .attr('r', 22)
          d3.select(this)
            .select('circle:nth-child(2)')
            .transition()
            .duration(200)
            .attr('r', 13)

          // Tooltip
          const tooltipG = g
            .append('g')
            .attr('class', 'tooltip-group')
            .attr('transform', `translate(${pos.x},${pos.y})`)
            .style('pointer-events', 'none')

          const tooltipY = -30
          const padding = 10
          const lineHeight = 16

          // Background rect — size will be set after text
          const tooltipBg = tooltipG
            .append('rect')
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('fill', '#ffffff')
            .attr('stroke', c.color)
            .attr('stroke-width', 1)
            .attr('opacity', 0.95)

          const nameText = tooltipG
            .append('text')
            .attr('y', tooltipY)
            .attr('text-anchor', 'middle')
            .attr('fill', COLORS.textPrimary)
            .attr('font-size', '12px')
            .attr('font-weight', '700')
            .text(c.label)

          // Pattern text (wrap if long)
          const maxChars = 40
          const patternLines: string[] = []
          const patternWords = c.pattern.split(' ')
          let patternLine = ''
          patternWords.forEach((word) => {
            if ((patternLine + ' ' + word).trim().length > maxChars) {
              patternLines.push(patternLine.trim())
              patternLine = word
            } else {
              patternLine = (patternLine + ' ' + word).trim()
            }
          })
          if (patternLine) patternLines.push(patternLine.trim())

          const patternTextEls: d3.Selection<
            SVGTextElement,
            unknown,
            null,
            undefined
          >[] = []
          patternLines.forEach((line, li) => {
            const el = tooltipG
              .append('text')
              .attr('y', tooltipY + lineHeight + li * 14)
              .attr('text-anchor', 'middle')
              .attr('fill', c.color)
              .attr('font-size', '11px')
              .attr('font-weight', '600')
              .text(line)
            patternTextEls.push(
              el as unknown as d3.Selection<
                SVGTextElement,
                unknown,
                null,
                undefined
              >
            )
          })

          // One-liner (wrap if long)
          const oneLinerLines: string[] = []
          const words = c.oneLiner.split(' ')
          let currentLine = ''
          words.forEach((word) => {
            if ((currentLine + ' ' + word).trim().length > maxChars) {
              oneLinerLines.push(currentLine.trim())
              currentLine = word
            } else {
              currentLine = (currentLine + ' ' + word).trim()
            }
          })
          if (currentLine) oneLinerLines.push(currentLine.trim())

          const patternHeight = patternLines.length * 14
          oneLinerLines.forEach((line, li) => {
            tooltipG
              .append('text')
              .attr('y', tooltipY + lineHeight + patternHeight + 4 + li * 13)
              .attr('text-anchor', 'middle')
              .attr('fill', COLORS.textSecondary)
              .attr('font-size', '10px')
              .attr('font-style', 'italic')
              .text(line)
          })

          // Size background rect — measure all text widths
          const nameBox = (nameText.node() as SVGTextElement).getBBox()
          let maxTextWidth = nameBox.width
          patternTextEls.forEach((el) => {
            const w = (el.node() as SVGTextElement).getBBox().width
            if (w > maxTextWidth) maxTextWidth = w
          })
          const totalHeight =
            lineHeight + patternHeight + 4 + oneLinerLines.length * 13 + padding
          const tooltipWidth = Math.max(maxTextWidth + padding * 2, 200)

          tooltipBg
            .attr('x', -tooltipWidth / 2)
            .attr('y', tooltipY - padding - 4)
            .attr('width', tooltipWidth)
            .attr('height', totalHeight + padding)
        })
        .on('mouseleave', function () {
          d3.select(this)
            .select('.glow-ring')
            .transition()
            .duration(200)
            .attr('opacity', 0)
            .attr('r', 18)
          d3.select(this)
            .select('circle:nth-child(2)')
            .transition()
            .duration(200)
            .attr('r', 10)
          g.selectAll('.tooltip-group').remove()
        })
        .on('click', () => {
          if (!dimmed) setSelectedCase((prev) => (prev?.id === c.id ? null : c))
        })
    })

    // ─── Legend ─────────────────────────────────────────────────

    const legendG = svg
      .append('g')
      .attr('transform', `translate(${20},${height - 30})`)

    LEGEND_ITEMS.forEach((item, i) => {
      const lg = legendG
        .append('g')
        .attr('transform', `translate(${i * 100},0)`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setActiveType((prev) => (prev === item.type ? null : item.type))
        })

      lg.append('circle')
        .attr('r', 5)
        .attr('fill', item.color)
        .attr('opacity', activeType && activeType !== item.type ? 0.3 : 0.9)

      lg.append('text')
        .attr('x', 10)
        .attr('y', 4)
        .attr(
          'fill',
          activeType && activeType !== item.type
            ? COLORS.textSecondary
            : COLORS.textPrimary
        )
        .attr('font-size', '11px')
        .attr('opacity', activeType && activeType !== item.type ? 0.5 : 1)
        .text(item.label)
    })

    // ─── Title ─────────────────────────────────────────────────

    svg
      .append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', COLORS.textPrimary)
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .text('GRIP Compass')

    svg
      .append('text')
      .attr('x', 20)
      .attr('y', 48)
      .attr('fill', COLORS.textSecondary)
      .attr('font-size', '12px')
      .text('Human-AI Power Dynamics — 14 Historical Case Studies')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, selectedCase, activeQuadrant, activeType])

  // Helper: should a case be dimmed based on active filters?
  function isDimmed(c: Pick<CaseStudy, 'quadrant' | 'type'>): boolean {
    if (
      activeQuadrant &&
      !c.quadrant.includes(activeQuadrant) &&
      c.quadrant !== 'ALL'
    )
      return true
    if (activeType && c.type !== activeType) return true
    return false
  }

  useEffect(() => {
    drawCompass()
  }, [drawCompass])

  return (
    <div
      ref={containerRef}
      style={{
        background: COLORS.bg,
        position: 'relative',
        width: 1280,
        minHeight: '100vh',
        overflow: 'hidden',
        margin: '0 auto',
        paddingLeft: 12,
      }}
    >
      <svg ref={svgRef} style={{ display: 'block' }} />

      {/* Detail Panel */}
      {selectedCase && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '360px',
            height: '100%',
            background: '#f8fafc',
            borderLeft: `2px solid ${selectedCase.color}`,
            padding: '24px',
            overflowY: 'auto',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <button
            onClick={() => setSelectedCase(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: `1px solid ${COLORS.textSecondary}`,
              borderRadius: '4px',
              color: COLORS.textSecondary,
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: '12px',
            }}
          >
            Close
          </button>

          {/* Type badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '12px',
              background: selectedCase.color + '22',
              color: selectedCase.color,
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            {selectedCase.type}
          </div>

          <h2
            style={{
              color: COLORS.textPrimary,
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '4px',
              lineHeight: 1.3,
            }}
          >
            {selectedCase.label}
          </h2>

          <div
            style={{
              color: selectedCase.color,
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {selectedCase.pattern}
          </div>

          {/* Metadata */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              fontSize: '12px',
              color: COLORS.textSecondary,
            }}
          >
            <span>
              Ring:{' '}
              {typeof selectedCase.ring === 'number'
                ? selectedCase.ring
                : 'Trajectory'}
            </span>
            <span>Quadrant: {selectedCase.quadrant}</span>
          </div>

          {/* One-liner quote */}
          <blockquote
            style={{
              borderLeft: `3px solid ${selectedCase.color}`,
              paddingLeft: '14px',
              margin: '0 0 20px 0',
              fontStyle: 'italic',
              color: COLORS.textPrimary,
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            "{selectedCase.oneLiner}"
          </blockquote>

          {/* Description */}
          <p
            style={{
              color: COLORS.textSecondary,
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            {selectedCase.description}
          </p>

          {/* Arc indicator */}
          {selectedCase.arrowTo && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                background:
                  selectedCase.arrowType === 'deterioration'
                    ? COLORS.deterioration + '15'
                    : COLORS.recovery + '15',
                borderLeft: `3px solid ${
                  selectedCase.arrowType === 'deterioration'
                    ? COLORS.deterioration
                    : COLORS.recovery
                }`,
                borderRadius: '0 6px 6px 0',
                fontSize: '12px',
                color:
                  selectedCase.arrowType === 'deterioration'
                    ? COLORS.deterioration
                    : COLORS.recovery,
                fontWeight: 600,
              }}
            >
              {selectedCase.arrowType === 'deterioration'
                ? `\u2192 Deteriorates to ${
                    caseStudies.find((c) => c.id === selectedCase.arrowTo)
                      ?.label
                  } \u2014 ${selectedCase.arrowLabel}`
                : `\u2192 Recovers to ${
                    caseStudies.find((c) => c.id === selectedCase.arrowTo)
                      ?.label
                  }`}
            </div>
          )}
          {selectedCase.arrowFrom && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: COLORS.deterioration + '15',
                borderLeft: `3px solid ${COLORS.deterioration}`,
                borderRadius: '0 6px 6px 0',
                fontSize: '12px',
                color: COLORS.deterioration,
                fontWeight: 600,
              }}
            >
              {`\u2190 Deteriorated from ${
                caseStudies.find((c) => c.id === selectedCase.arrowFrom)?.label
              } (17 years)`}
            </div>
          )}

          {/* Link to full case study */}
          {getCaseStudyPath(selectedCase.id) && (
            <Link
              to={getCaseStudyPath(selectedCase.id)!}
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '8px 16px',
                background: selectedCase.color + '22',
                color: selectedCase.color,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                border: `1px solid ${selectedCase.color}44`,
              }}
            >
              Read Full Case Study
            </Link>
          )}
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// Map case study IDs to their route paths
function getCaseStudyPath(id: number): string | null {
  const paths: Record<number, string> = {
    1: '/mindset/case-studies/wei-zhongxian-tianqi',
    2: '/mindset/case-studies/sejanus-tiberius',
    3: '/mindset/case-studies/qin-hui-gaozong',
    4: '/mindset/case-studies/rasputin-romanovs',
    5: '/mindset/case-studies/al-mansur-hisham',
    6: '/mindset/case-studies/fouche-napoleon',
    7: '/mindset/case-studies/zhou-mao',
    14: '/mindset/case-studies/zhou-mao',
    8: '/mindset/case-studies/cecil-elizabeth',
    9: '/mindset/case-studies/wei-zheng-taizong',
    10: '/mindset/case-studies/seward-lincoln',
    11: '/mindset/case-studies/lennon-mccartney',
    12: '/mindset/case-studies/wozniak-jobs',
    13: '/mindset/case-studies/aobai-kangxi',
  }
  return paths[id] ?? null
}
