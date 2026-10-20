// Facts about the business that search engines and AI assistants read.
// They feed the structured data (JSON-LD) on every page, so keep them true.

export const SITE_URL = 'https://www.inthekitchen.is';
export const SITE_NAME = 'In The Kitchen';
export const BOOKING_URL = 'https://tidycal.com/itk/meet-with-jon';
export const EMAIL = 'jon@inthekitchen.is';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jonitkin/';

export const ORGANIZATION_DESCRIPTION =
  'In The Kitchen is a positioning consultancy designed to help B2B technology leaders land the decisions and ideas that create authentic category leadership.';

const ORG_ID = `${SITE_URL}/#organization`;
const PERSON_ID = `${SITE_URL}/#jon-itkin`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const absolute = (path: string) => new URL(path, SITE_URL).href;

export const organization = {
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: absolute('/assets/itk-logo.png'),
  image: absolute('/og/home.png'),
  description: ORGANIZATION_DESCRIPTION,
  email: EMAIL,
  founder: { '@id': PERSON_ID },
  knowsAbout: [
    'B2B positioning',
    'Messaging strategy',
    'Category leadership',
    'Competitive differentiation',
    'Go-to-market strategy',
  ],
  sameAs: [LINKEDIN_URL],
};

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Jon Itkin',
  jobTitle: 'Founder',
  worksFor: { '@id': ORG_ID },
  url: `${SITE_URL}/`,
  image: absolute('/assets/jon-itkin.avif'),
  description:
    'Jon Itkin cut his teeth as a copywriter, strategist, and product marketing leader for companies from Google and Salesforce to early-stage startups.',
  sameAs: [LINKEDIN_URL],
};

export const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  publisher: { '@id': ORG_ID },
};

export const refs = { organization: { '@id': ORG_ID }, person: { '@id': PERSON_ID }, website: { '@id': WEBSITE_ID } };

export function breadcrumbs(items: Array<[name: string, path: string]>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absolute(path),
    })),
  };
}
