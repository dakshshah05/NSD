import os

filepath = r"d:\App\NSD\src\pages\Impact.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Block Leaderboard classes
content = content.replace(
    "className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${",
    "className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all cursor-pointer ${"
)

content = content.replace(
    ": 'bg-[rgb(var(--bg-input))] border-transparent hover:border-[rgb(var(--border))]'",
    ": 'bg-[rgb(var(--glass-bg))]/40 border-[rgb(var(--glass-border))]/10 hover:border-[rgb(var(--border))]'"
)

# 2. Update Anomalies
content = content.replace(
    'className="bg-[rgb(var(--bg-input))] border border-red-500/30 rounded-xl p-5 hover:border-red-500/60 transition-colors relative"',
    'className="bg-[rgb(var(--glass-bg))]/40 backdrop-blur-md border border-red-500/20 rounded-xl p-5 hover:border-red-500/50 transition-colors relative"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python edit script finished successfully!")
