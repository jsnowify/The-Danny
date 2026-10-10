# Retained capture harness diagnosis

The first final capture attempt timed out at the old readiness condition `flora-crown.count > 0`. A camera-culled batch can correctly be empty. It produced no final screenshots.

The corrected harness checks `flora-crown.instanceMatrix.version > 0` after scene readiness, then uses the same fixed simulation settling and real GPU render as the baseline capture. Runtime artwork was unchanged for this fix.
