// Single source of truth for the Gallery page. Add one entry per photo; the page
// (src/pages/gallery.html, via the {{GALLERY}} token — see scripts/build.mjs and
// scripts/render-gallery.mjs) picks it up on the next build.
//
// Empty for now: the parish has not yet supplied photographs (Oct 2026), and the
// page says so plainly instead of showing an empty grid.
//
// To add a photo:
//   1. Put the file in public/img/gallery/ (JPEG or WebP, ideally under 300 KB and no wider than
//      about 1600 pixels; resize it first, and strip hidden metadata such as GPS location).
//   2. Add an entry below. `alt` is REQUIRED and must say what the photo shows, for people who
//      cannot see it ("The south porch in snow", not "photo1.jpg"). `width` and `height` are the
//      image's size in pixels. `caption` and `credit` are optional.
//   3. Run `npm run build`; it fails (rather than publishing a bad entry) if anything is missing.
//
// Before publishing, make sure the parish has permission to use each photo, and the people in it.
// Don't publish identifiable photographs of children without a parent's or carer's consent.
export const GALLERY_PHOTOS = [
  // { file: 'south-porch-snow.jpg', alt: 'The south porch of the church covered in snow', width: 1200, height: 800, caption: 'The south porch, January', credit: 'Photo: A. Parishioner' },
];
