interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#111116] text-white">

      {/* ================= NAVBAR ================= */}
      <nav className="relative z-20 flex items-center justify-between border-b border-white/10 px-8 py-5 backdrop-blur-md">

        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-tight">
          Seva<span className="text-orange-400">Nest</span>
        </h1>

        {/* Login */}
        <button
          onClick={onGetStarted}
          className="rounded-lg bg-orange-400 px-6 py-3 font-semibold text-black transition hover:bg-orange-300"
        >
          Login
        </button>

      </nav>


      {/* ================= HERO ================= */}
      <section className="relative min-h-[calc(100vh-81px)] overflow-hidden">

        {/* Background Image */}
        <img
          src="/hero.jpg"
          alt="Government welfare services"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Blur layer */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />


        {/* Hero Content */}
        <div className="relative z-10 flex min-h-[calc(100vh-81px)] items-center">

          <div className="mx-auto w-full max-w-7xl px-8 py-20">

            <div className="max-w-3xl">

              {/* Small heading */}
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
                Government Welfare • Made Simple
              </p>


              {/* Main heading */}
              <h2 className="text-5xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">

                Welfare services
                <br />

                <span className="text-orange-400">
                  made simple.
                </span>

              </h2>


              {/* Description */}
              <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-200 md:text-xl">
                Discover government welfare schemes, find the benefits
                you are eligible for, and raise complaints without
                complicated procedures.
              </p>


              {/* Buttons */}
              <div className="mt-9 flex flex-wrap gap-4">

                <button
                  onClick={onGetStarted}
                  className="rounded-xl bg-orange-400 px-8 py-4 font-semibold text-black transition hover:bg-orange-300"
                >
                  Login →
                </button>

                <a
                  href="#services"
                  className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold backdrop-blur-md transition hover:bg-white/20"
                >
                  Explore Services
                </a>

              </div>


              {/* Small information */}
              <div className="mt-12 flex flex-wrap gap-8 text-sm text-gray-300">

                <div>
                  <p className="text-2xl font-bold text-white">
                    01
                  </p>
                  <p className="mt-1">
                    Welfare Access
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">
                    02
                  </p>
                  <p className="mt-1">
                    Smart Complaints
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">
                    03
                  </p>
                  <p className="mt-1">
                    Transparent Tracking
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section
        id="services"
        className="bg-[#111116] px-8 py-24"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              What we provide
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Everything you need,
              <br />
              in one place.
            </h2>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-3">

            {/* Welfare Schemes */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition hover:bg-white/[0.07]">

              <div className="text-4xl">
                🏛️
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Welfare Schemes
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Discover government schemes and understand the
                benefits available to you.
              </p>

            </div>


            {/* Complaints */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition hover:bg-white/[0.07]">

              <div className="text-4xl">
                📝
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Smart Complaints
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Submit your grievance in simple language without
                worrying about complicated categories.
              </p>

            </div>


            {/* Tracking */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition hover:bg-white/[0.07]">

              <div className="text-4xl">
                📍
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Track Progress
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Follow your complaint and receive updates about
                its progress.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="border-t border-white/10 bg-orange-400 px-8 py-20 text-center text-black">

        <h2 className="text-4xl font-bold md:text-5xl">
          Welfare shouldn't be complicated.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-black/70">
          Access government services, discover schemes and raise
          grievances from one simple platform.
        </p>

        <button
          onClick={onGetStarted}
          className="mt-8 rounded-xl bg-black px-8 py-4 font-semibold text-white transition hover:bg-black/80"
        >
          Login to SevaNest →
        </button>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 bg-[#0b0b0e] px-8 py-12">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2">

              <h3 className="text-2xl font-bold">
                Seva<span className="text-orange-400">
                  Nest
                </span>
              </h3>

              <p className="mt-4 max-w-md leading-7 text-gray-500">
                A centralized platform for accessing government
                welfare schemes and transparent grievance
                redressal.
              </p>

            </div>


            {/* Platform */}
            <div>

              <h4 className="font-semibold">
                Platform
              </h4>

              <div className="mt-4 space-y-3 text-sm text-gray-500">

                <a
                  href="#services"
                  className="block transition hover:text-white"
                >
                  Welfare Schemes
                </a>

                <a
                  href="#services"
                  className="block transition hover:text-white"
                >
                  Complaints
                </a>

                <a
                  href="#services"
                  className="block transition hover:text-white"
                >
                  Tracking
                </a>

              </div>

            </div>


            {/* Account */}
            <div>

              <h4 className="font-semibold">
                Account
              </h4>

              <div className="mt-4 space-y-3 text-sm text-gray-500">

                <button
                  onClick={onGetStarted}
                  className="block transition hover:text-white"
                >
                  Login
                </button>

                <p>
                  Citizen Services
                </p>

                <p>
                  Officer Portal
                </p>

              </div>

            </div>

          </div>


          {/* Bottom */}
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">

            <p>
              © 2026 SevaNest. All rights reserved.
            </p>

            <p>
              Welfare, made simple.
            </p>

          </div>

        </div>

      </footer>

    </div>
  )
}