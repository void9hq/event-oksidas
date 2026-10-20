// Event content. Edit here, the preview hot-reloads.
// Partner logos live in src/assets/logos and are imported with ?inline (data URI), so they are
// embedded in exported SVG/PNG. A partner without logo/wordmark shows a placeholder frame on
// posters (hidden on site).
import ltktLogo from './assets/logos/ltkt.svg?inline'; // official pack: ltkt.lt DUK, black RGB variant
import akcLogo from './assets/logos/anyksciu-kc.png?inline'; // from anyksciukc.lt header
import ltktLogoEn from './assets/logos/ltkt-en.svg?inline'; // same pack, English version

export const event = {
  title: 'OKSIDAS',
  subtitle: 'Muzikos technologijų dirbtuvės',

  organizer: 'VOID9',
  presents: 'pristato',

  date: '2026-10-24',
  price: 'Nemokamai', // shown after the date in the header as "// NEMOKAMAI"; '' hides it
  time: '', // e.g. '12:00–18:00' — shown next to weekday when set
  whenLabel: 'Kada',
  whereLabel: 'Kur',
  venue: 'Anykščių kultūros centras',
  city: 'Anykščiai, Lietuva',

  // names only; 6–8 fit all layouts, list fills column by column
  speakersLabel: 'Pranešėjai',
  speakers: [
    'Mikalojus Smulskis',
    'Tadas Dailyda',
    'Ignas Andriuškevičius',
    'Gabrielius Klemas',
    'Ugnė Skaisgirė',
    'Antanas Stankevičius',
    'Mindaugas Badokas',
    'VNKJS',
  ].map((name) => ({ name })),

  // caption: small line above the logo (LTKT requires "finansuoja" wording next to its logo)
  partnersLabel: 'Partneriai',
  partners: [
    { name: 'Lietuvos kultūros taryba', logo: ltktLogo, url: 'https://www.ltkt.lt', caption: 'Projektą finansuoja' },
    { name: 'Anykščių kultūros centras', logo: akcLogo, url: 'https://www.anyksciukc.lt' },
    // no logo files yet: name set as a wordmark (font = key from fonts.js, spacing in em,
    // lines = stacked left-aligned block)
    { name: 'STRUCTURUM', wordmark: { font: 'saira', weight: 400, spacing: 0.04, lines: ['STRUC', 'TURUM'] } },
    { name: '3022', wordmark: { font: 'unbounded', weight: 800, spacing: 0.02 } },
  ],
};

// English copy for the Instagram carousel. Speakers, date and partner order come from `event`,
// only the words are overridden, so edits above carry over.
const PARTNERS_EN = {
  'Lietuvos kultūros taryba': { name: 'Lithuanian Council for Culture', logo: ltktLogoEn, caption: 'Project funded by' },
  'Anykščių kultūros centras': { name: 'Anykščiai Cultural Centre' },
};
const EXCLUDE_EN = ['STRUCTURUM'];

export const eventEn = {
  ...event,
  locale: 'en-GB', // weekday name
  subtitle: 'Music & technology weekend',
  presents: 'presents',
  price: 'Free entry',
  whenLabel: 'When',
  whereLabel: 'Where',
  venue: 'Anykščiai Cultural Centre',
  city: 'Anykščiai, Lithuania',
  speakersLabel: 'Speakers',
  partnersLabel: 'Partners',
  registerLabel: 'Register',
  // speakers slide: deliberate "bad design" joke, this name is clipped as if its text box was
  // too narrow. keep = visible part. Remove to show the full name.
  speakerCut: { name: 'Mindaugas Badokas', keep: 'Mindaugas Ba' },
  // line under the speakers on the carousel; remove to hide
  speakersExtra: { main: 'Private workshops & afterparty', place: 'Saugus atstumas, Mackeliškiai' },
  url: 'oksidas.void9.com',
  // carousel shows three partners; STRUCTURUM stays on the Lithuanian posters and site
  partners: event.partners
    .filter((p) => !EXCLUDE_EN.includes(p.name))
    .map((p) => ({ ...p, ...PARTNERS_EN[p.name] })),
};
