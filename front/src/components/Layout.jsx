import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto mt-4">
        <Outlet />
      </main>
    </div>
  );
}
