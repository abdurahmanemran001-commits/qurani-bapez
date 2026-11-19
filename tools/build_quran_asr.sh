#!/usr/bin/env bash
# Exports the open Quran Whisper model (tarteel-ai/whisper-base-ar-quran) to int8 ONNX in transformers.js layout.
# Usage: bash tools/build_quran_asr.sh <out dir>
set -euo pipefail
OUT="${1:-dist/quran-asr}"
TMP="$(mktemp -d)"
pip install -q torch --index-url https://download.pytorch.org/whl/cpu
pip install -q "optimum[onnxruntime]==1.23.3" "transformers==4.46.3" onnx onnxruntime
optimum-cli export onnx --model tarteel-ai/whisper-base-ar-quran --task automatic-speech-recognition-with-past "$TMP/m"
mkdir -p "$OUT/onnx"
python3 - "$TMP/m" "$OUT" <<'PY'
import sys, os, shutil
from onnxruntime.quantization import quantize_dynamic, QuantType
src, out = sys.argv[1], sys.argv[2]
for f in os.listdir(src):
    if f.endswith('.json') or f.endswith('.txt'):
        shutil.copy(os.path.join(src, f), out)
for name in ('encoder_model', 'decoder_model_merged'):
    p = os.path.join(src, name + '.onnx')
    quantize_dynamic(p, os.path.join(out, 'onnx', name + '_quantized.onnx'), weight_type=QuantType.QUInt8)
PY
du -sh "$OUT"; ls -la "$OUT" "$OUT/onnx"
