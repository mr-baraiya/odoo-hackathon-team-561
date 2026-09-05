import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ContactSupportPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    priority: "Medium",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedTicket = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedTicket);
      setIsSubmitted(true);
      toast.success(`Support ticket ${generatedTicket} submitted successfully!`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="max-w-4xl mx-auto w-full pt-4">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <img src="/logo.svg" alt="DealFlow360 Logo" className="w-8 h-8 rounded-xl shadow-xs" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              DealFlow<span className="text-indigo-600">360</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full my-auto py-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Customer Support Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">
            How can we help your team?
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Submit a support ticket or reach out directly. Our enterprise B2B sales support team typically responds within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left Column: Form / Confirmation */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Submit a Ticket
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Vishal Baraiya"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Work Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Issue Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Account & Login">Account & Login</option>
                      <option value="Quotations & Builder">Quotations & Builder</option>
                      <option value="Discount & Approvals">Discount & Approvals</option>
                      <option value="Fulfillment & Billing">Fulfillment & Billing</option>
                      <option value="Bug Report">Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    >
                      <option value="Low">Low - General Question</option>
                      <option value="Medium">Medium - Normal Workaround</option>
                      <option value="High">High - Workflow Impacted</option>
                      <option value="Urgent">Urgent - Business Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your issue"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Detailed Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please include details such as deal ID, quotation number, or steps to reproduce..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
                </button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  OK
                </div>
                <h3 className="text-xl font-bold text-slate-900">Ticket Created Successfully</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your support request <span className="font-mono font-bold text-indigo-600">{ticketId}</span> has been routed to our B2B technical operations team. A confirmation has been sent to <span className="font-semibold text-slate-800">{formData.email}</span>.
                </p>
                <div className="pt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: "", email: "", category: "General Inquiry", priority: "Medium", subject: "", message: "" });
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Submit Another Ticket
                  </button>
                  <Link
                    to="/"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Channels & SLA */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                Direct Contact
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">Email Support</h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Send queries directly to our technical support team.
              </p>
              <a
                href="mailto:support@dealflow360.com"
                className="text-xs font-bold text-indigo-600 hover:underline block font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center"
              >
                support@dealflow360.com
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">
                SLA Guarantee
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">Response Time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard Support: &lt; 24 hours<br />
                Priority / Enterprise: &lt; 2 hours<br />
                System Outage: Immediate 24/7
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                Documentation
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">Self Service</h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Explore guides, API references, and deal workflow setup instructions.
              </p>
              <Link
                to="/"
                className="text-xs font-semibold text-indigo-600 hover:underline block"
              >
                View DealFlow360 Platform Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full pb-4 pt-8 text-center border-t border-slate-200 mt-8">
        <p className="text-xs text-slate-500">
          Back to <Link to="/" className="text-indigo-600 hover:underline font-semibold">Home</Link> &bull; Back to <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Sign In</Link> &bull; DealFlow360 Support
        </p>
      </div>
    </div>
  );
}
