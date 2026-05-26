import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sendContactForm } from '../lib/email';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUBJECTS = [
  'Account access issue',
  'Deposit or withdrawal problem',
  'Trading question',
  'KYC verification issue',
  'Virtual card problem',
  'Referral reward issue',
  'Security concern',
  'Technical bug',
  'Other',
];

export default function ContactModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [name, setName]         = useState(
    user?.user_metadata?.full_name ?? ''
  );
  const [email, setEmail]       = useState(user?.email ?? '');
  const [subject, setSubject]   = useState('');
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    if (message.length < 20) {
      toast.error('Please describe your issue in more detail');
      return;
    }
    setSending(true);
    try {
      await sendContactForm({
        name,
        email,
        subject,
        message,
        userId: user?.id,
      });
      setSent(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send. Try emailing support@evonance.com directly.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setMessage('');
    setSubject('');
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">
                Contact Support
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                We respond within 24 hours on business days
              </p>
            </div>
            <button onClick={handleClose}
              className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!sent ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-input-background border border-input rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-input-background border border-input rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-input-background border border-input rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Message
                  <span className="text-muted-foreground font-normal ml-1">
                    (min 20 characters)
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="w-full bg-input-background border border-input rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {message.length} characters
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={sending || !name || !email || !subject || message.length < 20}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Or email us directly:{' '}
                <a href="mailto:support@evonance.com"
                  className="text-primary hover:underline">
                  support@evonance.com
                </a>
              </p>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Message Sent!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We've received your message and sent a confirmation to {email}. We'll respond within 24 hours.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity">
                Close
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
