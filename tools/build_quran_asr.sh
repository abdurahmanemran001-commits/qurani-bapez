#!/usr/bin/env bash
# Exports tarteel-ai/whisper-base-ar-quran (open model) to int8 ONNX in transformers.js layout.
# Usage: bash tools/build_quran_asr.sh <out dir>
set -euo pipefail
OUT="${1:-dist/quran-asr}"
TMP="$(mktemp -d)"
pip install -q "torch==2.4.1" --index-url https://download.pytorch.org/whl/cpu
pip install -q "optimum[onnxruntime]==1.23.3" "transformers==4.46.3" onnx onnxruntime
optimum-cli export onnx --model "${MODEL:-tarteel-ai/whisper-base-ar-quran}" --task automatic-speech-recognition-with-past "$TMP/m"
ls -la "$TMP/m"
mkdir -p "$OUT/onnx"
python3 - "$TMP/m" "$OUT" <<'PY'
import sys, os, shutil
from optimum.onnxruntime import ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
src, out = sys.argv[1], sys.argv[2]
for f in os.listdir(src):
    if f.endswith('.json') or f.endswith('.txt'):
        shutil.copy(os.path.join(src, f), out)
qc = AutoQuantizationConfig.avx512(is_static=False, per_channel=False)
for name in ('encoder_model', 'decoder_model_merged'):
    q = ORTQuantizer.from_pretrained(src, file_name=name + '.onnx')
    tmp = os.path.join(out, '_q_' + name)
    q.quantize(save_dir=tmp, quantization_config=qc)
    for f in os.listdir(tmp):
        if f.endswith('.onnx'):
            shutil.move(os.path.join(tmp, f), os.path.join(out, 'onnx', name + '_quantized.onnx'))
    shutil.rmtree(tmp, ignore_errors=True)
PY
du -sh "$OUT"; ls -la "$OUT/onnx"
