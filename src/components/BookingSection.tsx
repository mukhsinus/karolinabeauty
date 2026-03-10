// src/components/BookingSection.tsx
import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { serviceCategories, getAllServices, ServiceItem } from "@/data/services";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Calendar, Clock, User } from "lucide-react";

interface Booking {
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
}

const formatPrice = (price: number) => price.toLocaleString("ru-RU");

const generateTimeSlots = (date: string): string[] => {
  const d = new Date(date);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const startHour = isWeekend ? 10 : 9;
  const endHour = isWeekend ? 22 : 21;
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
};

const getNextDays = (count: number): string[] => {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const BookingSection = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<Booking>({
    service: "",
    date: "",
    time: "",
    name: "",
    phone: "",
  });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const allServices = getAllServices();
  const dates = useMemo(() => getNextDays(14), []);
  const timeSlots = useMemo(
    () => (booking.date ? generateTimeSlots(booking.date) : []),
    [booking.date]
  );

  const selectedService = allServices.find((s) => s.id === booking.service);

  const canNext = () => {
    switch (step) {
      case 0: return !!booking.service;
      case 1: return !!booking.date;
      case 2: return !!booking.time;
      case 3: return booking.name.trim().length >= 2 && booking.phone.trim().length >= 7;
      default: return false;
    }
  };

  const handleConfirm = () => {
    const slotKey = `${booking.date}-${booking.time}`;
    setBookedSlots((prev) => [...prev, slotKey]);
    setConfirmed(true);
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  const stepIcons = [
    <Check key={0} size={16} />,
    <Calendar key={1} size={16} />,
    <Clock key={2} size={16} />,
    <User key={3} size={16} />,
  ];

  const stepLabels = [
    "booking.step_service",
    "booking.step_date",
    "booking.step_time",
    "booking.step_details",
  ];

  if (confirmed) {
    return (
      <section id="booking" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center bg-card rounded-3xl p-12 shadow-elevated"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-primary" size={32} />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
              {t("booking.success")}
            </h3>
            <p className="text-muted-foreground">{t("booking.success_message")}</p>
            <button
              onClick={() => {
                setConfirmed(false);
                setStep(0);
                setBooking({ service: "", date: "", time: "", name: "", phone: "" });
              }}
              className="mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium hover:shadow-soft transition-all"
            >
              {t("booking.title")}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {t("booking.title")}
          </h2>
        </motion.div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-10 max-w-md mx-auto">
          {stepLabels.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {stepIcons[i]}
              <span className="hidden sm:inline">{t(label)}</span>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Service */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {serviceCategories.map((cat) => (
                  <div key={cat.id}>
                    <h4 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span>{cat.icon}</span> {t(cat.nameKey)}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {cat.services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setBooking((b) => ({ ...b, service: service.id }))}
                          className={`text-left p-4 rounded-xl border transition-all text-sm ${
                            booking.service === service.id
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <span className="block text-foreground font-medium">{t(service.nameKey)}</span>
                          <span className="text-primary font-semibold mt-1 block">
                            {service.isFrom && `${t("services.from")} `}
                            {formatPrice(service.price)} {t("services.currency")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 1: Date */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
              >
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setBooking((b) => ({ ...b, date, time: "" }))}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      booking.date === date
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="block text-sm font-medium text-foreground">
                      {formatDateDisplay(date)}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Time */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {timeSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground">{t("booking.no_slots")}</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map((time) => {
                      const isBooked = bookedSlots.includes(`${booking.date}-${time}`);
                      return (
                        <button
                          key={time}
                          disabled={isBooked}
                          onClick={() => setBooking((b) => ({ ...b, time }))}
                          className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                            isBooked
                              ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                              : booking.time === time
                              ? "border-primary bg-primary/5 shadow-soft text-primary"
                              : "border-border bg-card hover:border-primary/30 text-foreground"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto space-y-6"
              >
                {/* Summary */}
                <div className="bg-card rounded-2xl p-6 shadow-card space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("booking.step_service")}</span>
                    <span className="font-medium text-foreground">
                      {selectedService ? t(selectedService.nameKey) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("booking.step_date")}</span>
                    <span className="font-medium text-foreground">{formatDateDisplay(booking.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("booking.step_time")}</span>
                    <span className="font-medium text-foreground">{booking.time}</span>
                  </div>
                  {selectedService && (
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">{t("nav.prices")}</span>
                      <span className="font-semibold text-primary">
                        {formatPrice(selectedService.price)} {t("services.currency")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t("booking.name")}
                    value={booking.name}
                    onChange={(e) => setBooking((b) => ({ ...b, name: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    maxLength={100}
                  />
                  <input
                    type="tel"
                    placeholder={t("booking.phone")}
                    value={booking.phone}
                    onChange={(e) => setBooking((b) => ({ ...b, phone: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    maxLength={20}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-10 max-w-md mx-auto">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                <ChevronLeft size={16} />
                {t("booking.back")}
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => canNext() && setStep((s) => s + 1)}
                disabled={!canNext()}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all ${
                  canNext()
                    ? "bg-primary text-primary-foreground hover:shadow-soft"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {t("booking.next")}
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => canNext() && handleConfirm()}
                disabled={!canNext()}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
                  canNext()
                    ? "bg-primary text-primary-foreground hover:shadow-soft"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {t("booking.confirm_booking")}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
