import React from 'react';

const Navbar = ({ title }) => {
  return (
    <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-blue-900">{title}</h1>
      <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-200 transition">
        Çıkış Yap
      </button>
    </header>
  );
};

export default Navbar;