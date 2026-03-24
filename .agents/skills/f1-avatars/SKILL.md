---
name: "F1 Driver Avatars"
description: "Fetch F1 driver photos from Sky Sports and save them as season avatars"
alwaysAllow: ["Bash", "WebFetch", "Write"]
---

# F1 Driver Avatars

Download driver headshot photos from Sky Sports and save them to `public/images/avatars/{year}/` for use in the app.

## Data Source

**URL:** `https://www.skysports.com/f1/drivers-teams`

This page lists all current-season F1 drivers grouped by team. Each driver has a 256×256 PNG headshot hosted on `365dm.com` (Sky's CDN), with URLs like:

```
https://e0.365dm.com/f1/drivers/256x256/h_full_1465.png
```

## Step-by-step process

### 1. Fetch driver data

Use `WebFetch` to scrape the Sky Sports page:

```
WebFetch(
  url: "https://www.skysports.com/f1/drivers-teams",
  prompt: "Extract ALL drivers. For each driver return: full name (first + last), team name, and the full image URL (from 365dm.com). List every driver."
)
```

### 2. Determine the season year

Use the current year. The Sky Sports page always shows the current season's drivers.

### 3. Generate 3-letter codes

Apply the **FIA convention**: take the **first 3 letters of the driver's last name**, uppercased.

Examples:
- Verstappen → `VER`
- Hamilton → `HAM`
- Leclerc → `LEC`
- Norris → `NOR`
- Antonelli → `ANT`
- Bortoleto → `BOR`
- Colapinto → `COL`
- Lindblad → `LIN`

### 4. Create the season directory

```bash
mkdir -p public/images/avatars/{year}
```

### 5. Download all images

Use `curl` to download each driver image:

```bash
curl -sL "https://e0.365dm.com/f1/drivers/256x256/h_full_1465.png" -o "public/images/avatars/2026/VER.png"
```

Download all images in a single bash command for efficiency (use `&&` or a loop).

### 6. Present results for verification

After downloading, list all files with their driver mapping in a table so the user can verify the 3-letter codes are correct. Format:

| Code | Driver | Team | File |
|------|--------|------|------|
| VER | Max Verstappen | Red Bull | public/images/avatars/2026/VER.png |
| ... | ... | ... | ... |

Highlight any **new drivers** (not present in the previous season's folder) and any **removed drivers** (present in previous season but not current).

## Important notes

- The 3-letter code convention (first 3 of last name) is a default. The user will verify and correct any exceptions manually.
- Images are PNG format, 256×256 pixels.
- The app references avatars via `/images/avatars/{season}/{id}.png` where `id` is the 3-letter code from the F1 TV API's `driverStream.title` field.
- For historical seasons, Web Archive snapshots of the Sky Sports page were used. The archive URL format is: `https://web.archive.org/web/{timestamp}im_/{original_url}`
