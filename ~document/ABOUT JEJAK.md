# TODO / EXPECTED BUGS

## All CRUD

1. Form validation

## Vehicle CRUD

1. Mesti check unique
2. Mesti trace transaction yg berkaitan then update sekali

# About Firestore Interaction

1. Update current position every seconds thus ensuring smooth animation
2. Update current speed every 10 seconds 
3. Update history every 60 seconds

# About Checkpoint

1. Before start tracking, driver must select which bus:
   - So that bus driver can be change
2. Then he select which checkpoint he's heading to:
   - Driver may start from checkpoint B instead of A due to change of driver, smartphone accidently off
3. When driver select checkpoint C, checkpoint A & B will be automatically considered arrived
4. Each second vehicle moving, we will check radius from next checkpoint to mark it as arrived
5. ETA to next checkpoint could use:
   - Straight line from current to next checkpoint without considering road corder
   - JS library
6. Checkpoint ABCD diikuti dgn A balik (circular). Means after D, next checkpoint is A
   - Jika bus jenis patah balik bukannya pusing, kena masukkan jujukan checkpoint patah balik
7. Katakan menuju ke A, tetiba phone off (or apps sent to background). Then bus dah lalu B and menuju ke C baru driver perasan and on balik. Calculation sekarang based on headingCheckpoint.
   - Solution, driver boleh tukar headingCheckpoint bila2