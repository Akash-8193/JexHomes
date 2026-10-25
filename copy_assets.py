import shutil
import os
import glob
from PIL import Image

src_brain = r"C:\Users\akkik\.gemini\antigravity-ide\brain\3f6c513d-1a73-45b8-80fc-2d1d93301a0f"
dest_dir = r"d:\Downloads\Ecommerce-Screenshot-Showcase\Ecommerce-Screenshot-Showcase\artifacts\jexhome-store\public\images"

patterns = {
    "cat_men_model*": "cat-men.jpg",
    "cat_women_model*": "cat-women.jpg",
    "cat_kids_model*": "cat-kids.jpg",
    "cat_cushions_sofa*": "cat-cushions.jpg",
    "prod_good_vibes*": "prod-good-vibes.jpg",
    "prod_abstract_tee*": "prod-abstract-tee.jpg",
    "prod_basic_tee*": "prod-basic-tee.jpg",
    "prod_skull_tee*": "prod-skull-tee.jpg",
    "prod_typography_tee*": "prod-typography-tee.jpg",
    "prod_moon_tee*": "prod-moon-tee.jpg",
    "prod_minimal_tee*": "prod-minimal-tee.jpg",
    "prod_oversized_hoodie*": "prod-oversized-hoodie.jpg",
}

for pattern, dest_name in patterns.items():
    matches = glob.glob(os.path.join(src_brain, pattern))
    if matches:
        src_file = matches[0]
        dest_file = os.path.join(dest_dir, dest_name)
        shutil.copyfile(src_file, dest_file)
        print(f"Copied {src_file} -> {dest_file}")
    else:
        print(f"No match for {pattern}")

# Now let's process the high-res reference image for additional views:
im = Image.open(r"d:\Downloads\Ecommerce-Screenshot-Showcase\Ecommerce-Screenshot-Showcase\attached_assets\image_1792922878810.png")

# 1. Dino Kids t-shirt (clean high-res crop)
dino = im.crop((315, 575, 432, 672))
dino_resized = dino.resize((480, 480), Image.Resampling.LANCZOS)
dino_resized.save(os.path.join(dest_dir, "prod-dino-kids.png"))

# 2. Graphic Art t-shirt
graphic = im.crop((455, 575, 572, 672))
graphic_resized = graphic.resize((480, 480), Image.Resampling.LANCZOS)
graphic_resized.save(os.path.join(dest_dir, "prod-graphic-art.png"))

# 3. Product detail thumbnails from Screen 3
# Thumbs at top-right (x: ~725 to 748, y: ~75 to 290)
# Zoom detail thumb:
zoom_thumb = im.crop((727, 120, 747, 160))
zoom_resized = zoom_thumb.resize((480, 480), Image.Resampling.LANCZOS)
zoom_resized.save(os.path.join(dest_dir, "prod-good-vibes-detail.png"))

# Model front thumb:
model_front = im.crop((727, 215, 747, 255))
mf_resized = model_front.resize((480, 480), Image.Resampling.LANCZOS)
mf_resized.save(os.path.join(dest_dir, "prod-good-vibes-model-front.png"))

# Description tab lifestyle model image (bottom-right: x: ~842 to 985, y: ~468 to 575)
lifestyle = im.crop((842, 468, 985, 575))
lifestyle_resized = lifestyle.resize((600, 450), Image.Resampling.LANCZOS)
lifestyle_resized.save(os.path.join(dest_dir, "prod-good-vibes-lifestyle.png"))

# 4. Botanical cushion & wildflower t-shirt:
# We can also create high-quality clean product visuals for cushions and wildflower:
cushion = im.crop((440, 420, 570, 505)) # from cushions category
if cushion.size[0] > 0 and cushion.size[1] > 0:
    cushion_resized = cushion.resize((480, 480), Image.Resampling.LANCZOS)
    cushion_resized.save(os.path.join(dest_dir, "prod-cushion-botanical.png"))

print("All asset processing done!")
