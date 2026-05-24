# Repti-Track v0.4 — Species Library Expansion

Adds 85 more species to the library, bringing the total to **~160 species** covering:

**More snakes:** Colombian Rainbow Boa, Dumeril's Boa, Madagascar Tree Boa, Eastern Hognose, plus SA natives (Puff Adder, Cape Cobra, Mole Snake, Brown House Snake, Rinkhals, Boomslang, Snouted Night Adder, Spotted Bush Snake), Baird's/Trans-Pecos Rat Snakes, Pueblan/Honduran Milk Snakes, Spotted/Anthill/Stimson's Pythons, Peruvian Rainbow Boa.

**More lizards:** Flap-Necked / Cape Dwarf / Meller's / Fischer's Chameleons, Painted/Tree/Rock Agamas, Armadillo Girdled Lizard, Collared Lizard, Green Basilisk, Red/Gold Tegus, Nile/Emerald Tree Monitors, Fire/Monkey-Tail/Cape/Five-Lined Skinks, Brown Anole.

**More geckos:** Leachianus, Chahoua, Banded Cave, Knob-Tailed, Giant Day, Electric Blue Day, Flying, Leaf-Tailed (Satanic & Mossy), Cape Dwarf, Pictus.

**More tortoises & turtles:** Marginated, Pancake, Egyptian, Indian Star, Spider; Red-Eared Slider, Musk, Painted, African Sideneck turtles.

**Amphibians:** Pacman Frog, African Bullfrog, Tomato Frog, Fire-Bellied Toad, White's/Red-Eyed Tree Frogs, Blue Dart Frog, African Clawed Frog, Axolotl.

**Invertebrates:** Curly Hair / Mexican Red-Knee / Pink-Toe Tarantulas, Emperor / Flat Rock Scorpions, African Giant Black Millipede, Giant African Land Snail, Orchid Mantis.

## Deployment

### 1. Run SQL in Supabase

Supabase Dashboard → SQL Editor → New Query → paste contents of `supabase/v4_species_expansion.sql` → Run.

Expected result: "Success. No rows returned" (or 85 inserted).

Verify the count:
```sql
select count(*) from species;
```
Should show **~162**.

### 2. No code deploy needed

The species library is just data — no app code changes required. Once the SQL runs, you can immediately search for any new species in the "Add reptile" flow.

But there IS a small version bump in the code (v0.3 → v0.4 in settings). To push:

```
cd "C:\Users\Jean Rossouw\Downloads\repticube-tracker\repticube-tracker"
git add .
git commit -m "v0.4 - species library expansion (160+ species)"
git push
```

## Note on venomous SA natives

Puff Adder, Cape Cobra, Rinkhals, Boomslang, Snouted Night Adder are flagged `expert` difficulty. They're in the library so you can sell them if you have the permits, but the difficulty rating helps customers self-assess. The care info notes "requires permits in SA."
