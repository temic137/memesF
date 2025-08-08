'use client';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>
              <span style={{color: '#FFFFFF'}}>Meme</span>
              <span style={{color: '#FFFFFF'}}>DB</span>
            </h3>
            <p className="text-sm" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>Your personal meme collection.</p>
          </div>
          <div className="flex gap-6">
            <a href="/about" className="transition-colors" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>About</a>
            <a href="/terms" className="transition-colors" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>Terms & Conditions</a>
            <a href="/privacy" className="transition-colors" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
