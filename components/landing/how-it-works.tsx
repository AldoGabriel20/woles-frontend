export function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Kirim pesan WA",
      desc: 'Ceritakan apa yang perlu diingat — cukup tulis di WhatsApp. Contoh: "Ingatkan bayar internet tiap tanggal 10."',
      icon: "💬",
    },
    {
      num: "2",
      title: "Woles simpan & jadwalkan",
      desc: "AI kami memahami pesanmu, mencatat detail penting, dan langsung menjadwalkan reminder tanpa form panjang.",
      icon: "🤖",
    },
    {
      num: "3",
      title: "Dapat reminder tepat waktu",
      desc: "Kamu akan menerima pesan WhatsApp sesuai jadwal — tidak ada yang terlewat, tidak ada yang telat.",
      icon: "🔔",
    },
  ];

  return (
    <section id="how-it-works" className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-[28px] font-bold text-on-surface sm:text-[32px]">
            3 langkah mudah
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Tidak ada app baru yang perlu diinstall. Cukup WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-outline-variant bg-surface-container-lowest p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                {step.icon}
              </div>
              <span className="absolute right-4 top-4 font-display text-[40px] font-bold leading-none text-outline-variant/40">
                {step.num}
              </span>
              <h3 className="mb-1.5 font-display text-title-lg text-on-surface">{step.title}</h3>
              <p className="text-label-md text-on-surface-variant">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
