import { TopicInfo } from '../types';

export const TOPICS: TopicInfo[] = [
  {
    id: 'stellenwert',
    title: 'Stellenwerttafel & Große Zahlen',
    subTitle: 'Zahlen bis 1.000.000, Zehntausender & Hunderttausender',
    category: 'Arithmetik',
    iconName: 'Hash',
    order: 1,
    unlockedStarsRequired: 0,
    description: 'Verstehe den Aufbau großer Zahlen mit E, Z, H, T, ZT, HT, M. Genau wie Zuschauerzahlen im Stadion!',
    standardFormula: '1 Million = 10 HT = 100 ZT = 1.000 T'
  },
  {
    id: 'runden',
    title: 'Runden & Überschlag',
    subTitle: 'Zahlen schätzen und blitzschnell im Kopf überschlagen',
    category: 'Arithmetik',
    iconName: 'Calculator',
    order: 2,
    unlockedStarsRequired: 1,
    description: 'Abrunden bei 0, 1, 2, 3, 4 – Aufrunden bei 5, 6, 7, 8, 9. Wichtig für schnelle Rechnungen!',
    standardFormula: 'Ab 5 aufrunden, unter 5 abrunden'
  },
  {
    id: 'schriftlich_plus_minus',
    title: 'Schriftliche Addition & Subtraktion',
    subTitle: 'Rechnen in der Tabelle mit Übertrag',
    category: 'Arithmetik',
    iconName: 'PlusSquare',
    order: 3,
    unlockedStarsRequired: 2,
    description: 'Einer unter Einer, Zehner unter Zehner. Vergiss den Übertrag nicht!',
    standardFormula: 'Summand + Summand = Summe | Minuend - Subtrahend = Differenz'
  },
  {
    id: 'schriftlich_mal',
    title: 'Schriftliche Multiplikation',
    subTitle: 'Große Zahlen multiplizieren & Punkt vor Strich',
    category: 'Arithmetik',
    iconName: 'XSquare',
    order: 4,
    unlockedStarsRequired: 4,
    description: 'Stelle für Stelle multiplizieren und am Ende addieren.',
    standardFormula: 'Faktor · Faktor = Produkt'
  },
  {
    id: 'schriftlich_geteilt',
    title: 'Schriftliche Division mit Rest',
    subTitle: 'Schrittweises Teilen und Restbestimmung',
    category: 'Arithmetik',
    iconName: 'DivideSquare',
    order: 5,
    unlockedStarsRequired: 6,
    description: 'Wie oft passt die Zahl hinein? Teilen, multiplizieren, abziehen, nächste Ziffer holen!',
    standardFormula: 'Dividend : Divisor = Quotient'
  },
  {
    id: 'groessen_laengen',
    title: 'Größen: Längenmaße',
    subTitle: 'mm, cm, dm, m und km sicher umrechnen',
    category: 'Größen',
    iconName: 'Ruler',
    order: 6,
    unlockedStarsRequired: 8,
    description: 'Spielfeldlängen, Laufdistanzen von Fußballstars und Schuhgrößen berechnen.',
    standardFormula: '1 km = 1.000 m | 1 m = 100 cm | 1 cm = 10 mm'
  },
  {
    id: 'groessen_gewichte_geld',
    title: 'Größen: Gewichte & Geld',
    subTitle: 'Gramm, Kilogramm, Tonnen sowie Euro & Cent',
    category: 'Größen',
    iconName: 'Coins',
    order: 7,
    unlockedStarsRequired: 10,
    description: 'Ticketpreise, Trikotkosten und das Gewicht der Trainingsausrüstung.',
    standardFormula: '1 t = 1.000 kg | 1 kg = 1.000 g | 1 € = 100 ct'
  },
  {
    id: 'groessen_zeit',
    title: 'Größen: Zeitspannen',
    subTitle: 'Sekunden, Minuten, Stunden und Tage',
    category: 'Größen',
    iconName: 'Clock',
    order: 8,
    unlockedStarsRequired: 12,
    description: 'Spielzeit 90 Minuten, Nachspielzeit, Halbzeitpause und Trainingsdauer berechnen.',
    standardFormula: '1 Tag = 24 h | 1 h = 60 min | 1 min = 60 s'
  },
  {
    id: 'geometrie',
    title: 'Geometrie: Umfang & Fläche',
    subTitle: 'Rechteck, Quadrat, Umfang (U) und Flächeninhalt (A)',
    category: 'Geometrie',
    iconName: 'Box',
    order: 9,
    unlockedStarsRequired: 14,
    description: 'Wie viel Rasen braucht das Stadion? Wie lang ist die weiße Außenlinie?',
    standardFormula: 'U = 2·(a + b) | A = a · b'
  },
  {
    id: 'sachaufgaben_fussball',
    title: 'Bundesliga-Meisterklasse (Sachaufgaben)',
    subTitle: 'Echte Textaufgaben: Frage → Rechnung → Antwort',
    category: 'Sachaufgaben',
    iconName: 'Trophy',
    order: 10,
    unlockedStarsRequired: 16,
    description: 'Löse spannende Sachaufgaben rund um Stadien, Meisterschaft und Transfermarkt!',
    standardFormula: '1. Frage finden → 2. Rechnung aufstellen → 3. Antwortsatz schreiben'
  }
];

export const BUNDESLIGA_CLUBS = [
  { name: 'FC Bayern München', colors: 'from-red-600 to-red-800', stadium: 'Allianz Arena (75.000 Plätze)' },
  { name: 'Borussia Dortmund', colors: 'from-yellow-400 to-amber-600', stadium: 'Signal Iduna Park (81.365 Plätze)' },
  { name: 'Bayer 04 Leverkusen', colors: 'from-red-600 to-black', stadium: 'BayArena (30.210 Plätze)' },
  { name: 'RB Leipzig', colors: 'from-white to-red-600', stadium: 'Red Bull Arena (47.069 Plätze)' },
  { name: 'Eintracht Frankfurt', colors: 'from-red-700 to-zinc-900', stadium: 'Deutsche Bank Park (58.000 Plätze)' },
  { name: 'VfB Stuttgart', colors: 'from-white to-red-500', stadium: 'MHP Arena (60.058 Plätze)' }
];
