export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">

      {/* TOP */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎵</span>
            <h3 className="text-2xl font-black">TuneTix</h3>
          </div>

          <p className="text-gray-600 text-sm max-w-md mb-6">
            TuneTix menghubungkan orang dengan konser, festival, dan event terbaik
            melalui teknologi pemesanan tiket yang mudah dan aman.
          </p>

          <div className="flex gap-3">
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
              className="h-10"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="h-10"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <p className="font-semibold mb-4">Payment Options:</p>

          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-semibold text-blue-700">BRI</span>
            <span className="text-sm font-semibold text-blue-800">BCA</span>
            <span className="text-sm font-semibold text-orange-600">BNI</span>
            <span className="text-sm font-semibold text-purple-600">OVO</span>
            <span className="text-sm font-semibold text-red-500">ShopeePay</span>
            <span className="text-sm font-semibold text-gray-700">GoPay</span>
          </div>
        </div>
      </div>

      {/* LINKS */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 border-t">

        <FooterCol title="USE TUNETIX">
          <li>Best Offers</li>
          <li>Promo</li>
          <li>Help Center</li>
          <li>Privacy Policy</li>
          <li>Terms & Conditions</li>
        </FooterCol>

        <FooterCol title="INFORMATION">
          <li>Publish Event</li>
          <li>Venue Owner</li>
          <li>Download Brochure</li>
          <li>Pricing</li>
        </FooterCol>

        <FooterCol title="EVENT BUSINESS">
          <li>Event Management</li>
          <li>Music & Concerts</li>
          <li>Exhibition</li>
          <li>Seminar</li>
        </FooterCol>

        <FooterCol title="MEET TUNETIX">
          <li>About Us</li>
          <li>Blog</li>
          <li>Careers</li>
          <li>Press Kit</li>
        </FooterCol>

        <div>
          <h4 className="font-bold text-sm mb-3">Customer Service (WA)</h4>
          <p className="text-sm text-gray-600 mb-4">+62 811-0000-0000</p>

          <h4 className="font-bold text-sm mb-2">Office</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Telkom University <br />
            Bandung, Jawa Barat
          </p>

          <p className="text-sm text-gray-600 mt-3">
            Working Hours: <br />
            Weekdays 09.00 – 20.00
          </p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="text-center text-sm text-gray-500 py-4 border-t">
        © 2025 TuneTix. All Rights Reserved.
      </div>
    </footer>
  );
}

/* ===== FOOTER COLUMN ===== */
function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="font-bold text-sm mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {children}
      </ul>
    </div>
  );
}
