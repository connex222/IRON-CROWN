"""Bundle the user-approved Iron Crown logo and eight realistic human portraits.

Era/mood files are graded variants of the same approved portrait. Phase 3 art
production can replace these independently with true expression/outfit renders.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path
import math, shutil

BASE=Path('/mnt/data'); ROOT=BASE/'iron-crown'/'public'/'art'; AV=ROOT/'avatars'
ROOT.mkdir(parents=True, exist_ok=True)
source={
 'augusta':'regal_victorian_countess_portrait.png',
 'silas':'victorian_steampunk_engineer_portrait.png',
 'jack':'steampunk_gentleman_with_emerald_brocade.png',
 'ada':'aristocratic_victorian_matriarch_portrait.png',
 'rupert':'stern_victorian_military_officer_portrait.png',
 'nell':'gritty_steampunk_adventurer_portrait.png',
 'ottoline':'steampunk_inventor_with_violet_energy_gadget.png',
 'ezra':'rogue_gentleman_in_teal_and_brass.png'
}
colours={'augusta':'#B3261E','silas':'#1F4FA8','jack':'#1E7A46','ada':'#C99A2E','rupert':'#22305A','nell':'#C2571A','ottoline':'#6B3FA0','ezra':'#167B7B'}
era_bg={'steam':('#584630','#0e221d'), 'iron':('#4b554d','#182421'), 'electric':('#2b4059','#0b1424')}

def rgb(hexval):return tuple(bytes.fromhex(hexval.removeprefix('#')))
def mix(a,b,f):return tuple(int(a[i]*(1-f)+b[i]*f) for i in range(3))

def background(side,era,col,mood):
 top,bot=map(rgb,era_bg[era]);edge=rgb(col)
 a=Image.new('RGBA',(side,side));pix=a.load()
 for y in range(side):
  for x in range(side):
   t=min(1,math.sqrt(((x-side*.47)/(side*.79))**2+((y-side*.15)/(side*.87))**2))
   color=mix(top,bot,t)
   f=.10 if mood=='neutral' else (.20 if mood=='smug' else .13)
   accent=edge if mood!='furious' else (145,40,32)
   color=mix(color,accent,f*(1-t*.4))
   pix[x,y]=(*color,255)
 return a

logo=Image.open(BASE/'victorian_railway_iron_crown_emblem.png').convert('RGBA')
logo.thumbnail((1600,550),Image.Resampling.LANCZOS)
logo.save(ROOT/'iron-crown-premium.png',optimize=True)
# The approved UI image has menu text baked into it. Crop only the clean train/
# architecture area and build actual accessible HTML controls separately.
scene=Image.open(BASE/'iron_crown_victorian_railway_command.png').convert('RGB')
w,h=scene.size
scenery=scene.crop((int(w*.55),int(h*.01),w,int(h*.78)))
scenery=scenery.resize((1130,860),Image.Resampling.LANCZOS)
scenery=ImageEnhance.Contrast(scenery).enhance(1.04)
scenery.save(ROOT/'victorian-terminal.jpg',quality=87,optimize=True)
# 72 real-person derivatives preserve each character's human identity. Graded
# lighting/frames indicate eras and outcomes, not fabricated facial expressions.
for id,name in source.items():
 human=Image.open(BASE/name).convert('RGBA')
 human.thumbnail((486,486),Image.Resampling.LANCZOS)
 for era in era_bg:
  for mood in ('neutral','smug','furious'):
   side=420
   out=background(side,era,colours[id],mood)
   # Faint engraved radial rings behind the portrait, a stable silhouette.
   overlay=Image.new('RGBA',(side,side));d=ImageDraw.Draw(overlay)
   for radius in (143,158,170):
    d.ellipse((side//2-radius,side//2-radius-28,side//2+radius,side//2+radius-28),outline=(215,173,94,42),width=2)
   out=Image.alpha_composite(out,overlay)
   person=human.resize((410,410),Image.Resampling.LANCZOS)
   # Keep faces the same for each tycoon. Brighter profile after a success;
   # dramatic darker lighting on defeat, plus separate UI mood indication.
   if mood=='smug':
    c=ImageEnhance.Contrast(person.convert('RGB')).enhance(1.06)
    person=Image.merge('RGBA',(*c.split(),person.getchannel('A')))
   if mood=='furious':
    c=ImageEnhance.Brightness(person.convert('RGB')).enhance(.86)
    person=Image.merge('RGBA',(*c.split(),person.getchannel('A')))
   out.alpha_composite(person,((side-410)//2,side-410))
   # Frame lines are placed at the edge, outside the central facial area.
   d=ImageDraw.Draw(out)
   line=rgb(colours[id]);brass=(230,188,105,255)
   d.rounded_rectangle((3,3,side-4,side-4),radius=24,outline=(*line,255),width=7)
   d.rounded_rectangle((11,11,side-12,side-12),radius=20,outline=brass,width=2)
   if mood=='smug':d.arc((24,24,side-24,side-24),190,350,fill=(246,218,129,220),width=5)
   elif mood=='furious':d.arc((23,23,side-23,side-23),20,170,fill=(235,99,81,230),width=5)
   out.convert('RGB').save(AV/f'{id}_{era}_{mood}.png',optimize=True)
 # Keep a transparent original for enlarged actor cards and marketing placement.
 raw=Image.open(BASE/name).convert('RGBA');raw.thumbnail((850,850),Image.Resampling.LANCZOS)
 raw.save(AV/f'{id}_human.png',optimize=True)
print('Wrote',len(list(AV.glob('*_*.png'))),'avatar PNGs and logo/scene')
