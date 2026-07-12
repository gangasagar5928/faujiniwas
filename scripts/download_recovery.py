import urllib.request
import os

base_url = "https://faujiniwas.web.app/"
public_dir = "/home/petronski/faujiniwas.test/fauji-niwas-app/public/"
root_dir = "/home/petronski/faujiniwas.test/fauji-niwas-app/"

files = [
    ("about.html", public_dir),
    ("privacy.html", public_dir),
    ("terms.html", public_dir),
    ("contact.html", public_dir),
    ("security.html", public_dir),
    ("community.html", public_dir),
    ("robots.txt", public_dir),
    ("sitemap.xml", public_dir),
    ("index.html", root_dir)
]

os.makedirs(public_dir, exist_ok=True)

for filename, dest_dir in files:
    url = base_url + filename
    dest_path = os.path.join(dest_dir, filename)
    try:
        urllib.request.urlretrieve(url, dest_path)
        print(f"Downloaded {filename} to {dest_dir}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")

