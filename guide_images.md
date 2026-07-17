# Glossary Image Guide

Use images in the glossary only where they clarify physical equipment, wiring flow, billing flow, or installation decisions. Avoid decorative images for every term.

## Recommended Asset Structure

Add glossary images under:

```txt
public/images/glossary/
```

Reference them from MDX with the `/book` base path:

```md
![Solar system flow from panels to inverter to home and grid](/book/images/glossary/solar-system-flow.webp)
```

## Priority Images

Create a small, consistent set of diagrams:

- `solar-system-flow.webp`: panels to inverter to home to grid
- `panel-vs-cell.webp`: panel made of many cells
- `string-vs-microinverter.webp`: central inverter compared with panel-level inverters
- `roof-attachment-flashing.webp`: mount, flashing, roof surface, and rafter
- `main-panel-breaker.webp`: main service panel, breaker, and solar connection
- `net-metering-flow.webp`: home usage, exported power, and bill credits
- `battery-critical-loads.webp`: battery feeding selected essential circuits
- `quote-cost-breakdown.webp`: gross cost, incentives, financing, and net estimate

Add a smaller set of real-world photos where they help homeowners recognize
equipment:

- `roof-solar-array-photo.webp`: residential rooftop solar array
- `electric-meter-photo.webp`: utility meter near a home
- `battery-wall-photo.webp`: wall-mounted home battery
- `service-panel-photo.webp`: residential electrical service panel

## Pixabay Workflow

Pixabay is a good source for public glossary photos, especially for equipment
recognition. Use it for photos of panels, rooftops, meters, batteries, service
panels, and installation scenes. Do not use it for abstract concepts like net
metering, AC/DC flow, incentives, or quote math; diagrams are clearer for those.

Keep the API key out of the repository. Store it in your shell or local
environment:

```sh
export PIXABAY_API_KEY="your-key"
```

Search with focused terms and safe image settings:

```sh
curl "https://pixabay.com/api/?key=$PIXABAY_API_KEY&q=residential+solar+panels&image_type=photo&orientation=horizontal&safesearch=true&per_page=10"
```

Useful search terms:

- `residential solar panels`
- `solar panels roof`
- `home battery storage`
- `electric meter house`
- `electrical panel breaker`
- `solar installer roof`
- `solar inverter`

Selection rules:

- Prefer photos that show the actual object clearly, not dramatic sunsets or
  generic stock scenes.
- Prefer horizontal images for section-level glossary placement.
- Avoid photos where equipment is too distant, cropped, blocked by text, or
  visually misleading.
- Check the Pixabay license and attribution requirements before publishing.
- Save only the final chosen and compressed assets in `public/images/glossary/`.

Download the chosen `largeImageURL` or `webformatURL`, then convert and compress
to WebP:

```sh
magick input.jpg -resize 1600x -strip -quality 82 public/images/glossary/roof-solar-array-photo.webp
```

If ImageMagick is unavailable, use `cwebp`, Squoosh, or another WebP optimizer.

## Format Guidance

- Use SVG for hand-authored diagrams when practical.
- Use WebP for photos or generated bitmap diagrams.
- Use PNG only when screenshots or sharp transparency need it.
- Keep full-width images around 1600px wide.
- Compress images and avoid files over 300 KB unless there is a clear reason.

## Placement

Place images at section level, not after every term.

Example:

```md
## Solar Equipment

![Diagram showing panels, inverter, home loads, and utility grid](/book/images/glossary/solar-system-flow.webp)

**Solar panel**  
A framed module made of solar cells that turns sunlight into direct current electricity.
```

## Accessibility

Every image needs useful alt text that explains the concept, not just the file name.

Good:

```md
![Diagram showing solar panels sending DC power to an inverter, then AC power to the home and utility grid](/book/images/glossary/solar-system-flow.webp)
```

Weak:

```md
![Solar image](/book/images/glossary/solar-system-flow.webp)
```

## Responsive Styling

Use CSS so images work across phones, tablets, and desktops:

```css
.sl-markdown-content img {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  height: auto;
  max-width: 100%;
}
```

## Practical Rule

Prefer 6-8 clear diagrams over many stock photos. Diagrams are usually more useful for homeowners trying to understand equipment, utility billing, and quote language.
