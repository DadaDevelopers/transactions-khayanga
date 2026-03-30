# Bitcoin Transaction Decoder (SegWit Supported)

## 📌 Overview
This project is a JavaScript-based Bitcoin transaction decoder that parses raw hex transactions into a structured JSON format. It supports both legacy and SegWit transactions.

---

## ⚙️ Features
- Parses Bitcoin transaction version
- Detects SegWit transactions (marker + flag)
- Decodes inputs (txid, vout, scriptSig, sequence)
- Decodes outputs (value, scriptPubKey)
- Parses witness data
- Extracts locktime correctly
- Fully offset-safe parsing using varInt logic


