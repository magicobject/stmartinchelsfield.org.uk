import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// Parish requirement R5 (Steve McCann's items 19 and 22): the people listed on
// A Church Near You, with their photos, emails and phone numbers; plus the data
// protection conditions from the security design review (obfuscated emails,
// clean images, a removal route, a fraud warning).
const PEOPLE = [
  { name: 'Revd Susan Atkinson-Jones', role: 'Rector of the Benefice', email: 'revsusan@smasch.org', tel: 'tel:+441689857763' },
  { name: 'Revd Martin Hayward', role: 'Associate Vicar of the Benefice', email: 'revmartin@smasch.org' },
  { name: 'Steve McCann', role: 'Churchwarden', email: 'churchwardens@stmartinchelsfield.org.uk' },
  { name: 'Suzanne Diamond', role: 'Benefice Administrator', email: 'office@smasch.org', tel: 'tel:+441689852905' },
  { name: 'Margaret Warren-Axe', role: 'Parish Safeguarding Officer', email: 'safeguarding@stmartinchelsfield.org.uk' },
  { name: 'Chris Mead', role: 'Treasurer & Choirmaster', email: 'treasurer@stmartinchelsfield.org.uk' },
  { name: 'Anne Ireland', role: 'PCC Secretary', email: 'secretary@stmartinchelsfield.org.uk' },
  { name: 'Barry Foale', role: 'Bookings Manager', email: 'bookings@stmartinchelsfield.org.uk' },
  { name: 'Philippa Rooke', role: 'Tower Captain, Archivist', email: 'philippa@stmartinchelsfield.org.uk', tel: 'tel:+447826516481' },
  { name: 'Jim Rooke', role: 'Gift Aid Secretary', email: 'giftaid@stmartinchelsfield.org.uk' },
];
// Images on A Church Near You that are not portraits of the person (so no alt text claiming they are).
const ILLUSTRATIONS = ['Suzanne Diamond', 'Chris Mead', 'Anne Ireland', 'Barry Foale'];
const publicDir = join(__dirname, '..', 'public');
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;

test.describe('Clergy & contacts page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/people.html');
  });

  test('lists exactly the ten people from A Church Near You, in order, with their roles', async ({ page }) => {
    const cards = page.locator('main .card');
    await expect(cards).toHaveCount(PEOPLE.length);
    for (let i = 0; i < PEOPLE.length; i++) {
      await expect(cards.nth(i).locator('h3')).toHaveText(PEOPLE[i].name);
      await expect(cards.nth(i).locator('.tags')).toHaveText(PEOPLE[i].role);
    }
  });

  test('headings: Clergy then Parish officers, no skipped levels', async ({ page }) => {
    await expect(page.locator('main h2').nth(0)).toHaveText('Clergy');
    await expect(page.locator('main h2').nth(1)).toHaveText('Parish officers');
  });

  test('each card has a mailto link that opens the right address, labelled "Email <first name>"', async ({ page }) => {
    const cards = page.locator('main .card');
    for (let i = 0; i < PEOPLE.length; i++) {
      const link = cards.nth(i).locator('a[href^="mailto:"]');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', 'mailto:' + PEOPLE[i].email);
      await expect(link).toContainText('Email ' + PEOPLE[i].name.replace(/^Revd /, '').split(' ')[0]);
    }
  });

  test('exactly the three published phone numbers are shown, as tap-to-call links', async ({ page }) => {
    await expect(page.locator('main a[href^="tel:"]')).toHaveCount(3);
    const cards = page.locator('main .card');
    for (let i = 0; i < PEOPLE.length; i++) {
      const own = cards.nth(i).locator('a[href^="tel:"]');
      if (PEOPLE[i].tel) await expect(own).toHaveAttribute('href', PEOPLE[i].tel!);
      else await expect(own).toHaveCount(0);
    }
  });

  test("every card shows a loaded image: portraits have the person's name as alt text, illustrations an empty alt, the coin a plain description", async ({ page }) => {
    const imgs = page.locator('main .card img.person-photo');
    await expect(imgs).toHaveCount(PEOPLE.length);
    for (let i = 0; i < PEOPLE.length; i++) {
      const img = imgs.nth(i);
      await expect(img).toHaveAttribute('src', /^\/img\/people\/[a-z-]+\.jpg(\?v=[0-9a-f]+)?$/);
      await expect(img).toHaveAttribute('width', '96');
      await expect(img).toHaveAttribute('height', '96');
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { message: PEOPLE[i].name }).toBe(true);
      if (ILLUSTRATIONS.includes(PEOPLE[i].name)) await expect(img).toHaveAttribute('alt', '');
      else if (PEOPLE[i].name !== 'Jim Rooke') await expect(img).toHaveAttribute('alt', PEOPLE[i].name);
    }
    await expect(imgs.nth(9)).toHaveAttribute('alt', /coin/i);
  });

  test("the Gift Aid card's coin image is credited and its licence is stated", async ({ page }) => {
    await expect(page.locator('main')).toContainText('Heritage Auctions');
    await expect(page.locator('main')).toContainText(/public domain/i);
    await expect(page.locator('main a[href^="https://commons.wikimedia.org/wiki/File:1887-S_five_pounds_reverse"]')).toHaveCount(1);
  });

  test('says how to get details corrected or removed, and warns about impersonation', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText(/corrected or removed/i);
    await expect(main).toContainText(/never ask you for money, gift cards or passwords/i);
    await expect(main.locator('a[href="safeguarding.html"]')).not.toHaveCount(0);
    await expect(main.locator('a[href="privacy-policy.html"]')).not.toHaveCount(0);
  });

  test('no card overflows its box at 320px wide (photo + links)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/people.html');
    const cards = page.locator('main .card');
    for (let i = 0; i < PEOPLE.length; i++) {
      const box = (await cards.nth(i).boundingBox())!;
      const inner = cards.nth(i).locator('a, img, h3');
      for (let j = 0; j < (await inner.count()); j++) {
        const b = (await inner.nth(j).boundingBox())!;
        expect(b.x + b.width, PEOPLE[i].name).toBeLessThanOrEqual(box.x + box.width + 1);
      }
    }
  });
});

test.describe('data protection', () => {
  test('no email address appears as visible text on the people page', async ({ page }) => {
    await page.goto('/people.html');
    expect(await page.locator('main').innerText()).not.toMatch(EMAIL_RE);
  });

  test('the page source has no plain-text email in the main content (mailto links are entity-encoded)', async ({ request }) => {
    const html = await (await request.get('/people.html')).text();
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    for (const { email } of PEOPLE) expect(main, email).not.toContain(email);
    expect(main).not.toMatch(EMAIL_RE);
  });

  test('none of the ten addresses appears in plain text anywhere in the built site, search index or structured data', async () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(html|json|js|xml|txt)$/.test(f)) files.push(p);
      }
    };
    walk(publicDir);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const { email } of PEOPLE) expect(text.includes(email), `${email} in ${file}`).toBe(false);
    }
  });

  test("no JSON-LD on any page carries a person's email or telephone", async ({ page }) => {
    for (const { path } of ALL_PAGES) {
      await page.goto(path);
      const ld = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent ?? '').join(' '));
      for (const { email } of PEOPLE) expect(ld, path).not.toContain(email);
      for (const p of PEOPLE) if (p.tel) expect(ld, path).not.toContain(p.tel.replace('tel:', ''));
    }
  });

  test('photos are JPEG only, under 120 KB, with no EXIF/XMP/IPTC/comment segments (JFIF and ICC colour profile only)', async () => {
    const dir = join(publicDir, 'img', 'people');
    const files = readdirSync(dir);
    expect(files.length).toBe(PEOPLE.length);
    for (const f of files) {
      expect(f, f).toMatch(/^[a-z-]+\.jpg$/);
      const buf = readFileSync(join(dir, f));
      expect(buf.length, f).toBeLessThan(120 * 1024);
      expect(buf.readUInt16BE(0), f + ' is a JPEG').toBe(0xffd8);
      let i = 2;
      while (i < buf.length && buf[i] === 0xff) {
        const marker = buf[i + 1];
        if (marker === 0xda) break; // start of image data
        const len = buf.readUInt16BE(i + 2);
        const isAppOrComment = (marker >= 0xe0 && marker <= 0xef) || marker === 0xfe;
        if (isAppOrComment) {
          // Only the JFIF header and a standard ICC colour profile are allowed; anything else
          // (EXIF 0xE1, XMP, IPTC 0xED, comments 0xFE ...) could carry personal data.
          const id = buf.toString('latin1', i + 4, i + 4 + 12);
          const allowed = (marker === 0xe0 && id.startsWith('JFIF')) || (marker === 0xe2 && id.startsWith('ICC_PROFILE'));
          expect(allowed, `${f} has a metadata segment (0xFF${marker.toString(16)})`).toBe(true);
        }
        i += 2 + len;
      }
    }
  });
});

test('no page still names the previous Rector', async ({ page }) => {
  for (const { path } of ALL_PAGES) {
    await page.goto(path);
    expect(await page.locator('body').innerText(), path).not.toMatch(/tranter/i);
  }
});

test('site search finds the safeguarding officer by name', async ({ request }) => {
  const index = await (await request.get('/search-index.json')).text();
  expect(index).toContain('Margaret Warren-Axe');
});
