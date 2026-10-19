// Event content. Edit here, the preview hot-reloads.
// Partner logos live in src/assets/logos and are imported with ?inline (data URI), so they are
// embedded in exported SVG/PNG. A partner without logo/wordmark shows a placeholder frame on
// posters (hidden on site).
import ltktLogo from './assets/logos/ltkt.svg?inline'; // official pack: ltkt.lt DUK, black RGB variant
import akcLogo from './assets/logos/anyksciu-kc.png?inline'; // from anyksciukc.lt header

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
    'Adomas Lapinkas',
    'Antanas Stankevičius',
    'Mindaugas Badokas',
    'VNKJS',
  ].map((name) => ({ name })),

  // caption: small line above the logo (LTKT requires "finansuoja" wording next to its logo)
  partnersLabel: 'Partneriai',
  partners: [
    { name: 'Lietuvos kultūros taryba', logo: ltktLogo, url: 'https://www.ltkt.lt', caption: 'Projektą finansuoja' },
    { name: 'Anykščių kultūros centras', logo: akcLogo, url: 'https://www.anyksciukc.lt' },
    // no logo files yet: name set as a wordmark (font = key from fonts.js, spacing in em)
    { name: 'STRUCTURUM', wordmark: { font: 'michroma', weight: 400, spacing: 0.12 } },
    { name: '3022', wordmark: { font: 'unbounded', weight: 800, spacing: 0.02 } },
  ],
};
