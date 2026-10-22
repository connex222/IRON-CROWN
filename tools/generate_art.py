"""Generate locally bundled painted-vector-inspired portraits (no runtime dependencies)."""
from pathlib import Path
import cairosvg, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/art/avatars';OUT.mkdir(parents=True,exist_ok=True)
CHARACTERS=[
 ('augusta','#B3261E','#f2cbb0','#bfc1d4','duchess'),('silas','#1F4FA8','#ecc29b','#4b382c','engineer'),
 ('jack','#1E7A46','#e7b48e','#654125','gambler'),('ada','#C99A2E','#eed0b0','#58372c','banker'),
 ('rupert','#22305A','#e5ad8c','#775238','colonel'),('nell','#C2571A','#ddb18e','#44342b','union'),
 ('ottoline','#6B3FA0','#f3c7a8','#594079','inventor'),('ezra','#167B7B','#c69a7d','#292b31','smuggler')]
def shape(s):return s
for ident,accent,skin,hair,role in CHARACTERS:
 for era in ['steam','iron','electric']:
  for mood in ['neutral','smug','furious']:
   bg={'steam':'#dac49d','iron':'#968773','electric':'#32354b'}[era]
   edge={'steam':'#785943','iron':'#3d3b39','electric':'#bd9f53'}[era]
   stripe={'steam':'#eee1c5','iron':'#cfbea0','electric':'#d8c072'}[era]
   brows = {'neutral':(0,0),'smug':(-5,6),'furious':(8,-8)}[mood]
   mouth={'neutral':'M118 170 Q128 174 138 170','smug':'M114 169 Q132 187 144 166','furious':'M112 177 Q128 163 144 177'}[mood]
   hat=''
   if ident in ('silas','jack','ezra','nell','rupert'):
    if era=='steam':hat=f'<path d="M73 69 Q130 8 180 69 L178 77 L67 77 Z" fill="{accent}" stroke="#302622" stroke-width="5"/><path d="M55 76 Q130 91 198 75" stroke="#241d1c" stroke-width="11"/>'
    elif era=='iron':hat=f'<path d="M87 38 L166 38 L171 83 L81 83 Z" fill="{accent}" stroke="#241d1c" stroke-width="5"/><path d="M66 82 Q130 93 189 82" stroke="#241d1c" stroke-width="10"/>'
    else:hat=f'<path d="M81 65 Q130 31 176 65 L181 83 L75 83 Z" fill="{accent}" stroke="#382b26" stroke-width="5"/><path d="M65 84 L188 84" stroke="#d9bc74" stroke-width="8"/>'
   if ident=='augusta':
    if era=='steam':hat=f'<path d="M63 93 Q60 40 133 31 Q195 40 193 91" fill="{accent}" stroke="#5b2a2d" stroke-width="6"/><path d="M66 84 Q128 119 199 84" stroke="#dabb75" stroke-width="9"/>'
    elif era=='iron':hat=f'<path d="M89 68 L102 27 L159 45 L175 73" fill="{accent}" stroke="#57372d" stroke-width="6"/><path d="M61 76 Q125 105 202 76" stroke="#d4b47b" stroke-width="9"/>'
    else:hat='<path d="M80 67 L88 33 L109 57 L128 27 L148 57 L170 34 L179 67 Z" fill="#e3ba49" stroke="#f6ecb9" stroke-width="4"/><circle cx="128" cy="52" r="7" fill="#a9e7ed"/>'
   if ident=='ada':hat='<path d="M83 90 Q67 33 129 40 Q177 36 180 89" fill="#47342c" stroke="#211c1d" stroke-width="4"/>'
   if ident=='ottoline':hat='<path d="M68 89 Q54 31 88 48 Q102 2 130 39 Q164 3 179 56 Q206 26 194 98" fill="#594079" stroke="#211c2e" stroke-width="5"/>'
   accessory=''
   if ident=='augusta':accessory='<circle cx="128" cy="220" r="8" fill="#f6ecd8"/><circle cx="110" cy="216" r="5" fill="#f6ecd8"/><circle cx="147" cy="216" r="5" fill="#f6ecd8"/>'
   if ident=='silas':accessory='<path d="M183 85 L193 57" stroke="#d8b45c" stroke-width="5"/><path d="M177 83 L185 62" stroke="#23262c" stroke-width="3"/>'
   if ident=='jack':accessory='<circle cx="165" cy="225" r="13" fill="#f8e1aa" stroke="#5e4a31" stroke-width="3"/><circle cx="162" cy="221" r="2" fill="#354c3b"/><circle cx="168" cy="228" r="2" fill="#354c3b"/>'
   if ident=='ada':accessory='<path d="M86 144 Q108 158 129 144 Q149 158 169 144" fill="none" stroke="#614531" stroke-width="5"/><circle cx="104" cy="137" r="20" stroke="#d3ad5f" stroke-width="4" fill="none"/><circle cx="151" cy="137" r="20" stroke="#d3ad5f" stroke-width="4" fill="none"/>'
   if ident=='rupert':accessory='<path d="M96 164 Q113 152 128 163 Q145 151 160 164 Q143 176 128 166 Q110 177 96 164" fill="#684631" stroke="#3d2c28" stroke-width="3"/><circle cx="82" cy="221" r="6" fill="#e3c466"/><circle cx="98" cy="227" r="6" fill="#e3c466"/>'
   if ident=='nell':accessory=f'<path d="M72 222 Q133 238 185 211" stroke="#e5b56c" stroke-width="14" fill="none"/>'
   if ident=='ottoline':accessory='<circle cx="95" cy="110" r="18" stroke="#dbc170" stroke-width="7" fill="none"/><circle cx="158" cy="110" r="18" stroke="#dbc170" stroke-width="7" fill="none"/><path d="M113 109 L139 109" stroke="#dbc170" stroke-width="7"/><circle cx="176" cy="227" r="13" fill="#78e0d8" stroke="#f8d67c" stroke-width="4"/>'
   if ident=='ezra':accessory='<path d="M65 203 L111 229 L145 229 L190 200" fill="none" stroke="#262a36" stroke-width="16"/><path d="M70 224 L111 244" stroke="#d3b08b" stroke-width="5"/>'
   insignia={'steam':'●','iron':'◆','electric':'✦'}[era]
   svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
   <defs><radialGradient id="bg"><stop offset="0" stop-color="{stripe}"/><stop offset="1" stop-color="{bg}"/></radialGradient><linearGradient id="coat" x2="1" y2="1"><stop stop-color="{accent}"/><stop offset="1" stop-color="#24202b"/></linearGradient><filter id="shade"><feGaussianBlur stdDeviation="4"/></filter></defs>
   <circle cx="128" cy="128" r="125" fill="url(#bg)"/><circle cx="128" cy="128" r="122" fill="none" stroke="{edge}" stroke-width="6"/><path d="M43 244 Q34 193 91 192 L105 189 L150 189 L171 192 Q227 190 218 244" fill="url(#coat)" stroke="#332729" stroke-width="5"/>
   <path d="M105 181 L101 212 L128 241 L154 210 L151 181" fill="{skin}" stroke="#6d4941" stroke-width="4"/>
   <path d="M97 201 L128 245 L158 201 L145 199 L129 220 L112 198" fill="{stripe}"/>
   <ellipse cx="77" cy="135" rx="13" ry="20" fill="{skin}" stroke="#8f6657" stroke-width="3"/><ellipse cx="180" cy="135" rx="13" ry="20" fill="{skin}" stroke="#8f6657" stroke-width="3"/>
   <path d="M79 111 Q78 79 125 72 Q177 75 176 123 L173 160 Q166 195 128 199 Q88 190 83 159 Z" fill="{skin}" stroke="#825b4b" stroke-width="4"/>
   <path d="M84 108 Q85 66 126 67 Q172 65 176 106 L169 93 Q130 79 89 102 Z" fill="{hair}" opacity=".85"/>
   <path d="M98 {124+brows[0]} L117 {122+brows[1]}" stroke="{hair}" stroke-width="6" stroke-linecap="round"/><path d="M143 {122+brows[1]} L161 {124+brows[0]}" stroke="{hair}" stroke-width="6" stroke-linecap="round"/>
   <ellipse cx="110" cy="139" rx="6" ry="7" fill="#252525"/><ellipse cx="149" cy="139" rx="6" ry="7" fill="#252525"/><circle cx="108" cy="137" r="2" fill="white"/><circle cx="147" cy="137" r="2" fill="white"/>
   <path d="M126 145 L121 160 L132 161" stroke="#a07663" stroke-width="3" fill="none"/><path d="{mouth}" stroke="#774d49" fill="none" stroke-width="4" stroke-linecap="round"/>
   {accessory}{hat}
   <path d="M54 243 Q130 235 201 243" fill="none" stroke="{edge}" stroke-width="8"/>
   <circle cx="128" cy="128" r="122" fill="none" stroke="#f6e9bd" stroke-opacity=".45" stroke-width="2"/>
   </svg>'''
   cairosvg.svg2png(bytestring=svg.encode(),write_to=str(OUT/f'{ident}_{era}_{mood}.png'),output_width=256,output_height=256)
print('Generated',len(list(OUT.glob('*.png'))),'avatar portraits')
