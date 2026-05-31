import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { useKYC } from '../hooks/useKYC';
import {
  getKYC, updateKYC, submitKYC,
  uploadKYCDocument, KYC_LIMITS, createNotification
} from '../lib/db';
import { toast } from 'sonner';
import {
  Shield, ShieldCheck, ChevronRight,
  Upload, Camera, Check, AlertCircle,
  Clock, User, MapPin, FileText,
  CreditCard, X, Loader2,
  TrendingUp, DollarSign,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Overview',   icon: Shield },
  { id: 2, label: 'Personal',   icon: User },
  { id: 3, label: 'Address',    icon: MapPin },
  { id: 4, label: 'Document',   icon: FileText },
  { id: 5, label: 'Selfie',     icon: Camera },
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa',
  'United States', 'United Kingdom', 'Canada',
  'Australia', 'Germany', 'France', 'UAE',
  'Singapore', 'India', 'Brazil', 'Other',
];

const NATIONALITIES = [...COUNTRIES];

export default function KYCOnboarding() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user }    = useAuth();
  const { kyc, loading, status, level, refresh } = useKYC();

  const state = location.state as any;
  const pendingWithdrawal = state?.pendingWithdrawal;
  const returnMessage = state?.message;

  const [step, setStep]           = useState(1);
  const [saving, setSaving]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 2 — Personal info
  const [fullName, setFullName]     = useState('');
  const [dob, setDob]               = useState('');
  const [nationality, setNationality] = useState('');
  const [phone, setPhone]           = useState('');

  // Step 3 — Address
  const [address1, setAddress1]     = useState('');
  const [city, setCity]             = useState('');
  const [country, setCountry]       = useState('');
  const [postcode, setPostcode]     = useState('');

  // Step 4 — Document
  const [docType, setDocType]       = useState<'passport' | 'national_id' | 'drivers_license'>('passport');
  const [docNumber, setDocNumber]   = useState('');
  const [frontFile, setFrontFile]   = useState<File | null>(null);
  const [backFile, setBackFile]     = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview]   = useState('');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack]   = useState(false);

  // Step 5 — Selfie
  const [selfieFile, setSelfieFile]     = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  const frontRef  = useRef<HTMLInputElement>(null);
  const backRef   = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // Pre-fill from existing KYC data
  useEffect(() => {
    if (kyc) {
      setFullName(kyc.full_name ?? '');
      setDob(kyc.date_of_birth ?? '');
      setNationality(kyc.nationality ?? '');
      setPhone(kyc.phone ?? '');
      setAddress1(kyc.address_line1 ?? '');
      setCity(kyc.address_city ?? '');
      setCountry(kyc.address_country ?? '');
      setPostcode(kyc.address_postcode ?? '');
      setDocType(kyc.document_type ?? 'passport');
      setDocNumber(kyc.document_number ?? '');
      if (kyc.document_front_url) setFrontPreview('uploaded');
      if (kyc.document_back_url)  setBackPreview('uploaded');
      if (kyc.selfie_url)         setSelfiePreview('uploaded');
    }
  }, [kyc]);

  const handleFileSelect = async (
    file: File,
    type: 'front' | 'back' | 'selfie'
  ) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB'); return;
    }
    const preview = URL.createObjectURL(file);
    if (type === 'front')  {
      setFrontFile(file); setFrontPreview(preview);
      setUploadingFront(true);
      try {
        const path = await uploadKYCDocument(user.id, file, 'front');
        await updateKYC(user.id, { document_front_url: path });
      } catch { toast.error('Upload failed'); }
      finally { setUploadingFront(false); }
    }
    if (type === 'back')   {
      setBackFile(file); setBackPreview(preview);
      setUploadingBack(true);
      try {
        const path = await uploadKYCDocument(user.id, file, 'back');
        await updateKYC(user.id, { document_back_url: path });
      } catch { toast.error('Upload failed'); }
      finally { setUploadingBack(false); }
    }
    if (type === 'selfie') {
      setSelfieFile(file); setSelfiePreview(preview);
      setUploadingSelfie(true);
      try {
        const path = await uploadKYCDocument(user.id, file, 'selfie');
        await updateKYC(user.id, { selfie_url: path });
      } catch { toast.error('Upload failed'); }
      finally { setUploadingSelfie(false); }
    }
  };

  const saveStep2 = async () => {
    if (!user) return;
    if (!fullName || !dob || !nationality || !phone) {
      toast.error('Please fill in all fields'); return;
    }
    setSaving(true);
    try {
      await updateKYC(user.id, {
        full_name: fullName,
        date_of_birth: dob,
        nationality,
        phone,
      });
      setStep(3);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const saveStep3 = async () => {
    if (!user) return;
    if (!address1 || !city || !country || !postcode) {
      toast.error('Please fill in all fields'); return;
    }
    setSaving(true);
    try {
      await updateKYC(user.id, {
        address_line1: address1,
        address_city: city,
        address_country: country,
        address_postcode: postcode,
      });
      setStep(4);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const saveStep4 = async () => {
    if (!user) return;
    if (!docNumber) {
      toast.error('Enter your document number'); return;
    }
    if (!frontPreview) {
      toast.error('Upload the front of your document'); return;
    }
    setSaving(true);
    try {
      await updateKYC(user.id, {
        document_type: docType,
        document_number: docNumber,
      });
      setStep(5);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!selfiePreview) {
      toast.error('Please upload a selfie photo'); return;
    }
    setSubmitting(true);
    try {
      await submitKYC(user.id);
      await createNotification(
        user.id, 'security',
        'KYC submitted for review',
        'Your identity verification documents have been submitted. We\'ll review them within 24 hours.',
        '/kyc'
      );
      await refresh();
      toast.success('KYC submitted! We\'ll review within 24 hours.');
      navigate('/dashboard');
    } catch { toast.error('Submission failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  // ── STATUS SCREENS ──────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  if (status === 'pending') return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center
          justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Under Review</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Your KYC documents have been submitted and are being reviewed
          by our compliance team. This usually takes 24–48 hours.
        </p>
        <div className="bg-card border border-border rounded-2xl p-6 mt-8 text-left">
          <h3 className="font-semibold text-foreground mb-3">
            What happens next?
          </h3>
          <div className="space-y-3">
            {[
              { icon: FileText, text: 'Our team verifies your documents' },
              { icon: Shield,   text: 'Identity check is completed' },
              { icon: ShieldCheck, text: 'Your limits are upgraded' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex
                  items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full bg-primary text-primary-foreground
            rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (status === 'verified') return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center
          justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Fully Verified
        </h1>
        <p className="text-muted-foreground mt-3">
          Your identity has been verified. You have full access to
          all EVONANCE features.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          {Object.entries(KYC_LIMITS).map(([lvl, info]) => (
            <div key={lvl}
              className={`bg-card border rounded-xl p-4 text-left
                ${parseInt(lvl) <= level
                  ? 'border-success/30 bg-success/[0.02]'
                  : 'border-border opacity-50'
                }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Level {lvl}
                </span>
                {parseInt(lvl) <= level && (
                  <Check className="w-4 h-4 text-success" />
                )}
              </div>
              <p className="font-semibold text-foreground">{info.label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ${info.daily.toLocaleString()}/day
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full bg-primary text-primary-foreground
            rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // ── MAIN ONBOARDING FLOW ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {pendingWithdrawal && (
          <div className="bg-primary/5 border border-primary/20
            rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex
              items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Complete verification to process your withdrawal
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your withdrawal of{' '}
                <strong className="text-foreground">
                  ${pendingWithdrawal.amount?.toFixed(2)} USDT
                </strong>{' '}
                via {pendingWithdrawal.network} is waiting.
                Once your identity is verified, return to
                the dashboard to complete it.
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive    = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center
                      justify-center transition-all
                      ${isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                          ? 'bg-primary/20 border-2 border-primary text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                      {isCompleted
                        ? <Check className="w-5 h-5" />
                        : <Icon className="w-4 h-4" />
                      }
                    </div>
                    <p className={`text-xs mt-1 font-medium hidden sm:block
                      ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {s.label}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all
                      ${step > s.id ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of {STEPS.length}</span>
            <span>{Math.round(((step - 1) / STEPS.length) * 100)}% complete</span>
          </div>
        </div>

        {/* ── STEP 1: OVERVIEW ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Verify Your Identity
              </h1>
              <p className="text-muted-foreground mt-2">
                Complete KYC to unlock higher trading limits and full
                access to all EVONANCE features.
              </p>
            </div>

            {/* Level cards */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(KYC_LIMITS).map(([lvl, info]) => (
                <div key={lvl}
                  className={`bg-card border rounded-xl p-4
                    ${parseInt(lvl) === 2
                      ? 'border-primary/40 bg-primary/[0.02]'
                      : 'border-border'
                    }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Level {lvl}
                    </span>
                    {parseInt(lvl) === 2 && (
                      <span className="text-xs bg-primary/10 text-primary
                        rounded-full px-2 py-0.5 font-medium">
                        Target
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground">{info.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${info.daily.toLocaleString()}/day limit
                  </p>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                What you'll need
              </h3>
              <div className="space-y-3">
                {[
                  { icon: User,       text: 'Full legal name and date of birth' },
                  { icon: MapPin,     text: 'Residential address' },
                  { icon: CreditCard, text: 'Government-issued photo ID' },
                  { icon: Camera,     text: 'A clear selfie photo' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex
                      items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex gap-3 p-4 bg-secondary rounded-xl">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your documents are encrypted and stored securely.
                We never share your personal data with third parties
                without your consent.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-primary-foreground
                rounded-xl py-3 font-semibold hover:opacity-90
                transition-opacity flex items-center justify-center gap-2">
              Start Verification
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: PERSONAL INFO ──────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Personal Information
              </h2>
              <p className="text-muted-foreground mt-1">
                Enter your details exactly as they appear on your ID
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6
              space-y-4">

              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Full legal name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="As it appears on your ID"
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    placeholder:text-muted-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date(Date.now() - 18 * 365.25 * 86400000)
                    .toISOString().split('T')[0]}
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    focus:outline-none focus:border-primary focus:ring-2
                    focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You must be at least 18 years old
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Nationality</label>
                <select
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    focus:outline-none focus:border-primary focus:ring-2
                    focus:ring-primary/20 transition-all appearance-none">
                  <option value="">Select nationality</option>
                  {NATIONALITIES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    placeholder:text-muted-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border bg-background
                  text-foreground rounded-xl py-3 font-semibold
                  hover:bg-secondary transition-colors">
                Back
              </button>
              <button
                onClick={saveStep2}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50
                  flex items-center justify-center gap-2">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <>Continue <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: ADDRESS ────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Residential Address
              </h2>
              <p className="text-muted-foreground mt-1">
                Enter your current home address
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6
              space-y-4">

              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Address line</label>
                <input
                  value={address1}
                  onChange={e => setAddress1(e.target.value)}
                  placeholder="Street address"
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    placeholder:text-muted-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground
                    block mb-1.5">City</label>
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-input-background border border-input
                      rounded-lg px-4 py-2.5 text-foreground text-sm
                      placeholder:text-muted-foreground focus:outline-none
                      focus:border-primary focus:ring-2 focus:ring-primary/20
                      transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground
                    block mb-1.5">Postcode</label>
                  <input
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    placeholder="Postcode / ZIP"
                    className="w-full bg-input-background border border-input
                      rounded-lg px-4 py-2.5 text-foreground text-sm
                      placeholder:text-muted-foreground focus:outline-none
                      focus:border-primary focus:ring-2 focus:ring-primary/20
                      transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    focus:outline-none focus:border-primary focus:ring-2
                    focus:ring-primary/20 transition-all appearance-none">
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-border bg-background
                  text-foreground rounded-xl py-3 font-semibold
                  hover:bg-secondary transition-colors">
                Back
              </button>
              <button
                onClick={saveStep3}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50
                  flex items-center justify-center gap-2">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <>Continue <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: DOCUMENT UPLOAD ────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Identity Document
              </h2>
              <p className="text-muted-foreground mt-1">
                Upload a clear photo of your government-issued ID
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6
              space-y-5">

              {/* Document type */}
              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-3">Document type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'passport',         label: 'Passport' },
                    { value: 'national_id',      label: 'National ID' },
                    { value: 'drivers_license',  label: "Driver's License" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDocType(opt.value as any)}
                      className={`p-3 rounded-xl border-2 text-center
                        text-sm font-medium transition-all
                        ${docType === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-foreground hover:border-border/80'
                        }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document number */}
              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">Document number</label>
                <input
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  placeholder="e.g. A12345678"
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-2.5 text-foreground text-sm
                    font-mono placeholder:text-muted-foreground
                    focus:outline-none focus:border-primary focus:ring-2
                    focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Upload zones */}
              <div className="grid grid-cols-2 gap-4">
                {/* Front */}
                <div>
                  <label className="text-sm font-medium text-foreground
                    block mb-2">Front side</label>
                  <div
                    onClick={() => frontRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl
                      h-36 flex flex-col items-center justify-center gap-2
                      cursor-pointer transition-all
                      ${frontPreview
                        ? 'border-success/50 bg-success/5'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}>
                    {uploadingFront ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : frontPreview && frontPreview !== 'uploaded' ? (
                      <>
                        <img src={frontPreview} alt="Front"
                          className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute top-2 right-2 w-6 h-6
                          rounded-full bg-success flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </>
                    ) : frontPreview === 'uploaded' ? (
                      <>
                        <Check className="w-6 h-6 text-success" />
                        <p className="text-xs text-success font-medium">Uploaded</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center px-2">
                          Click to upload front
                        </p>
                      </>
                    )}
                  </div>
                  <input ref={frontRef} type="file"
                    accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] &&
                      handleFileSelect(e.target.files[0], 'front')} />
                </div>

                {/* Back — hide for passport */}
                {docType !== 'passport' && (
                  <div>
                    <label className="text-sm font-medium text-foreground
                      block mb-2">Back side</label>
                    <div
                      onClick={() => backRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl
                        h-36 flex flex-col items-center justify-center gap-2
                        cursor-pointer transition-all
                        ${backPreview
                          ? 'border-success/50 bg-success/5'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                        }`}>
                      {uploadingBack ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      ) : backPreview && backPreview !== 'uploaded' ? (
                        <>
                          <img src={backPreview} alt="Back"
                            className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute top-2 right-2 w-6 h-6
                            rounded-full bg-success flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </>
                      ) : backPreview === 'uploaded' ? (
                        <>
                          <Check className="w-6 h-6 text-success" />
                          <p className="text-xs text-success font-medium">Uploaded</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground text-center px-2">
                            Click to upload back
                          </p>
                        </>
                      )}
                    </div>
                    <input ref={backRef} type="file"
                      accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] &&
                        handleFileSelect(e.target.files[0], 'back')} />
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="flex gap-2 p-3 bg-primary/5 border
                border-primary/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Make sure all text is clearly visible</p>
                  <p>• No glare or shadows covering the document</p>
                  <p>• JPG, PNG or HEIC — max 5MB per file</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-border bg-background
                  text-foreground rounded-xl py-3 font-semibold
                  hover:bg-secondary transition-colors">
                Back
              </button>
              <button
                onClick={saveStep4}
                disabled={saving || !frontPreview || !docNumber}
                className="flex-1 bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50
                  flex items-center justify-center gap-2">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <>Continue <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: SELFIE + SUBMIT ────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Selfie Verification
              </h2>
              <p className="text-muted-foreground mt-1">
                Take a clear photo of your face to complete verification
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6
              space-y-5">

              {/* Selfie upload */}
              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-3">Your selfie photo</label>
                <div
                  onClick={() => selfieRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl
                    h-56 flex flex-col items-center justify-center gap-3
                    cursor-pointer transition-all mx-auto max-w-xs
                    ${selfiePreview
                      ? 'border-success/50 bg-success/5'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}>
                  {uploadingSelfie ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : selfiePreview && selfiePreview !== 'uploaded' ? (
                    <>
                      <img src={selfiePreview} alt="Selfie"
                        className="w-full h-full object-cover rounded-2xl" />
                      <div className="absolute top-3 right-3 w-7 h-7
                        rounded-full bg-success flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : selfiePreview === 'uploaded' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-success/10
                        flex items-center justify-center">
                        <Check className="w-8 h-8 text-success" />
                      </div>
                      <p className="text-sm text-success font-medium">
                        Selfie uploaded
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-secondary
                        flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Click to take or upload selfie
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG or PNG — max 5MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <input ref={selfieRef} type="file"
                  accept="image/*" capture="user"
                  className="hidden"
                  onChange={e => e.target.files?.[0] &&
                    handleFileSelect(e.target.files[0], 'selfie')} />
              </div>

              {/* Selfie tips */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Tips for a good selfie:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '☀️', text: 'Good lighting' },
                    { icon: '👤', text: 'Face clearly visible' },
                    { icon: '🚫', text: 'No sunglasses' },
                    { icon: '📸', text: 'Neutral expression' },
                  ].map(({ icon, text }) => (
                    <div key={text}
                      className="flex items-center gap-2 bg-secondary
                        rounded-lg p-2.5">
                      <span className="text-base">{icon}</span>
                      <span className="text-xs text-foreground">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review summary */}
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Review summary
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Full name',    value: fullName || '—' },
                    { label: 'Date of birth',value: dob || '—' },
                    { label: 'Nationality',  value: nationality || '—' },
                    { label: 'Address',      value: city && country ? `${city}, ${country}` : '—' },
                    { label: 'Document',     value: docType ? docType.replace(/_/g, ' ') : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium capitalize">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Declaration */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                By submitting, I confirm that all information provided is
                accurate and the documents are genuine. I consent to
                EVONANCE processing my personal data for identity
                verification purposes in accordance with the Privacy Policy.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="flex-1 border border-border bg-background
                  text-foreground rounded-xl py-3 font-semibold
                  hover:bg-secondary transition-colors">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selfiePreview}
                className="flex-1 bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50
                  flex items-center justify-center gap-2">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <><ShieldCheck className="w-4 h-4" /> Submit for Review</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
