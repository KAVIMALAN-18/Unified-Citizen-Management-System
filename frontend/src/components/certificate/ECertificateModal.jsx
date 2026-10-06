import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, ShieldAlert, CheckCircle2, Printer, ExternalLink, X, Award, Building2 } from 'lucide-react';

export const ECertificateModal = ({ isOpen, onClose, data, type = 'CERTIFICATE' }) => {
  const canvasRef = useRef(null);

  const isCert = type === 'CERTIFICATE';
  const isRejected = data?.status === 'REJECTED' || data?.status === 'REVOKED';
  const refCode = data ? (isCert ? (data.certificateReference || data.requestId) : (data.sanctionReference || data.applicationId)) : '';
  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify?ref=${encodeURIComponent(refCode || '')}` : '';

  useEffect(() => {
    if (isOpen && canvasRef.current && refCode) {
      QRCode.toCanvas(
        canvasRef.current,
        verificationUrl,
        {
          width: 130,
          margin: 1,
          color: {
            dark: isRejected ? '#991b1b' : '#06223d',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Failed to generate QR Code:', error);
        }
      );
    }
  }, [isOpen, verificationUrl, refCode, isRejected]);

  if (!isOpen || !data) return null;

  const citizenName = data.citizenName || 'Verified Citizen';
  const village = data.village || 'Keeranur Gram Panchayat';
  const issueDate = data.issuedAt || data.approvedAt || data.updatedAt || new Date().toISOString();
  const formattedDate = new Date(issueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(issueDate).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const certTitle = isCert
    ? (data.certificateType === 'INCOME' ? 'INCOME & ASSET CERTIFICATE'
        : data.certificateType === 'RESIDENCE' ? 'RESIDENCE & NATIVITY CERTIFICATE'
        : data.certificateType === 'CASTE' ? 'COMMUNITY & CASTE CERTIFICATE'
        : `${data.certificateType} CERTIFICATE`)
    : 'WELFARE SCHEME SANCTION ORDER';

  const digitalSignature = data.digitalSignature || `SHA256:${refCode?.replace(/[^a-zA-Z0-9]/g, '') || 'AUTH'}e9a8f23`;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenVerify = () => {
    window.open(verificationUrl, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Header Action Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.5rem',
            background: 'var(--slate-900)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              OFFICIAL e-CERTIFICATE & VERIFICATION DESK
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={handleOpenVerify}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={15} /> Test Live Scan
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div
          id="printable-certificate"
          style={{
            padding: '2.5rem',
            overflowY: 'auto',
            background: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Certificate Border Frame */}
          <div
            style={{
              border: isRejected ? '4px double #dc2626' : '4px double #0a365c',
              padding: '2rem',
              borderRadius: '8px',
              position: 'relative',
              background: isRejected
                ? 'linear-gradient(135deg, rgba(254, 242, 242, 0.7) 0%, rgba(255, 255, 255, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(240, 247, 255, 0.4) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            {/* Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-25deg)',
                fontSize: isRejected ? '3.5rem' : '4.5rem',
                fontWeight: 900,
                color: isRejected ? 'rgba(220, 38, 38, 0.14)' : 'rgba(10, 54, 92, 0.035)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                letterSpacing: '6px',
                border: isRejected ? '6px solid rgba(220, 38, 38, 0.2)' : 'none',
                padding: isRejected ? '10px 30px' : '0',
                borderRadius: '12px',
              }}
            >
              {isRejected ? 'REJECTED / VOID' : 'GRAM PANCHAYAT GOVT'}
            </div>

            {/* Official Header */}
            <div style={{ textAlign: 'center', borderBottom: isRejected ? '2px solid #dc2626' : '2px solid #0a365c', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                <Building2 size={36} color={isRejected ? '#b91c1c' : '#0a365c'} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06223d', margin: 0, letterSpacing: '1px' }}>
                GOVERNMENT OF TAMIL NADU
              </h2>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isRejected ? '#b91c1c' : '#0a365c', marginTop: '2px' }}>
                DEPARTMENT OF REVENUE & RURAL ADMINISTRATION
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                KEERANUR GRAM PANCHAYAT • UNIFIED CITIZEN MANAGEMENT SYSTEM (UCMS)
              </div>
            </div>

            {/* Title Banner */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: isRejected ? 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)' : 'linear-gradient(135deg, #0a365c 0%, #0f4c81 100%)',
                  color: '#ffffff',
                  padding: '0.5rem 1.8rem',
                  borderRadius: '24px',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  letterSpacing: '1.5px',
                  boxShadow: isRejected ? '0 4px 6px -1px rgba(220, 38, 38, 0.35)' : '0 4px 6px -1px rgba(10, 54, 92, 0.25)',
                }}
              >
                {certTitle} {isRejected && '(REVOKED / REJECTED)'}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                Certificate Reference No: <strong style={{ color: '#0f172a', letterSpacing: '0.5px' }}>{refCode}</strong>
              </div>
            </div>

            {/* Certificate Formal Text */}
            <div style={{ fontSize: '0.925rem', lineHeight: '1.7', color: '#1e293b', marginBottom: '1.5rem', textAlign: 'justify' }}>
              This is to officially record that <strong>Thiru / Tmt / Selvi {citizenName}</strong>, residing at{' '}
              <strong>{data.address || 'Panchayat Ward'}, {village}</strong>, was evaluated in accordance with the
              official Village Administrative records and Gram Panchayat field audits.
              {isRejected ? (
                <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                  {' '}NOTICE: This document / sanction has been officially REJECTED and REVOKED by the competent Gram Panchayat authority. Any claim of active sanction or validity using this reference is null and void.
                </span>
              ) : isCert ? (
                <span>
                  {' '}The applicant has met all statutory requirements for the issuance of this <strong>{certTitle}</strong>.
                  {data.annualIncome ? ` Verified family annual income is recorded as ₹${Number(data.annualIncome).toLocaleString('en-IN')}.` : ''}
                </span>
              ) : (
                <span>
                  {' '}The applicant has satisfied all statutory eligibility benchmarks for <strong>{data.schemeName || 'the requested welfare scheme'}</strong>.
                  Sanction and benefit distribution have been officially approved under the direct supervision of the Village Panchayat.
                </span>
              )}
            </div>

            {/* Key Particulars Table */}
            <div style={{ background: '#ffffff', border: isRejected ? '1px solid #fca5a5' : '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: '#64748b' }}>Beneficiary Name:</span> <strong>{citizenName}</strong></div>
                <div><span style={{ color: '#64748b' }}>Certificate No:</span> <strong>{refCode}</strong></div>
                <div><span style={{ color: '#64748b' }}>Village / Panchayat:</span> <strong>{village}</strong></div>
                <div><span style={{ color: '#64748b' }}>Date & Time of Issue:</span> <strong>{formattedDate} {formattedTime}</strong></div>
                {data.submittedInfo && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Purpose / Remarks:</span> <strong>{data.submittedInfo}</strong>
                  </div>
                )}
                {data.schemeName && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Scheme Name:</span> <strong>{data.schemeName}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: '#64748b' }}>Status:</span>{' '}
                  <strong style={{ color: isRejected ? '#dc2626' : '#15803d' }}>
                    {isRejected ? 'REJECTED & VOIDED' : 'APPROVED & VALID'}
                  </strong>
                </div>
                <div><span style={{ color: '#64748b' }}>Security Digest:</span> <strong style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{digitalSignature.substring(0, 18)}...</strong></div>
                {(data.rejectionRemarks || data.rejectionReason) && (
                  <div style={{ gridColumn: 'span 2', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fca5a5', marginTop: '0.25rem' }}>
                    <span style={{ color: '#991b1b', fontWeight: 700 }}>Rejection Reason:</span>{' '}
                    <span style={{ color: '#7f1d1d', fontWeight: 600 }}>{data.rejectionRemarks || data.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: QR Code Verification & e-Sign Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '1.5rem', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '1.25rem' }}>
              {/* QR Code Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '6px', border: isRejected ? '1px solid #fca5a5' : '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <canvas ref={canvasRef} style={{ display: 'block' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isRejected ? '#b91c1c' : '#0a365c', marginBottom: '3px', textTransform: 'uppercase' }}>
                    Scan to Verify
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.3' }}>
                    Scan with any phone camera to verify this record status on the official public portal.
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isRejected ? '#dc2626' : '#0284c7', marginTop: '4px', fontWeight: 600 }}>
                    {refCode}
                  </div>
                </div>
              </div>

              {/* Digital e-Sign Stamp */}
              <div
                style={{
                  border: isRejected ? '2px solid #dc2626' : '2px solid #16a34a',
                  background: isRejected ? 'rgba(254, 226, 226, 0.6)' : 'rgba(220, 252, 231, 0.45)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                }}
              >
                <div
                  style={{
                    background: isRejected ? '#dc2626' : '#16a34a',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isRejected ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
                </div>
                <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  <div style={{ color: isRejected ? '#b91c1c' : '#15803d', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isRejected ? 'STATUS: OFFICIALLY REVOKED & VOIDED' : (<><CheckCircle2 size={14} /> DIGITALLY SIGNED (e-Sign)</>)}
                  </div>
                  <div style={{ color: isRejected ? '#991b1b' : '#166534', fontWeight: 600 }}>
                    {isRejected ? 'Revoked by Officer / Audit' : `Signatory: ${data.approvedByOfficer || 'Village Administrative Officer (VAO)'}`}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.7rem' }}>
                    Keeranur Gram Panchayat • Date: {formattedDate}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.675rem', fontFamily: 'monospace', marginTop: '2px' }}>
                    {isRejected ? 'Audit Flag: REVOKED ON LEDGER' : `Fingerprint: ${digitalSignature.substring(0, 24)}...`}
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer Footer */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#94a3b8' }}>
              This is a computer-generated official e-Certificate authenticated under the Information Technology Act, 2000.
              Tampering or presenting counterfeit reproductions is a punishable legal offense.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
