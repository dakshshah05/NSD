import os

filepath = r"d:\App\NSD\src\pages\Impact.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert Earth color to #ffffff so it doesn't look muddy
content = content.replace(
    "color={theme === 'light' ? '#888888' : '#ffffff'}",
    "color=\"#ffffff\""
)
content = content.replace( # fallback
    "color={theme === 'light' ? '#666666' : '#ffffff'}",
    "color=\"#ffffff\""
)

# 2. Adjust Canvas Lighting so it's not too bright in light mode but clear
content = content.replace(
    "<ambientLight intensity={theme === 'light' ? 0.3 : 0.8} />\n                 <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1 : 2} color=\"#ffffff\" />",
    "<ambientLight intensity={theme === 'light' ? 0.6 : 0.8} />\n                 <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1.5 : 2} color=\"#ffffff\" />"
)
content = content.replace(
    "<ambientLight intensity={theme === 'light' ? 0.3 : 0.8} />\r\n                 <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1 : 2} color=\"#ffffff\" />",
    "<ambientLight intensity={theme === 'light' ? 0.6 : 0.8} />\r\n                 <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1.5 : 2} color=\"#ffffff\" />"
)


# 3. Adjust the hero overlay gradient so it doesn't wash out the earth on the right side
content = content.replace(
    "className=\"absolute inset-0 z-10 bg-gradient-to-r from-[rgb(var(--bg-card))]/90 via-[rgb(var(--bg-card))]/60 to-transparent pointer-events-none\"",
    "className=\"absolute inset-0 z-10 bg-gradient-to-r from-[rgb(var(--bg-card))]/95 from-10% via-[rgb(var(--bg-card))]/20 via-50% to-transparent pointer-events-none\""
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Earth overlay fix script finished successfully!")
