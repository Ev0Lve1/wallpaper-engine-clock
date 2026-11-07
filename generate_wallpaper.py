from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont


TEXT = "我以智取胜，轻轻松松就赢了你"


def pick_font() -> str:
    candidates = [
        r"C:\Windows\Fonts\simhei.ttf",
        r"C:\Windows\Fonts\msyhbd.ttc",
        r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simsun.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            return path
    raise FileNotFoundError("No suitable Chinese font found.")


def main() -> None:
    cwd = Path.cwd()
    source = cwd / "微信图片_20250731092713.jpg"
    output = cwd / "wallpaper_glow_particles.png"

    image = Image.open(source).convert("RGBA")
    width, height = image.size

    font_path = pick_font()
    font_size = max(44, width // 25)
    font = ImageFont.truetype(font_path, font_size, encoding="unic")
    drawer = ImageDraw.Draw(image)
    left, top, right, bottom = drawer.textbbox((0, 0), TEXT, font=font)
    text_width = right - left
    while text_width > width * 0.80:
        font_size -= 2
        font = ImageFont.truetype(font_path, font_size, encoding="unic")
        left, top, right, bottom = drawer.textbbox((0, 0), TEXT, font=font)
        text_width = right - left
    text_height = bottom - top

    x = (width - text_width) // 2
    y = int(height * 0.05)

    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))

    panel = Image.new("RGBA", image.size, (0, 0, 0, 0))
    panel_draw = ImageDraw.Draw(panel)
    panel_draw.rounded_rectangle(
        [x - 42, y - 20, x + text_width + 42, y + text_height + 26],
        radius=24,
        fill=(0, 10, 22, 176),
    )
    overlay.alpha_composite(panel.filter(ImageFilter.GaussianBlur(13)))

    for blur, alpha in [(4, 110), (9, 90), (18, 62), (30, 36)]:
        glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        glow_draw.text((x, y), TEXT, font=font, fill=(85, 228, 255, alpha))
        overlay.alpha_composite(glow.filter(ImageFilter.GaussianBlur(blur)))

    text_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_layer)
    text_draw.text((x, y), TEXT, font=font, fill=(195, 249, 255, 255))
    text_draw.text((x - 1, y - 1), TEXT, font=font, fill=(255, 255, 255, 120))
    text_draw.text((x + 1, y + 1), TEXT, font=font, fill=(80, 220, 255, 92))
    overlay.alpha_composite(text_layer)

    shine = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shine_draw = ImageDraw.Draw(shine)
    for index in range(5):
        alpha = max(0, 88 - index * 16)
        shine_draw.rectangle(
            [x - 10, y - 4 + index, x + text_width + 10, y + text_height * 0.42 + index],
            fill=(255, 255, 255, alpha),
        )
    overlay.alpha_composite(shine.filter(ImageFilter.GaussianBlur(8)))

    particles = Image.new("RGBA", image.size, (0, 0, 0, 0))
    particle_draw = ImageDraw.Draw(particles)
    random.seed(21)
    for _ in range(120):
        px = random.randint(max(0, x - 90), min(width - 1, x + text_width + 90))
        py = random.randint(max(0, y - 28), min(height - 1, y + text_height + 36))
        radius = random.uniform(1.2, 3.0)
        color = random.choice([(95, 235, 255), (155, 245, 255), (88, 210, 255)])
        alpha = random.randint(45, 110)
        particle_draw.ellipse([px - radius, py - radius, px + radius, py + radius], fill=(*color, alpha))

    overlay.alpha_composite(particles.filter(ImageFilter.GaussianBlur(3)))
    overlay.alpha_composite(particles)

    final_image = Image.alpha_composite(image, overlay).convert("RGB")
    final_image.save(output, quality=95)
    print(output)


if __name__ == "__main__":
    main()
