import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  User,
  MapPin,
  FileCheck,
  Hash,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const VerifyCertificate = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('certId') || '';

  const [inputRef, setInputRef] = useState(initialRef);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const verifyReference = async (refCode) => {
    if (!refCode || !refCode.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/public/verify/${encodeURIComponent(refCode.trim())}`);
      setResult(response.data);
    } catch (err) {
      setResult({
        valid: false,
        referenceCode: refCode,
        message: 'Could not contact the verification servers. Please check your network connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setInputRef(initialRef);
      verifyReference(initialRef);
    }
  }, [initialRef]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (inputRef.trim()) {
      setSearchParams({ ref: inputRef.trim() });
      verifyReference(inputRef.trim());
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #e2e8f0 100%)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* Government Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#0a365c', color: '#ffffff', width: '56px', height: '56px', borderRadius: '16px', marginBottom: '0.75rem', boxShadow: '0 8px 16px rgba(10,54,92,0.2)' }}>
            <Building2 size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06223d', margin: 0, letterSpacing: '0.5px' }}>
            GOVERNMENT OF TAMIL NADU
          </h1>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a365c', marginTop: '4px' }}>
            State e-Certificate & Welfare Sanction Digital Verification Portal
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Unified Citizen Management System (UCMS) • Real-Time Anti-Fraud & Authenticity Verification
          </div>
        </div>

        {/* Verification Search Bar */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)', marginBottom: '1.75rem' }}>
          <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder="Scan QR or enter Certificate / Sanction Number (e.g. UCMS-CERT-...)"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button
              type="submit"
              disabled={loading || !inputRef.trim()}
              style={{
                background: '#0a365c',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: '1rem', fontWeight: 600, color: '#334155' }}>
              Validating cryptographic signature with State Database Records...
            </div>
          </div>
        )}

        {/* Verification Result: AUTHENTIC / ORIGINAL */}
        {!loading && searched && result && result.valid && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '2px solid #16a34a',
              boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.15)',
            }}
          >
            {/* Authenticity Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  100% AUTHENTIC & ORIGINAL DOCUMENT
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.95, marginTop: '2px' }}>
                  Cryptographically Verified Official Government Record • UCMS Portal
                </div>
              </div>
            </div>

            {/* Document Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Document Type
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {result.title}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Certificate / Sanction Ref
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0284c7', fontFamily: 'monospace', marginTop: '2px' }}>
                  {result.referenceCode}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Beneficiary Citizen
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={16} color="#64748b" /> {result.citizenName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Village / Ward
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} color="#64748b" /> {result.village}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Approval / Issue Date
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={16} color="#64748b" /> {result.issueDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Approved By Authority
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#15803d', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> {result.approvedBy}
                </div>
              </div>

              {result.details && Object.entries(result.details).map(([key, val]) => (
                <div key={key} style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{key}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginTop: '2px' }}>{String(val)}</div>
                </div>
              ))}
            </div>

            {/* Cryptographic e-Sign Signature Card */}
            <div style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} /> {result.eSignStatus}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.35rem' }}>
                Issuing Authority: {result.issuingAuthority}
              </div>
              <div style={{ fontSize: '0.725rem', fontFamily: 'monospace', color: '#475569', marginTop: '0.35rem', wordBreak: 'break-all' }}>
                Digital Fingerprint: <strong>{result.digitalSignature}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              Confirmed authentic under the Information Technology Act. This certificate is valid for official administrative, academic, and banking verification.
            </div>
          </div>
        )}

        {/* Verification Result: EXPLICITLY REJECTED / REVOKED */}
        {!loading && searched && result && result.status === 'REJECTED' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '2px solid #dc2626',
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.2)',
            }}
          >
            {/* Rejection Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  DOCUMENT STATUS: REJECTED / REVOKED
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.95, marginTop: '2px' }}>
                  Official Sanction Terminated by Administrative Authorities • UCMS Verification
                </div>
              </div>
            </div>

            {/* Document Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem', background: '#fef2f2', padding: '1.25rem', borderRadius: '10px', border: '1px solid #fecaca' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Document Name
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {result.title}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Reference Code
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', fontFamily: 'monospace', marginTop: '2px' }}>
                  {result.referenceCode}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Beneficiary Citizen
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {result.citizenName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Current Government Status
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                  REJECTED & VOIDED
                </div>
              </div>
            </div>

            {/* Officer Remarks / Reason */}
            <div style={{ background: '#fff1f2', border: '1px solid #fda4af', padding: '1.25rem', borderRadius: '10px', color: '#881337', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Administrative Officer Rejection Justification:
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
                {result.details?.['Officer Rejection Remarks'] || result.details?.['Officer Remarks'] || result.message}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9f1239' }}>
                {result.issuingAuthority} • e-Sign: <strong>REVOKED / VOIDED</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                Return to Citizen Portal <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* Verification Result: FAILED / TAMPERED / NOT FOUND */}
        {!loading && searched && result && !result.valid && result.status !== 'REJECTED' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '2px solid #ef4444',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  VERIFICATION FAILED: INVALID OR TAMPERED RECORD
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.95, marginTop: '2px' }}>
                  No Active Official Approval Exists In Government Database
                </div>
              </div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.25rem', borderRadius: '10px', color: '#991b1b', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <strong>Audit Notice:</strong> {result.message || 'The specified document reference was not recognized as an approved official certificate. Presenting or forging fabricated certificates is a punishable legal offense.'}
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                Queried Reference: <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>{result.referenceCode || inputRef}</code>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                Go to Citizen Login Portal <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/login" style={{ color: '#475569', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Return to Unified Citizen Management System (UCMS)
          </Link>
        </div>
      </div>
    </div>
  );
};
