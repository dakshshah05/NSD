import os

filepath = r"d:\App\NSD\src\pages\Impact.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Pass theme to RealEarthGame
content = content.replace(
    "const RealEarthGame = () => {",
    "const RealEarthGame = ({ theme }) => {"
)

# 2. Adjust earth material based on theme
# Since the earth texture might be bright, we can tint the color darker in light mode
content = content.replace(
    "<meshStandardMaterial \n            map={earthTexture}\n            roughness={0.6}\n            metalness={0.1}\n          />",
    "<meshStandardMaterial \n            map={earthTexture}\n            roughness={0.6}\n            metalness={0.1}\n            color={theme === 'light' ? '#888888' : '#ffffff'}\n          />"
)
# fallback if spacing is different
content = content.replace(
    "<meshStandardMaterial\n            map={earthTexture}\n            roughness={0.6}\n            metalness={0.1}\n          />",
    "<meshStandardMaterial\n            map={earthTexture}\n            roughness={0.6}\n            metalness={0.1}\n            color={theme === 'light' ? '#888888' : '#ffffff'}\n          />"
)
content = content.replace(
    "<meshStandardMaterial \r\n            map={earthTexture}\r\n            roughness={0.6}\r\n            metalness={0.1}\r\n          />",
    "<meshStandardMaterial \r\n            map={earthTexture}\r\n            roughness={0.6}\r\n            metalness={0.1}\r\n            color={theme === 'light' ? '#666666' : '#ffffff'}\r\n          />"
)

# 3. Adjust Canvas lighting based on theme using the existing theme variable in Impact component
content = content.replace(
    "<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>\n                 <ambientLight intensity={0.8} />\n                 <directionalLight position={[10, 10, 5]} intensity={2} color=\"#ffffff\" />",
    "<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>\n                 <ambientLight intensity={theme === 'light' ? 0.3 : 0.8} />\n                 <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1 : 2} color=\"#ffffff\" />"
)
content = content.replace(
    "<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>\r\n                 <ambientLight intensity={0.8} />\r\n                 <directionalLight position={[10, 10, 5]} intensity={2} color=\"#ffffff\" />",
    "<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>\r\n                 <ambientLight intensity={theme === 'light' ? 0.4 : 0.8} />\r\n                 <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1.2 : 2} color=\"#ffffff\" />"
)

# 4. Pass theme prop in Canvas
content = content.replace(
    "<RealEarthGame />",
    "<RealEarthGame theme={theme} />"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Earth dark mode edit script finished successfully!")
