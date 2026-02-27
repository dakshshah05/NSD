import os

filepath = r"d:\App\NSD\src\pages\Impact.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if "import { useTheme }" not in content:
    content = content.replace(
        "import { useAuth } from '../context/AuthContext';",
        "import { useAuth } from '../context/AuthContext';\nimport { useTheme } from '../context/ThemeContext';"
    )

# 2. Add hook usage in Impact component
if "const { theme } = useTheme();" not in content:
    content = content.replace(
        "const { user, role } = useAuth();",
        "const { user, role } = useAuth();\n  const { theme } = useTheme();"
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix script finished successfully!")
