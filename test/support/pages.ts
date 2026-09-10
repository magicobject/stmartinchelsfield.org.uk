// Single source of truth for what each page in the main nav should look
// like. Used across specs so a new page only needs an entry added here.
export interface SitePage {
  path: string;
  navLabel: string;
  titleContains: string;
  heading: RegExp;
  hasHeader?: boolean;
}

// The homepage isn't in NAV_PAGES below: the brand link in the header
// already goes here, so it has no link of its own in the primary nav.
export const HOME_PAGE: SitePage = {
  path: '/index.html',
  navLabel: 'Home',
  titleContains: 'St Martin of Tours, Chelsfield',
  heading: /a medieval church, still at the heart of chelsfield/i,
};

export const NAV_PAGES: SitePage[] = [
  { path: '/about.html', navLabel: 'History', titleContains: 'History', heading: /history & architecture/i },
  { path: '/visit-us.html', navLabel: 'Visit Us', titleContains: 'Visit Us', heading: /visit us/i },
  { path: '/services.html', navLabel: 'Services', titleContains: 'Services', heading: /services/i },
  { path: '/calendar.html', navLabel: 'Calendar', titleContains: 'Calendar', heading: /what's on/i },
  { path: '/get-involved.html', navLabel: 'Groups & Activities', titleContains: 'Groups & Activities', heading: /groups & activities/i },
  { path: '/newsletter.html', navLabel: 'Newsletter', titleContains: 'Newsletter', heading: /newsletter/i },
  { path: '/people.html', navLabel: 'Clergy & Contacts', titleContains: 'Clergy & Contacts', heading: /clergy & contacts/i },
  { path: '/contact.html', navLabel: 'Contact', titleContains: 'Contact', heading: /get in touch/i },
];

export const SAFEGUARDING_PAGE: SitePage = {
  path: '/safeguarding.html',
  navLabel: 'Safeguarding',
  titleContains: 'Safeguarding',
  heading: /safeguarding, care and nurture/i,
};

export const NEWSLETTER_ARCHIVE_PAGE: SitePage = {
  path: '/newsletter-archive.html',
  navLabel: 'Newsletter Archive',
  titleContains: 'Newsletter Archive',
  heading: /newsletter archive/i,
};

export const PRIVACY_POLICY_PAGE: SitePage = {
  path: '/privacy-policy.html',
  navLabel: 'Privacy Policy',
  titleContains: 'Privacy Policy',
  heading: /privacy policy/i,
};

export const DONATE_PAGE: SitePage = {
  path: '/donate.html',
  navLabel: 'Donate',
  titleContains: 'Donate',
  heading: /support st martin's/i,
};

export const UPDATES_PAGE: SitePage = {
  path: '/updates.html',
  navLabel: 'Updates',
  titleContains: 'Site Updates',
  heading: /site updates/i,
};

export const HELP_PAGES: SitePage[] = [
  { path: '/help.html', navLabel: 'Help', titleContains: 'Help', heading: /how to update this website/i },
  { path: '/help-getting-set-up.html', navLabel: 'Getting set up', titleContains: 'Setting Up Your Laptop', heading: /setting up your laptop/i },
  { path: '/help-making-a-change.html', navLabel: 'Making a change', titleContains: 'Making a Change', heading: /making a change/i },
  { path: '/help-technical-details.html', navLabel: 'Technical details', titleContains: 'Technical Details', heading: /technical details/i },
  { path: '/help-when-it-goes-wrong.html', navLabel: 'When it goes wrong', titleContains: 'When It Goes Wrong', heading: /when something goes wrong/i },
];

export const ALL_PAGES: SitePage[] = [HOME_PAGE, ...NAV_PAGES, SAFEGUARDING_PAGE, NEWSLETTER_ARCHIVE_PAGE, PRIVACY_POLICY_PAGE, DONATE_PAGE, UPDATES_PAGE, ...HELP_PAGES];
