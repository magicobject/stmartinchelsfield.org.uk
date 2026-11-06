// Single source of truth for the Gallery page. Add one entry per photo; the page
// (src/pages/gallery.html, via the {{GALLERY}} token — see scripts/build.mjs and
// scripts/render-gallery.mjs) picks it up on the next build.
//
// 14 photos supplied by the parish (Nov 2026; permission from Philippa Rooke, church administrator).
// If the list is ever empty, the page says so plainly instead of showing an empty grid.
//
// To add a photo:
//   1. Put the file in public/img/gallery/ (WebP or JPEG, ideally under 300 KB and no wider than
//      about 1600 pixels; resize it first, and strip hidden metadata such as GPS location).
//   2. Add an entry below. `alt` is REQUIRED and must say what the photo shows, for people who
//      cannot see it ("The south porch in snow", not "photo1.jpg"). `width` and `height` are the
//      image's size in pixels. `caption` and `credit` are optional.
//   3. Run `npm run build`; it fails (rather than publishing a bad entry) if anything is missing.
//
// Before publishing, make sure the parish has permission to use each photo, and the people in it.
// Don't publish identifiable photographs of children without a parent's or carer's consent.
export const GALLERY_PHOTOS = [
  { file: 'st-martin-of-tours-chelsfield-exterior.webp', alt: 'The flint church of St Martin of Tours, Chelsfield, with its shingled spire, seen from the churchyard on a sunny day', width: 1600, height: 900, caption: 'St Martin of Tours, Chelsfield' },
  { file: 'nave-looking-east-towards-chancel-walls.webp', alt: 'The nave looking east towards the chancel, with wooden pews either side of the aisle and memorials on the white walls', width: 1600, height: 738, caption: 'The nave looking east towards the chancel' },
  { file: 'nave-looking-east-towards-chancel-roof.webp', alt: 'The timber roof trusses above the nave, with the aisle and pews below leading to the chancel', width: 738, height: 1600, caption: 'The nave roof, looking east' },
  { file: 'st-john-chapel-from-nave.webp', alt: 'The St John Chapel seen from the nave, with carved wooden screens and a memorial on the wall', width: 1600, height: 974, caption: 'The St John Chapel from the nave' },
  { file: 'st-john-chapel-in-the-early-morning.webp', alt: 'Early morning light through the small window of the St John Chapel, falling on the altar and chairs', width: 903, height: 1600, caption: 'The St John Chapel in the early morning' },
  { file: 'collett-memorial-early-c17th-in-st-john-chapel.webp', alt: 'A carved and painted early 17th-century wall memorial to the Collett family, with kneeling figures, in the St John Chapel', width: 1283, height: 1600, caption: 'The Collett memorial, early C17th, in the St John Chapel' },
  { file: 'central-east-window-by-moira-forsythe.webp', alt: 'The tall central east window, a stained glass figure of Christ in red and pink robes, with a small cross on the altar below', width: 903, height: 1600, caption: 'The central east window, by Moira Forsythe' },
  { file: 'window-of-st-john-the-baptist-by-moira-forsythe.webp', alt: 'Stained glass showing St John the Baptist in a rough tunic holding a long staff, in blue, gold and purple', width: 665, height: 1600, caption: 'The window of St John the Baptist, by Moira Forsythe' },
  { file: 'window-of-st-martin-of-tours-by-veronica-whall.webp', alt: 'Stained glass showing St Martin of Tours on horseback, in deep blue and red', width: 903, height: 1600, caption: 'The window of St Martin of Tours, by Veronica Whall' },
  { file: 'window-of-st-michael-in-memory-of-stewart-miller-hallet-killed-in-wwi.webp', alt: 'A two-light stained glass window showing St Michael in armour, with a lower inscription', width: 1241, height: 1600, caption: 'The window of St Michael, in memory of Stewart Miller-Hallett, killed in the First World War' },
  { file: 'war-memorial.webp', alt: 'The green war memorial board inscribed with the names of those who died in the 1914 to 1918 and 1939 to 1945 wars', width: 520, height: 842, caption: 'The war memorial' },
  { file: 'churchyard-1.webp', alt: 'Blossom on trees above the churchyard, with gravestones and crosses in the grass on a spring day', width: 900, height: 1600, caption: 'The churchyard in spring' },
  { file: 'carpet-of-snowdrops-in-churchyard.webp', alt: 'A carpet of snowdrops among the trees and graves of the churchyard', width: 1600, height: 738, caption: 'A carpet of snowdrops in the churchyard' },
  { file: 'brass-crosby-room.webp', alt: 'The Brass Crosby Room, a bright hall with a wooden floor, large windows and a flint wall', width: 1600, height: 737, caption: 'The Brass Crosby Room' },
];
