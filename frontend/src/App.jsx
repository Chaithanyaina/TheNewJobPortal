import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* AnimatePresence allows for smooth page transitions */}
        <AnimatePresence mode="wait">
          <AppRoutes />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
export default App;