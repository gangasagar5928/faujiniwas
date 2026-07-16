import React, { useState } from "react";
import { Property, RankHRAInfo } from "../types";
import { RANKS_HRA } from "../data";
import { X, Calendar, MapPin, CheckCircle, ShieldCheck, Phone, UserCheck, Calculator, Star, HelpCircle } from "lucide-react";

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  userProfile: { name: string; rank: string; basicPay: number } | null;
}

export default function PropertyDetailsModal({
  property,
  onClose,
  userProfile,
}: PropertyDetailsModalProps) {
  // State for rank-HRA lookup inside detail view
  const [selectedCalcRank, setSelectedCalcRank] = useState<string>(
    userProfile?.rank || "Sepoy"
  );
  const [customBasicPay, setCustomBasicPay] = useState<number>(
    userProfile?.basicPay || 25000
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [isCSDAgreement, setIsCSDAgreement] = useState(true);

  // Find HRA rate info for the selected rank
  const activeRankInfo = RANKS_HRA.find((r) => r.rank === selectedCalcRank) || RANKS_HRA[0];

  // Calculate HRA (18% for Y Category city like Patna/Danapur)
  const calculatedHRA = Math.round(customBasicPay * (activeRankInfo.hraRateY / 100));
  const rentDifference = calculatedHRA - property.rent;
  const isHRACovered = rentDifference >= 0;

  // Handle default basic pay update when rank shifts
  const handleRankChange = (rankName: string) => {
    setSelectedCalcRank(rankName);
    const rInfo = RANKS_HRA.find((r) => r.rank === rankName);
    if (rInfo) {
      setCustomBasicPay(rInfo.minBasicPay);
    }
  };

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;
    setBookingSuccess(true);
  };

  // Generate mock commute breakdown
  const commutes = [
    { target: "Danapur Cantonment HQ", time: property.commute, distance: "1.2 km" },
    { target: "Military Hospital (MH) Patna", time: "14 mins", distance: "2.4 km" },
    { target: "Army Public School (APS)", time: "9 mins", distance: "1.5 km" },
    { target: "CSD Depot / Cantonment Canteen", time: "5 mins", distance: "0.8 km" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900/80 hover:scale-110 transition-all duration-300 shadow-lg cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Left Section: Image and Commutes */}
        <div className="w-full md:w-1/2 bg-slate-50 relative flex flex-col border-r border-slate-100 max-h-[45vh] md:max-h-full overflow-y-auto">
          <div className="relative h-60 md:h-72 w-full shrink-0">
            <img
              src={property.image}
              alt={property.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white text-left">
              <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1 inline-block">
                {property.cantonment}
              </span>
              <h2 className="text-xl font-bold font-serif">{property.title}</h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-emerald-400" />
                <span>Patna Cantonment District, Bihar</span>
              </p>
            </div>
            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span>{property.rating} / 5.0 Rating</span>
            </div>
          </div>

          {/* Commutes Details list */}
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600" />
              <span>Commute Breakdown to Military Hubs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {commutes.map((comm, idx) => (
                <div key={idx} className="bg-slate-100 rounded-2xl p-3 border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{comm.target}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
                    <span className="text-emerald-700 font-bold">⏱ {comm.time}</span>
                    <span>📍 {comm.distance}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Certification */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 mt-1 text-left">
              <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-emerald-900">Army Verified Housing Board Approved</p>
                <p className="text-[10px] text-emerald-800/80 leading-relaxed mt-1">
                  This dwelling conforms to security clearances required for armed forces serving personnel. Surrounding neighbors are vetted and police patrolling is fully responsive.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Details, Calculator, & Booking */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[45vh] md:max-h-full flex flex-col gap-5 text-left">
          {/* Rent Box */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Monthly Rent</span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-extrabold text-slate-900">₹{property.rent.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400">Included in HRA claims</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Property Description</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Dynamic Rank HRA Calculator */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Calculator size={15} className="text-indigo-600" />
              <span>7th CPC HRA Coverage Check</span>
            </h4>

            {/* Rank Select */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Armed Forces Rank</label>
                <select
                  value={selectedCalcRank}
                  onChange={(e) => handleRankChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  {RANKS_HRA.map((r) => (
                    <option key={r.rank} value={r.rank}>
                      {r.rank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Pay slider/numeric input */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Basic Pay (₹)</label>
                <input
                  type="number"
                  min={activeRankInfo.minBasicPay}
                  max={activeRankInfo.maxBasicPay}
                  value={customBasicPay}
                  onChange={(e) => setCustomBasicPay(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Result Visual Bar */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Calculated HRA (18%)</span>
                <span className={isHRACovered ? "text-emerald-600" : "text-amber-600"}>
                  ₹{calculatedHRA.toLocaleString()} /mo
                </span>
              </div>

              {/* Comparison visual line */}
              <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                    isHRACovered ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min((calculatedHRA / property.rent) * 100, 100)}%` }}
                />
              </div>

              {/* HRA details alert */}
              <p className="text-[10px] text-slate-500 mt-1">
                {isHRACovered ? (
                  <span className="text-emerald-700 font-medium">
                    ✓ HRA covers this listing entirely! You save{" "}
                    <strong className="font-extrabold">₹{rentDifference.toLocaleString()}</strong> of HRA budget.
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    ⚠ Rent exceeds HRA by{" "}
                    <strong className="font-extrabold">₹{Math.abs(rentDifference).toLocaleString()}</strong>. Excess rent must be paid directly or requires HRA exception clearance.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Booking Verification/Liaison Desk Form */}
          <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
            {bookingSuccess ? (
              <div className="text-center py-4 flex flex-col items-center justify-center gap-2">
                <CheckCircle size={40} className="text-emerald-600 animate-bounce" />
                <h5 className="font-bold text-sm text-slate-900">Visit Scheduled Successfully!</h5>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed mt-1">
                  Reference: <strong className="font-mono text-emerald-800">FN-{(100000 + Math.floor(Math.random() * 900000))}</strong>
                  <br /> Our defense liaison officer will coordinate transport from cantonment gate to the property on{" "}
                  <strong>{bookingDate}</strong> at <strong>{bookingTime}</strong>.
                </p>
                <button
                  onClick={() => setBookingSuccess(false)}
                  className="mt-3 text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-4 py-1.5 hover:bg-white"
                >
                  Modify Schedule
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookVisit} className="flex flex-col gap-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar size={15} className="text-emerald-600" />
                  <span>Book Cantonment Vetted Visit</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Preferred Time</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="csd-agreement"
                    checked={isCSDAgreement}
                    onChange={(e) => setIsCSDAgreement(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer animate-pulse"
                  />
                  <label htmlFor="csd-agreement" className="text-[10px] text-slate-500 cursor-pointer select-none">
                    Require Cantonment Board Brokerage Exemption Clearance.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!bookingDate}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 active:bg-emerald-950 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md cursor-pointer transition-all duration-300"
                >
                  Confirm Vetted Escort & Booking
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
