import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-teal-900 text-white pt-12 pb-6 relative overflow-hidden">
      {/* Abstract gradient shapes */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-purple-800 opacity-20 filter blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-teal-700 opacity-20 filter blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 12h3v8h16v-8h3L12 2zm-1 15v-5h2v5h-2z"/>
              </svg>
              <span className="ml-2 text-xl font-heading font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">
                PropertyX
              </span>
            </div>
            <p className="text-neutral-300 text-sm mb-4">
              Tokenizing Urban Real-World Assets on Stacks for Decentralized Economic Ecosystems.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white transition-colors duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors duration-300">
                <i className="fab fa-discord"></i>
              </a>
              <a href="https://github.com/buildersacademyai" className="text-neutral-300 hover:text-white transition-colors duration-300">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://t.me/+CzSrLytJb0JjZWQ9" className="text-neutral-300 hover:text-white transition-colors duration-300">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="https://www.linkedin.com/company/buildersacademy/" className="text-neutral-300 hover:text-white transition-colors duration-300">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-heading font-semibold mb-4 bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Home</Link></li>
              <li><Link href="/staking" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Staking</Link></li>
              <li><Link href="/profile" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Profile</Link></li>
              <li><Link href="/feedback" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Feedback</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-heading font-semibold mb-4 bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Whitepaper</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Documentation</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">FAQ</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">API</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Governance</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-heading font-semibold mb-4 bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">
              Legal
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Risk Disclosure</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Compliance</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm transition-colors duration-300">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-opacity-20 border-teal-400 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-300 text-sm">
            &copy; {new Date().getFullYear()} PropertyX Protocol. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-neutral-300 text-sm mr-2">Powered by</span>
            <a href="https://www.stacks.co/" target="_blank" rel="noopener noreferrer" className="flex items-center group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" className="text-teal-300 group-hover:text-white transition-colors duration-300">
                <path d="M384 32H128A128 128 0 0 0 0 160v192a128 128 0 0 0 128 128h256a128 128 0 0 0 128-128V160A128 128 0 0 0 384 32zm96 320a96.1 96.1 0 0 1-96 96H128a96.1 96.1 0 0 1-96-96V160a96.1 96.1 0 0 1 96-96h256a96.1 96.1 0 0 1 96 96zM240 128h32v112h88a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H240a8 8 0 0 1-8-8V136a8 8 0 0 1 8-8z"/>
              </svg>
              <span className="ml-1 text-neutral-300 group-hover:text-white text-sm transition-colors duration-300">Stacks Blockchain</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;