import sys

with open('netlify.toml', 'rb') as f:
    content = f.read()

if content.startswith(b'\xef\xbb\xbf'):
    content = content[3:]

with open('netlify.toml', 'wb') as f:
    f.write(content)
