# Hertzz the Coyote – Landing Page

A simple responsive landing page for **Hertzz** that features:
- A dynamic HTML `<canvas>` background with shapes
- Links loaded from a `socials.txt` file
- A sticky footer
- Ubuntu font usage
- Click-and-hold momentum boost for the shapes

## Structure

- **index.html** – Main entry point (HTML structure, canvas, layout).
- **css/style.css** – Styles for layout, fonts, colors, etc.
- **script/scripts.js** – JavaScript for:
  - Loading social links.
  - Animated canvas background.
  - Click-and-hold momentum logic.
- **socials.txt** – Comma-separated lines: `<icon class>, <title>, <URL>`.
- **img/profile.jpg** – Profile image for Hertzz (optional, or replace with your own).

## Usage

1. **Clone or Download** this repo locally.
2. **Edit `socials.txt`** to include your desired links (Font Awesome icon classes, link title, and URL).
3. **Update `img/profile.jpg`** with your own image (or an external URL in `index.html`).

When you open `index.html` in a browser:
- The background canvas will animate shapes that bounce off walls, repel each other and the mouse, and speed up on click-hold-release.
- Your social links appear in the `#links-container` area.

## Serving the Site Locally

To serve the page locally using Python’s built-in HTTP server, open a terminal in the project folder and run:

'''bash
python3 -m http.server 8000
'''

Then open [http://localhost:8000](http://localhost:8000) in your browser to view the site.

## License


