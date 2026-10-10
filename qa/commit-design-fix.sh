cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "Design system: fix light-mode contrast + gray ground" -m "- root cause: Card/Button/Badge/Input/Modal/StatCard hardcoded dark hexes with data-[theme=light]: SELF-variants that never inherit from <html> -> light mode kept light text on light cards
- all core ui components now theme via CSS vars (--bg-card, --border-line, --text-primary, --accent-gold-soft...)
- light ground: ivory #F7F3E9 -> gray #F2F3F5 per Dhrumil's directive (tokens.css + globals.css; sidebar/elevated/borders retuned)
- verified: wallet light-mode stat value rgb(11,15,20) on white; admin E2E 10/10; wave3 E2E 13/13; next build clean" 2>&1 | tail -2
git push origin HEAD 2>&1 | tail -2
git log --oneline -1
