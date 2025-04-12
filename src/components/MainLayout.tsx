// src/components/MainLayout.tsx

import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface Props {
  children: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

