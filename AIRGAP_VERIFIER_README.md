# Detective Quantum // Air Gap Offline Verifier (v1.0)

The **Air Gap Offline Verifier** is a standalone, zero-dependency tool designed to verify evidence authenticity, file integrity, and full provenance history on a **completely disconnected machine** with **zero network access** (no server calls, no database lookups, no internet).

---

## 1. How It Works

1. **Self-Contained Air Gap Package (`.agpkg`)**:
   When an evidence file is exported from the Detective Quantum platform, it is packaged into a self-contained `.agpkg` bundle containing:
   - The raw evidence content bytes.
   - A canonical `provenance_manifest.json` recording the full, ordered history of events (collection, audits, handovers).
   - An **Ed25519 Master Digital Signature** (`master_signature_hex`) signed by the Platform Root Authority.

2. **Pinned Root Authority Key**:
   The offline verifier CLI ships with the **pinned Platform Root Ed25519 Public Key** hardcoded inside the script. It does not fetch keys over the network at verify time.

3. **Tamper-Evident Hash Chain**:
   Every event block is cryptographically linked to the preceding block's hash ($H(event_i) = SHA256(prev\_event\_hash_{i-1} + event\_type + file\_sha256 + timestamp + actor)$). Any byte mutation, event deletion, or reordering breaks signature and hash-chain validation.

---

## 2. Quick Start: Running Fully Offline

### Step A: Export Evidence Bundle
1. Open any verified report on the platform.
2. Click **EXPORT AIR GAP BUNDLE (.AGPKG)**.
3. Save the resulting `<filename>.agpkg` file to a USB stick or physical media.

### Step B: Verify on Disconnected Computer
Copy the `.agpkg` file and the `scripts/verify-airgap.ts` verifier tool to the air-gapped machine. Ensure networking is disabled.

Run the verification CLI:

```bash
# Verify bundle offline
npx tsx scripts/verify-airgap.ts path/to/evidence.agpkg
```

---

## 3. Verification Output Example

```
---------------------------------------------------------
  DETECTIVE QUANTUM // AIR GAP OFFLINE VERIFIER (v1.0)   
  Mode: 100% OFF-GRID AIR-GAPPED VERIFICATION            
---------------------------------------------------------

[+] Loading Air Gap Package from disk: authentic_evidence_doc.txt.agpkg
[+] Pinned Ed25519 Root Public Key: Verified
[+] File Content SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb924...
[+] Recorded Manifest SHA-256:  e3b0c44298fc1c149afbf4c8996fb924...

---------------------------------------------------------
  VERIFICATION AUDIT RESULTS                             
---------------------------------------------------------
  1. Master Signature Check: ✅ PASS (Ed25519 Verified against Pinned Root)
  2. File Content Integrity: ✅ PASS (SHA-256 Digest Match)
  3. Provenance Chain Link:  ✅ PASS (2 Linked Events Intact)
---------------------------------------------------------

VERIFIED PROVENANCE AUDIT LOG:
  [Event #1] 2026-09-01T10:00:00.000Z | CREATE     | Custodian: Dr. Sarah Lin
              Notes: Automatic evidence acquisition & SHA-256 locking on receipt
              Hash:  a1b2c3d4e5f6...

  [Event #2] 2026-09-04T12:00:00.000Z | VERIFY     | Custodian: Detective Quantum Engine
              Notes: Automated 11-step forensic analysis completed
              Hash:  d4e5f6a1b2c3...

=========================================================
  VERDICT: OFFICIAL AIR-GAP VERIFICATION PASSED (100%)    
  Evidence is authentic, unbroken, and tamper-free.       
=========================================================
```

---

## 4. Tamper Resistance Guarantees

| Tamper Scenario | Verifier Behavior | Result |
| :--- | :--- | :--- |
| **Mutated File Content Byte** | Recomputed SHA-256 digest mismatches manifest hash. | ❌ **FAIL (File Integrity Error)** |
| **Deleted History Event** | Hash chain continuity severed or Master Ed25519 signature breaks. | ❌ **FAIL (Chain Severed Error)** |
| **Reordered History Events** | Previous event hash pointers ($prev\_event\_hash$) mismatch. | ❌ **FAIL (Reordering Error)** |
| **Fake Key / Re-signing** | Signature fails verification against Pinned Platform Root Key. | ❌ **FAIL (Untrusted Key Error)** |

---

## 5. Security & Key Management Notes

- **Platform Root Private Key Protection**: The server stores the Ed25519 root private key in `server/keys/airgap_root_ed25519.priv` (restricted filesystem permissions).
- **Known Limit (Offline Key Revocation)**: In a 100% disconnected environment, key revocations cannot be queried online. Revocations must be distributed via updated offline verifier releases containing updated pinned root keys.
