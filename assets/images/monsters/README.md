# Dungeon monster sprite sheets

Add one folder per monster. Match each folder name to the `spriteFolder` value
for that monster in `data/dungeonStages.js`:

```text
monsters/
  plantMonster/
    Idle.png
    attack.png
    hurt.png
    die.png
  demon/
    idle.png
    attack.png
    hurt.png
    die.png
  medusa/
    idle.png
    attack.png
    hurt.png
    die.png
```

The corresponding animation slots and per-animation frame counts are defined in
`data/dungeonStages.js`. Plant Monster and Demon have frame counts filled from
their current sheets. Set the Medusa counts when its sprite sheets are added.
When a sheet is ready, set that slot's `source` to its static asset source and
update `frameWidth` and `frameHeight` if it differs from the 128 by 128 default.
Unfilled slots continue using the existing generic monster animation.
