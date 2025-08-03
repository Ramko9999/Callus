export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-secondary text-sm">
            © 2025 Callus
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="mailto:ramapitchala@gmail.com" className="text-text-secondary hover:text-primary transition-colors text-sm">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 